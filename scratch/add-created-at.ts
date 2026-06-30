import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set in environment");
  process.exit(1);
}

console.log("Connecting to:", dbUrl);
const sql = neon(dbUrl);

async function main() {
  console.log("⏳ Adding 'created_at' column to 'episodes' table in .env.local database...");
  try {
    await sql.query(`
      ALTER TABLE "episodes" 
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
    console.log("✅ Successfully added 'created_at' column to 'episodes' table!");
  } catch (err: any) {
    console.error("❌ Failed to add column:", err.message);
  }
}

main();
