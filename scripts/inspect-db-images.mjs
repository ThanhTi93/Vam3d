import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || 'postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d';
const sql = postgres(dbUrl);

async function inspectImages() {
  console.log('--- QUÉT HÌNH ẢNH TRONG DATABASE ---');

  const [movies, episodes, actors, characters, aiImages, accounts] = await Promise.all([
    sql.unsafe('SELECT id, name, img_url FROM movies'),
    sql.unsafe('SELECT id, name, banner FROM episodes'),
    sql.unsafe('SELECT id, name, img_url FROM actors'),
    sql.unsafe('SELECT id, name, img_url FROM characters'),
    sql.unsafe('SELECT id, img_url FROM ai_images'),
    sql.unsafe('SELECT id, username, img_url FROM accounts'),
  ]);

  console.log(`Movies: ${movies.length} rows`);
  console.log(`Episodes: ${episodes.length} rows`);
  console.log(`Actors: ${actors.length} rows`);
  console.log(`Characters: ${characters.length} rows`);
  console.log(`AiImages: ${aiImages.length} rows`);
  console.log(`Accounts: ${accounts.length} rows`);

  const allUrls = new Set();
  const addUrl = (u) => { if (u && typeof u === 'string' && u.trim()) allUrls.add(u.trim()); };

  movies.forEach(m => { addUrl(m.img_url); });
  episodes.forEach(e => { addUrl(e.banner); });
  actors.forEach(a => { addUrl(a.img_url); });
  characters.forEach(c => { addUrl(c.img_url); });
  aiImages.forEach(gi => { addUrl(gi.img_url); });
  accounts.forEach(acc => { addUrl(acc.img_url); });

  console.log(`\nTổng cộng có ${allUrls.size} URL ảnh duy nhất trong Database.`);

  let bunnyUrls = 0, r2Urls = 0, externalUrls = 0;
  for (const u of allUrls) {
    if (u.includes('b-cdn.net') || u.includes('cdn.vam3dhentai.online') || (!u.startsWith('http') && u.length > 3)) {
      bunnyUrls++;
    } else if (u.includes('r2.dev')) {
      r2Urls++;
    } else {
      externalUrls++;
    }
  }

  console.log(`- Ảnh Bunny (hoặc đường dẫn tương đối): ${bunnyUrls}`);
  console.log(`- Ảnh Cloudflare R2: ${r2Urls}`);
  console.log(`- Ảnh nguồn ngoài khác: ${externalUrls}`);

  console.log('\nMẫu 15 URL ảnh trong DB:');
  Array.from(allUrls).slice(0, 15).forEach(u => console.log(' *', u));

  await sql.end();
}

inspectImages().catch(console.error);
