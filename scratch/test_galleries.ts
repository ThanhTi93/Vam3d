import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { db, schema } = await import("../lib/db");
  const { desc } = await import("drizzle-orm");
  
  if (!db) {
    console.error("Database not initialized.");
    return;
  }

  console.log("Calling raw db query for galleries...");
  const startTime = Date.now();
  try {
    const res = await db.query.aiGalleries.findMany({
      orderBy: (g, { desc }) => [desc(g.createdAt)],
      with: {
        movie: { columns: { id: true, name: true } },
        plan: { columns: { id: true, name: true, level: true } },
        galleryCharacters: {
          with: { character: { columns: { id: true, name: true } } }
        },
        images: {
          columns: { id: true, imgUrl: true },
          with: {
            collectionImages: true
          }
        }
      }
    });
    const duration = Date.now() - startTime;
    console.log(`Success! Fetched ${res.length} galleries in ${duration}ms.`);
    if (res.length > 0) {
      console.log("First gallery images count:", res[0].images?.length);
      
      // Let's also check size in memory
      const jsonStr = JSON.stringify(res);
      console.log(`Total JSON response size: ${(jsonStr.length / (1024 * 1024)).toFixed(2)} MB`);
    }
  } catch (error) {
    console.error("Error fetching galleries:", error);
  }
}

run();
