import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _client: any = null;
let _db: any = null;
let _lastUrl: string | null = null;

function getDbInstance() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { db: null, sql: null };
  }

  if (_db && _lastUrl === databaseUrl) {
    return { db: _db, sql: _client };
  }

  try {
    _client = postgres(databaseUrl, {
      prepare: false, // Required for Supabase Transaction Connection Pooler
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      ssl: { rejectUnauthorized: false },
    });
    _db = drizzle(_client, { schema });
    _lastUrl = databaseUrl;
    return { db: _db, sql: _client };
  } catch (err) {
    console.error("Error initializing postgres client:", err);
    return { db: null, sql: null };
  }
}

// Proxy export for db and sql so it always resolves with the live DATABASE_URL
export const db: any = new Proxy({}, {
  get(_target, prop) {
    const instance = getDbInstance();
    if (!instance.db) return undefined;
    const val = instance.db[prop];
    if (typeof val === "function") {
      return val.bind(instance.db);
    }
    return val;
  }
});

export const sql: any = new Proxy(function() {}, {
  apply(_target, _thisArg, argArray) {
    const instance = getDbInstance();
    if (!instance.sql) return Promise.resolve([]);
    return instance.sql(...argArray);
  },
  get(_target, prop) {
    const instance = getDbInstance();
    if (!instance.sql) return undefined;
    const val = instance.sql[prop];
    if (typeof val === "function") {
      return val.bind(instance.sql);
    }
    return val;
  }
});

export { schema };
