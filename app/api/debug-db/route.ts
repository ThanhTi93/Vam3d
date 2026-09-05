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
    const rawCount = await sql`SELECT count(*) FROM movies`;
    diagnostics.rawCount = rawCount;
  } catch (err: any) {
    diagnostics.rawCountError = { message: err.message, name: err.name, code: err.code };
  }

  try {
    const drizzleMovies = await db.query.movies.findMany({ limit: 2 });
    diagnostics.drizzleMoviesCount = drizzleMovies.length;
  } catch (err: any) {
    diagnostics.drizzleMoviesError = { message: err.message, name: err.name, code: err.code };
  }

  return NextResponse.json(diagnostics);
}

