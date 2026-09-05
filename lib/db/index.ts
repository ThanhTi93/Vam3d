import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _sql: any = null;
let _db: any = null;

export function getDb() {
  if (_db) return { db: _db, sql: _sql };

  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

  _sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 0,
    connect_timeout: 10,
    ssl: "require",
  });

  _db = drizzle(_sql, { schema });
  return { db: _db, sql: _sql };
}

// Lazy proxy so no IO/timers run during Cloudflare Worker module initialization
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const { db: instance } = getDb();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

export const sql = new Proxy(function () {} as any, {
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

export { schema };
