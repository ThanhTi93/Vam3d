import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import postgres from "postgres";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables from .env.local (or .env fallback)
const envLocalPath = path.join(process.cwd(), ".env.local");
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN ||
  process.env.R2_PUBLIC_DOMAIN ||
  "pub-990b17b26195410f8d6faba5f800f6bf.r2.dev"
)
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

if (!DATABASE_URL || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error("❌ Thiếu biến môi trường DATABASE_URL hoặc R2_* trong .env.local");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const isLocalDb = DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1");
const sql = postgres(DATABASE_URL, {
  prepare: false,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

function resolveImageUrl(rawUrl) {
  if (!rawUrl) return "";
  let processed = rawUrl.trim();
  const cdnUrl = `https://${R2_PUBLIC_DOMAIN}`;
  if (processed.startsWith("//")) processed = `https:${processed}`;
  processed = processed.replace(/https?:\/\/[a-zA-Z0-9._-]*b-cdn\.net/gi, cdnUrl);
  processed = processed.replace(/https?:\/\/cdn\.vam3dhentai\.online/gi, cdnUrl);
  processed = processed.replace(/^[a-zA-Z0-9._-]*b-cdn\.net/gi, cdnUrl);
  processed = processed.replace(/^cdn\.vam3dhentai\.online/gi, cdnUrl);
  if (!processed.startsWith("http://") && !processed.startsWith("https://")) {
    const cleanPath = processed.startsWith("/") ? processed : `/${processed}`;
    processed = `${cdnUrl}${cleanPath}`;
  }
  return processed;
}

function sanitizeSlug(str, fallback) {
  const base = (str || fallback || "img")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
  return base || String(fallback || "img");
}

async function convertAndUpload(sourceUrl, r2Key) {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "Vam3D-Image-Optimizer/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi tải ${sourceUrl}`);
  }
  const origBuffer = Buffer.from(await res.arrayBuffer());
  const mobileBuffer = await sharp(origBuffer)
    .resize({ width: 520, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: mobileBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    publicUrl: `https://${R2_PUBLIC_DOMAIN}/${r2Key}`,
    origBytes: origBuffer.length,
    mobileBytes: mobileBuffer.length,
  };
}

async function processBatch(items, concurrency, handler) {
  let idx = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const current = idx++;
      await handler(items[current], current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log("🚀 1. Kiểm tra cột mobile_img_url (movies) và mobile_banner (episodes)...");
  const cols = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE (table_name = 'movies' AND column_name = 'mobile_img_url')
       OR (table_name = 'episodes' AND column_name = 'mobile_banner')
  `;
  const hasMovieCol = cols.some((c) => c.table_name === "movies" && c.column_name === "mobile_img_url");
  const hasEpCol = cols.some((c) => c.table_name === "episodes" && c.column_name === "mobile_banner");

  if (!hasMovieCol || !hasEpCol) {
    try {
      if (!hasMovieCol) await sql`ALTER TABLE movies ADD COLUMN IF NOT EXISTS mobile_img_url VARCHAR(500)`;
      if (!hasEpCol) await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS mobile_banner VARCHAR(500)`;
      console.log("✅ Đã tự động tạo cột DB thành công.");
    } catch (err) {
      if (err.code === "42501") {
        console.error("\n⚠️ User DATABASE_URL không phải owner của bảng movies/episodes.");
        console.error("👉 Hãy chạy lệnh sau 1 lần duy nhất trên VPS (bằng user postgres) để thêm 2 cột:\n");
        console.error(
          `sudo -u postgres psql -d vam3d -c "ALTER TABLE movies ADD COLUMN IF NOT EXISTS mobile_img_url VARCHAR(500); ALTER TABLE episodes ADD COLUMN IF NOT EXISTS mobile_banner VARCHAR(500);"`
        );
        console.error("\nSau đó chạy lại: node scripts/generate-mobile-images.mjs");
        await sql.end();
        process.exit(1);
      }
      throw err;
    }
  } else {
    console.log("✅ Cột mobile_img_url và mobile_banner đã tồn tại sẵn.");
  }

  const forceAll = process.argv.includes("--force");

  const moviesRows = forceAll
    ? await sql`SELECT id, slug, name, img_url FROM movies WHERE img_url IS NOT NULL AND img_url <> '' ORDER BY id ASC`
    : await sql`SELECT id, slug, name, img_url FROM movies WHERE img_url IS NOT NULL AND img_url <> '' AND (mobile_img_url IS NULL OR mobile_img_url = '') ORDER BY id ASC`;

  const episodeRows = forceAll
    ? await sql`SELECT id, slug, name, banner FROM episodes WHERE banner IS NOT NULL AND banner <> '' ORDER BY id ASC`
    : await sql`SELECT id, slug, name, banner FROM episodes WHERE banner IS NOT NULL AND banner <> '' AND (mobile_banner IS NULL OR mobile_banner = '') ORDER BY id ASC`;

  console.log(`📦 Cần xử lý: ${moviesRows.length} phim và ${episodeRows.length} tập phim.`);

  let totalOrigBytes = 0;
  let totalMobileBytes = 0;
  let movieSuccess = 0;
  let movieFail = 0;
  let epSuccess = 0;
  let epFail = 0;

  // Process Movies
  await processBatch(moviesRows, 5, async (row, i) => {
    const srcUrl = resolveImageUrl(row.img_url);
    const safeName = sanitizeSlug(row.slug || row.name, row.id);
    const r2Key = `movies/mobile/movie_${row.id}_${safeName}.webp`;
    try {
      const { publicUrl, origBytes, mobileBytes } = await convertAndUpload(srcUrl, r2Key);
      await sql`UPDATE movies SET mobile_img_url = ${publicUrl} WHERE id = ${row.id}`;
      totalOrigBytes += origBytes;
      totalMobileBytes += mobileBytes;
      movieSuccess++;
      console.log(
        `  [Movie ${i + 1}/${moviesRows.length}] #${row.id} OK: ${(origBytes / 1024).toFixed(1)} KiB -> ${(mobileBytes / 1024).toFixed(1)} KiB`
      );
    } catch (err) {
      movieFail++;
      console.error(`  [Movie #${row.id}] ❌ Lỗi:`, err.message);
    }
  });

  // Process Episodes
  await processBatch(episodeRows, 5, async (row, i) => {
    const srcUrl = resolveImageUrl(row.banner);
    const safeName = sanitizeSlug(row.slug || row.name, row.id);
    const r2Key = `episodes/mobile/ep_${row.id}_${safeName}.webp`;
    try {
      const { publicUrl, origBytes, mobileBytes } = await convertAndUpload(srcUrl, r2Key);
      await sql`UPDATE episodes SET mobile_banner = ${publicUrl} WHERE id = ${row.id}`;
      totalOrigBytes += origBytes;
      totalMobileBytes += mobileBytes;
      epSuccess++;
      console.log(
        `  [Episode ${i + 1}/${episodeRows.length}] #${row.id} OK: ${(origBytes / 1024).toFixed(1)} KiB -> ${(mobileBytes / 1024).toFixed(1)} KiB`
      );
    } catch (err) {
      epFail++;
      console.error(`  [Episode #${row.id}] ❌ Lỗi:`, err.message);
    }
  });

  const savedPct =
    totalOrigBytes > 0 ? (((totalOrigBytes - totalMobileBytes) / totalOrigBytes) * 100).toFixed(1) : "0";

  console.log("\n==========================================");
  console.log(`🎉 HOÀN TẤT CONVERT & UPLOAD LÊN CLOUDFLARE R2!`);
  console.log(`   - Phim: ${movieSuccess} thành công, ${movieFail} lỗi`);
  console.log(`   - Tập phim: ${epSuccess} thành công, ${epFail} lỗi`);
  console.log(
    `   - Tổng dung lượng: ${(totalOrigBytes / 1024 / 1024).toFixed(2)} MB -> ${(totalMobileBytes / 1024 / 1024).toFixed(2)} MB (Giảm ${savedPct}%)`
  );
  console.log("==========================================");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
