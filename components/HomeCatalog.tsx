"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flame, Award, Film, Tv, TrendingUp, Camera, Play, Clock } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import MovieSection from "@/components/MovieSection";
import RankingsSidebar from "@/components/RankingsSidebar";
import dynamic from "next/dynamic";
import { HomeGallerySection } from "@/components/GalleryComponents";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBunnyImageUrl, formatRelativeTime, formatDuration } from "@/lib/utils";
import { Movie } from "@/types";
import { incrementGalleryViews } from "@/app/admin/actions";

const GalleryDetailModal = dynamic(() => import("@/components/GalleryComponents").then((mod) => mod.GalleryDetailModal), {
  ssr: false,
});

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);

  const handleSelectGallery = (g: any) => {
    setSelectedGallery(g);
    if (g && g.id) {
      incrementGalleryViews(g.id);
    }
  };

  const q = searchParams.get("q") || "";

  // Sync selected genre with URL parameter
  useEffect(() => {
    setSelectedGenre(searchParams.get("genre") || "Tất cả");
  }, [searchParams]);

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    const params = new URLSearchParams(window.location.search);
    if (genre !== "Tất cả") {
      params.set("genre", genre);
    } else {
      params.delete("genre");
    }
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const getFilteredMoviesList = () => {
    let list = movies;

    if (selectedGenre !== "Tất cả") {
      list = list.filter((m) => m.genres && m.genres.includes(selectedGenre));
    }

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

  const filteredMovies = getFilteredMoviesList();
  const isFiltering = q.trim() !== "" || selectedGenre !== "Tất cả";

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      <h1 className="sr-only">RoPhim – Xem Phim Online Thuyết Minh Vietsub HD</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Movie Catalog or Sections */}
        <div className="lg:col-span-3 space-y-10">
          {isFiltering ? (
            /* Filtering / Search active view */
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Film className="w-5 h-5 text-orange-500" />
                  {q.trim() ? `Kết quả tìm kiếm: "${q}"` : `Thể loại: ${selectedGenre}`}
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
                icon={<Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-wider">
          <Play className="w-4 h-4 text-orange-500 fill-orange-500/20" />
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
        {episodes.map((ep) => {
          const epIndex = ep.movie?.episodes?.findIndex((x: any) => x.id === ep.id);
          const epParamVal = epIndex !== undefined && epIndex !== -1 ? epIndex + 1 : 1;
          const playUrl = `/movie/${ep.idMovie}?ep=${epParamVal}`;
          
          const displayImage = ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "";

          return (
            <Link
              key={ep.id}
              href={playUrl}
              className="group bg-[#131520] border border-white/5 rounded-xl overflow-hidden relative aspect-video flex flex-col hover:border-orange-500/30 transition-all duration-300 shadow-md shadow-black/40"
            >
              <div className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden">
                {displayImage ? (
                  <img
                    src={getBunnyImageUrl(displayImage, 'thumb')}
                    alt={`${ep.movie?.name} - ${ep.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Play className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
              </div>

              <div className="absolute top-2 left-2 z-20">
                <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide border-0 shadow-md">
                  {ep.name || "Tập mới"}
                </Badge>
              </div>
              {ep.plan && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide border-0 shadow-md">
                    {ep.plan.name}
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20 flex flex-col justify-end">
                <h3 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {ep.movie?.name || "Phim"}
                </h3>
                <span className="text-[9px] text-gray-400 font-medium mt-0.5 line-clamp-1 flex items-center gap-1 flex-wrap">
                  <span>{ep.name}</span>
                  {ep.duration > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 inline" />
                        <span>{formatDuration(ep.duration)}</span>
                      </span>
                    </>
                  )}
                  {showViews && (
                    <>
                      <span>•</span>
                      <span>👁️ {ep.views || 0} lượt xem</span>
                    </>
                  )}
                  {!ep.duration && !showViews && (
                    <>
                      <span>•</span>
                      <span>Mới cập nhật</span>
                    </>
                  )}
                </span>
              </div>

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeCatalog(props: HomeCatalogProps) {
  return (
    <Suspense fallback={
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    }>
      <HomeCatalogContent {...props} />
    </Suspense>
  );
}
