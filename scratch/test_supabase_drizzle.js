const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

async function main() {
  const client = postgres('postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', {
    prepare: false,
    ssl: { rejectUnauthorized: false, servername: 'aws-0-ap-southeast-1.pooler.supabase.com' },
    idle_timeout: 0,
    connect_timeout: 10,
    max: 1
  });

  const db = drizzle(client);

  try {
    const movies = await client`SELECT id, name, slug FROM movies LIMIT 3`;
    console.log('Movies from Supabase:', movies);
    const categories = await client`SELECT id, name FROM categories LIMIT 3`;
    console.log('Categories from Supabase:', categories);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
