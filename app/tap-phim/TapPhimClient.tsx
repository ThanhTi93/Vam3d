"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Play, 
  Flame, 
  Sparkles, 
  Search, 
  Film, 
  Clock, 
  Eye, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Tv
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import RankingsSidebar from "@/components/RankingsSidebar";
import { Input } from "@/components/ui/input";
import { getBunnyImageUrl, formatDuration, slugify } from "@/lib/utils";
import { fetchEpisodesAction } from "./actions";
import { useAuth } from "@/app/context/AuthContext";

const PAGE_SIZE = 12;

interface TapPhimClientProps {
  initialEpisodes: any[];
  initialTotalCount: number;
  filterMovies: any[];
  allMoviesForSidebar: any[];
  initialFilters: {
    sort: "newest" | "views";
    movie: string;
    q: string;
    page: number;
  };
}

export default function TapPhimClient({
  initialEpisodes,
  initialTotalCount,
  filterMovies,
  allMoviesForSidebar,
  initialFilters,
}: TapPhimClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { freeVipMode } = useAuth();

  const [sortBy, setSortBy] = useState<"newest" | "views">(initialFilters.sort || "newest");
  const [selectedMovie, setSelectedMovie] = useState<string>(initialFilters.movie || "all");
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.q || "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialFilters.q || "");

  const [episodes, setEpisodes] = useState<any[]>(initialEpisodes || []);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || 0);
  const [page, setPage] = useState<number>(initialFilters.page || 1);
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync URL query params with state
  const updateUrl = (newSort: string, newMovie: string, newSearch: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSort !== "newest") params.set("sort", newSort);
    if (newMovie !== "all") params.set("movie", newMovie);
    if (newSearch.trim()) params.set("q", newSearch.trim());
    if (newPage > 1) params.set("page", newPage.toString());

    const newUrl = params.toString() ? `/tap-phim?${params.toString()}` : "/tap-phim";
    window.history.replaceState({}, "", newUrl);
  };

  // Fetch episodes when filters or page change
  const fetchEpisodes = async (
    sortVal = sortBy,
    movieVal = selectedMovie,
    searchVal = debouncedSearch,
    pageVal = page
  ) => {
    setLoading(true);
    try {
      const res = await fetchEpisodesAction({
        page: pageVal,
        limit: PAGE_SIZE,
        sortBy: sortVal,
        movieId: movieVal,
        search: searchVal,
      });

      setEpisodes(res.episodes || []);
      setTotalCount(res.totalCount || 0);
      setPage(pageVal);
    } catch (err) {
      console.error("Error fetching episodes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change (reset to page 1)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    fetchEpisodes(sortBy, selectedMovie, debouncedSearch, 1);
    updateUrl(sortBy, selectedMovie, debouncedSearch, 1);
  }, [sortBy, selectedMovie, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || loading) return;
    setPage(newPage);
    fetchEpisodes(sortBy, selectedMovie, debouncedSearch, newPage);
    updateUrl(sortBy, selectedMovie, debouncedSearch, newPage);
    window.scrollTo({ top: 250, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Tập phim", href: "/tap-phim" },
          { label: sortBy === "views" ? "Xem nhiều nhất" : "Mới nhất" },
        ]}
      />

      {/* Hero Header Banner */}
      <section className="relative bg-gradient-to-r from-[#131520] via-[#161826] to-[#0f111c] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow tracking-wider flex items-center gap-1">
                <Tv className="w-3 h-3" /> Danh Sách Tập Phim
              </span>
              <span className="text-xs font-bold text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {totalCount} tập phim
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {sortBy === "views" ? "Tập Phim Xem Nhiều Nhất" : "Tập Phim Mới Cập Nhật"}
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Tuyển tập trọn bộ các tập phim hoạt hình 3D, anime vietsub mới nhất và được xem nhiều nhất chất lượng Full HD sắc nét độc quyền tại Vam3D.
            </p>
          </div>

          {/* Quick Sort Switch Buttons */}
          <div className="flex items-center bg-[#090a0f] p-1.5 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setSortBy("newest")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortBy === "newest"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mới Nhất</span>
            </button>
            <button
              onClick={() => setSortBy("views")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortBy === "views"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Xem Nhiều Nhất</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131520] border border-white/5 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-2xl">
          {/* Search by Episode / Movie */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Tìm tên tập / tên phim…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#090a0f] border-white/5 text-sm h-9 w-full"
            />
          </div>

          {/* Filter by Movie */}
          <div className="w-full sm:w-60">
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-xs sm:text-sm text-gray-300 cursor-pointer focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">-- Tất cả phim ({filterMovies.length}) --</option>
              {filterMovies.map((m: any) => (
                <option key={m.id} value={m.id.toString()} className="bg-[#131520] text-gray-200">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Results text */}
        <div className="text-xs text-gray-400 font-semibold self-end sm:self-auto">
          Hiển thị <span className="text-orange-400 font-bold">{totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> – <span className="text-orange-400 font-bold">{Math.min(page * PAGE_SIZE, totalCount)}</span> / {totalCount} tập
        </div>
      </div>

      {/* Main Content Layout: Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Episode Cards Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : episodes.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {episodes.map((ep) => {
                  const movieSlug = ep.movie?.slug || ep.idMovie || ep.movie?.id;
                  const epSlug = ep.slug || (ep.name ? slugify(ep.name) : ep.id);
                  const playUrl = `/movie/${movieSlug}?ep=${epSlug}`;
                  const displayImage = ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "";
                  const movieName = ep.movie?.name || "Phim 3D";
                  const epName = ep.name || `Tập ${ep.id}`;
                  const planName = ep.plan?.name;
                  const isFree = !ep.idPlan || ep.plan?.level === 0;

                  return (
                    <Link
                      key={ep.id}
                      href={playUrl}
                      prefetch={false}
                      className="group bg-[#131520] border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 shadow-md shadow-black/40 h-full"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full bg-[#090a0f] overflow-hidden flex-shrink-0">
                        {displayImage ? (
                          <Image
                            src={getBunnyImageUrl(displayImage, "thumb")}
                            alt={`${movieName} - ${epName}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <Film className="w-8 h-8 stroke-1" />
                          </div>
                        )}

                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Play hover button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Top Badges: VIP Plan (only when not free) */}
                        {!freeVipMode && !isFree && ep.plan && ep.plan.level > 0 && (
                          <div className="absolute top-2 right-2 z-20">
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                              {planName || ep.plan.name || "VIP"}
                            </span>
                          </div>
                        )}

                        {/* Bottom Info inside thumbnail: Duration & Views */}
                        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300 font-medium">
                          <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            <Clock className="w-3 h-3 text-orange-400" />
                            {formatDuration(ep.duration || 0)}
                          </span>
                          <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            <Eye className="w-3 h-3 text-gray-400" />
                            {ep.views || 0}
                          </span>
                        </div>
                      </div>

                      {/* Card Meta Body */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                            {epName}
                          </h3>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 font-medium">
                            {movieName}
                          </p>
                        </div>

                        {/* Characters Tag if available */}
                        {ep.episodesCharacters && ep.episodesCharacters.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                            {ep.episodesCharacters.slice(0, 2).map((ec: any) => (
                              <span key={ec.id} className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                                {ec.character?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <div className="text-xs text-gray-400">
                    Trang <strong className="text-white font-mono">{page}</strong> / <strong className="text-orange-400 font-mono">{totalPages}</strong> (Hiển thị <strong className="text-white font-mono">{(page - 1) * PAGE_SIZE + 1}</strong> – <strong className="text-white font-mono">{Math.min(page * PAGE_SIZE, totalCount)}</strong> / <strong className="text-orange-400 font-mono">{totalCount}</strong> tập)
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1 || loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131520] border border-white/10 text-gray-300 hover:text-white hover:border-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trước</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          return (
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                          );
                        })
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) => {
                          if (typeof item === "string") {
                            return (
                              <span key={`dots-${idx}`} className="px-2 text-xs text-gray-500">
                                ...
                              </span>
                            );
                          }
                          const isActive = item === page;
                          return (
                            <button
                              key={item}
                              onClick={() => handlePageChange(item)}
                              disabled={loading}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                  : "bg-[#131520] border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/50"
                              }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages || loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131520] border border-white/10 text-gray-300 hover:text-white hover:border-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#131520]/50 rounded-2xl border border-white/5 text-center px-4">
              <Film className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
              <h3 className="text-lg font-bold text-gray-300 mb-1">
                Không tìm thấy tập phim nào
              </h3>
              <p className="text-gray-500 text-xs max-w-sm">
                Vui lòng thử bộ lọc phim hoặc từ khóa tìm kiếm khác.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Rankings Sidebar */}
        <div className="space-y-6">
          <RankingsSidebar movies={allMoviesForSidebar} />
        </div>
      </div>
    </main>
  );
}
