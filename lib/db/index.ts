import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "⚠️ WARNING: DATABASE_URL is not set. The database queries will automatically use in-memory/static fallback data to keep the application functioning."
  );
}

// Export the Neon HTTP sql driver (client-side serverless)
export const sql = databaseUrl ? neon(databaseUrl) : null;

// Export the Drizzle client initialized with schema
export const db = sql ? drizzle(sql, { schema }) : null;
export { schema };
