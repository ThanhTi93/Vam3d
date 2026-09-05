import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { getMoviesByCategory, getMovieById } from "@/lib/db/queries";

async function main() {
  console.log("🔍 Testing category queries...");
  const catSlugMovies = await getMoviesByCategory("sex-3d");
  console.log(`- Query by slug 'sex-3d': found ${catSlugMovies.length} movies.`);

  const catNameMovies = await getMoviesByCategory("Sex 3D");
  console.log(`- Query by raw name 'Sex 3D': found ${catNameMovies.length} movies.`);

  console.log("\n🔍 Testing movie queries...");
  const movieBySlug = await getMovieById("truen-thuy-hau-cung-the-gioi-khac-tap-1");
  console.log(`- Query movie by slug: ${movieBySlug ? `Found '${movieBySlug.name}'` : "Not found"}`);

  const movieById = await getMovieById("1");
  console.log(`- Query movie by ID '1': ${movieById ? `Found '${movieById.name}'` : "Not found"}`);

  console.log("\n✅ All route query tests complete!");
}

main().catch(console.error);
