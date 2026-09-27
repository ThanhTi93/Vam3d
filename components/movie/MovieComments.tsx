"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Heart,
  Reply,
  Trash2,
  Send,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame,
  CornerDownRight,
  User as UserIcon,
  LogIn,
  Loader2,
  SortDesc,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AvatarFrame from "@/components/ranking/AvatarFrame";
import RankBadge from "@/components/ranking/RankBadge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export interface CommentItem {
  id: number;
  idMovie: number;
  idEpisode?: number | null;
  idAccount?: number | null;
  parentId?: number | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  content: string;
  likes: number;
  status: number;
  createdAt: string | Date | null;
  updatedAt?: string | Date | null;
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

interface MovieCommentsProps {
  movieId?: number | null;
  episodeId?: number | null;
  galleryId?: number | null;
  characterId?: number | null;
  movieTitle?: string;
  title?: string;
  subtitle?: string;
}

function formatRelativeTime(dateStr: string | Date | null): string {
  if (!dateStr) return "Vừa xong";
  const now = new Date();
  const past = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 45) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} ngày trước`;
  return past.toLocaleDateString("vi-VN");
}

export default function MovieComments({
  movieId,
  episodeId,
  galleryId,
  characterId,
  movieTitle,
  title,
  subtitle,
}: MovieCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");

  // Form states
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");

  // Reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Liked comment IDs in current session
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  // Count total comments including replies
  const totalCommentsCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  );

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (movieId) params.set("movieId", movieId.toString());
      if (episodeId) params.set("episodeId", episodeId.toString());
      if (galleryId) params.set("galleryId", galleryId.toString());
      if (characterId) params.set("characterId", characterId.toString());
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/comments?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [movieId, episodeId, galleryId, characterId, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movieId || null,
          episodeId: episodeId || null,
          galleryId: galleryId || null,
          characterId: characterId || null,
          content: content.trim(),
          authorName: user ? user.username : guestName.trim() || "Đạo Hữu Vô Danh",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          // Prepend newly created comment
          setComments((prev) => [data.comment, ...prev]);
          setContent("");
        }
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
      setReplySubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movieId || null,
          episodeId: episodeId || null,
          galleryId: galleryId || null,
          characterId: characterId || null,
          parentId,
          content: replyContent.trim(),
          authorName: user ? user.username : "Đạo Hữu Vô Danh",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), data.comment],
                };
              }
              return c;
            })
          );
          setReplyContent("");
          setReplyingToId(null);
        }
      }
    } catch (err) {
      console.error("Error posting reply:", err);
    } finally {
      setReplySubmitting(false);
    }
  };

  // Like comment
  const handleLike = async (commentId: number) => {
    if (likedIds.has(commentId)) return; // Already liked in this session

    // Optimistic update
    setLikedIds((prev) => new Set([...prev, commentId]));
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes: c.likes + 1 };
        }
        if (c.replies?.some((r) => r.id === commentId)) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, likes: r.likes + 1 } : r
            ),
          };
        }
        return c;
      })
    );

    try {
      await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bình luận này?")) return;

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) =>
          prev
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies?.filter((r) => r.id !== commentId),
            }))
        );
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const userViews = Number(user?.views) || 0;

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              {title || "Bình luận & Đàm Đạo"}
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                {totalCommentsCount}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">
              {subtitle || "Chia sẻ cảm nghĩ, bàn luận tình tiết cùng các đạo hữu"}
            </p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setSortBy("newest")}
            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
              sortBy === "newest"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-gray-400 hover:text-white bg-white/5 border border-transparent"
            }`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
              sortBy === "top"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-gray-400 hover:text-white bg-white/5 border border-transparent"
            }`}
          >
            Nhiều thích nhất
          </button>
        </div>
      </div>

      {/* ── Comment Post Form ── */}
      <div className="bg-[#131520] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <form onSubmit={handleSubmitComment} className="space-y-3.5">
          {/* User info bar or guest prompt */}
          <div className="flex items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <AvatarFrame
                  src={user.imgUrl}
                  alt={user.username}
                  views={userViews}
                  size="xs"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">{user.username}</span>
                    {user.role === "admin" && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-black px-1.5 py-0.2 rounded uppercase">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RankBadge views={userViews} size="sm" showLabel={true} />
                    <span className="text-[10px] text-orange-400/80 font-semibold">
                      {formatNumber(userViews)} tu vi
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Đạo hiệu của bạn (mặc định: Đạo Hữu Vô Danh)..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-8 max-w-xs bg-[#090a0f] border border-white/10 rounded-lg text-xs text-gray-200 placeholder-gray-500"
                  />
                </div>
                <Link
                  href="/login"
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold self-start sm:self-center transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập để hiện Khung Tu Tiên 3D
                </Link>
              </div>
            )}
          </div>

          {/* Text input area */}
          <div className="relative">
            <Textarea
              placeholder="Để lại lời bình, luận bàn công pháp, tình tiết tu tiên..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 resize-none min-h-[80px] focus-visible:ring-1 focus-visible:ring-orange-500/40"
              maxLength={1000}
              required
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-500">
                {content.length}/1000 ký tự
              </span>
              <Button
                type="submit"
                disabled={submitting || !content.trim()}
                size="sm"
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-md cursor-pointer border-0 flex items-center gap-1.5 h-8 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Gửi bình luận
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Comments List ── */}
      {loading ? (
        <div className="space-y-4 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#131520]/60 p-4 rounded-xl border border-white/5 animate-pulse flex gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#131520]/80 p-4 rounded-2xl border border-white/5 space-y-3 transition-colors hover:border-white/10"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarFrame
                    src={comment.account?.imgUrl || comment.authorAvatar}
                    alt={comment.account?.username || comment.authorName || "Đạo Hữu"}
                    views={comment.account?.views ?? 0}
                    size="xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-200">
                        {comment.account?.username || comment.authorName || "Đạo Hữu Vô Danh"}
                      </span>
                      {comment.account?.role === "admin" && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-black px-1.5 py-0.2 rounded uppercase">
                          ADMIN
                        </span>
                      )}
                      {comment.account ? (
                        <RankBadge views={comment.account.views ?? 0} size="sm" showLabel={true} />
                      ) : (
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          Khách vãng lai
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-600" />
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Delete button (if user is author or admin) */}
                {(user?.role === "admin" || (user && user.id === comment.idAccount)) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Xoá bình luận"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Comment Body */}
              <p className="text-xs text-gray-300 leading-relaxed pl-1 whitespace-pre-line">
                {comment.content}
              </p>

              {/* Action Bar (Like, Reply) */}
              <div className="flex items-center gap-4 pt-1 border-t border-white/5 text-[11px] text-gray-400">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    likedIds.has(comment.id)
                      ? "text-red-400 font-bold"
                      : "hover:text-red-400"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      likedIds.has(comment.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{comment.likes > 0 ? comment.likes : "Thích"}</span>
                </button>

                <button
                  onClick={() =>
                    setReplyingToId(replyingToId === comment.id ? null : comment.id)
                  }
                  className="flex items-center gap-1.5 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Trả lời</span>
                </button>
              </div>

              {/* Reply Box */}
              {replyingToId === comment.id && (
                <div className="mt-3 pl-3 sm:pl-6 border-l-2 border-orange-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AvatarFrame
                      src={user?.imgUrl}
                      alt={user?.username || "Bạn"}
                      views={userViews}
                      size="2xs"
                    />
                    <span className="text-[11px] text-gray-400">
                      Trả lời <strong className="text-orange-400">@{comment.account?.username || comment.authorName || "Đạo Hữu"}</strong>
                    </span>
                  </div>
                  <Textarea
                    placeholder="Viết câu trả lời của bạn..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full bg-[#090a0f] border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 placeholder-gray-500 resize-none min-h-[60px]"
                    maxLength={500}
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyContent("");
                      }}
                      className="text-xs text-gray-400 hover:text-white h-7 px-3"
                    >
                      Huỷ
                    </Button>
                    <Button
                      type="button"
                      disabled={replySubmitting || !replyContent.trim()}
                      onClick={() => handleSubmitReply(comment.id)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3.5 h-7 rounded-md border-0"
                    >
                      {replySubmitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Phản hồi"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Nested Replies List */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-2.5 pl-3 sm:pl-6 border-l border-white/10">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-[#0b0c13]/60 p-3 rounded-xl border border-white/5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <AvatarFrame
                            src={reply.account?.imgUrl || reply.authorAvatar}
                            alt={reply.account?.username || reply.authorName || "Đạo Hữu"}
                            views={reply.account?.views ?? 0}
                            size="2xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-gray-200">
                                {reply.account?.username || reply.authorName || "Đạo Hữu Vô Danh"}
                              </span>
                              {reply.account?.role === "admin" && (
                                <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 font-black px-1 rounded uppercase">
                                  ADMIN
                                </span>
                              )}
                              {reply.account ? (
                                <RankBadge views={reply.account.views ?? 0} size="sm" showLabel={false} />
                              ) : null}
                            </div>
                            <span className="text-[9px] text-gray-500 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-gray-600" />
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                          </div>
                        </div>

                        {(user?.role === "admin" || (user && user.id === reply.idAccount)) && (
                          <button
                            onClick={() => handleDelete(reply.id)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Xoá phản hồi"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed pl-1 whitespace-pre-line">
                        {reply.content}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[10px] text-gray-400">
                        <button
                          onClick={() => handleLike(reply.id)}
                          className={`flex items-center gap-1 transition-colors cursor-pointer ${
                            likedIds.has(reply.id)
                              ? "text-red-400 font-bold"
                              : "hover:text-red-400"
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              likedIds.has(reply.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                          <span>{reply.likes > 0 ? reply.likes : "Thích"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 px-4 bg-[#131520]/40 rounded-2xl border border-dashed border-white/10 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-300">Chưa có lời đàm đạo nào</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Hãy là đạo hữu đầu tiên để lại bình luận khai mở sơn môn cho bộ phim này!
          </p>
        </div>
      )}
    </div>
  );
}
