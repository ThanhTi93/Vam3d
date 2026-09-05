import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// Parse .env and .env.local
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
    console.log(`⏳ Adding 'name_en' & 'name_zh' columns to characters table on DB: ${url.substring(0, 30)}...`);
    const sql = neon(url);
    await sql.query(`
      ALTER TABLE "characters"
      ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
      ADD COLUMN IF NOT EXISTS name_zh VARCHAR(255);
    `);
    console.log("✅ Done adding columns!");
  }
}

main().catch(console.error);
