import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const zone = process.env.BUNNY_STORAGE_ZONE_NAME || 'vam3d-gallery';
const key = process.env.BUNNY_STORAGE_ACCESS_KEY || 'a645f8a9-a9e9-4387-ba173cd0f932-39a5-4e31';

async function listDir(path = '') {
  const cleanPath = path ? (path.endsWith('/') ? path : `${path}/`) : '';
  const url = `https://storage.bunnycdn.com/${zone}/${cleanPath}`;
  const res = await fetch(url, { headers: { AccessKey: key } });
  if (!res.ok) return [];
  return res.json();
}

async function checkSizes() {
  const folders = ['movies', 'episodes', 'characters', 'avatar'];
  for (const f of folders) {
    const items = await listDir(f);
    let totalBytes = 0;
    items.forEach(i => totalBytes += (i.Length || 0));
    console.log(`📁 Folder /${f}: ${items.length} files (${(totalBytes / (1024*1024)).toFixed(2)} MB)`);
  }

  // Check ai_galleries subfolders
  console.log('Scanning /ai_galleries subfolders...');
  const galItems = await listDir('ai_galleries');
  console.log(`📁 Folder /ai_galleries has ${galItems.length} subfolders/items`);
  let sampleSize = 0;
  for (const item of galItems.slice(0, 5)) {
    if (item.IsDirectory) {
      const sub = await listDir(`ai_galleries/${item.ObjectName}`);
      console.log(`   * ${item.ObjectName}: ${sub.length} files`);
    }
  }
}

checkSizes().catch(console.error);

