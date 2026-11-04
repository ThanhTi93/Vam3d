import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

const zone = process.env.BUNNY_STORAGE_ZONE_NAME || 'vam3d-gallery';
const bunnyKey = process.env.BUNNY_STORAGE_ACCESS_KEY;
const r2Bucket = process.env.R2_BUCKET_NAME;

async function testMigrateOne() {
  const filePath = 'movies/Dau_Pha_Thuong_Khung_bbkmxp.webp';
  console.log(`1. Fetching from Bunny: ${filePath}...`);
  const res = await fetch(`https://storage.bunnycdn.com/${zone}/${filePath}`, {
    headers: { AccessKey: bunnyKey }
  });
  if (!res.ok) throw new Error(`Bunny download failed: HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`2. Downloaded ${buffer.length} bytes. Uploading to R2: ${filePath}...`);

  await s3.send(new PutObjectCommand({
    Bucket: r2Bucket,
    Key: filePath,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000',
  }));

  const publicUrl = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${filePath}`;
  console.log(`3. Uploaded to R2 successfully: ${publicUrl}`);

  const check = await fetch(publicUrl, { method: 'HEAD' });
  console.log(`4. Verified public R2 URL: HTTP ${check.status}, size: ${check.headers.get('content-length')}, type: ${check.headers.get('content-type')}`);
}

testMigrateOne().catch(console.error);

