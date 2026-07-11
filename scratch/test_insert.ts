import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { createGallery } = await import("../app/admin/actions");
  
  console.log("Calling createGallery...");
  try {
    await createGallery({
      name: "Test Gallery " + Date.now(),
      idMovie: 25,
      idPlan: 6,
      characterIds: [],
      imageUrls: [
        "https://vam3d.b-cdn.net/test_image_1.webp",
        "https://vam3d.b-cdn.net/test_image_2.webp"
      ]
    });
    console.log("Success! createGallery completed without error.");
  } catch (error) {
    console.error("Error running createGallery:", error);
  }
}

run();
