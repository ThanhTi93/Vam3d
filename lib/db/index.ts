import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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

function createClientInstance() {
  const { connStr, isHyperdrive } = getConnectionString();
  return postgres(connStr, {
    prepare: false,
    ssl: isHyperdrive ? false : { rejectUnauthorized: false, servername: "aws-0-ap-southeast-1.pooler.supabase.com" },
    max: 1,
    idle_timeout: 1,
    connect_timeout: 10,
  });
}

export function getDb() {
  const client = createClientInstance();
  return drizzle(client, { schema });
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
    const client = createClientInstance();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
  apply(_target, _thisArg, argArray) {
    const client = createClientInstance();
    return (client as any).apply(client, argArray);
  },
});

export { schema };
