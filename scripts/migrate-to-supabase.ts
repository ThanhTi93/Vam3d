import postgres from "postgres";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env and .env.local
const envPath = path.join(process.cwd(), ".env");
const envLocalPath = path.join(process.cwd(), ".env.local");

const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const neonUrl = process.env.NEON_DATABASE_URL || envLocalConfig.DATABASE_URL || envConfig.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

async function migrate() {
  console.log("==================================================");
  console.log("🚀 MIGRATION: NEON POSTGRES ➔ SUPABASE POSTGRES");
  console.log("==================================================\n");

  if (!neonUrl) {
    console.error("❌ Lỗi: Chưa tìm thấy chuỗi kết nối nguồn Neon (NEON_DATABASE_URL).");
    process.exit(1);
  }

  if (!supabaseUrl || supabaseUrl === neonUrl) {
    console.error("❌ Lỗi: Cần cung cấp chuỗi kết nối đích SUPABASE_DATABASE_URL hợp lệ.");
    process.exit(1);
  }

  console.log("📡 Nguồn (Neon):", neonUrl.replace(/:[^:@]+@/, ":****@"));
  console.log("🎯 Đích (Supabase):", supabaseUrl.replace(/:[^:@]+@/, ":****@"));

  const sqlSource = postgres(neonUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
  const sqlDest = postgres(supabaseUrl, {
    prepare: false,
    ssl: { rejectUnauthorized: false }
  });

  const tables = [
    "authors",
    "plans",
    "features",
    "packages",
    "movies",
    "categories",
    "movie_category",
    "characters",
    "actors",
    "episodes",
    "episodes_actor",
    "episodes_character",
    "accounts",
    "like",
    "favorites",
    "watch_history",
    "ai_galleries",
    "gallery_character",
    "ai_images",
    "collections",
    "collection_images",
    "payments"
  ];

  try {
    console.log("\n🧹 Xóa dữ liệu cũ trên Supabase (nếu có) để tránh xung đột khóa chính...");
    for (const table of [...tables].reverse()) {
      try {
        await sqlDest.unsafe(`DELETE FROM "${table}"`);
        console.log(`  ✓ Đã dọn dẹp bảng: ${table}`);
      } catch (err: any) {
        console.warn(`  ⚠️ Cảnh báo khi dọn dẹp bảng ${table}: ${err.message}`);
      }
    }

    console.log("\n📦 Bắt đầu sao chép dữ liệu từ Neon sang Supabase...");
    let totalRows = 0;

    for (const table of tables) {
      const res = await sqlSource.query(`SELECT * FROM "${table}"`);
      const rows = Array.isArray(res) ? res : (res && (res as any).rows) || [];

      if (rows.length > 0) {
        // Insert into Supabase in chunks of 100
        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await sqlDest`INSERT INTO ${sqlDest(table)} ${sqlDest(chunk)}`;
        }
        console.log(`  ✅ Bảng ${table}: Đã chuyển thành công ${rows.length} dòng.`);
        totalRows += rows.length;
      } else {
        console.log(`  ℹ️ Bảng ${table}: 0 dòng (trống).`);
      }
    }

    // Reset sequences for auto-increment serial IDs in Postgres
    console.log("\n🔄 Cập nhật lại chuỗi số tự tăng (auto-increment sequence) trên Supabase...");
    for (const table of tables) {
      try {
        await sqlDest.unsafe(`
          SELECT setval(
            pg_get_serial_sequence('"${table}"', 'id'),
            COALESCE((SELECT MAX(id) FROM "${table}"), 1),
            true
          );
        `);
      } catch (e) {
        // Ignore if table has no serial id
      }
    }

    console.log(`\n🎉 HOÀN THÀNH XUẤT SẮC! Tổng cộng đã chuyển ${totalRows} dòng dữ liệu sang Supabase.`);
  } catch (error: any) {
    console.error("\n❌ Lỗi trong quá trình chuyển đổi:", error.message || error);
  } finally {
    await sqlDest.end();
  }
}

migrate();
