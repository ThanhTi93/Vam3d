"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Play, Clock } from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import { getBunnyImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types";

export default function MovieCard({ movie }: { movie: Movie }) {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/movie/${movie.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl overflow-hidden border border-white/5 group cursor-pointer hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col h-full bg-[#131520] p-0 py-0 gap-0"
    >
      <div className="relative aspect-video w-full bg-[#090a0f] overflow-hidden">
        <Image
          src={getBunnyImageUrl(movie.thumbnail, 'thumb')}
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span className="bg-orange-500 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-sm tracking-wide shadow-sm select-none text-center">
            {movie.quality}
          </span>
          <span className="bg-black/60 text-gray-300 font-medium text-[9px] px-1.5 py-0.5 rounded-sm border border-white/10 select-none text-center">
            {movie.sub}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWatchlist(movie.id);
            }}
            aria-label={isInWatchlist(movie.id) ? "Xóa khỏi tủ phim" : "Thêm vào tủ phim"}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              isInWatchlist(movie.id)
                ? "bg-red-500 border-transparent text-white scale-110"
                : "bg-black/50 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isInWatchlist(movie.id) ? "fill-white" : ""}`} />
          </Button>
        </div>

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400 border border-white/10">
          <Star className="w-3 h-3 fill-yellow-400" /> {movie.rating}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-orange-500 transition-colors">
            {movie.title}
          </h3>
          <p className="text-[10px] text-gray-500 line-clamp-1 italic font-light mt-0.5">
            {movie.originalTitle}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2.5 text-[9px] text-gray-400 font-bold border-t border-white/5 pt-2">
          <span>{movie.year}</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {movie.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}
