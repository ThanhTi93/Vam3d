import { neon } from "@neondatabase/serverless";

const neonUrl = "postgresql://neondb_owner:npg_qIf0e4SuGpEw@ep-fragrant-mouse-aih6znwj-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const sql = neon(neonUrl);
  console.log("Checking Neon database...");
  const t0 = Date.now();
  const movies = await sql`SELECT count(*) FROM movies WHERE status = 1`;
  console.log("Movies count in Neon:", movies, "in", Date.now() - t0, "ms");

  const episodes = await sql`SELECT count(*) FROM episodes WHERE status = 1`;
  console.log("Episodes count in Neon:", episodes);

  const categories = await sql`SELECT count(*) FROM categories WHERE status = 1`;
  console.log("Categories count in Neon:", categories);

  const galleries = await sql`SELECT count(*) FROM ai_galleries WHERE status = 1`;
  console.log("Galleries count in Neon:", galleries);
}

main().catch(console.error);
