import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { db } = await import("../lib/db");
  const { aiGalleries, aiImages } = await import("../lib/db/schema");
  const { desc } = await import("drizzle-orm");

  if (!db) {
    console.error("Database not initialized. Check DATABASE_URL.");
    return;
  }
  try {
    console.log("Connecting to database...");
    const galleries = await db.select().from(aiGalleries).orderBy(desc(aiGalleries.id)).limit(5);
    console.log("Recent galleries:");
    console.log(JSON.stringify(galleries, null, 2));

    const imageCount = await db.select().from(aiImages).orderBy(desc(aiImages.id)).limit(5);
    console.log("Recent images:");
    console.log(JSON.stringify(imageCount, null, 2));
  } catch (error) {
    console.error("Error querying database:", error);
  }
}

run();
