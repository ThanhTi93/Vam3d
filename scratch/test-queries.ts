import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in env");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function run() {
  console.log("Measuring database query times...");

  console.time("getAdminMovies query");
  const moviesResult = await db.query.movies.findMany({
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
  });
  console.timeEnd("getAdminMovies query");
  console.log(`Movies count: ${moviesResult.length}`);

  console.time("getAdminCategories query");
  const categoriesResult = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.id)],
  });
  console.timeEnd("getAdminCategories query");
  console.log(`Categories count: ${categoriesResult.length}`);

  console.time("getAdminAuthors query");
  const authorsResult = await db.query.authors.findMany({
    orderBy: (a, { desc }) => [desc(a.id)],
  });
  console.timeEnd("getAdminAuthors query");
  console.log(`Authors count: ${authorsResult.length}`);
}

run().catch(console.error);
