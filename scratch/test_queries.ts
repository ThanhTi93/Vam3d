import { getHotMovies, getAllMovies, getLatestGalleries, getMostViewedEpisodes, getLatestEpisodes } from "../lib/db/queries";
import { sql } from "../lib/db";

async function main() {
  console.log("Testing individual queries...");
  
  let t = Date.now();
  const hot = await getHotMovies();
  console.log("getHotMovies:", Date.now() - t, "ms", "count:", hot.length);

  t = Date.now();
  const all = await getAllMovies();
  console.log("getAllMovies:", Date.now() - t, "ms", "count:", all.length);

  t = Date.now();
  const gals = await getLatestGalleries();
  console.log("getLatestGalleries:", Date.now() - t, "ms", "count:", gals.length);

  t = Date.now();
  const most = await getMostViewedEpisodes(12);
  console.log("getMostViewedEpisodes:", Date.now() - t, "ms", "count:", most.length);

  t = Date.now();
  const latest = await getLatestEpisodes(12);
  console.log("getLatestEpisodes:", Date.now() - t, "ms", "count:", latest.length);

  await sql.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Error in main:", err);
  process.exit(1);
});
