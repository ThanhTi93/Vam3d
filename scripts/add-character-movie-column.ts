import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import postgres from "postgres";

const envPath = path.join(process.cwd(), ".env");
const envLocalPath = path.join(process.cwd(), ".env.local");

const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const urls = Array.from(new Set([
  envLocalConfig.DATABASE_URL || process.env.DATABASE_URL,
  envConfig.DATABASE_URL
].filter(Boolean))) as string[];

async function main() {
  if (urls.length === 0) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  for (const url of urls) {
    console.log(`⏳ Adding 'id_movie' column to characters table on DB: ${url.substring(0, 35)}...`);
    const sql = postgres(url, { prepare: false, ssl: { rejectUnauthorized: false } });
    await sql.query(`
      ALTER TABLE "characters"
      ADD COLUMN IF NOT EXISTS id_movie INTEGER REFERENCES movies(id) ON DELETE SET NULL;
    `);
    console.log("✅ Done adding column!");
  }
}

main().catch(console.error);
