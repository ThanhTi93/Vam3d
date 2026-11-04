import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const BUNNY_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME || 'vam3d-gallery';
const BUNNY_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY || 'a645f8a9-a9e9-4387-ba173cd0f932-39a5-4e31';
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

function getContentType(path) {
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

async function listBunnyDir(path = '') {
  const cleanPath = path ? (path.endsWith('/') ? path : `${path}/`) : '';
  const url = `https://storage.bunnycdn.com/${BUNNY_ZONE}/${cleanPath}`;
  const res = await fetch(url, { headers: { AccessKey: BUNNY_KEY } });
  if (!res.ok) return [];
  return res.json();
}

async function uploadFileToR2(relPath) {
  const cleanPath = relPath.replace(/^\/+/, '');
  // 1. Fetch from Bunny Storage API
  const bunnyUrl = `https://storage.bunnycdn.com/${BUNNY_ZONE}/${cleanPath}`;
  const res = await fetch(bunnyUrl, { headers: { AccessKey: BUNNY_KEY } });
  if (!res.ok) {
    throw new Error(`Bunny download failed for ${cleanPath}: HTTP ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = getContentType(cleanPath);

  // 2. Put to R2
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: cleanPath,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return `https://${R2_PUBLIC_DOMAIN}/${cleanPath}`;
}

async function migrateFolder(folderName) {
  console.log(`\n📁 Đang quét thư mục /${folderName}...`);
  const items = await listBunnyDir(folderName);
  const files = items.filter(i => !i.IsDirectory);
  console.log(`Tìm thấy ${files.length} tệp trong /${folderName}`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relPath = `${folderName}/${file.ObjectName}`;
    try {
      await uploadFileToR2(relPath);
      success++;
      process.stdout.write(`\r   [${i + 1}/${files.length}] Đã chuyển: ${relPath}`);
    } catch (err) {
      failed++;
      console.error(`\n❌ Lỗi file ${relPath}:`, err.message);
    }
  }
  console.log(`\n✅ Hoàn tất /${folderName}: Thành công ${success}, Lỗi ${failed}`);
}

async function migrateAiGalleries() {
  console.log(`\n📁 Đang quét danh mục /ai_galleries...`);
  const subfolders = await listBunnyDir('ai_galleries');
  console.log(`Tìm thấy ${subfolders.length} album trong /ai_galleries`);

  let totalImages = 0;
  let successImages = 0;
  let failedImages = 0;

  for (let i = 0; i < subfolders.length; i++) {
    const folder = subfolders[i];
    if (!folder.IsDirectory) continue;

    const albumPath = `ai_galleries/${folder.ObjectName}`;
    const images = await listBunnyDir(albumPath);
    const files = images.filter(img => !img.IsDirectory);
    totalImages += files.length;

    console.log(`\n[${i + 1}/${subfolders.length}] Album "${folder.ObjectName}" (${files.length} ảnh)...`);

    // Concurrent batching for speed (10 concurrent requests per album)
    const BATCH_SIZE = 10;
    for (let j = 0; j < files.length; j += BATCH_SIZE) {
      const batch = files.slice(j, j + BATCH_SIZE);
      await Promise.all(
        batch.map(async (f) => {
          const relPath = `${albumPath}/${f.ObjectName}`;
          try {
            await uploadFileToR2(relPath);
            successImages++;
          } catch (err) {
            failedImages++;
          }
        })
      );
      process.stdout.write(`\r   -> Tiến độ album: ${Math.min(j + BATCH_SIZE, files.length)}/${files.length} ảnh (Tổng R2: ${successImages})`);
    }
  }

  console.log(`\n🏁 Hoàn tất /ai_galleries: Đã chuyển ${successImages}/${totalImages} ảnh sang R2 (Lỗi: ${failedImages})`);
}

async function updateDatabaseUrls() {
  console.log('\n============================================================');
  console.log('🔄 ĐANG CẬP NHẬT TOÀN BỘ ĐƯỜNG DẪN ẢNH TRONG DATABASE SANG R2...');
  console.log('============================================================');

  const oldDomains = ['vam3d.b-cdn.net', 'cdn.vam3dhentai.online'];
  for (const oldDom of oldDomains) {
    console.log(`\nThay thế "${oldDom}" -> "${R2_PUBLIC_DOMAIN}":`);

    const rMovies = await sql.unsafe(`UPDATE movies SET img_url = REPLACE(img_url, $1, $2) WHERE img_url LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng movies: ${rMovies.count} bản ghi`);

    const rEps = await sql.unsafe(`UPDATE episodes SET banner = REPLACE(banner, $1, $2) WHERE banner LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng episodes: ${rEps.count} bản ghi`);

    const rChars = await sql.unsafe(`UPDATE characters SET img_url = REPLACE(img_url, $1, $2) WHERE img_url LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng characters: ${rChars.count} bản ghi`);

    const rActs = await sql.unsafe(`UPDATE actors SET img_url = REPLACE(img_url, $1, $2) WHERE img_url LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng actors: ${rActs.count} bản ghi`);

    const rAccs = await sql.unsafe(`UPDATE accounts SET img_url = REPLACE(img_url, $1, $2) WHERE img_url LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng accounts: ${rAccs.count} bản ghi`);

    const rAi = await sql.unsafe(`UPDATE ai_images SET img_url = REPLACE(img_url, $1, $2) WHERE img_url LIKE $3`, [oldDom, R2_PUBLIC_DOMAIN, `%${oldDom}%`]);
    console.log(` - Cập nhật bảng ai_images: ${rAi.count} bản ghi`);
  }

  // Also handle relative paths (e.g. "movies/abc.webp" -> "https://${R2_PUBLIC_DOMAIN}/movies/abc.webp")
  console.log('\nChuẩn hoá các đường dẫn tương đối (không có http):');
  const rRelMovies = await sql.unsafe(`UPDATE movies SET img_url = CONCAT('https://${R2_PUBLIC_DOMAIN}/', LTRIM(img_url, '/')) WHERE img_url NOT LIKE 'http%' AND img_url IS NOT NULL AND LENGTH(img_url) > 0`);
  console.log(` - Chuẩn hoá movies: ${rRelMovies.count} bản ghi`);

  const rRelEps = await sql.unsafe(`UPDATE episodes SET banner = CONCAT('https://${R2_PUBLIC_DOMAIN}/', LTRIM(banner, '/')) WHERE banner NOT LIKE 'http%' AND banner IS NOT NULL AND LENGTH(banner) > 0`);
  console.log(` - Chuẩn hoá episodes: ${rRelEps.count} bản ghi`);

  const rRelChars = await sql.unsafe(`UPDATE characters SET img_url = CONCAT('https://${R2_PUBLIC_DOMAIN}/', LTRIM(img_url, '/')) WHERE img_url NOT LIKE 'http%' AND img_url IS NOT NULL AND LENGTH(img_url) > 0`);
  console.log(` - Chuẩn hoá characters: ${rRelChars.count} bản ghi`);

  console.log('\n🎉 ĐÃ CẬP NHẬT XONG DATABASE SANG CLOUDFLARE R2!');
}

async function run() {
  console.log('=== BẮT ĐẦU CHUYỂN TOÀN BỘ ẢNH TỪ BUNNY SANG CLOUDFLARE R2 ===\n');

  // Giai đoạn 1: Chuyển các thư mục cốt lõi trước (movies, episodes, characters, avatar)
  await migrateFolder('movies');
  await migrateFolder('episodes');
  await migrateFolder('characters');
  await migrateFolder('avatar');

  // Giai đoạn 2: Cập nhật URL trong database ngay để website sử dụng luôn
  await updateDatabaseUrls();

  // Giai đoạn 3: Chuyển toàn bộ kho AI Galleries
  await migrateAiGalleries();

  console.log('\n============================================================');
  console.log('🏁 TẤT CẢ HÌNH ẢNH ĐÃ ĐƯỢC CHUYỂN SANG CLOUDFLARE R2 THÀNH CÔNG!');
  console.log('============================================================\n');

  await sql.end();
}

run().catch(async (e) => {
  console.error('Lỗi nghiêm trọng:', e);
  await sql.end();
  process.exit(1);
});

