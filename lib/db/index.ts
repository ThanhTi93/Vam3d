import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getConnectionString(): string {
  try {
    const cf = getCloudflareContext();
    if (cf?.env && (cf.env as Record<string, any>).HYPERDRIVE?.connectionString) {
      return (cf.env as Record<string, any>).HYPERDRIVE.connectionString;
    }
  } catch {
    // Fallback when called outside of request context or during build
  }
  return (
    process.env.DATABASE_URL ||
    "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
  );
}

let cachedClient: ReturnType<typeof postgres> | null = null;
let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedConnStr: string = "";

export function getDb() {
  const connStr = getConnectionString();
  if (!cachedDb || cachedConnStr !== connStr) {
    cachedConnStr = connStr;
    cachedClient = postgres(connStr, {
      max: 5,
      idle_timeout: 10,
      connect_timeout: 10,
    });
    cachedDb = drizzle(cachedClient, { schema });
  }
  return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

export const sql = new Proxy((() => {}) as unknown as ReturnType<typeof postgres>, {
  get(_target, prop) {
    const connStr = getConnectionString();
    if (!cachedClient || cachedConnStr !== connStr) {
      getDb();
    }
    const val = (cachedClient as any)[prop];
    if (typeof val === "function") {
      return val.bind(cachedClient);
    }
    return val;
  },
  apply(_target, thisArg, argArray) {
    const connStr = getConnectionString();
    if (!cachedClient || cachedConnStr !== connStr) {
      getDb();
    }
    return (cachedClient as any).apply(thisArg, argArray);
  },
});

export { schema };


