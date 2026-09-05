import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

export const sql = postgres(databaseUrl, {
  prepare: false,
  max: 1,
  idle_timeout: 0,
  connect_timeout: 10,
  ssl: "require",
});

export const db = drizzle(sql, { schema });

export { schema };
