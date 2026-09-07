"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Flame, Award, Film, Tv, TrendingUp, Camera, Play, Clock } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import MovieSection from "@/components/MovieSection";
import RankingsSidebar from "@/components/RankingsSidebar";
import { HomeGallerySection, GalleryDetailModal } from "@/components/GalleryComponents";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBunnyImageUrl, formatRelativeTime, formatDuration, slugify } from "@/lib/utils";
import { Movie } from "@/types";
import { incrementGalleryViews } from "@/app/admin/actions";

interface HomeCatalogProps {
  movies: Movie[];
  galleries: any[];
  latestEpisodes?: any[];
  mostViewedEpisodes?: any[];
}

function HomeCatalogContent({ 
  movies, 
  galleries, 
  latestEpisodes = [], 
  mostViewedEpisodes = [] 
}: HomeCatalogProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);

  const handleSelectGallery = (g: any) => {
    setSelectedGallery(g);
    if (g && g.id) {
      incrementGalleryViews(g.id);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q") || "";
      const genreParam = params.get("genre");
      if (qParam) setSearchQuery(qParam);
      if (genreParam) setSelectedGenre(genreParam);
    }
  }, []);

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (genre !== "Tất cả") {
        params.set("genre", genre);
      } else {
        params.delete("genre");
      }
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    }
  };

  const getFilteredMoviesList = () => {
    let list = movies;

    if (selectedGenre !== "Tất cả") {
      list = list.filter((m) => m.genres && m.genres.includes(selectedGenre));
    }

    if (searchQuery.trim()) {
      const rawQuery = searchQuery.toLowerCase().trim();
      const slugQuery = slugify(searchQuery);
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(rawQuery) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(rawQuery)) ||
          slugify(m.title).includes(slugQuery) ||
          (m.originalTitle && slugify(m.originalTitle).includes(slugQuery))
      );
    }

    return list;
  };

  const filteredMovies = getFilteredMoviesList();
  const isFiltering = searchQuery.trim() !== "" || selectedGenre !== "Tất cả";

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      <h1 className="sr-only">Vam3D – Xem Phim Online Thuyết Minh Vietsub HD</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Movie Catalog or Sections */}
        <div className="lg:col-span-3 space-y-10">
          {isFiltering ? (
            /* Filtering / Search active view */
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Film className="w-5 h-5 text-orange-500" />
                  {searchQuery.trim() ? `Kết quả tìm kiếm: "${searchQuery}"` : `Thể loại: ${selectedGenre}`}
                </h2>
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
                    Vui lòng thử bộ lọc hoặc từ khóa khác.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Standard Homepage Sections */
            <>
              {/* Hot picks */}
              <MovieSection
                title="Phim Đề Cử Mới Nhất"
                icon={<Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-orange-500/20" />}
                movies={movies.slice(0, 4)}
                viewAllHref="/phim-hot"
              />

              {/* Most Viewed Episodes */}
              {mostViewedEpisodes.length > 0 && (
                <LatestEpisodesSection
                  title="Tập Phim Xem Nhiều Nhất"
                  episodes={mostViewedEpisodes}
                  showViews={true}
                />
              )}

              {/* Latest Episodes */}
              {latestEpisodes.length > 0 && (
                <LatestEpisodesSection
                  title={
                    <span className="flex items-center gap-2">
                      <span>Tập Phim Mới Nhất</span>
                      <span className="bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse shadow-md shadow-orange-500/20 normal-case">
                        New
                      </span>
                    </span>
                  }
                  episodes={latestEpisodes}
                  showViews={false}
                />
              )}

              {/* AI Galleries Section */}
              {galleries.length > 0 && (
                <HomeGallerySection
                  title="Bộ Sưu Tập AI Xem Nhiều Nhất"
                  galleries={[...galleries].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6)}
                  onViewAll={() => router.push("/gallery")}
                  onSelectGallery={handleSelectGallery}
                />
              )}

              {/* Newest AI Galleries Section */}
              {galleries.length > 0 && (
                <HomeGallerySection
                  title={
                    <span className="flex items-center gap-2">
                      <span>Bộ Sưu Tập AI Mới Nhất</span>
                      <span className="bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse shadow-md shadow-orange-500/20 normal-case">
                        New
                      </span>
                    </span>
                  }
                  galleries={[...galleries].sort((a, b) => b.id - a.id).slice(0, 6)}
                  onViewAll={() => router.push("/gallery")}
                  onSelectGallery={handleSelectGallery}
                />
              )}


            </>
          )}
        </div>

        {/* Right column: Rankings Sidebar */}
        <div>
          <RankingsSidebar movies={movies} />
        </div>
      </div>

      <GalleryDetailModal
        gallery={selectedGallery}
        onClose={() => setSelectedGallery(null)}
      />
    </main>
  );
}

function LatestEpisodesSection({ 
  episodes, 
  title, 
  showViews = false 
}: { 
  episodes: any[]; 
  title: React.ReactNode; 
  showViews?: boolean; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-sm md:text-lg font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
          <Play className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-orange-500/20" />
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
        {episodes.map((ep) => {
          const movieId = ep.idMovie || ep.movie?.id;
          const playUrl = `/movie/${movieId}?ep=${ep.id}`;
          
          const displayImage = ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "";

          return (
            <Link
              key={ep.id}
              href={playUrl}
              prefetch={false}
              className="group bg-[#131520] border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-orange-500/30 transition-all duration-300 shadow-md shadow-black/40 h-full"
            >
              <div className="relative aspect-video w-full bg-[#090a0f] overflow-hidden flex-shrink-0">
                {displayImage ? (
                  <Image
                    src={getBunnyImageUrl(displayImage, 'thumb')}
                    alt={`${ep.movie?.name} - ${ep.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Play className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                
                <div className="absolute top-2 left-2 z-20 max-w-[55%]">
                  <span className="bg-orange-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm shadow-md truncate block w-full text-center select-none">
                    {ep.name || "Tập mới"}
                  </span>
                </div>
                {ep.plan && (
                  <div className="absolute top-2 right-2 z-20 max-w-[40%]">
                    <span className="bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm shadow-md truncate block w-full text-center select-none">
                      {ep.plan.name}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-2.5 flex-grow flex flex-col justify-between">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {ep.movie?.name || "Phim"}
                  </h3>
                  <div className="text-[9px] text-gray-400 font-medium mt-1.5 line-clamp-1 flex items-center gap-1 flex-wrap">
                    <span className="text-gray-300 bg-white/5 border border-white/10 px-1 rounded-sm text-[8px] max-w-[80px] truncate">{ep.name}</span>
                    {ep.duration > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 inline" />
                          <span>{formatDuration(ep.duration)}</span>
                        </span>
                      </>
                    )}
                    {showViews && (
                      <>
                        <span>•</span>
                        <span>👁️ {ep.views || 0}</span>
                      </>
                    )}
                    {!ep.duration && !showViews && (
                      <>
                        <span>•</span>
                        <span>Mới</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default HomeCatalogContent;
