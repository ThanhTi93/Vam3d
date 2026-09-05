import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json([]);
    }
    const categories = await db.query.categories.findMany({
      where: (cats, { eq }) => eq(cats.status, 1),
      orderBy: (c, { asc }) => [asc(c.id)],
    });
    return NextResponse.json(categories || []);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
