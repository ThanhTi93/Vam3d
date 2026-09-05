import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { getAdminGalleries } = require("../app/admin/actions");

async function main() {
  console.log("⏳ Fetching galleries via getAdminGalleries()...");
  const galleries = await getAdminGalleries();
  
  const g = galleries.find((x: any) => x.id === 46);
  if (!g) {
    console.error("❌ Gallery ID 46 not found in results.");
    return;
  }
  
  console.log(`Gallery ID: ${g.id}, Name: "${g.name}"`);
  console.log(`📸 images array length returned by query: ${g.images?.length || 0}`);
  
  // Print first 10 image IDs and URLs
  console.log("\n--- First 10 Images in array ---");
  const first10 = g.images?.slice(0, 10) || [];
  for (let i = 0; i < first10.length; i++) {
    const img = first10[i];
    console.log(`Index ${i}: ID=${img.id}, URL=${img.imgUrl.substring(img.imgUrl.lastIndexOf('/') + 1)}`);
  }

  // Check for duplicates in the array
  const ids = g.images?.map((img: any) => img.id) || [];
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.log("\n⚠️ DUPLICATE IDS FOUND IN QUERY RESULTS ARRAY!");
    const counts: Record<number, number> = {};
    for (const id of ids) {
      counts[id] = (counts[id] || 0) + 1;
    }
    const dupes = Object.entries(counts).filter(([_, c]) => c > 1);
    console.log("Duplicate IDs list:", dupes);
  } else {
    console.log("\n✅ Drizzle returned all unique image IDs in the array.");
  }
}

main().catch(console.error);
