import { db, sql, schema } from "../lib/db";

async function testSequential() {
  console.log("Request 1...");
  const res1 = await db.select({ id: schema.movies.id }).from(schema.movies).limit(1);
  console.log("Res 1:", res1);

  console.log("Request 2...");
  const res2 = await db.select({ id: schema.movies.id }).from(schema.movies).limit(1);
  console.log("Res 2:", res2);

  console.log("Request 3 (db.query)...");
  const res3 = await db.query.movies.findFirst();
  console.log("Res 3:", res3 ? res3.id : null);

  console.log("Request 4 (sql template)...");
  const res4 = await sql`SELECT 1 as num`;
  console.log("Res 4:", res4);

  console.log("ALL SEQUENTIAL REQUESTS SUCCEEDED!");
}

testSequential().catch(console.error);
