import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

delete process.env.DATABASE_URL;
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
