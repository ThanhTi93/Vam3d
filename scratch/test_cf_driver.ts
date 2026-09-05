import postgres from "postgres";

const databaseUrl = "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function main() {
  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 0,
    connect_timeout: 5,
    ssl: 'require',
  });

  const t0 = Date.now();
  console.log("Connecting...");
  const res = await sql`SELECT count(*) FROM movies WHERE status = 1`;
  console.log("Success in:", Date.now() - t0, "ms", res);
  await sql.end();
}

main().catch(console.error);
