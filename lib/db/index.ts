import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const cfSymbol = Symbol.for("__cloudflare-context__");

function getDbConfig(): { connStr: string; isHyperdrive: boolean; isCloudflare: boolean; useSsl: boolean } {
  try {
    const cf = (globalThis as any)[cfSymbol];
    if (cf?.env?.HYPERDRIVE?.connectionString) {
      return { connStr: cf.env.HYPERDRIVE.connectionString, isHyperdrive: true, isCloudflare: true, useSsl: false };
    }
    if (cf?.env?.DATABASE_URL) {
      const connStr = cf.env.DATABASE_URL;
      const useSsl = connStr.includes("sslmode=require") || connStr.includes("supabase.com");
      return { connStr, isHyperdrive: false, isCloudflare: true, useSsl };
    }
  } catch {}

  const isCloudflare =
    typeof (globalThis as any)[cfSymbol] !== "undefined" ||
    process.env.NEXT_RUNTIME === "edge" ||
    (typeof navigator !== "undefined" && (navigator as any).userAgent?.includes("Cloudflare-Workers"));

  const connStr =
    process.env.DATABASE_URL ||
    "postgresql://vam3d_user:141200Ti%40@51.79.241.5:5432/vam3d";
  const isHyperdrive = isCloudflare && !connStr.includes("51.79.241.5") && !connStr.includes("localhost");
  const useSsl = connStr.includes("sslmode=require") || connStr.includes("supabase.com");
  return { connStr, isHyperdrive, isCloudflare, useSsl };
}

// Global cache for Node.js / dev / build singleton connection pool
declare global {
  // eslint-disable-next-line no-var
  var __postgresClient__: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __drizzleDb__: ReturnType<typeof drizzle<typeof schema>> | undefined;
  // eslint-disable-next-line no-var
  var __dbConnStr__: string | undefined;
}

// Module-scoped cache for Cloudflare Workers isolate
let cfCachedClient: ReturnType<typeof postgres> | null = null;
let cfCachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cfCachedConnStr: string = "";

export function getDb() {
  const { connStr, isHyperdrive, isCloudflare, useSsl } = getDbConfig();

  if (isCloudflare) {
    // In Cloudflare Workers isolate:
    // Reuse client if connection string is the same to prevent connection churn.
    // CRITICAL: idle_timeout must be null (or disabled) to prevent background timer Error 1101.
    if (!cfCachedDb || cfCachedConnStr !== connStr) {
      cfCachedConnStr = connStr;
      cfCachedClient = postgres(connStr, {
        prepare: false,
        fetch_types: false,
        ssl: isHyperdrive ? false : (useSsl ? { rejectUnauthorized: false } : false),
        max: 2, // Conservative pool per Cloudflare Worker isolate
        idle_timeout: null as any, // Eliminates background timers (fixes Error 1101)
        connect_timeout: 10,
        onnotice: () => {},
        onclose: () => {
          cfCachedClient = null;
          cfCachedDb = null;
        },
      });
      cfCachedDb = drizzle(cfCachedClient, { schema });
    }
    return { db: cfCachedDb, client: cfCachedClient! };
  }

  // In Node.js (next build, next dev, SSR, scripts):
  // Maintain a persistent singleton pool of at most 5 connections.
  if (!globalThis.__drizzleDb__ || globalThis.__dbConnStr__ !== connStr) {
    globalThis.__dbConnStr__ = connStr;
    globalThis.__postgresClient__ = postgres(connStr, {
      prepare: false,
      fetch_types: false,
      ssl: isHyperdrive ? false : (useSsl ? { rejectUnauthorized: false } : false),
      max: 5, // At most 5 concurrent connections across the entire Node process
      idle_timeout: 20, // Reclaim idle connections after 20s
      connect_timeout: 10,
      onnotice: () => {},
      onclose: () => {
        globalThis.__postgresClient__ = undefined;
        globalThis.__drizzleDb__ = undefined;
      },
    });
    globalThis.__drizzleDb__ = drizzle(globalThis.__postgresClient__, { schema });
  }

  return { db: globalThis.__drizzleDb__, client: globalThis.__postgresClient__! };
}

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
