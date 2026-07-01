import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("No DATABASE_URL found");
    return;
  }
  
  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });
  
  console.log("=== PLANS ===");
  const plans = await db.select().from(schema.plans);
  console.log(plans);
  
  console.log("=== PACKAGES ===");
  const packages = await db.select().from(schema.packages);
  console.log(packages);
}

run();
