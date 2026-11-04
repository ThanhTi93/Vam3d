import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const login = process.env.STREAMTAPE_API_LOGIN || '439070443d3e6fe76376';
const key = process.env.STREAMTAPE_API_KEY || 'RpAWzXJbpXI0lR';
const fileId = 'dPQJxbj031ikdQd'; // Ep 81

async function migrateOne() {
  console.log('1. Getting download ticket...');
  const ticketRes = await fetch(`https://api.streamtape.com/file/dlticket?file=${fileId}&login=${login}&key=${key}`);
  const ticket = await ticketRes.json();
  const waitMs = ((ticket?.result?.wait_time || 5) + 1) * 1000;
  console.log(`Waiting ${waitMs}ms...`);
  await new Promise(r => setTimeout(r, waitMs));

  console.log('2. Getting direct download URL...');
  const dlRes = await fetch(`https://api.streamtape.com/file/dl?file=${fileId}&ticket=${ticket.result.ticket}`);
  const dl = await dlRes.json();
  const streamUrl = dl?.result?.url;
  if (!streamUrl) throw new Error('No stream URL: ' + JSON.stringify(dl));

  console.log('3. Streaming from Streamtape to R2...');
  const videoResp = await fetch(streamUrl);
  if (!videoResp.ok || !videoResp.body) throw new Error(`Fetch video failed: ${videoResp.status}`);

  const r2Key = `episodes/ep-81.mp4`;
  const nodeReadable = Readable.fromWeb(videoResp.body);

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
      Body: nodeReadable,
      ContentType: 'video/mp4',
    },
    partSize: 10 * 1024 * 1024,
    queueSize: 4,
  });

  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      const pct = Math.round((progress.loaded / progress.total) * 100);
      console.log(`Upload to R2 progress: ${pct}% (${(progress.loaded / (1024*1024)).toFixed(1)}MB / ${(progress.total / (1024*1024)).toFixed(1)}MB)`);
    } else {
      console.log(`Upload to R2 progress: ${(progress.loaded / (1024*1024)).toFixed(1)}MB loaded`);
    }
  });

  await upload.done();
  const publicDomain = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const r2PublicUrl = `https://${publicDomain}/${r2Key}`;
  console.log('✅ Uploaded to R2 successfully:', r2PublicUrl);

  // Test verify R2 public URL
  const testHead = await fetch(r2PublicUrl, { method: 'HEAD' });
  console.log('Public R2 check status:', testHead.status, 'Content-Length:', testHead.headers.get('content-length'));
}

migrateOne().catch(console.error);

