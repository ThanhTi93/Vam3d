import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { updateGallery } = require("../app/admin/actions");
const { neon } = require("@neondatabase/serverless");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set in .env.local.");
  process.exit(1);
}

async function main() {
  const sql = neon(dbUrl);
  
  // 1. Get count before
  const before = await sql.query('SELECT COUNT(*) FROM "ai_images" WHERE id_gallery = 44');
  console.log(`📸 Image count BEFORE updateGallery: ${before[0].count}`);

  // 2. Call updateGallery with empty imageUrls
  console.log("⏳ Invoking updateGallery server action with empty imageUrls array...");
  try {
    await updateGallery(44, {
      name: "edit",
      characterIds: [],
      imageUrls: []
    });
  } catch (err: any) {
    if (err.message.includes("static generation store")) {
      console.log("ℹ️ Ignore Next.js revalidatePath warning (runs outside Next.js server).");
    } else {
      throw err;
    }
  }

  // 3. Get count after
  const after = await sql.query('SELECT COUNT(*) FROM "ai_images" WHERE id_gallery = 44');
  console.log(`📸 Image count AFTER updateGallery:  ${after[0].count}`);

  if (Number(before[0].count) === Number(after[0].count)) {
    console.log("✅ SUCCESS: No duplicate image rows were created by updateGallery.");
  } else {
    console.log("❌ ERROR: Image count increased! Duplication occurred!");
  }
}

main().catch(console.error);
