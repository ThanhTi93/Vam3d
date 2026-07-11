import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const { db } = await import("../lib/db");
  const { movies, plans } = await import("../lib/db/schema");

  if (!db) {
    console.error("Database not initialized.");
    return;
  }
  try {
    const movieList = await db.select().from(movies);
    console.log("Movies in DB:");
    console.log(JSON.stringify(movieList, null, 2));

    const planList = await db.select().from(plans);
    console.log("Plans in DB:");
    console.log(JSON.stringify(planList, null, 2));
  } catch (error) {
    console.error("Error querying DB:", error);
  }
}

run();
