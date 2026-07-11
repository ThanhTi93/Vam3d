import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { db } = await import("../lib/db");
  const { characters } = await import("../lib/db/schema");

  if (!db) {
    console.error("Database not initialized.");
    return;
  }
  try {
    const list = await db.select().from(characters);
    console.log("Characters in DB:");
    console.log(JSON.stringify(list, null, 2));
  } catch (error) {
    console.error("Error querying characters:", error);
  }
}

run();
