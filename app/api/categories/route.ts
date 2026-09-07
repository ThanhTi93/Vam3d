import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 86400;

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }
    const categories = await db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.id)],
    });
    return NextResponse.json(categories || [], {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err: any) {
    console.error("Error in /api/categories:", err);
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
