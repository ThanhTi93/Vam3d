import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const cfSymbol = Symbol.for("__cloudflare-context__");

// Store database session per Request's Cloudflare context to guarantee:
// 1) Exactly 1 single DB connection per request (no Error 1102 CPU limit)
// 2) Fresh clean connection per navigation request (no Error 1101 dead socket)
const requestDbCache = new WeakMap<
  object,
  { db: ReturnType<typeof drizzle<typeof schema>>; client: ReturnType<typeof postgres> }
>();

// Fallback for environments without Cloudflare ctx (build time, CLI scripts)
let fallbackClient: ReturnType<typeof postgres> | null = null;
let fallbackDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(): {
  db: ReturnType<typeof drizzle<typeof schema>>;
  client: ReturnType<typeof postgres>;
} {
  let cf: any = null;
  try {
    cf = (globalThis as any)[cfSymbol];
  } catch {}

  // In Cloudflare Worker runtime with ExecutionContext per request
  if (cf?.ctx && typeof cf.ctx === "object") {
    const cached = requestDbCache.get(cf.ctx);
    if (cached) {
      return cached;
    }

    const connStr =
      cf.env?.HYPERDRIVE?.connectionString ||
      process.env.DATABASE_URL ||
      "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
    const isHyperdrive = !connStr.includes("supabase.com");

    const client = postgres(connStr, {
      prepare: false,
      ssl: isHyperdrive ? false : { rejectUnauthorized: false, servername: "aws-0-ap-southeast-1.pooler.supabase.com" },
      max: 1,
      idle_timeout: isHyperdrive ? 15 : 5,
      connect_timeout: 10,
    });
    const dbInstance = drizzle(client, { schema });
    const session = { db: dbInstance, client };
    requestDbCache.set(cf.ctx, session);
    return session;
  }

  // Fallback for environments without Cloudflare ctx (build time / local scripts)
  if (!fallbackDb) {
    const connStr =
      cf?.env?.HYPERDRIVE?.connectionString ||
      process.env.DATABASE_URL ||
      "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
    const isHyperdrive = !connStr.includes("supabase.com");

    fallbackClient = postgres(connStr, {
      prepare: false,
      ssl: isHyperdrive ? false : { rejectUnauthorized: false, servername: "aws-0-ap-southeast-1.pooler.supabase.com" },
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
    });
    fallbackDb = drizzle(fallbackClient, { schema });
  }

  return { db: fallbackDb, client: fallbackClient! };
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


