import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set in environment");
  process.exit(1);
}

const sql = neon(dbUrl);

async function test() {
  console.log("Checking episodes banners for movie 25...");
  try {
    const res = await sql.query(`SELECT id, name, banner FROM episodes WHERE id_movie = 25`);
    console.log("Episodes:", res);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

test();
