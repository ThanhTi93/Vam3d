import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json([]);
    }
    const categories = await db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.id)],
    });
    return NextResponse.json(categories || []);
  } catch (err: any) {
    console.error("Error in /api/categories:", err);
    return NextResponse.json([]);
  }
}
