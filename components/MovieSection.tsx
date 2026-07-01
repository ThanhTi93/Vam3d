import React from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types";

interface MovieSectionProps {
  title: string;
  icon: React.ReactNode;
  movies: Movie[];
  viewAllHref?: string;
}

export default function MovieSection({
  title,
  icon,
  movies,
  viewAllHref,
}: MovieSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-sm md:text-lg font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
          {icon} {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-bold text-orange-500 hover:text-orange-400 hover:underline cursor-pointer"
          >
            Xem tất cả →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
