import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import postgres from "postgres";
import sharp from "sharp";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

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

function getThumbR2KeyFromUrl(resolvedUrl) {
  try {
    const parsed = new URL(resolvedUrl);
    const key = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
    if (!key) return null;
    if (key.endsWith("display.webp") || key.endsWith("thumb.webp") || key.endsWith("original.png") || key.endsWith(".thumb.webp")) {
      return null;
    }
    if (!/\.(webp|png|jpe?g)$/i.test(key)) {
      return null;
    }
    return key.replace(/\.(webp|png|jpe?g)$/i, ".thumb.webp");
  } catch {
    return null;
  }
}

async function existsOnR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function convertAndUpload(sourceUrl, thumbKey, force = false) {
  if (!force && (await existsOnR2(thumbKey))) {
    return { skipped: true };
  }
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
      Key: thumbKey,
      Body: mobileBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    skipped: false,
    publicUrl: `https://${R2_PUBLIC_DOMAIN}/${thumbKey}`,
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
  const forceAll = process.argv.includes("--force");

  const moviesRows = await sql`SELECT id, name, img_url FROM movies WHERE img_url IS NOT NULL AND img_url <> '' ORDER BY id ASC`;
  const episodeRows = await sql`SELECT id, name, banner FROM episodes WHERE banner IS NOT NULL AND banner <> '' ORDER BY id ASC`;

  // Deduplicate URLs across movies & episodes
  const tasksMap = new Map();
  for (const m of moviesRows) {
    const srcUrl = resolveImageUrl(m.img_url);
    const thumbKey = getThumbR2KeyFromUrl(srcUrl);
    if (thumbKey && !tasksMap.has(thumbKey)) {
      tasksMap.set(thumbKey, { type: "Movie", id: m.id, srcUrl, thumbKey });
    }
  }
  for (const ep of episodeRows) {
    const srcUrl = resolveImageUrl(ep.banner);
    const thumbKey = getThumbR2KeyFromUrl(srcUrl);
    if (thumbKey && !tasksMap.has(thumbKey)) {
      tasksMap.set(thumbKey, { type: "Episode", id: ep.id, srcUrl, thumbKey });
    }
  }

  const tasks = Array.from(tasksMap.values());
  console.log(`📦 Tổng số ảnh độc lập cần tạo bản Mobile (.thumb.webp) trên Cloudflare R2: ${tasks.length}`);

  let totalOrigBytes = 0;
  let totalMobileBytes = 0;
  let convertedCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  await processBatch(tasks, 6, async (task, i) => {
    try {
      const res = await convertAndUpload(task.srcUrl, task.thumbKey, forceAll);
      if (res.skipped) {
        skippedCount++;
        console.log(`  [${i + 1}/${tasks.length}] ⏭️ Đã có sẵn: ${task.thumbKey}`);
      } else {
        convertedCount++;
        totalOrigBytes += res.origBytes;
        totalMobileBytes += res.mobileBytes;
        console.log(
          `  [${i + 1}/${tasks.length}] ✅ ${task.thumbKey}: ${(res.origBytes / 1024).toFixed(1)} KiB -> ${(res.mobileBytes / 1024).toFixed(1)} KiB`
        );
      }
    } catch (err) {
      failCount++;
      console.error(`  [${i + 1}/${tasks.length}] ❌ Lỗi (${task.thumbKey}):`, err.message);
    }
  });

  const savedPct =
    totalOrigBytes > 0 ? (((totalOrigBytes - totalMobileBytes) / totalOrigBytes) * 100).toFixed(1) : "0";

  console.log("\n==========================================");
  console.log(`🎉 HOÀN TẤT TẠO ẢNH MOBILE (.thumb.webp) TRÊN CLOUDFLARE R2!`);
  console.log(`   - Đã convert mới: ${convertedCount} ảnh`);
  console.log(`   - Đã có sẵn (bỏ qua): ${skippedCount} ảnh`);
  console.log(`   - Lỗi: ${failCount} ảnh`);
  if (convertedCount > 0) {
    console.log(
      `   - Dung lượng: ${(totalOrigBytes / 1024 / 1024).toFixed(2)} MB -> ${(totalMobileBytes / 1024 / 1024).toFixed(2)} MB (Giảm ${savedPct}%)`
    );
  }
  console.log("==========================================");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
