import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const login = process.env.STREAMTAPE_API_LOGIN || '439070443d3e6fe76376';
const key = process.env.STREAMTAPE_API_KEY || 'RpAWzXJbpXI0lR';
const dbUrl = process.env.DATABASE_URL || 'postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_DOMAIN) {
  console.error('❌ Missing R2 environment variables!');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const sql = postgres(dbUrl);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function migrateAll() {
  console.log('=== BẮT ĐẦU CHUYỂN TẤT CẢ VIDEO STREAMTAPE SANG CLOUDFLARE R2 ===\n');

  const rows = await sql.unsafe("SELECT id, id_movie, name, slug, url FROM episodes WHERE url LIKE '%streamtape%' ORDER BY id ASC");
  console.log(`📌 Tìm thấy tổng cộng ${rows.length} tập phim đang dùng link Streamtape trong Database.`);

  if (rows.length === 0) {
    console.log('✅ Không còn tập phim nào dùng Streamtape! Tất cả đã sạch bóng Streamtape.');
    await sql.end();
    return;
  }

  let successCount = 0;
  let failedCount = 0;
  let dead404Count = 0;

  for (let i = 0; i < rows.length; i++) {
    const ep = rows[i];
    console.log(`\n------------------------------------------------------------`);
    console.log(`[${i + 1}/${rows.length}] Đang xử lý Tập #${ep.id}: "${ep.name}"`);
    console.log(`URL hiện tại: ${ep.url}`);

    const match = ep.url.match(/streamtape\.com\/(?:e|v)\/([a-zA-Z0-9]+)/);
    if (!match) {
      console.warn(`⚠️ Không trích xuất được fileId từ URL: ${ep.url}`);
      failedCount++;
      continue;
    }

    const fileId = match[1];

    try {
      // 1. Kiểm tra dlticket
      console.log(`1. Xin vé tải (dlticket) cho file ${fileId}...`);
      const ticketRes = await fetch(`https://api.streamtape.com/file/dlticket?file=${fileId}&login=${login}&key=${key}`);
      const ticket = await ticketRes.json();

      if (!ticket?.result?.ticket) {
        if (ticket?.status === 404 || ticket?.msg === 'file not found') {
          console.warn(`❌ Tập #${ep.id} đã bị Streamtape xóa (404 Not Found trên Streamtape). Bỏ qua.`);
          dead404Count++;
        } else {
          console.warn(`⚠️ Lỗi lấy vé từ Streamtape:`, ticket?.msg || ticket);
          failedCount++;
        }
        continue;
      }

      const waitMs = ((ticket.result.wait_time || 5) + 1) * 1000;
      console.log(`2. Chờ ${waitMs / 1000}s theo quy định Streamtape...`);
      await sleep(waitMs);

      // 2. Lấy link stream gốc
      console.log(`3. Lấy direct download URL...`);
      const dlRes = await fetch(`https://api.streamtape.com/file/dl?file=${fileId}&ticket=${ticket.result.ticket}`);
      const dl = await dlRes.json();

      if (!dl?.result?.url) {
        console.warn(`⚠️ Không lấy được link tải trực tiếp từ Streamtape:`, dl?.msg || dl);
        failedCount++;
        continue;
      }

      const directVideoUrl = dl.result.url;
      const fileSizeMb = (dl.result.size / (1024 * 1024)).toFixed(1);
      console.log(`4. Tải và đẩy trực tiếp video (${fileSizeMb} MB) sang Cloudflare R2...`);

      const videoResp = await fetch(directVideoUrl);
      if (!videoResp.ok || !videoResp.body) {
        throw new Error(`Lỗi tải stream từ Streamtape CDN: HTTP ${videoResp.status}`);
      }

      const r2Key = `videos/ep-${ep.id}.mp4`;
      const nodeReadable = Readable.fromWeb(videoResp.body);

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: R2_BUCKET_NAME,
          Key: r2Key,
          Body: nodeReadable,
          ContentType: 'video/mp4',
        },
        partSize: 10 * 1024 * 1024,
        queueSize: 4,
      });

      let lastReport = Date.now();
      upload.on('httpUploadProgress', (p) => {
        if (Date.now() - lastReport > 2000) {
          lastReport = Date.now();
          const loadedMb = (p.loaded / (1024 * 1024)).toFixed(1);
          console.log(`   -> Tiến độ sang R2: ${loadedMb} MB...`);
        }
      });

      await upload.done();

      const newR2PublicUrl = `https://${R2_PUBLIC_DOMAIN}/${r2Key}`;
      console.log(`✅ Đã đẩy thành công lên Cloudflare R2: ${newR2PublicUrl}`);

      // 5. Cập nhật URL trong PostgreSQL
      await sql.unsafe(`UPDATE episodes SET url = $1 WHERE id = $2`, [newR2PublicUrl, ep.id]);
      console.log(`💾 Đã cập nhật Database tập #${ep.id} -> ${newR2PublicUrl}`);

      successCount++;
    } catch (err) {
      console.error(`❌ Thất bại khi di chuyển tập #${ep.id}:`, err?.message || err);
      failedCount++;
    }
  }

  console.log(`\n============================================================`);
  console.log(`🏁 HOÀN TẤT QUÁ TRÌNH CHUYỂN ĐỔI:`);
  console.log(`   - Chuyển thành công sang R2: ${successCount} tập`);
  console.log(`   - Bị 404 sẵn trên Streamtape: ${dead404Count} tập (cần up file mới)`);
  console.log(`   - Thất bại do lỗi khác: ${failedCount} tập`);
  console.log(`============================================================\n`);

  await sql.end();
}

migrateAll().catch(async (e) => {
  console.error('Lỗi nghiêm trọng:', e);
  await sql.end();
  process.exit(1);
});

