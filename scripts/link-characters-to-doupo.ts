import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

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
    console.log(`\n⏳ Processing database: ${url.substring(0, 35)}...`);
    const sql = neon(url);

    // Find movie 'Đấu Phá Thương Khung'
    const movies = await sql.query(`SELECT id, name FROM movies WHERE name ILIKE '%Đấu Phá Thương Khung%' LIMIT 1;`);
    
    if (movies.length === 0) {
      console.warn("⚠️ Movie 'Đấu Phá Thương Khung' not found in database.");
      continue;
    }

    const movieId = movies[0].id;
    console.log(`🎬 Found Movie '${movies[0].name}' with ID: ${movieId}`);

    const res = await sql.query(
      `UPDATE characters SET id_movie = $1 WHERE id_movie IS NULL OR id_movie != $1;`,
      [movieId]
    );

    console.log(`✅ Successfully updated characters to belong to '${movies[0].name}' (ID ${movieId})!`);
  }
}

main().catch(console.error);
