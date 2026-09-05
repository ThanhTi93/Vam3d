const postgres = require('postgres');
async function test() {
  const sql = postgres('postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', {
    prepare: false,
    ssl: { rejectUnauthorized: false, servername: 'aws-0-ap-southeast-1.pooler.supabase.com' }
  });
  try {
    const res = await sql`SELECT * FROM system_settings`;
    console.log('system_settings in Supabase:', res);
  } catch(e) {
    console.error('Error with system_settings:', e.message);
  } finally {
    await sql.end();
  }
}
test();
