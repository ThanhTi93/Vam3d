import "dotenv/config";
import { db } from "./lib/db/index";
import { aiGalleries } from "./lib/db/schema";

async function main() {
  if (!db) {
    console.error("No DB connection");
    return;
  }
  const allGalleries = await db.select().from(aiGalleries);
  console.log("=== Current Galleries in DB ===");
  console.log("Count:", allGalleries.length);
  allGalleries.forEach(g => {
    console.log(`ID: ${g.id} | Name: "${g.name}"`);
  });
}

main().catch(console.error);
