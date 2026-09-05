import { db, sql } from "../lib/db/index";
import { accounts } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function test() {
  try {
    console.log("Testing db.select()...");
    const res = await db.select({ id: accounts.id }).from(accounts).limit(1);
    console.log("db.select() result:", res);

    console.log("Testing db.query.accounts.findFirst()...");
    const first = await db.query.accounts.findFirst();
    console.log("db.query result:", first ? first.id : null);

    console.log("Testing sql template tag...");
    const raw = await sql`SELECT 1 as num`;
    console.log("sql tag result:", raw);

    console.log("ALL TESTS PASSED!");
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
