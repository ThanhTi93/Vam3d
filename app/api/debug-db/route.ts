import { NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { getHotMovies } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlMasked: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@") : "none",
  };

  try {
    const rawCount = await sql`SELECT count(*) FROM movies`;
    diagnostics.rawCount = rawCount;
  } catch (err: any) {
    diagnostics.rawCountError = { message: err.message, name: err.name, stack: err.stack };
  }

  try {
    const drizzleMovies = await db.query.movies.findMany({ limit: 2 });
    diagnostics.drizzleMoviesCount = drizzleMovies.length;
  } catch (err: any) {
    diagnostics.drizzleMoviesError = { message: err.message, name: err.name, stack: err.stack };
  }

  try {
    const hotMovies = await getHotMovies();
    diagnostics.hotMoviesLength = hotMovies.length;
  } catch (err: any) {
    diagnostics.hotMoviesError = { message: err.message, name: err.name, stack: err.stack };
  }

  return NextResponse.json(diagnostics);
}
