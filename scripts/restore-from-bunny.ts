import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
const envLocalPath = path.join(process.cwd(), ".env.local");
const envLocalConfig = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const storageZone = envLocalConfig.BUNNY_STORAGE_ZONE_NAME;
const accessKey = envLocalConfig.BUNNY_STORAGE_ACCESS_KEY;
const cdnUrl = (envLocalConfig.NEXT_PUBLIC_BUNNY_CDN_URL || "https://vam3d.b-cdn.net").replace(/\/$/, "");
const dbUrl = envLocalConfig.DATABASE_URL;

if (!storageZone || !accessKey || !dbUrl) {
  console.error("❌ ERROR: Missing credentials in .env.local.");
  process.exit(1);
}

// Character name Vietnamese mapping
const nameMap: Record<string, string> = {
  Duong_Hoa_Nhi: "Dương Hỏa Nhi",
  Han_Nguyet: "Hàn Nguyệt",
  Han_Tuyet: "Hàn Tuyết",
  Huan_Nhi: "Huân Nhi",
  Huyen_Y: "Huyền Y",
  Lieu_Phi: "Liễu Phi",
  My_Do_Toa: "Mỹ Đỗ Toa",
  Nha_Phi: "Nhã Phi",
  Phuong_Hoang: "Phượng Hoàng",
  Phuong_Thanh_Nhi: "Phượng Thanh Nhi",
  Tao_Dinh: "Tào Dĩnh",
  Thanh_Lan: "Thanh Lân",
  Thanh_Tien_Tu: "Thanh Tiên Tử",
  Tieu_Y_Tien: "Tiểu Y Tiên",
  Tu_Nghien: "Tử Nghiên",
  Van_Van: "Vân Vận"
};

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function listFolder(folderPath: string) {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderPath}/`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function main() {
  console.log("⏳ Starting recovery from Bunny Storage...");

  // 1. Fetch default author and plan for placeholder movie
  const [author] = await db.select().from(schema.authors).limit(1);
  const [plan] = await db.select().from(schema.plans).limit(1);

  if (!author || !plan) {
    console.error("❌ ERROR: Please run 'npm run db:seed' first so that default plans and authors exist.");
    process.exit(1);
  }

  // 2. Create parent movie "Đấu Phá Thương Khung"
  console.log("🎬 Creating parent movie 'Đấu Phá Thương Khung'...");
  const [movie] = await db.insert(schema.movies).values({
    name: "Đấu Phá Thương Khung",
    description: "Phim hoạt hình 3D được phục hồi từ Bunny Storage.",
    idAuthor: author.id,
    status: 1
  }).returning();

  console.log(`✅ Movie created with ID: ${movie.id}`);

  // 3. List and create Characters
  console.log("⏳ Listing characters from Bunny...");
  const bunnyCharacters = await listFolder("characters");
  console.log(`Found ${bunnyCharacters.length} items in characters/`);

  const characterDbMap = new Map<string, number>(); // key -> character_id

  for (const item of bunnyCharacters) {
    const objectName = item.ObjectName;
    
    // Determine key and Vietnamese name
    let key = "";
    if (objectName.includes("_")) {
      key = objectName.substring(0, objectName.lastIndexOf("_"));
    } else {
      key = objectName.substring(0, objectName.lastIndexOf("."));
    }

    const vietName = nameMap[key] || key.replace(/_/g, " ");
    
    // Construct CDN URL
    let imgUrl = "";
    if (item.IsDirectory) {
      imgUrl = `${cdnUrl}/characters/${objectName}/display.webp`;
    } else {
      imgUrl = `${cdnUrl}/characters/${objectName}`;
    }

    console.log(`👤 Restoring Character: ${vietName}...`);
    const [charRow] = await db.insert(schema.characters).values({
      name: vietName,
      imgUrl: imgUrl,
      description: `Nhân vật ${vietName} trong Đấu Phá Thương Khung.`,
    }).returning();

    characterDbMap.set(key, charRow.id);
  }

  // 4. List and create AI Galleries
  console.log("\n⏳ Listing AI Galleries from Bunny...");
  const bunnyGalleries = await listFolder("ai_galleries");
  console.log(`Found ${bunnyGalleries.length} items in ai_galleries/`);

  for (const item of bunnyGalleries) {
    if (!item.IsDirectory) continue;

    const folderName = item.ObjectName;
    console.log(`📂 Processing gallery folder: ${folderName}...`);

    // Parse character key from folder suffix (e.g., kuzan_97P670MB_Huyen_Y -> Huyen_Y)
    let charKey = "";
    for (const key of Object.keys(nameMap)) {
      if (folderName.endsWith(`_${key}`)) {
        charKey = key;
        break;
      }
    }

    const charId = charKey ? characterDbMap.get(charKey) : undefined;
    
    // Construct readable gallery name
    let galleryName = folderName;
    if (charKey) {
      galleryName = folderName.substring(0, folderName.lastIndexOf(`_${charKey}`));
    }
    galleryName = galleryName.replace(/_/g, " ");

    console.log(`🖼️ Creating AI Gallery: ${galleryName} (Character key: ${charKey || "unknown"})...`);
    
    const [gallery] = await db.insert(schema.aiGalleries).values({
      name: galleryName,
      idMovie: movie.id,
      status: 1
    }).returning();

    // Link to Character if matched
    if (charId) {
      await db.insert(schema.galleryCharacter).values({
        idGallery: gallery.id,
        idCharacter: charId
      });
    }

    // List images inside the folder and insert to ai_images
    const images = await listFolder(`ai_galleries/${folderName}`);
    console.log(`   └─ Found ${images.length} images. Inserting...`);

    const imageValues = images.map((img: any) => ({
      idGallery: gallery.id,
      imgUrl: `${cdnUrl}/ai_galleries/${folderName}/${img.ObjectName}`,
      status: 1
    }));

    if (imageValues.length > 0) {
      // Chunk inserts to avoid query limits
      const chunkSize = 50;
      for (let i = 0; i < imageValues.length; i += chunkSize) {
        await db.insert(schema.aiImages).values(imageValues.slice(i, i + chunkSize));
      }
    }
  }

  console.log("\n✨ Restoration from Bunny Storage completed successfully!");
}

main().catch(console.error);
