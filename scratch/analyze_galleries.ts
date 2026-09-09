import "dotenv/config";
import { db } from "../lib/db/index";
import { aiGalleries, movies, characters, galleryCharacter, aiImages } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  if (!db) {
    console.log("No db connection");
    return;
  }

  const allGalleries = await db.query.aiGalleries.findMany({
    with: {
      movie: true,
      galleryCharacters: {
        with: {
          character: true,
        },
      },
      images: {
        limit: 3,
      },
    },
    orderBy: (g, { asc }) => [asc(g.id)],
  });

  console.log(`Total galleries: ${allGalleries.length}`);
  
  const fs = await import("fs");
  const path = await import("path");

  const summary = allGalleries.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    movie: g.movie ? { id: g.movie.id, name: g.movie.name, slug: g.movie.slug } : null,
    characters: g.galleryCharacters.map((gc) => ({
      id: gc.character?.id,
      name: gc.character?.name,
      nameZh: gc.character?.nameZh,
      nameEn: gc.character?.nameEn,
      slug: gc.character?.slug
    })).filter((c) => !!c.name),
    imagesCount: g.images?.length || 0,
    sampleImages: (g.images || []).map((img) => img.imgUrl),
  }));

  fs.writeFileSync(
    path.join(__dirname, "galleries_data.json"),
    JSON.stringify(summary, null, 2),
    "utf-8"
  );
  console.log("Successfully wrote galleries_data.json!");
}

main().catch(console.error);
