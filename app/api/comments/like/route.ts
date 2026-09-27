import { NextRequest, NextResponse } from "next/server";
import { likeComment } from "@/lib/db/comments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Thiếu commentId" }, { status: 400 });
    }

    const updated = await likeComment(Number(commentId));
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error in POST /api/comments/like:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi thích bình luận" }, { status: 500 });
  }
}
