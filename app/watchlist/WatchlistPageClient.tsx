"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types";

interface WatchlistPageClientProps {
  allMovies: Movie[];
}

export default function WatchlistPageClient({ allMovies }: WatchlistPageClientProps) {
  const { watchlist } = useWatchlist();

  // Filter movies that are in the user's watchlist
  const watchlistMovies = allMovies.filter((m) => watchlist.includes(m.id));

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
            <Heart className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            Tủ Phim Yêu Thích Của Bạn
          </h2>
          <span className="text-gray-400 text-xs font-semibold bg-[#131520] border border-white/5 px-2.5 py-1 rounded">
            {watchlistMovies.length} phim đã lưu
          </span>
        </div>

        {watchlistMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
            {watchlistMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#131520]/50 rounded-xl border border-white/5 text-center px-4">
            <Heart className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-gray-300 mb-1">
              Tủ phim của bạn đang trống
            </h3>
            <p className="text-gray-500 text-xs max-w-sm mb-6">
              Lưu lại các bộ phim hay bằng cách bấm vào biểu tượng hình trái tim trên các thẻ phim để xem lại bất cứ lúc nào.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
