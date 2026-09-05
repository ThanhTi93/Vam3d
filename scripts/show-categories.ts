import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const postgres = require("postgres");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

async function main() {
  const sql = postgres(dbUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
  console.log("🔍 Fetching categories from database:");
  const cats = await sql.query('SELECT * FROM "categories"');
  console.log(cats);
}

main().catch(console.error);
