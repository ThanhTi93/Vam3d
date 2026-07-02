import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema.js";
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
  
  const user = await db.query.accounts.findFirst({
    where: eq(schema.accounts.username, "tiprokid1")
  });
  
  console.log("USER RECORD:", JSON.stringify(user, null, 2));

  if (user) {
    const subs = await db.query.userSubscriptions.findMany({
      where: eq(schema.userSubscriptions.idAccount, user.id),
      with: {
        plan: true
      }
    });
    console.log("USER SUBSCRIPTIONS:", JSON.stringify(subs, null, 2));
  }
}

run();
