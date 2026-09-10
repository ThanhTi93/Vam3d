"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, PenTool, BookOpen, Film, ChevronRight, Sparkles, Star } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getBunnyImageUrl } from "@/lib/utils";

interface Author {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  movies?: any[];
}

interface AuthorsPageClientProps {
  authors: Author[];
}

export default function AuthorsPageClient({ authors }: AuthorsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAuthors = authors.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchName = a.name.toLowerCase().includes(q);
    const matchDesc = a.description?.toLowerCase().includes(q) || false;
    const matchMovie = a.movies?.some((m: any) => m.name.toLowerCase().includes(q)) || false;
    return matchName || matchDesc || matchMovie;
  });

  const totalWorks = authors.reduce((sum, a) => sum + (a.movies?.length || 0), 0);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Tác Giả" },
        ]}
      />

      {/* Hero Header Banner */}
      <section className="relative bg-gradient-to-r from-[#131520] via-[#161826] to-[#0f111c] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow tracking-wider flex items-center gap-1">
                <PenTool className="w-3 h-3" /> Tác Giả &amp; Tác Phẩm
              </span>
              <span className="text-xs font-bold text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {authors.length} tác giả · {totalWorks} tác phẩm
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Danh Sách Tác Giả Nổi Tiếng
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Tổng hợp những cây bút đại tài, tác giả của các bộ tiểu thuyết Tiên Hiệp, Huyền Huyễn đỉnh cao được chuyển thể thành phim hoạt hình 3D hấp dẫn nhất.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm tên tác giả, tác phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 shadow-inner transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Authors Grid */}
      {filteredAuthors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => {
            const authorSlug = author.slug || author.id.toString();
            const moviesCount = author.movies?.length || 0;
            const topMovies = (author.movies || []).slice(0, 3);

            return (
              <div
                key={author.id}
                className="group relative bg-[#131520] border border-white/5 hover:border-orange-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/5 group-hover:bg-orange-500/10 rounded-full blur-2xl transition-all pointer-events-none" />

                <div className="space-y-4">
                  {/* Author Header Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      {author.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/tac-gia/${authorSlug}`}
                        className="text-base font-black text-white group-hover:text-orange-400 transition-colors line-clamp-1 flex items-center gap-1.5"
                      >
                        <span>{author.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Film className="w-2.5 h-2.5" />
                          {moviesCount} tác phẩm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {author.description ||
                      `${author.name} là tác giả sáng tạo các tác phẩm hoạt hình 3D đặc sắc, mang đến những câu chuyện tiên hiệp, huyền huyễn lôi cuốn người xem.`}
                  </p>

                  {/* Authored Works Preview */}
                  {topMovies.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" /> Tác phẩm tiêu biểu:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {topMovies.map((m: any) => (
                          <Link
                            key={m.id}
                            href={`/movie/${m.slug || m.id}`}
                            className="group/movie relative rounded-lg overflow-hidden border border-white/5 bg-[#090a0f] aspect-[3/4] block hover:border-orange-500/40 transition-colors"
                            title={m.name}
                          >
                            {m.imgUrl ? (
                              <Image
                                src={getBunnyImageUrl(m.imgUrl, "thumb")}
                                alt={m.name}
                                fill
                                className="object-cover group-hover/movie:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 30vw, 10vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-[9px] text-center p-1 font-bold">
                                {m.name}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover/movie:opacity-100 transition-opacity" />
                            <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-white line-clamp-1 text-center">
                              {m.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">
                    Khám phá chi tiết
                  </span>
                  <Link
                    href={`/tac-gia/${authorSlug}`}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#131520]/20 rounded-2xl border border-white/5 text-center px-4">
          <PenTool className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-gray-300 mb-1">
            Không tìm thấy tác giả nào
          </h3>
          <p className="text-gray-500 text-xs max-w-sm">
            Vui lòng thử tìm kiếm với tên tác giả hoặc tác phẩm khác.
          </p>
        </div>
      )}
    </main>
  );
}
