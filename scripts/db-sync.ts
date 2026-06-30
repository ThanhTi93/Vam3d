import { neon } from "@neondatabase/serverless";
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

  const sqlSource = neon(sourceUrl);
  const sqlDest = neon(destUrl);

  const tables = [
    { name: "payments", schemaTable: schema.payments },
    { name: "collection_images", schemaTable: schema.collectionImages },
    { name: "collections", schemaTable: schema.collections },
    { name: "ai_images", schemaTable: schema.aiImages },
    { name: "gallery_character", schemaTable: schema.galleryCharacter },
    { name: "ai_galleries", schemaTable: schema.aiGalleries },
    { name: "watch_history", schemaTable: schema.watchHistory },
    { name: "favorites", schemaTable: schema.favorites },
    { name: "like", schemaTable: schema.like },
    { name: "accounts", schemaTable: schema.accounts },
    { name: "episodes_character", schemaTable: schema.episodesCharacter },
    { name: "episodes_actor", schemaTable: schema.episodesActor },
    { name: "episodes", schemaTable: schema.episodes },
    { name: "actors", schemaTable: schema.actors },
    { name: "characters", schemaTable: schema.characters },
    { name: "movie_category", schemaTable: schema.movieCategory },
    { name: "categories", schemaTable: schema.categories },
    { name: "movies", schemaTable: schema.movies },
    { name: "packages", schemaTable: schema.packages },
    { name: "features", schemaTable: schema.features },
    { name: "plans", schemaTable: schema.plans },
    { name: "authors", schemaTable: schema.authors }
  ];

  console.log("🧹 Wiping destination tables...");
  for (const table of tables) {
    console.log(`Clearing: ${table.name}`);
    await sqlDest.query(`DELETE FROM "${table.name}"`);
  }

  console.log("\n🚀 Copying data...");
  const copyOrder = [...tables].reverse();
  for (const table of copyOrder) {
    console.log(`Reading: ${table.name}`);
    const res = await sqlSource.query(`SELECT * FROM "${table.name}"`);
    const rows = Array.isArray(res) ? res : (res && (res as any).rows) || [];
    
    if (rows.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        
        const keys = Object.keys(chunk[0]);
        const columns = keys.map(k => `"${k}"`).join(", ");
        
        let paramIndex = 1;
        const valuePlaceholders: string[] = [];
        const flatValues: any[] = [];
        
        for (const row of chunk) {
          const placeholders = keys.map(() => `$${paramIndex++}`).join(", ");
          valuePlaceholders.push(`(${placeholders})`);
          for (const key of keys) {
            flatValues.push(row[key]);
          }
        }
        
        const query = `INSERT INTO "${table.name}" (${columns}) VALUES ${valuePlaceholders.join(", ")}`;
        await sqlDest.query(query, flatValues);
      }
      console.log(`✅ Copied ${rows.length} rows into ${table.name}`);
    } else {
      console.log(`ℹ️ Table ${table.name} is empty.`);
    }
  }

  console.log("\n✨ Database synchronization completed successfully!\n");
}

main().catch((err) => {
  console.error("❌ Sync failed with error:", err);
  process.exit(1);
});
