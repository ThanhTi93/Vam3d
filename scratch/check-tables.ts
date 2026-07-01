import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("No DATABASE_URL found");
    return;
  }
  
  const sql = neon(dbUrl);
  const db = drizzle(sql);
  
  const result = await db.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log("Tables in DB:", result.rows);
}

run();
