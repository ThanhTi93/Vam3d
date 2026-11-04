import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const zone = process.env.BUNNY_STORAGE_ZONE_NAME || 'vam3d-gallery';
const key = process.env.BUNNY_STORAGE_ACCESS_KEY || 'a645f8a9-a9e9-4387-ba173cd0f932-39a5-4e31';

async function test() {
  console.log(`Connecting to Bunny storage zone: ${zone}...`);
  const res = await fetch(`https://storage.bunnycdn.com/${zone}/`, {
    headers: { AccessKey: key }
  });
  const data = await res.json();
  console.log('Bunny root files count:', data?.length);
  console.log(data?.map(f => ({ name: f.ObjectName, isDir: f.IsDirectory, size: (f.Length / (1024*1024)).toFixed(2) + 'MB' })));
}

test().catch(console.error);

