"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PenTool, Film, Star, Clock, Eye, Play, ChevronRight, BookOpen, User, Flame } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getBunnyImageUrl, formatNumber } from "@/lib/utils";

interface AuthorDetailPageClientProps {
  author: any;
  movies: any[];
  otherAuthors: any[];
}

export default function AuthorDetailPageClient({
  author,
  movies,
  otherAuthors,
}: AuthorDetailPageClientProps) {
  const totalEpisodes = movies.reduce((sum, m) => sum + (m.episodes?.length || 0), 0);
  const totalViews = movies.reduce(
    (sum, m) => sum + (m.episodes || []).reduce((s: number, ep: any) => s + (ep.views || 0), 0),
    0
  );

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Tác Giả", href: "/tac-gia" },
          { label: author.name },
        ]}
      />

      {/* Author Profile Hero Card */}
      <section className="relative bg-gradient-to-br from-[#131520] via-[#161826] to-[#0f111c] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
          {/* Avatar Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-xl shadow-orange-500/25 shrink-0 border border-white/10">
            {author.name.charAt(0).toUpperCase()}
          </div>

          {/* Author Text Info */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow tracking-wider flex items-center gap-1">
                <PenTool className="w-3 h-3" /> Tác Giả
              </span>
              <span className="text-xs font-bold text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {movies.length} tác phẩm chuyển thể
              </span>
              {totalEpisodes > 0 && (
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {totalEpisodes} tập phim
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {author.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
              {author.description ||
                `${author.name} là một trong những tác giả nổi bật với nhiều tác phẩm tiểu thuyết tiên hiệp, kiếm hiệp và huyền huyễn đặc sắc đã được chuyển thể thành các series hoạt hình 3D đỉnh cao.`}
            </p>

            {/* Quick Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <Film className="w-4 h-4 text-orange-400" />
                <span>Số phim: <strong className="text-white">{movies.length}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Tổng lượt xem: <strong className="text-white">{formatNumber(totalViews)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Authored Works Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: List of Authored Movies */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Tác phẩm của {author.name} ({movies.length})
            </h2>
          </div>

          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6">
              {movies.map((movie: any) => {
                const movieSlug = movie.slug || movie.id;
                const genres = movie.movieCategories?.map((mc: any) => mc.category?.name).filter(Boolean) || [];

                return (
                  <Link
                    key={movie.id}
                    href={`/movie/${movieSlug}`}
                    prefetch={false}
                    className="group bg-[#131520] border border-white/5 hover:border-orange-500/40 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 h-full"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] w-full bg-[#090a0f] overflow-hidden">
                      {movie.imgUrl ? (
                        <Image
                          src={getBunnyImageUrl(movie.imgUrl, "thumb")}
                          alt={`Phim ${movie.name} - Tác giả ${author.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <Film className="w-10 h-10 stroke-1" />
                        </div>
                      )}

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                      {/* Rating & Year Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400 border border-white/10">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>{movie.rating || "9.5"}</span>
                      </div>

                      {/* Episodes Count Badge */}
                      {movie.episodes && movie.episodes.length > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                          {movie.episodes.length} tập
                        </div>
                      )}
                    </div>

                    {/* Meta Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                          {movie.name}
                        </h3>
                        {genres.length > 0 && (
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
                            {genres.slice(0, 2).join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span>{movie.createdAt ? new Date(movie.createdAt).getFullYear() : 2026}</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Eye className="w-3 h-3 text-gray-500" />
                          <span>{formatNumber((movie.episodes || []).reduce((acc: number, ep: any) => acc + (ep.views || 0), 0))}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[#131520]/20 rounded-2xl border border-white/5 text-center px-4">
              <Film className="w-12 h-12 text-gray-600 mb-3 stroke-1" />
              <p className="text-gray-400 text-sm font-semibold">
                Chưa có tác phẩm nào được liên kết với tác giả này.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Other Authors Recommendation */}
        <div className="space-y-6">
          <div className="bg-[#131520] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <PenTool className="w-4 h-4 text-orange-500" /> Tác giả khác
            </h3>

            {otherAuthors.length > 0 ? (
              <div className="space-y-3">
                {otherAuthors.map((oa: any) => {
                  const oaSlug = oa.slug || oa.id.toString();
                  return (
                    <Link
                      key={oa.id}
                      href={`/tac-gia/${oaSlug}`}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white/2 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
                          {oa.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors line-clamp-1">
                            {oa.name}
                          </p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">
                            {oa.movies?.length || 0} tác phẩm
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Không có tác giả khác</p>
            )}

            <div className="pt-2 border-t border-white/5">
              <Link
                href="/tac-gia"
                className="w-full block text-center text-xs font-bold text-orange-400 hover:text-orange-300 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
              >
                Xem tất cả tác giả →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
