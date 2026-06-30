import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
const envLocalPath = path.join(process.cwd(), ".env.local");
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const storageZone = envLocalConfig.BUNNY_STORAGE_ZONE_NAME;
const accessKey = envLocalConfig.BUNNY_STORAGE_ACCESS_KEY;
const dbUrl = envLocalConfig.DATABASE_URL;

if (!storageZone || !accessKey || !dbUrl) {
  console.error("❌ ERROR: Missing credentials in .env.local.");
  process.exit(1);
}

async function listFolder(folderPath: string) {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderPath}/`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { AccessKey: accessKey, Accept: "application/json" }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function main() {
  const sql = neon(dbUrl);
  console.log("⏳ Comparing database image counts to Bunny Storage folders...");

  const galleries = await sql`SELECT id, name FROM "ai_galleries" ORDER BY id ASC`;
  const bunnyGalleries = await listFolder("ai_galleries");

  for (const g of galleries) {
    // Find the corresponding folder name on Bunny Storage
    // The folder name on bunny starts with the gallery name (using underscores)
    const cleanName = g.name.replace(/ /g, "_").toLowerCase();
    
    // Find matching folder
    const folder = bunnyGalleries.find((item: any) => {
      if (!item.IsDirectory) return false;
      const folderNameLower = item.ObjectName.toLowerCase();
      // Match name prefix or if it's the exact folder name
      return folderNameLower.startsWith(cleanName) || cleanName.startsWith(folderNameLower);
    });

    const dbImages = await sql.query('SELECT COUNT(*) FROM "ai_images" WHERE id_gallery = $1', [g.id]);
    const dbCount = parseInt((dbImages as any)[0].count);

    if (folder) {
      const bunnyImages = await listFolder(`ai_galleries/${folder.ObjectName}`);
      const bunnyCount = bunnyImages.length;
      
      console.log(`Gallery ID ${g.id} ("${g.name}"):`);
      console.log(`  └─ DB count:    ${dbCount}`);
      console.log(`  └─ Bunny count: ${bunnyCount}`);
      
      if (dbCount > bunnyCount) {
        console.log(`  ⚠️ WARNING: DB count is greater than Bunny Storage folder size!`);
      }
    } else {
      console.log(`Gallery ID ${g.id} ("${g.name}"): DB count: ${dbCount} (No matching folder found on Bunny!)`);
    }
  }
}

main().catch(console.error);
