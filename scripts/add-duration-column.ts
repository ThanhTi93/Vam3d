import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

async function main() {
  const sql = neon(dbUrl);
  console.log("⏳ Adding 'duration' column to episodes table...");
  await sql.query(`
    ALTER TABLE "episodes" 
    ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0
  `);
  console.log("✅ Done! Column 'duration' (in seconds) added to episodes.");
}

main().catch(console.error);
