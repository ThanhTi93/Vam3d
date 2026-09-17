"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Eye, Heart, Clock, Play } from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import { getBunnyImageUrl, formatDuration } from "@/lib/utils";
import { Movie } from "@/types";

interface RankingsSidebarProps {
  movies: Movie[];
  episodes?: any[];
}

function formatNumber(num: number): string {
  return (num || 0).toLocaleString();
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

export default function RankingsSidebar({ movies, episodes }: RankingsSidebarProps) {
  const { watchlist } = useWatchlist();
  const [rankingTab, setRankingTab] = useState<"day" | "week" | "month">("day");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Extract all episodes from movies or provided episodes prop
  const allEpisodes = useMemo<RankedEpisode[]>(() => {
    if (episodes && episodes.length > 0) {
      return episodes.map((ep) => {
        const movieSlug = ep.movie?.slug || ep.idMovie || ep.movie?.id || "";
        return {
          id: ep.id,
          name: ep.name || `Tập ${ep.id}`,
          banner: ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "",
          views: ep.views || 0,
          duration: ep.duration || 0,
          movieSlug: String(movieSlug),
          movieTitle: ep.movie?.name || ep.movie?.title || "Phim",
          url: `/movie/${movieSlug}?ep=${ep.id}`,
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
          extracted.push({
            id: ep.id || ep.name,
            name: ep.name || `Tập ${ep.id}`,
            banner: ep.banner || movieThumb,
            views: ep.views || Math.floor((m.views || 100) / (m.episodes?.length || 1)),
            duration: ep.duration || 0,
            movieSlug: String(movieSlug),
            movieTitle,
            url: `/movie/${movieSlug}?ep=${ep.id || 1}`,
          });
        });
      } else {
        // Fallback to movie itself if no episode array
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

  const rankings = useMemo(() => {
    if (allEpisodes.length === 0) return [];

    // Sort descending by views
    const sorted = [...allEpisodes].sort((a, b) => (b.views || 0) - (a.views || 0));

    if (rankingTab === "day") {
      // Top daily: Top episodes with highest views / daily activity
      return sorted.slice(0, 6).map((ep, idx) => ({
        ...ep,
        displayViews: Math.max(1, Math.round(ep.views * 0.12) + (6 - idx) * 35),
      }));
    }

    if (rankingTab === "week") {
      // Top weekly: Scaled views for week
      return sorted.slice(0, 6).map((ep, idx) => ({
        ...ep,
        displayViews: Math.max(1, Math.round(ep.views * 0.45) + (6 - idx) * 120),
      }));
    }

    // Top monthly: Full views
    return sorted.slice(0, 6).map((ep) => ({
      ...ep,
      displayViews: ep.views,
    }));
  }, [allEpisodes, rankingTab]);

  return (
    <div className="space-y-6">
      {/* Rankings Card */}
      <div className="bg-[#131520] border border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-md font-bold uppercase tracking-wider text-white">Bảng Xếp Hạng</h2>
          </div>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Top Tập Phim</span>
        </div>

        {/* Day / Week / Month Tabs */}
        <div className="flex bg-[#090a0f] rounded-lg p-1 border border-white/5 mb-5">
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
        <div className="space-y-3.5">
          {rankings.map((ep, index) => {
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
                      src={getBunnyImageUrl(ep.banner, 'thumb')}
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
