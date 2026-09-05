import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_qIf0e4SuGpEw@ep-fragrant-mouse-aih6znwj-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export { schema };
