import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

export const sql = postgres(databaseUrl, {
  prepare: false, // Required for Supabase Transaction Connection Pooler
  max: 2,
  idle_timeout: 10,
  connect_timeout: 15,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(sql, { schema });

export { schema };
