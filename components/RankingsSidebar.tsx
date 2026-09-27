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

export default function RankingsSidebar({ movies, episodes, initialAccounts }: RankingsSidebarProps) {
  const { watchlist } = useWatchlist();
  const [mainTab, setMainTab] = useState<"episodes" | "accounts">("episodes");
  const [rankingTab, setRankingTab] = useState<"day" | "week" | "month">("day");
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

  // Extract all episodes from movies or provided episodes prop
  const allEpisodes = useMemo<RankedEpisode[]>(() => {
    if (episodes && episodes.length > 0) {
      return episodes.map((ep: any) => {
        const movieSlug = ep.movie?.slug || ep.idMovie || ep.movie?.id || "";
        const epSlug = ep.slug || (ep.name ? slugify(ep.name) : ep.id);
        return {
          id: ep.id,
          name: ep.name || `Tập ${ep.id}`,
          banner: ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "",
          views: ep.views || 0,
          duration: ep.duration || 0,
          movieSlug: String(movieSlug),
          movieTitle: ep.movie?.name || ep.movie?.title || "Phim",
          url: `/movie/${movieSlug}?ep=${epSlug}`,
        };
      });
    }

    if (!movies || movies.length === 0) return [];

    const extracted: RankedEpisode[] = [];
    movies.forEach((m) => {
      const movieSlug = (m as any).slug || m.id;
      const movieTitle = m.title || (m as any).name || "Phim";
      const movieThumb = m.thumbnail || (m as any).imgUrl || m.banner || "";

      if (m.episodes && m.episodes.length > 0) {
        m.episodes.forEach((ep: any) => {
          const epSlug = ep.slug || (ep.name ? slugify(ep.name) : (ep.id || 1));
          extracted.push({
            id: ep.id || ep.name,
            name: ep.name || `Tập ${ep.id}`,
            banner: ep.banner || movieThumb,
            views: ep.views || Math.floor((m.views || 100) / (m.episodes?.length || 1)),
            duration: ep.duration || 0,
            movieSlug: String(movieSlug),
            movieTitle,
            url: `/movie/${movieSlug}?ep=${epSlug}`,
          });
        });
      } else {
        extracted.push({
          id: m.id,
          name: m.title,
          banner: movieThumb,
          views: m.views || 0,
          duration: 0,
          movieSlug: String(movieSlug),
          movieTitle,
          url: `/movie/${movieSlug}`,
        });
      }
    });

    return extracted;
  }, [movies, episodes]);

  const episodeRankings = useMemo(() => {
    if (allEpisodes.length === 0) return [];

    const sorted = [...allEpisodes].sort((a, b) => (b.views || 0) - (a.views || 0));

    if (rankingTab === "day") {
      return sorted.slice(0, 6).map((ep, idx) => ({
        ...ep,
        displayViews: Math.max(1, Math.round(ep.views * 0.12) + (6 - idx) * 35),
      }));
    }

    if (rankingTab === "week") {
      return sorted.slice(0, 6).map((ep, idx) => ({
        ...ep,
        displayViews: Math.max(1, Math.round(ep.views * 0.45) + (6 - idx) * 120),
      }));
    }

    return sorted.slice(0, 6).map((ep) => ({
      ...ep,
      displayViews: ep.views,
    }));
  }, [allEpisodes, rankingTab]);

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

        {/* Primary Tab Switcher: [Top Tập Phim] vs [Top Thành Viên] */}
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
            <Play className="w-3 h-3 fill-current" />
            <span>Tập Phim</span>
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

        {/* ════ TAB 1: EPISODES RANKING ════ */}
        {mainTab === "episodes" && (
          <>
            {/* Day / Week / Month Subtabs */}
            <div className="flex bg-[#090a0f] rounded-lg p-1 border border-white/5 mb-4">
              {(["day", "week", "month"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRankingTab(tab)}
                  className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    rankingTab === tab
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "day" ? "Ngày" : tab === "week" ? "Tuần" : "Tháng"}
                </button>
              ))}
            </div>

            {/* Ranked Episodes List */}
            <div className="space-y-3">
              {episodeRankings.map((ep, index) => {
                const rank = index + 1;
                return (
                  <Link
                    key={`${ep.id}-${ep.movieSlug}-${index}`}
                    href={ep.url}
                    prefetch={false}
                    className="flex items-center gap-3 group cursor-pointer hover:bg-white/[0.03] rounded-xl transition-all p-1.5 border border-transparent hover:border-white/5"
                  >
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-md font-extrabold flex items-center justify-center text-xs flex-shrink-0 shadow-sm ${
                        rank === 1
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/30"
                          : rank === 2
                          ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-black font-black"
                          : rank === 3
                          ? "bg-gradient-to-tr from-gray-200 to-amber-200 text-black font-black"
                          : "bg-[#1c1f2f] text-gray-400"
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Thumbnail */}
                    <div className="relative w-14 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-[#090a0f] border border-white/5">
                      {ep.banner ? (
                        <Image
                          src={getBunnyImageUrl(ep.banner, "thumb")}
                          alt={`${ep.movieTitle} - ${ep.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {ep.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 font-medium mb-0.5">
                        {ep.movieTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="text-gray-400 flex items-center gap-1 font-medium">
                          <Eye className="w-3 h-3 text-orange-400/80" /> {formatNumber(ep.displayViews)}
                        </span>
                        {(ep.duration || 0) > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-gray-400">
                              <Clock className="w-2.5 h-2.5" /> {formatDuration(ep.duration || 0)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
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
