import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";
import * as schema from "./schema";

const cfSymbol = Symbol.for("__cloudflare-context__");

function getDbConfig(): { connStr: string; isHyperdrive: boolean } {
  try {
    const cf = (globalThis as any)[cfSymbol];
    if (cf?.env?.HYPERDRIVE?.connectionString) {
      return { connStr: cf.env.HYPERDRIVE.connectionString, isHyperdrive: true };
    }
  } catch {}

  const connStr =
    process.env.DATABASE_URL ||
    "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  return { connStr, isHyperdrive: !connStr.includes("supabase.com") };
}

// React cache() guarantees 1 single client per request (no cross-request socket reuse, no socket leak, no background timers in Cloudflare Workers)
export const getDb = cache(() => {
  const { connStr, isHyperdrive } = getDbConfig();
  const client = postgres(connStr, {
    prepare: false,
    fetch_types: false, // Disables pg_type queries on connection startup to keep CPU < 0.5ms
    ssl: isHyperdrive ? false : { rejectUnauthorized: false },
    max: 1,
    idle_timeout: null as any, // CRITICAL: Disable background timer in Cloudflare Workers to eliminate Error 1101
    connect_timeout: 10,
    onnotice: () => {},
  });
  const db = drizzle(client, { schema });
  return { db, client };
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const { db: instance } = getDb();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

export const sql = new Proxy((() => {}) as unknown as ReturnType<typeof postgres>, {
  get(_target, prop) {
    const { client } = getDb();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
  apply(_target, _thisArg, argArray) {
    const { client } = getDb();
    return (client as any).apply(client, argArray);
  },
});

export { schema };





