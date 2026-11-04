const login = '439070443d3e6fe76376';
const key = 'RpAWzXJbpXI0lR';

async function listFiles(folderId = '') {
  const url = folderId 
    ? `https://api.streamtape.com/file/listfolder?login=${login}&key=${key}&folder=${folderId}`
    : `https://api.streamtape.com/file/listfolder?login=${login}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.result || { files: [], folders: [] };
}

async function scanAll() {
  console.log('Scanning Streamtape account files...');
  const root = await listFiles();
  let allFiles = [...(root.files || [])];
  console.log(`Root folder has ${root.files?.length || 0} files and ${root.folders?.length || 0} folders`);

  if (root.folders) {
    for (const f of root.folders) {
      console.log(`Checking folder: ${f.name} (id: ${f.id})...`);
      const sub = await listFiles(f.id);
      console.log(` -> Found ${sub.files?.length || 0} files in folder "${f.name}"`);
      if (sub.files) allFiles.push(...sub.files);
    }
  }

  console.log(`\nTổng số files tìm thấy trên tài khoản Streamtape: ${allFiles.length}`);
  allFiles.forEach((f, idx) => {
    console.log(`[${idx + 1}] ${f.name} | LinkId: ${f.linkid} | Size: ${(f.size / (1024*1024)).toFixed(1)} MB`);
  });
}

scanAll().catch(console.error);

