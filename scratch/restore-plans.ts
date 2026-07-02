import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import { eq } from "drizzle-orm";
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
  
  console.log("Restoring plan levels to original specification...");
  
  // Set VAM VIP to level 1
  await db.update(schema.plans)
    .set({ level: 1 })
    .where(eq(schema.plans.id, 5));
    
  // Set VAM STANDARD to level 2
  await db.update(schema.plans)
    .set({ level: 2 })
    .where(eq(schema.plans.id, 6));

  console.log("Plan levels restored successfully!");
  
  const plans = await db.select().from(schema.plans);
  console.log("Current plans:", plans);
}

run();
