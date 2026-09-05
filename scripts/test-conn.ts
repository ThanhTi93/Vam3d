import postgres from "postgres";

async function test() {
  const urls = [
    { name: "Direct", url: "postgresql://postgres:149162536Ti%40@db.qgvklbzwwbzswpivvgsm.supabase.co:5432/postgres" },
    { name: "Pooler-6543", url: "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" },
    { name: "Pooler-5432", url: "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" }
  ];

  for (const item of urls) {
    console.log(`Testing ${item.name}...`);
    try {
      const sql = postgres(item.url, { connect_timeout: 5, prepare: false, ssl: { rejectUnauthorized: false } });
      const res = await sql`SELECT 1 as connected`;
      console.log(`✅ SUCCESS with ${item.name}:`, res);
      await sql.end();
      return item.url;
    } catch (e: any) {
      console.log(`❌ Failed ${item.name}:`, e.message || e);
    }
  }
}

test();
