import postgres from "postgres";

const password = encodeURIComponent("149162536Ti@");

async function testHost(name: string, url: string) {
  console.log(`Testing ${name}: ${url.replace(/:[^:@]+@/, ":***@")}`);
  const sql = postgres(url, {
    prepare: false,
    connect_timeout: 5,
    ssl: { rejectUnauthorized: false },
  });
  const t0 = Date.now();
  try {
    const res = await sql`SELECT 1 as test`;
    console.log(`✅ ${name} SUCCESS in ${Date.now() - t0}ms:`, res);
  } catch (err: any) {
    console.log(`❌ ${name} FAILED in ${Date.now() - t0}ms:`, err.message);
  } finally {
    await sql.end();
  }
}

async function main() {
  // 1. Direct host
  await testHost("Direct Host 5432", `postgresql://postgres:${password}@db.qgvklbzwwbzswpivvgsm.supabase.co:5432/postgres`);

  // 2. Pooler Session Mode 5432
  await testHost("Pooler Session 5432", `postgresql://postgres.qgvklbzwwbzswpivvgsm:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`);

  // 3. Pooler Transaction Mode 6543
  await testHost("Pooler Transaction 6543", `postgresql://postgres.qgvklbzwwbzswpivvgsm:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`);
}

main();
