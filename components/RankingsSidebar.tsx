"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Eye, Heart, Clock, Play, Trophy, Crown, Flame, ChevronRight } from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import { getBunnyImageUrl, formatDuration, formatNumber, slugify } from "@/lib/utils";
import { Movie } from "@/types";
import AvatarFrame from "./ranking/AvatarFrame";
import RankBadge from "./ranking/RankBadge";
import { RankedAccount } from "@/lib/db/queries";

interface RankingsSidebarProps {
  movies: Movie[];
  episodes?: any[];
  initialAccounts?: RankedAccount[];
}

interface RankedEpisode {
  id: number | string;
  name: string;
  banner: string;
  views: number;
  duration?: number;
  movieSlug: string;
  movieTitle: string;
  url: string;
}

export default function RankingsSidebar({ movies, initialAccounts }: RankingsSidebarProps) {
  const { watchlist } = useWatchlist();
  const [mainTab, setMainTab] = useState<"episodes" | "accounts">("episodes");
  const [accounts, setAccounts] = useState<RankedAccount[]>(initialAccounts || []);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch accounts if not provided
  useEffect(() => {
    if (mainTab === "accounts" && accounts.length === 0 && !loadingAccounts) {
      setLoadingAccounts(true);
      fetch("/api/leaderboard")
        .then((res) => res.json())
        .then((data) => {
          if (data?.rankedList) {
            setAccounts(data.rankedList);
          }
        })
        .catch((err) => console.error("Error fetching accounts for sidebar:", err))
        .finally(() => setLoadingAccounts(false));
    }
  }, [mainTab, accounts.length, loadingAccounts]);

  // Top 5 movies with highest views
  const top5Movies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return [...movies]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [movies]);

  return (
    <div className="space-y-6">
      {/* Rankings Card */}
      <div className="bg-[#131520] border border-white/5 rounded-2xl p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-md font-bold uppercase tracking-wider text-white">Bảng Xếp Hạng</h2>
          </div>
          <Link
            href="/bang-xep-hang"
            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5 group"
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Primary Tab Switcher: [Top Phim] vs [Top Thành Viên] */}
        <div className="grid grid-cols-2 bg-[#090a0f] p-1 rounded-xl border border-white/5 mb-4">
          <button
            type="button"
            onClick={() => setMainTab("episodes")}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "episodes"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Top Phim</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("accounts")}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "accounts"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>Thành Viên</span>
          </button>
        </div>

        {/* ════ TAB 1: TOP 5 MOVIES RANKING (IMAGE ONLY) ════ */}
        {mainTab === "episodes" && (
          <div className="space-y-2.5">
            {top5Movies.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                Chưa có dữ liệu phim xếp hạng.
              </div>
            ) : (
              top5Movies.map((movie, index) => {
                const rank = index + 1;
                const movieSlug = (movie as any).slug || movie.id;
                const movieTitle = movie.title || (movie as any).name || "Phim";
                const movieImage = movie.thumbnail || (movie as any).imgUrl || movie.banner || "";

                return (
                  <Link
                    key={`${movie.id}-${index}`}
                    href={`/movie/${movieSlug}`}
                    prefetch={false}
                    className="group relative block w-full aspect-[16/7] rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/60 transition-all duration-300 shadow-md hover:shadow-orange-500/10 cursor-pointer bg-[#090a0f]"
                  >
                    {/* Movie Poster/Banner Image */}
                    {movieImage ? (
                      <Image
                        src={getBunnyImageUrl(movieImage, "display")}
                        alt={movieTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    )}

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:from-black/75 transition-colors" />

                    {/* Top Left: Rank Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs shadow-lg transition-transform group-hover:scale-110 ${
                          rank === 1
                            ? "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-orange-500/40 ring-1 ring-white/30"
                            : rank === 2
                            ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-black shadow-amber-500/30"
                            : rank === 3
                            ? "bg-gradient-to-br from-gray-200 to-gray-400 text-black shadow-gray-500/30"
                            : "bg-black/60 backdrop-blur-md text-gray-300 border border-white/15"
                        }`}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* Top Right: Views badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-200 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                        <Eye className="w-3 h-3 text-orange-400" />
                        {formatNumber(movie.views || 0)}
                      </span>
                    </div>

                    {/* Bottom: Movie Title */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 z-10">
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-orange-400 transition-colors drop-shadow-md">
                        {movieTitle}
                      </h4>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* ════ TAB 2: ACCOUNTS RANKING ════ */}
        {mainTab === "accounts" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {loadingAccounts ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                Đang tải bảng xếp hạng thành viên...
              </div>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs space-y-1">
                <Trophy className="w-8 h-8 mx-auto text-orange-400/50" />
                <p>Chưa có thành viên nào đủ lượt xem.</p>
                <p className="text-[10px] text-gray-600">Hãy là người đầu tiên xem phim!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {accounts.slice(0, 6).map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all gap-2.5"
                    >
                      {/* Left: Rank Badge + Avatar Frame + Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RankBadge views={acc.views} rank={acc.rank} size="sm" showLabel={false} />
                        <AvatarFrame
                          src={acc.imgUrl}
                          alt={acc.username}
                          views={acc.views}
                          rank={acc.rank}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-gray-200 truncate">
                              {acc.username}
                            </span>
                            {acc.level && acc.level > 0 ? (
                              <span className="text-[8px] font-black text-amber-300 bg-amber-500/20 px-1 py-0.1 rounded border border-amber-500/30 uppercase">
                                VIP
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[9px] font-bold text-amber-300/90 block truncate">
                            {acc.realm?.name || "Phàm Nhân"} · {acc.realm?.title || ""}
                          </span>
                        </div>
                      </div>

                      {/* Right: Views */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-xs font-black text-orange-400">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>{formatNumber(acc.views)}</span>
                        </div>
                        <span className="text-[9px] text-gray-500">views</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Full Leaderboard Link */}
                <Link
                  href="/bang-xep-hang"
                  className="w-full mt-3 block text-center bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-orange-500/20 rounded-xl py-2 text-xs font-bold text-orange-400 transition-all cursor-pointer"
                >
                  Xem Bảng Xếp Hạng Đầy Đủ →
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Watchlist CTA Card */}
      <div className="bg-[#131520] border border-white/5 rounded-2xl p-5 shadow-xl text-center">
        <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-200 mb-1">Tủ Phim Của Bạn</h3>
        <Link
          href="/watchlist"
          className="w-full block text-center bg-[#1c1f2f] hover:bg-orange-500 hover:text-white border border-white/5 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all text-gray-300 cursor-pointer"
        >
          Xem Tủ Phim (<span suppressHydrationWarning>{mounted ? watchlist.length : 0}</span>)
        </Link>
      </div>
    </div>
  );
}
