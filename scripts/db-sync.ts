import postgres from "postgres";
import * as schema from "../lib/db/schema";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Parse .env and .env.local connection strings
const envPath = path.join(process.cwd(), ".env");
const envLocalPath = path.join(process.cwd(), ".env.local");

const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const prodUrl = envConfig.DATABASE_URL;
const devUrl = envLocalConfig.DATABASE_URL || prodUrl;

const mode = process.argv[2]; // "push" or "pull"

if (mode !== "push" && mode !== "pull") {
  console.error("❌ ERROR: Mode must be either 'push' or 'pull'.");
  process.exit(1);
}

if (!prodUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in .env (production).");
  process.exit(1);
}
if (!devUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in .env.local (development).");
  process.exit(1);
}

const isPush = mode === "push";
const sourceUrl = isPush ? devUrl : prodUrl;
const destUrl = isPush ? prodUrl : devUrl;

const sourceName = isPush ? "Vam3d (Development)" : "production (Sản xuất)";
const destName = isPush ? "production (Sản xuất)" : "Vam3d (Development)";

async function main() {
  console.log(`\n🔄 Starting Database Sync [${mode.toUpperCase()}]`);
  console.log(`📡 Source:      ${sourceName}`);
  console.log(`🎯 Destination: ${destName}\n`);

  if (sourceUrl === destUrl) {
    console.error("❌ ERROR: Source and destination database URLs are identical. Sync cancelled.");
    process.exit(1);
  }

  const sqlSource = postgres(sourceUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
  const sqlDest = postgres(destUrl, { prepare: false, ssl: { rejectUnauthorized: false } });

  const tables = [
    "payments",
    "collection_images",
    "collections",
    "ai_images",
    "gallery_character",
    "ai_galleries",
    "watch_history",
    "favorites",
    "like",
    "accounts",
    "episodes_character",
    "episodes_actor",
    "episodes",
    "actors",
    "characters",
    "movie_category",
    "categories",
    "movies",
    "packages",
    "features",
    "plans",
    "authors"
  ];

  try {
    console.log("🧹 Wiping destination tables...");
    for (const table of tables) {
      console.log(`Clearing: ${table}`);
      await sqlDest.unsafe(`DELETE FROM "${table}"`);
    }

    console.log("\n🚀 Copying data...");
    const copyOrder = [...tables].reverse();
    for (const table of copyOrder) {
      console.log(`Reading: ${table}`);
      const rows = await sqlSource.unsafe(`SELECT * FROM "${table}"`);
      
      if (rows && rows.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await sqlDest`INSERT INTO ${sqlDest(table)} ${sqlDest(chunk)}`;
        }
        console.log(`✅ Copied ${rows.length} rows into ${table}`);
      } else {
        console.log(`ℹ️ Table ${table} is empty.`);
      }
    }

    console.log("\n✨ Database synchronization completed successfully!\n");
  } finally {
    await sqlSource.end();
    await sqlDest.end();
  }
}

main().catch((err) => {
  console.error("❌ Sync failed with error:", err);
  process.exit(1);
});
