import postgres from 'postgres';

const login = '439070443d3e6fe76376';
const key = 'RpAWzXJbpXI0lR';

async function checkAll() {
  const sql = postgres('postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d');
  const rows = await sql.unsafe("SELECT id, name, url FROM episodes WHERE url LIKE '%streamtape%'");
  console.log(`Found ${rows.length} streamtape episodes in DB`);

  const ids = rows.map(r => {
    const m = r.url.match(/streamtape\.com\/(?:e|v)\/([a-zA-Z0-9]+)/);
    return m ? m[1] : null;
  }).filter(Boolean);

  console.log(`Extracted ${ids.length} Streamtape IDs`);

  // Streamtape info allows checking files
  const fileIdsStr = ids.join(',');
  const res = await fetch(`https://api.streamtape.com/file/info?file=${fileIdsStr}&login=${login}&key=${key}`);
  const data = await res.json();
  
  console.log('Streamtape API status:', data.status, data.msg);
  let liveCount = 0;
  let deadCount = 0;

  for (const r of rows) {
    const m = r.url.match(/streamtape\.com\/(?:e|v)\/([a-zA-Z0-9]+)/);
    const fid = m ? m[1] : null;
    const fileInfo = fid && data.result ? data.result[fid] : null;
    if (fileInfo && fileInfo.status === 200) {
      liveCount++;
      console.log(`✅ [LIVE] Ep ${r.id} - ${r.name} (${fileInfo.name}, size: ${(fileInfo.size / (1024*1024)).toFixed(2)} MB)`);
    } else {
      deadCount++;
      console.log(`❌ [DEAD/404] Ep ${r.id} - ${r.name} (URL: ${r.url})`);
    }
  }

  console.log(`\nSummary: Live: ${liveCount}, Dead: ${deadCount}`);
  await sql.end();
}

checkAll().catch(console.error);

