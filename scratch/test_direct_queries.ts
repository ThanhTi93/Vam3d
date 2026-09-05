import { db, schema } from "../lib/db";
import { eq, and, desc, asc, isNull, inArray, ilike, count } from "drizzle-orm";
import { sql } from "../lib/db";

async function main() {
  console.log("Testing direct queries without unstable_cache...");
  
  let t = Date.now();
  const hot = await db.query.movies.findMany({
    where: (m, { eq }) => eq(m.status, 1),
    orderBy: (m, { desc }) => [desc(m.id)],
    limit: 6,
    with: {
      movieCategories: { with: { category: true } },
      episodes: { limit: 1, orderBy: (ep, { asc }) => [asc(ep.id)] },
    },
  });
  console.log("getHotMovies:", Date.now() - t, "ms", "count:", hot.length);

  t = Date.now();
  const all = await db.query.movies.findMany({
    where: (m, { eq }) => eq(m.status, 1),
    orderBy: (m, { desc }) => [desc(m.id)],
    limit: 100,
    with: {
      author: true,
      movieCategories: { with: { category: true } },
    },
  });
  console.log("getAllMovies:", Date.now() - t, "ms", "count:", all.length);

  t = Date.now();
  const gals = await db.query.aiGalleries.findMany({
    orderBy: (g, { desc }) => [desc(g.id)],
    limit: 12,
    with: {
      movie: { columns: { id: true, name: true } },
      plan: { columns: { id: true, name: true, level: true } },
      images: { columns: { id: true, imgUrl: true }, limit: 1 }
    }
  });
  console.log("getLatestGalleries:", Date.now() - t, "ms", "count:", gals.length);

  t = Date.now();
  const most = await db.query.episodes.findMany({
    where: (ep, { eq, gt, and }) => and(eq(ep.status, 1), gt(ep.views, 0)),
    orderBy: (ep, { desc }) => [desc(ep.views)],
    limit: 12,
    with: {
      movie: {
        columns: { id: true, name: true, imgUrl: true, banner: true }
      },
      plan: true,
    },
  });
  console.log("getMostViewedEpisodes:", Date.now() - t, "ms", "count:", most.length);

  t = Date.now();
  const latest = await db.query.episodes.findMany({
    where: (ep, { eq }) => eq(ep.status, 1),
    orderBy: (ep, { desc }) => [desc(ep.id)],
    limit: 12,
    with: {
      movie: {
        columns: { id: true, name: true, imgUrl: true, banner: true }
      },
      plan: true,
    },
  });
  console.log("getLatestEpisodes:", Date.now() - t, "ms", "count:", latest.length);

  await sql.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Error in main:", err);
  process.exit(1);
});
