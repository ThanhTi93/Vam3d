import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const dbUrl = process.env.DATABASE_URL || 'postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d';
const sql = postgres(dbUrl);

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listAllInEpisodes() {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: 'episodes/',
  });
  const res = await s3.send(command);
  return res.Contents || [];
}

async function moveObject(oldKey, newKey) {
  // 1. Copy
  await s3.send(new CopyObjectCommand({
    Bucket: R2_BUCKET_NAME,
    CopySource: `${R2_BUCKET_NAME}/${oldKey}`,
    Key: newKey,
  }));
  // 2. Delete old
  await s3.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: oldKey,
  }));
}

async function run() {
  console.log('=== BẮT ĐẦU TÁCH THƯ MỤC VIDEO VÀ ẢNH BANNER TRÊN CLOUDFLARE R2 ===\n');

  const items = await listAllInEpisodes();
  console.log(`Tìm thấy tổng cộng ${items.length} tệp trong thư mục /episodes/`);

  const videoItems = items.filter(i => i.Key.endsWith('.mp4'));
  const bannerItems = items.filter(i => !i.Key.endsWith('.mp4'));

  console.log(` - File Video (.mp4): ${videoItems.length} tệp -> Sẽ chuyển sang thư mục /videos/`);
  console.log(` - File Ảnh banner (.webp / .jpg): ${bannerItems.length} tệp -> Sẽ chuyển sang thư mục /banners/`);

  // 1. Chuyển video sang /videos/
  console.log('\n--- 1. ĐANG TÁCH VIDEO SANG /videos/ ---');
  for (let i = 0; i < videoItems.length; i++) {
    const item = videoItems[i];
    const fileName = item.Key.replace('episodes/', '');
    const newKey = `videos/${fileName}`;
    await moveObject(item.Key, newKey);
    console.log(`   [${i + 1}/${videoItems.length}] Chuyển video: ${item.Key} -> ${newKey}`);
  }

  // 2. Chuyển ảnh banner sang /banners/
  console.log('\n--- 2. ĐANG TÁCH ẢNH BANNER SANG /banners/ ---');
  for (let i = 0; i < bannerItems.length; i++) {
    const item = bannerItems[i];
    const fileName = item.Key.replace('episodes/', '');
    const newKey = `banners/${fileName}`;
    await moveObject(item.Key, newKey);
    console.log(`   [${i + 1}/${bannerItems.length}] Chuyển banner: ${item.Key} -> ${newKey}`);
  }

  // 3. Cập nhật URL trong PostgreSQL
  console.log('\n--- 3. ĐANG CẬP NHẬT DATABASE POSTGRESQL ---');
  const rVideo = await sql.unsafe(`UPDATE episodes SET url = REPLACE(url, '/episodes/', '/videos/') WHERE url LIKE '%/episodes/%'`);
  console.log(`✅ Đã cập nhật đường dẫn video trong bảng episodes: ${rVideo.count} bản ghi`);

  const rBanner = await sql.unsafe(`UPDATE episodes SET banner = REPLACE(banner, '/episodes/', '/banners/') WHERE banner LIKE '%/episodes/%'`);
  console.log(`✅ Đã cập nhật đường dẫn banner trong bảng episodes: ${rBanner.count} bản ghi`);

  console.log('\n============================================================');
  console.log('🎉 HOÀN TẤT TÁCH THƯ MỤC THÀNH CÔNG:');
  console.log(`   📁 /videos/  : Chuyên chứa toàn bộ video tập phim (.mp4)`);
  console.log(`   📁 /banners/ : Chuyên chứa toàn bộ ảnh banner tập phim (.webp)`);
  console.log('============================================================\n');

  await sql.end();
}

run().catch(async (e) => {
  console.error('Lỗi:', e);
  await sql.end();
  process.exit(1);
});

