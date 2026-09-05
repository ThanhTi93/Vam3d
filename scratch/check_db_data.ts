import { sql } from "../lib/db";

async function main() {
  const movies = await sql`SELECT id, name, status FROM movies LIMIT 10`;
  console.log("Sample movies:", movies);

  const statusCounts = await sql`SELECT status, count(*) FROM movies GROUP BY status`;
  console.log("Status counts:", statusCounts);

  const episodes = await sql`SELECT count(*), status FROM episodes GROUP BY status`;
  console.log("Episodes status counts:", episodes);

  const categories = await sql`SELECT count(*), status FROM categories GROUP BY status`;
  console.log("Categories status counts:", categories);

  await sql.end();
}

main().catch(console.error);
