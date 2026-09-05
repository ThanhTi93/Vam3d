import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envLocalPath = path.join(process.cwd(), ".env.local");
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};
const dbUrl = envLocalConfig.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set in .env.local.");
  process.exit(1);
}

async function main() {
  const sql = neon(dbUrl);
  console.log("🔍 Checking all galleries for duplicate records...");
  
  const galleries = await sql`SELECT id, name FROM "ai_galleries" ORDER BY id ASC`;
  let foundDupe = false;
  
  for (const g of galleries) {
    const images = await sql.query('SELECT img_url FROM "ai_images" WHERE id_gallery = $1', [g.id]);
    const urls = (images as any).map((r: any) => r.img_url);
    const uniqueUrls = new Set(urls);
    
    if (urls.length !== uniqueUrls.size) {
      console.log(`⚠️ DUPLICATE DETECTED: Gallery ID ${g.id} ("${g.name}") has ${urls.length} images, but only ${uniqueUrls.size} are unique!`);
      foundDupe = true;
    }
  }
  
  if (!foundDupe) {
    console.log("✅ No duplicate records found in any gallery.");
  }
}

main().catch(console.error);
