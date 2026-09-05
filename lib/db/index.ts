import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const cfSymbol = Symbol.for("__cloudflare-context__");

function getConnectionString(): string {
  try {
    const cf = (globalThis as any)[cfSymbol];
    if (cf?.env?.HYPERDRIVE?.connectionString) {
      return cf.env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Ignore context extraction errors
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
    const isHyperdrive = !connStr.includes("supabase.com");
    cachedClient = postgres(connStr, {
      prepare: false,
      ssl: isHyperdrive ? false : { rejectUnauthorized: false, servername: "aws-0-ap-southeast-1.pooler.supabase.com" },
      max: 1,
      idle_timeout: 0,
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
    getDb();
    const val = (cachedClient as any)[prop];
    if (typeof val === "function") {
      return val.bind(cachedClient);
    }
    return val;
  },
  apply(_target, _thisArg, argArray) {
    getDb();
    return (cachedClient as any).apply(cachedClient, argArray);
  },
});

export { schema };


