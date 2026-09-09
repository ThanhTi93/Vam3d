import "dotenv/config";
import { db } from "../lib/db/index";
import { aiGalleries } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
  if (!db) {
    console.error("No DB connection");
    return;
  }
  const sampleIds = [1, 25, 50, 80, 100, 130, 150, 175, 200, 220, 245];
  const items = await db.query.aiGalleries.findMany({
    where: (g, { inArray }) => inArray(g.id, sampleIds),
    with: {
      movie: true,
      galleryCharacters: {
        with: { character: true }
      }
    }
  });

  console.log("=== SAMPLE UPDATED GALLERIES ===");
  for (const g of items) {
    console.log(`\n[ID: ${g.id}]`);
    console.log(`- Name: ${g.name}`);
    console.log(`- Slug: ${g.slug}`);
    console.log(`- Description: ${g.description}`);
    console.log(`- Movie: ${g.movie?.name || "N/A"}`);
    console.log(`- Characters: ${g.galleryCharacters.map((gc: any) => gc.character?.name).join(", ") || "N/A"}`);
  }
}

main().catch(console.error);
