import { db, schema } from "./index";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";
import { getCultivationRealm } from "@/lib/cultivation";

export interface CommentItem {
  id: number;
  idMovie?: number | null;
  idEpisode?: number | null;
  idGallery?: number | null;
  idCharacter?: number | null;
  idAccount?: number | null;
  parentId?: number | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  content: string;
  likes: number;
  status: number;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  account?: {
    id: number;
    username: string;
    imgUrl?: string | null;
    role?: string | null;
    views?: number | null;
    level?: number | null;
  } | null;
  realm?: {
    id: string;
    name: string;
    tier: number;
    color: string;
    bgColor: string;
    borderColor: string;
  };
  replies?: CommentItem[];
}

/**
 * Fetch comments for a movie, optionally filtered by episode.
 * Returns nested parent comments with their replies.
 */
export async function getComments({
  movieId,
  episodeId,
  galleryId,
  characterId,
  sortBy = "newest",
}: {
  movieId?: number | null;
  episodeId?: number | null;
  galleryId?: number | null;
  characterId?: number | null;
  sortBy?: "newest" | "top";
}): Promise<CommentItem[]> {
  try {
    if (!db) return [];

    const conditions: any[] = [eq(schema.comments.status, 1)];

    if (galleryId) {
      conditions.push(eq(schema.comments.idGallery, galleryId));
    } else if (characterId) {
      conditions.push(eq(schema.comments.idCharacter, characterId));
    } else if (movieId) {
      conditions.push(eq(schema.comments.idMovie, movieId));
      if (episodeId !== undefined && episodeId !== null) {
        // Can filter by episode if provided
      }
    } else {
      return [];
    }

    // Fetch all active comments for this movie
    const rawComments = await db.query.comments.findMany({
      where: and(...conditions),
      orderBy: (c, { desc, asc }) =>
        sortBy === "top" ? [desc(c.likes), desc(c.createdAt)] : [desc(c.createdAt)],
      with: {
        account: {
          columns: {
            id: true,
            username: true,
            imgUrl: true,
            role: true,
            views: true,
            level: true,
          },
        },
      },
    });

    // Map comments with realm info
    const enriched: CommentItem[] = rawComments.map((c: any) => {
      const views = Number(c.account?.views) || 0;
      const realm = c.account ? getCultivationRealm(views) : undefined;
      return {
        ...c,
        likes: c.likes || 0,
        realm,
        replies: [],
      };
    });

    // Group into top-level comments and replies
    const topLevelComments: CommentItem[] = [];
    const replyMap = new Map<number, CommentItem[]>();

    for (const c of enriched) {
      if (c.parentId) {
        if (!replyMap.has(c.parentId)) {
          replyMap.set(c.parentId, []);
        }
        replyMap.get(c.parentId)!.push(c);
      } else {
        topLevelComments.push(c);
      }
    }

    // Attach replies to parents (sorted by oldest first for readable conversations)
    for (const parent of topLevelComments) {
      const replies = replyMap.get(parent.id) || [];
      // Replies are sorted chronological (asc)
      parent.replies = replies.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
    }

    return topLevelComments;
  } catch (error) {
    console.error("Error in getComments:", error);
    return [];
  }
}

/**
 * Create a new comment or reply
 */
export async function createComment({
  movieId,
  episodeId,
  galleryId,
  characterId,
  accountId,
  parentId,
  authorName,
  authorAvatar,
  content,
}: {
  movieId?: number | null;
  episodeId?: number | null;
  galleryId?: number | null;
  characterId?: number | null;
  accountId?: number | null;
  parentId?: number | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  content: string;
}) {
  if (!db) throw new Error("Cơ sở dữ liệu chưa sẵn sàng");
  if (!content || !content.trim()) throw new Error("Nội dung bình luận không được để trống");

  // Sanitize content
  const trimmed = content.trim().slice(0, 1000);

  const [inserted] = await db
    .insert(schema.comments)
    .values({
      idMovie: movieId || null,
      idEpisode: episodeId || null,
      idGallery: galleryId || null,
      idCharacter: characterId || null,
      idAccount: accountId || null,
      parentId: parentId || null,
      authorName: authorName ? authorName.trim().slice(0, 100) : null,
      authorAvatar: authorAvatar || null,
      content: trimmed,
      likes: 0,
      status: 1,
    })
    .returning();

  // Fetch full details with account
  const fullComment = await db.query.comments.findFirst({
    where: eq(schema.comments.id, inserted.id),
    with: {
      account: {
        columns: {
          id: true,
          username: true,
          imgUrl: true,
          role: true,
          views: true,
          level: true,
        },
      },
    },
  });

  if (!fullComment) return inserted;

  const views = Number(fullComment.account?.views) || 0;
  const realm = fullComment.account ? getCultivationRealm(views) : undefined;

  return {
    ...fullComment,
    likes: fullComment.likes || 0,
    realm,
    replies: [],
  };
}

/**
 * Like a comment
 */
export async function likeComment(commentId: number) {
  if (!db) throw new Error("Cơ sở dữ liệu chưa sẵn sàng");

  const [updated] = await db
    .update(schema.comments)
    .set({
      likes: sql`COALESCE(${schema.comments.likes}, 0) + 1`,
      updatedAt: new Date(),
    })
    .where(eq(schema.comments.id, commentId))
    .returning({
      id: schema.comments.id,
      likes: schema.comments.likes,
    });

  return updated;
}

/**
 * Delete a comment (or mark status = 0)
 */
export async function deleteComment({
  commentId,
  accountId,
  isAdmin,
}: {
  commentId: number;
  accountId?: number | null;
  isAdmin?: boolean;
}) {
  if (!db) throw new Error("Cơ sở dữ liệu chưa sẵn sàng");

  // Check comment exists
  const existing = await db.query.comments.findFirst({
    where: eq(schema.comments.id, commentId),
  });

  if (!existing) {
    throw new Error("Bình luận không tồn tại");
  }

  // Permission check
  if (!isAdmin && existing.idAccount !== accountId) {
    throw new Error("Bạn không có quyền xoá bình luận này");
  }

  // Soft delete so replies aren't broken, or hard delete
  await db
    .update(schema.comments)
    .set({ status: 0, updatedAt: new Date() })
    .where(eq(schema.comments.id, commentId));

  return { success: true };
}
