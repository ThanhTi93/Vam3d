import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../lib/db/schema";

const neonUrl = "postgresql://neondb_owner:npg_qIf0e4SuGpEw@ep-fragrant-mouse-aih6znwj-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(neonUrl);
const db = drizzle(sql, { schema });

async function main() {
  console.log("1. Testing raw neon query...");
  const raw = await sql`SELECT count(*) FROM movies WHERE status = 1`;
  console.log("Raw SQL count:", raw);

  console.log("2. Testing Drizzle relational query.movies.findMany...");
  const movies = await db.query.movies.findMany({
    where: (m, { eq }) => eq(m.status, 1),
    limit: 5,
    with: {
      author: true,
      movieCategories: { with: { category: true } },
    }
  });
  console.log("Movies fetched:", movies.map(m => ({ id: m.id, name: m.name, categories: m.movieCategories?.map((mc: any) => mc.category?.name) })));

  console.log("3. Testing Drizzle galleries findMany...");
  const galleries = await db.query.aiGalleries.findMany({
    where: (g, { eq }) => eq(g.status, 1),
    limit: 5,
  });
  console.log("Galleries count:", galleries.length);
}

main().catch(console.error);
