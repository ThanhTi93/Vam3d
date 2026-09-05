const postgres = require('postgres');

async function main() {
  console.log('Testing Supabase pooler connection...');
  const sql = postgres('postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', {
    ssl: { rejectUnauthorized: false, servername: 'aws-0-ap-southeast-1.pooler.supabase.com' },
    idle_timeout: 0,
    connect_timeout: 10,
    max: 1
  });

  try {
    const res = await sql`SELECT count(*) FROM movies`;
    console.log('Query success:', res);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await sql.end();
  }
}

main();
