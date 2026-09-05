import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

export const sql = postgres(databaseUrl, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: {
    rejectUnauthorized: false,
    servername: "aws-0-ap-southeast-1.pooler.supabase.com",
  },
});

export const db = drizzle(sql, { schema });

export { schema };
