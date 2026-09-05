import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "⚠️ WARNING: DATABASE_URL is not set. The database queries will automatically use in-memory/static fallback data to keep the application functioning."
  );
}

// Global connection client with prepare: false for Supabase Transaction Pooler compatibility
const client = databaseUrl
  ? postgres(databaseUrl, {
      prepare: false, // Required for Supabase Transaction Connection Pooler
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Export the Drizzle client initialized with schema
export const db = client ? drizzle(client, { schema }) : null;
export const sql = client;
export { schema };
