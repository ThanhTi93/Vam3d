import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "rophim-secret";

export async function POST(request: Request) {
  try {
    const { secret, tag } = await request.json();

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validTags = ["movies", "categories", "plans"];
    const tagsToRevalidate = tag ? [tag] : validTags;

    for (const t of tagsToRevalidate) {
      if (validTags.includes(t)) revalidateTag(t, "default");
    }

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      now: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
