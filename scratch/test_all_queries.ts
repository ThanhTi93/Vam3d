import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { db, schema } = await import("../lib/db");
  const { desc, asc } = await import("drizzle-orm");
  
  if (!db) {
    console.error("Database not initialized.");
    return;
  }

  console.log("Starting parallel database queries...");
  const startTime = Date.now();
  try {
    const [galleries, movies, plans, characters, collections] = await Promise.all([
      db.query.aiGalleries.findMany({
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
      }),
      db.query.movies.findMany({
        orderBy: (m, { desc }) => [desc(m.id)],
        with: {
          movieCategories: { with: { category: true } },
          author: true,
          episodes: {
            orderBy: (ep, { asc }) => [asc(ep.id)],
            with: {
              episodesActors: { with: { actor: true } },
              episodesCharacters: { with: { character: true } },
            }
          },
        },
      }),
      db.query.plans.findMany({
        orderBy: (p, { asc }) => [asc(p.level)],
      }),
      db.query.characters.findMany({
        orderBy: (c, { desc }) => [desc(c.id)],
      }),
      db.query.collections.findMany({
        orderBy: (c, { desc }) => [desc(c.id)],
        with: {
          collectionImages: {
            with: {
              aiImage: true
            }
          }
        }
      })
    ]);

    const duration = Date.now() - startTime;
    console.log(`Success! All queries completed in ${duration}ms.`);
    console.log(`Galleries: ${galleries.length}`);
    console.log(`Movies: ${movies.length}`);
    console.log(`Plans: ${plans.length}`);
    console.log(`Characters: ${characters.length}`);
    console.log(`Collections: ${collections.length}`);

    const totalJsonStr = JSON.stringify({ galleries, movies, plans, characters, collections });
    console.log(`Total payload size in memory: ${(totalJsonStr.length / (1024 * 1024)).toFixed(2)} MB`);
  } catch (error) {
    console.error("Error executing parallel queries:", error);
  }
}

run();
