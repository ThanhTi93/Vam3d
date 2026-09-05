import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

let _sql: any = null;
let _db: any = null;

function getDb() {
  if (_db) return { db: _db, sql: _sql };

  const databaseUrl = "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

  _sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 0,
    connect_timeout: 5,
    ssl: "require",
  });

  _db = drizzle(_sql, { schema });
  return { db: _db, sql: _sql };
}

const db = new Proxy({} as any, {
  get(_target, prop) {
    const { db: instance } = getDb();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

const sql = new Proxy(function () {} as any, {
  apply(_target, _thisArg, argArray) {
    const { sql: instance } = getDb();
    return instance(...argArray);
  },
  get(_target, prop) {
    const { sql: instance } = getDb();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

async function main() {
  console.log("1. Testing raw sql query...");
  const raw = await sql`SELECT count(*) FROM movies WHERE status = 1`;
  console.log("Raw SQL:", raw);

  console.log("2. Testing Drizzle select...");
  const selectRes = await db.select().from(schema.movies).limit(2);
  console.log("Drizzle select:", selectRes.length);

  console.log("3. Testing Drizzle query.movies.findMany...");
  const queryRes = await db.query.movies.findMany({ limit: 2, with: { movieCategories: { with: { category: true } } } });
  console.log("Drizzle relational query:", queryRes.length);

  await _sql.end();
}

main().catch(console.error);
