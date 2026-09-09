"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Film, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  CheckCircle2, 
  Search, 
  HelpCircle, 
  Tag, 
  Tv, 
  Flame,
  Clapperboard
} from "lucide-react";
import MovieCard from "@/components/MovieCard";
import RankingsSidebar from "@/components/RankingsSidebar";
import { Movie } from "@/types";
import { DEFAULT_CATEGORIES, CategoryFAQ } from "@/lib/categories";
import { slugify } from "@/lib/utils";

interface CategoryCatalogProps {
  categoryTitle: string;
  categorySlug?: string;
  categoryDescription?: string;
  categoryLongDescription?: string;
  categoryHighlights?: string[];
  categoryFaqs?: CategoryFAQ[];
  movies: Movie[];
  allMovies: Movie[];
  allCategories?: { id: number; name: string; slug: string }[];
}

export default function CategoryCatalog({
  categoryTitle,
  categorySlug = "",
  categoryDescription,
  categoryLongDescription,
  categoryHighlights = [],
  categoryFaqs = [],
  movies,
  allMovies,
  allCategories,
}: CategoryCatalogProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const availableCategories = allCategories && allCategories.length > 0 
    ? allCategories 
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q") || "";
      const genreParam = params.get("genre");
      if (qParam) setSearchQuery(qParam);
      if (genreParam) setSelectedGenre(genreParam);
    }
  }, []);

  const getFilteredMovies = () => {
    let list = movies;

    // Filter by genre
    if (selectedGenre !== "Tất cả") {
      list = list.filter((m) =>
        m.genres && m.genres.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(query))
      );
    }

    return list;
  };

  const filteredMovies = getFilteredMovies();
  const currentSlugClean = (categorySlug || slugify(categoryTitle)).toLowerCase();

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-300">
      {/* ─── SEO HERO HEADER / CATEGORY DESCRIPTION CARD ─── */}
      <header className="relative bg-gradient-to-b from-[#161826] to-[#0f1019] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 overflow-hidden shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-red-500/10 blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[11px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-md shadow-orange-500/20 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Thể Loại Tuyển Chọn
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Film className="w-3 h-3 text-orange-400" />
              {movies.length} bộ phim
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Cập nhật Full HD / 4K
            </span>
          </div>

          {/* Main H1 Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Phim {categoryTitle} Vietsub Mới Nhất
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-orange-400/90 font-medium mt-1">
              Tuyển tập phim 3D thể loại {categoryTitle} chuẩn HD, vietsub mượt mà và cập nhật nhanh nhất tại Vam3D
            </p>
          </div>

          {/* Category Description with Read More / Read Less */}
          {categoryDescription && (
            <div className="bg-[#0b0c13]/70 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/5 space-y-3">
              <div className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                <p>{categoryDescription}</p>
                {categoryLongDescription && isDescExpanded && (
                  <p className="mt-2.5 text-gray-400 border-t border-white/5 pt-2.5 animate-in fade-in duration-200">
                    {categoryLongDescription}
                  </p>
                )}
              </div>

              {categoryLongDescription && (
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                >
                  {isDescExpanded ? (
                    <>
                      Thu gọn mô tả <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Xem thêm chi tiết <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Feature Highlights Pills */}
          {categoryHighlights && categoryHighlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {categoryHighlights.map((hl, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
                >
                  <CheckCircle2 className="w-3 h-3 text-orange-400 shrink-0" />
                  {hl}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ─── CRAWLABLE CATEGORY NAVIGATION / PILL LINKS (SEO BOOST) ─── */}
      <section aria-label="Danh mục thể loại phim" className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          <span className="text-gray-400 text-xs sm:text-sm font-bold whitespace-nowrap mr-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-orange-500" />
            Thể loại:
          </span>

          {/* All link */}
          <Link
            href="/phim-hot"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border whitespace-nowrap transition-all duration-200 ${
              categorySlug === "phim-hot" || categorySlug === ""
                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20"
                : "bg-[#131520] hover:bg-[#1f2235] text-gray-300 hover:text-white border-white/10"
            }`}
          >
            Tất cả phim
          </Link>

          {/* Direct Category Links for Search Engine Bot Discovery */}
          {availableCategories.map((cat) => {
            const catSlug = cat.slug || slugify(cat.name);
            const isActive = currentSlugClean === catSlug.toLowerCase() || currentSlugClean === slugify(cat.name).toLowerCase();

            return (
              <Link
                key={cat.id || cat.slug || cat.name}
                href={`/${encodeURIComponent(catSlug)}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20 ring-1 ring-orange-400/40"
                    : "bg-[#131520] hover:bg-[#1f2235] text-gray-300 hover:text-white border-white/5 hover:border-white/15"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── MAIN CONTENT GRID (MOVIES + SIDEBAR) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Movies Grid */}
        <section className="lg:col-span-3 space-y-6">
          {/* Section Heading & Search Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
              <Clapperboard className="w-5 h-5 text-orange-500" />
              {searchQuery.trim() ? `Kết quả tìm kiếm: "${searchQuery}"` : `Tuyển Tập Phim ${categoryTitle}`}
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-semibold bg-[#131520] border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                {filteredMovies.length} phim sẵn sàng
              </span>
            </div>
          </div>

          {/* Movies List */}
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 animate-in fade-in duration-300">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[#131520]/60 rounded-2xl border border-white/10 text-center px-4 space-y-3">
              <Film className="w-16 h-16 text-gray-600 stroke-1" />
              <h3 className="text-lg font-bold text-gray-200">
                Không tìm thấy phim nào phù hợp
              </h3>
              <p className="text-gray-400 text-xs max-w-md">
                Hiện tại danh mục này chưa có phim tương ứng hoặc từ khóa tìm kiếm chưa chính xác. Vui lòng thử lại với thể loại khác.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Xóa từ khóa tìm kiếm
                </button>
              )}
            </div>
          )}

          {/* ─── SEO FAQ & DETAILED INFORMATIONAL SECTION ─── */}
          {categoryFaqs && categoryFaqs.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Câu Hỏi Thường Gặp Về Thể Loại Phim {categoryTitle}
                </h2>
              </div>

              <div className="space-y-3">
                {categoryFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <article
                      key={index}
                      className="bg-[#131520] border border-white/5 rounded-xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-gray-200 hover:text-orange-400 transition-colors cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-orange-500 transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-gray-400 border-t border-white/5 pt-3 leading-relaxed animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── INTERNAL LINKING TAG CLOUD (SEO EXPANSION) ─── */}
          <section className="bg-[#10121b] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">
                Khám Phá Thể Loại Phim Khác
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.slice(0, 16).map((cat) => {
                const catSlug = cat.slug || slugify(cat.name);
                return (
                  <Link
                    key={catSlug}
                    href={`/${encodeURIComponent(catSlug)}`}
                    className="text-xs text-gray-400 hover:text-orange-400 bg-[#171926] hover:bg-[#202334] border border-white/5 px-2.5 py-1 rounded-md transition-colors"
                  >
                    #{cat.name}
                  </Link>
                );
              })}
            </div>
          </section>
        </section>

        {/* Right column: Rankings Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <RankingsSidebar movies={allMovies} />
        </aside>
      </div>
    </main>
  );
}

