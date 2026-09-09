import "dotenv/config";
import { db } from "../lib/db/index";
import { sql } from "drizzle-orm";

async function main() {
  if (!db) {
    console.error("No database connection");
    return;
  }
  console.log("Running migration: ADD COLUMN IF NOT EXISTS description to ai_galleries...");
  await db.execute(sql`ALTER TABLE ai_galleries ADD COLUMN IF NOT EXISTS description TEXT;`);
  console.log("Migration executed successfully!");
}

main().catch(console.error);
