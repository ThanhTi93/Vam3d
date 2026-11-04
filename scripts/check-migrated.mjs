import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || 'postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d';
const sql = postgres(dbUrl);

async function check() {
  const r2Rows = await sql.unsafe("SELECT id, name, url FROM episodes WHERE url LIKE '%r2.dev%' ORDER BY id ASC");
  console.log(`\n🎉 ĐÃ CÓ ${r2Rows.length} TẬP HOÀN TẤT CHUYỂN SANG CLOUDFLARE R2:`);
  r2Rows.forEach(r => console.log(`  [Tập #${r.id}] ${r.name} -> ${r.url}`));

  const stRows = await sql.unsafe("SELECT count(*) FROM episodes WHERE url LIKE '%streamtape%'");
  console.log(`\n📌 Số tập Streamtape còn lại đang xử lý: ${stRows[0].count} tập\n`);
  await sql.end();
}

check().catch(console.error);

