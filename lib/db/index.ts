import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";
import * as schema from "./schema";

const cfSymbol = Symbol.for("__cloudflare-context__");

function getConnectionString(): { connStr: string; isHyperdrive: boolean } {
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

// React cache() guarantees 1 single client per request (no socket leak, no CPU limit exceeded)
export const getDbSession = cache(() => {
  const { connStr, isHyperdrive } = getConnectionString();
  const client = postgres(connStr, {
    prepare: false,
    ssl: isHyperdrive ? false : { rejectUnauthorized: false, servername: "aws-0-ap-southeast-1.pooler.supabase.com" },
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });
  const dbInstance = drizzle(client, { schema });
  return { db: dbInstance, client };
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const { db: instance } = getDbSession();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
});

export const sql = new Proxy((() => {}) as unknown as ReturnType<typeof postgres>, {
  get(_target, prop) {
    const { client } = getDbSession();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
  apply(_target, _thisArg, argArray) {
    const { client } = getDbSession();
    return (client as any).apply(client, argArray);
  },
});

export { schema };
