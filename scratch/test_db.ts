import postgres from "postgres";

const databaseUrl = "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 5,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: false }
  });

  const t0 = Date.now();
  console.log("Querying...");
  const res = await sql`SELECT count(*) FROM movies WHERE status = 1`;
  console.log("Query finished in:", Date.now() - t0, "ms", res);
  await sql.end();
}

main();
