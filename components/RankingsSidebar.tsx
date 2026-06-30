"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Eye, Star, Heart } from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import { getBunnyImageUrl } from "@/lib/utils";
import { Movie } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RankingsSidebarProps {
  movies: Movie[];
}

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function RankingsSidebar({ movies }: RankingsSidebarProps) {
  const { watchlist } = useWatchlist();
  const [rankingTab, setRankingTab] = useState<"day" | "week" | "month">("day");

  const getRankings = () => {
    if (!movies || movies.length === 0) return [];
    
    // Sort movies by views descending
    const sorted = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0));
    
    if (rankingTab === "day") {
      return sorted.slice(0, 6);
    }
    if (rankingTab === "week") {
      // Simulate weekly ranking by reversing or slight shifting (as in original)
      return [...sorted].reverse().slice(0, 6);
    }
    // Simulate monthly ranking by selecting specific items (as in original)
    if (sorted.length >= 6) {
      return [sorted[1], sorted[3], sorted[0], sorted[4], sorted[2], sorted[5]];
    }
    return sorted.slice(0, 6);
  };

  const rankings = getRankings();

  return (
    <div className="space-y-6">
      {/* rankings Card */}
      <Card className="bg-[#131520] border-white/5 p-5 shadow-xl gap-0">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h2 className="text-md font-bold uppercase tracking-wider text-white">Bảng Xếp Hạng</h2>
        </div>

        <div className="flex bg-[#090a0f] rounded-lg p-1 border border-white/5 mb-5">
          {(["day", "week", "month"] as const).map((tab) => (
            <Button
              key={tab}
              variant={rankingTab === tab ? "default" : "outline"}
              size="xs"
              onClick={() => setRankingTab(tab)}
              className="flex-1"
            >
              {tab === "day" ? "Ngày" : tab === "week" ? "Tuần" : "Tháng"}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {rankings.map((movie, index) => {
            const rank = index + 1;
            return (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="flex items-center gap-3 group cursor-pointer hover:bg-white/2 rounded-lg transition-colors p-1"
              >
                <span
                  className={`w-7 h-7 rounded-md font-extrabold flex items-center justify-center text-xs flex-shrink-0 ${
                    rank === 1
                      ? "bg-orange-500 text-white"
                      : rank === 2
                      ? "bg-amber-500 text-black"
                      : rank === 3
                      ? "bg-yellow-500 text-black"
                      : "bg-[#1c1f2f] text-gray-400"
                  }`}
                >
                  {rank}
                </span>
                <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-[#090a0f] border border-white/5">
                  <Image
                    src={getBunnyImageUrl(movie.thumbnail, 'thumb')}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {movie.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1 italic mb-0.5">
                    {movie.originalTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-medium">
                      <Eye className="w-3 h-3" /> {formatNumber(movie.views || 0)}
                    </span>
                    <span className="text-[10px] text-yellow-500 flex items-center gap-0.5 font-bold">
                      <Star className="w-2.5 h-2.5 fill-yellow-500" /> {movie.rating}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Watchlist CTA Card */}
      <Card className="bg-[#131520] border-white/5 p-5 shadow-xl text-center gap-0">
        <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-200 mb-1">Tủ Phim Của Bạn</h3>
        <p className="text-xs text-gray-500 mb-4">Lưu lại phim hay để xem bất cứ khi nào!</p>
        <Link href="/watchlist" className="w-full block">
          <Button
            variant="outline"
            className="w-full bg-[#1c1f2f] hover:bg-orange-500 hover:text-white border border-white/5 rounded-lg py-2 text-xs font-bold tracking-wide transition-all text-gray-300 cursor-pointer"
          >
            Xem Tủ Phim ({watchlist.length})
          </Button>
        </Link>
      </Card>
    </div>
  );
}
