import { NextRequest, NextResponse } from "next/server";
import { getComments, createComment, deleteComment } from "@/lib/db/comments";
import { decryptSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const movieIdParam = searchParams.get("movieId");
    const episodeIdParam = searchParams.get("episodeId");
    const galleryIdParam = searchParams.get("galleryId");
    const characterIdParam = searchParams.get("characterId");
    const sortBy = (searchParams.get("sortBy") as "newest" | "top") || "newest";

    const movieId = movieIdParam ? parseInt(movieIdParam, 10) : null;
    const episodeId = episodeIdParam ? parseInt(episodeIdParam, 10) : null;
    const galleryId = galleryIdParam ? parseInt(galleryIdParam, 10) : null;
    const characterId = characterIdParam ? parseInt(characterIdParam, 10) : null;

    if (!movieId && !galleryId && !characterId) {
      return NextResponse.json({ error: "Thiếu movieId, galleryId hoặc characterId" }, { status: 400 });
    }

    const comments = await getComments({
      movieId,
      episodeId,
      galleryId,
      characterId,
      sortBy,
    });
    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json({ error: error.message || "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, episodeId, galleryId, characterId, parentId, content, authorName } = body;

    if (!movieId && !galleryId && !characterId) {
      return NextResponse.json({ error: "Thiếu movieId, galleryId hoặc characterId" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung bình luận" }, { status: 400 });
    }

    // Check user session
    let accountId: number | null = null;
    const token = req.cookies.get("session")?.value;
    if (token) {
      try {
        const payload = await decryptSession(token);
        if (payload?.userId) {
          accountId = Number(payload.userId);
        }
      } catch (authErr) {
        console.warn("Session token decrypt failed in comment API:", authErr);
      }
    }

    const comment = await createComment({
      movieId: movieId ? Number(movieId) : null,
      episodeId: episodeId ? Number(episodeId) : null,
      galleryId: galleryId ? Number(galleryId) : null,
      characterId: characterId ? Number(characterId) : null,
      accountId,
      parentId: parentId ? Number(parentId) : null,
      authorName: authorName || (accountId ? null : "Đạo Hữu Vô Danh"),
      content,
    });

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error("Error in POST /api/comments:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi gửi bình luận" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentIdParam = searchParams.get("id");

    if (!commentIdParam) {
      return NextResponse.json({ error: "Thiếu comment id" }, { status: 400 });
    }

    const commentId = parseInt(commentIdParam, 10);
    const token = req.cookies.get("session")?.value;
    let accountId: number | null = null;
    let isAdmin = false;

    if (token) {
      try {
        const payload = await decryptSession(token);
        if (payload?.userId) {
          accountId = Number(payload.userId);
        }
        if (payload?.role === "admin") {
          isAdmin = true;
        }
      } catch (authErr) {
        console.warn("Session token decrypt failed in comment delete:", authErr);
      }
    }

    if (!accountId && !isAdmin) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để xoá bình luận" }, { status: 401 });
    }

    await deleteComment({
      commentId,
      accountId,
      isAdmin,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/comments:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi xoá bình luận" }, { status: 500 });
  }
}
