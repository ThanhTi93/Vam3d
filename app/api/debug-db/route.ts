import { NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { getHotMovies } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfSymbol = Symbol.for("__cloudflare-context__");
  const cf = (globalThis as any)[cfSymbol];
  const hyperdriveObj = cf?.env?.HYPERDRIVE;

  const diagnostics: any = {
    hasCfContext: !!cf,
    hasHyperdrive: !!hyperdriveObj,
    hyperdriveConnStringMasked: hyperdriveObj?.connectionString ? hyperdriveObj.connectionString.replace(/:[^:@]+@/, ":***@") : "none",
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlMasked: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@") : "none",
    envKeys: cf?.env ? Object.keys(cf.env) : [],
  };

  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    diagnostics.tables = tables.map((t: any) => t.table_name);
  } catch (err: any) {
    diagnostics.tablesError = err.message;
  }

  try {
    const rawCategories = await sql`SELECT * FROM categories LIMIT 10`;
    diagnostics.rawCategories = rawCategories;
  } catch (err: any) {
    diagnostics.rawCategoriesError = err.message;
  }

  return NextResponse.json(diagnostics);
}

