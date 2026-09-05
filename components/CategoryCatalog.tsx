"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Film } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import RankingsSidebar from "@/components/RankingsSidebar";
import { Movie } from "@/types";
import { getAdminCategories } from "@/app/admin/actions";

const formatCategoryLabel = (name: string) => {
  if (name === "Tất cả") return "Tất cả";
  if (name === "phim-le") return "Phim Lẻ";
  if (name === "phim-bo") return "Phim Bộ";
  if (name === "chieu-rap") return "Chiếu Rạp";
  if (name === "hoat-hinh") return "Hoạt Hình";
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

interface CategoryCatalogProps {
  categoryTitle: string;
  movies: Movie[];
  allMovies: Movie[];
}

function CategoryCatalogContent({
  categoryTitle,
  movies,
  allMovies,
}: CategoryCatalogProps) {
  const searchParams = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [dbGenres, setDbGenres] = useState<any[]>([{ id: 0, name: "Tất cả" }]);

  useEffect(() => {
    getAdminCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setDbGenres([{ id: 0, name: "Tất cả" }, ...cats]);
      } else {
        setDbGenres([
          { id: 0, name: "Tất cả" },
          { id: 1, name: "phim-le" },
          { id: 2, name: "phim-bo" },
          { id: 3, name: "chieu-rap" },
          { id: 4, name: "hoat-hinh" },
        ]);
      }
    });
  }, []);

  const q = searchParams.get("q") || "";

  const getFilteredMovies = () => {
    let list = movies;

    // Filter by genre
    if (selectedGenre !== "Tất cả") {
      list = list.filter((m) =>
        m.genres && m.genres.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    // Filter by search query
    if (q.trim()) {
      const query = q.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(query))
      );
    }

    return list;
  };

  const filteredMovies = getFilteredMovies();

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <span className="text-gray-400 text-sm font-semibold whitespace-nowrap mr-2">
          Thể loại:
        </span>
        {dbGenres.map((genreObj) => (
          <button
            key={genreObj.name}
            onClick={() => setSelectedGenre(genreObj.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedGenre === genreObj.name
                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/10"
                : "bg-[#131520] hover:bg-[#1f2235] text-gray-300 border-white/5"
            }`}
          >
            {formatCategoryLabel(genreObj.name)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Movies Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h1 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
              <Film className="w-5 h-5 text-orange-500" />
              {q.trim() ? `Kết quả tìm kiếm: "${q}"` : categoryTitle}
            </h1>
            <span className="text-gray-400 text-xs font-semibold bg-[#131520] border border-white/5 px-2.5 py-1 rounded">
              {filteredMovies.length} phim
            </span>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[#131520]/50 rounded-xl border border-white/5 text-center px-4">
              <Film className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
              <h3 className="text-lg font-bold text-gray-300 mb-1">
                Không tìm thấy phim nào
              </h3>
              <p className="text-gray-500 text-xs max-w-sm">
                Vui lòng thử bộ lọc hoặc từ khóa tìm kiếm khác.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Rankings Sidebar */}
        <div>
          <RankingsSidebar movies={allMovies} />
        </div>
      </div>
    </main>
  );
}

export default function CategoryCatalog(props: CategoryCatalogProps) {
  return (
    <Suspense fallback={
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    }>
      <CategoryCatalogContent {...props} />
    </Suspense>
  );
}
