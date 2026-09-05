import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "vam3d-secret";

export async function POST(request: Request) {
  try {
    const { secret, tag } = await request.json();

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validTags = [
      "movies:all",
      "movies:hot",
      "movies:top",
      "movies:category",
      "categories:all",
      "plans:all",
      "episodes:latest",
      "episodes:most-viewed",
      "galleries:latest"
    ];

    const isValidTag = (t: string) => {
      if (validTags.includes(t)) return true;
      if (t.startsWith("movie:detail-")) return true;
      if (t.startsWith("movies:category-")) return true;
      if (t.startsWith("episodes:recommended-")) return true;
      return false;
    };

    const tagsToRevalidate = tag ? [tag] : validTags;

    for (const t of tagsToRevalidate) {
      if (isValidTag(t)) revalidateTag(t, "default");
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
