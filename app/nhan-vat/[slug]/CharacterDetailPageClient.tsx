"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Tv, 
  Camera, 
  Film, 
  Play, 
  Clock, 
  Eye, 
  Users, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  User2
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getBunnyImageUrl, formatDuration } from "@/lib/utils";
import { HomeGalleryCard } from "@/components/GalleryComponents";
import { incrementGalleryViews } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CharacterDetailPageClientProps {
  data: {
    character: any;
    episodes: any[];
    galleries: any[];
    otherCharacters: any[];
  };
}

export default function CharacterDetailPageClient({ data }: CharacterDetailPageClientProps) {
  const { character, episodes, galleries, otherCharacters } = data;
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);

  const handleSelectGallery = (g: any) => {
    setSelectedGallery(g);
    if (g && g.id) {
      incrementGalleryViews(g.id);
    }
  };

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Nhân vật", href: "/nhan-vat" },
    { label: character.name },
  ];

  const subNames = [character.nameEn, character.nameZh].filter(Boolean).join(" · ");

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-10 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* ─── HERO PROFILE HEADER ─── */}
      <section className="relative bg-[#131520] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 lg:p-10">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-500/10 blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
          {/* Character Poster / Avatar */}
          <div className="relative aspect-[2/3] w-48 sm:w-56 md:w-64 shrink-0 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl shadow-black/80 group">
            {character.imgUrl ? (
              <Image
                src={getBunnyImageUrl(character.imgUrl, "display")}
                alt={character.name}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 192px, 256px"
              />
            ) : (
              <div className="w-full h-full bg-[#0d0e15] flex items-center justify-center text-gray-600">
                <User2 className="w-16 h-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg tracking-wider">
                Nhân Vật
              </span>
            </div>
          </div>

          {/* Character Information */}
          <div className="flex-1 flex flex-col justify-between text-center md:text-left space-y-5">
            <div>
              {/* Parent Movie Link Badge */}
              {character.movie && (
                <Link
                  href={`/movie/${character.movie.id}`}
                  className="inline-flex items-center gap-2 bg-[#1a1c2b] hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold transition-all mb-3 shadow-md group/tag"
                >
                  <Film className="w-3.5 h-3.5 group-hover/tag:scale-110 transition-transform" />
                  <span>{character.movie.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Character Main Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {character.name}
              </h1>

              {/* English & Chinese names */}
              {subNames && (
                <p className="text-sm sm:text-base text-gray-400 font-medium mt-1 italic">
                  {subNames}
                </p>
              )}
            </div>

            {/* Stats Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-[#0a0b10]/70 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Tập phim</span>
                  <span className="text-sm sm:text-base font-extrabold text-white">{episodes.length} tập</span>
                </div>
              </div>

              <div className="bg-[#0a0b10]/70 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Bộ sưu tập AI</span>
                  <span className="text-sm sm:text-base font-extrabold text-white">{galleries.length} bộ</span>
                </div>
              </div>

              {character.movie?.movieCategories && character.movie.movieCategories.length > 0 && (
                <div className="bg-[#0a0b10]/70 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/15 text-red-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Thể loại</span>
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      {character.movie.movieCategories.map((mc: any) => mc.category?.name).filter(Boolean).slice(0, 2).join(", ") || "3D"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Description / Bio */}
            {character.description ? (
              <div className="bg-[#090a0f]/60 border border-white/5 rounded-2xl p-4 sm:p-5 text-sm text-gray-300 leading-relaxed max-w-3xl">
                <p>{character.description}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Nhân vật nổi tiếng trong tác phẩm {character.movie?.name || "hoạt hình 3D"}.
              </p>
            )}

            {/* Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {episodes.length > 0 && (
                <a
                  href="#tap-phim"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Xem {episodes.length} Tập Phim
                </a>
              )}

              {galleries.length > 0 && (
                <a
                  href="#bo-suu-tap"
                  className="inline-flex items-center gap-2 bg-[#1a1c2b] hover:bg-[#25283d] text-gray-200 hover:text-white font-bold px-5 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  Xem {galleries.length} Bộ Ảnh AI
                </a>
              )}

              {character.movie && (
                <Link
                  href={`/movie/${character.movie.id}`}
                  className="inline-flex items-center gap-2 bg-[#131520] hover:bg-white/10 text-gray-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl border border-white/5 text-xs transition-all"
                >
                  <Film className="w-4 h-4 text-orange-500" />
                  Trang Phim
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 1: EPISODES FEATURING THIS CHARACTER ─── */}
      <section id="tap-phim" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2.5">
            <Tv className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            <span>Tập Phim Có Nhân Vật {character.name}</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
              {episodes.length}
            </span>
          </h2>
        </div>

        {episodes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {episodes.map((ep: any, idx: number) => {
              const movieId = ep.idMovie || ep.movie?.id || character.idMovie;
              const playUrl = `/movie/${movieId}?ep=${ep.id}`;
              const displayImage = ep.banner || ep.movie?.imgUrl || character.imgUrl || "";

              return (
                <Link
                  key={ep.id ?? idx}
                  href={playUrl}
                  prefetch={false}
                  className="group bg-[#131520] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-orange-500/40 transition-all duration-300 shadow-xl shadow-black/40 hover:-translate-y-1 h-full"
                >
                  <div className="relative aspect-video w-full bg-[#090a0f] overflow-hidden flex-shrink-0">
                    {displayImage ? (
                      <Image
                        src={getBunnyImageUrl(displayImage, "thumb")}
                        alt={`${ep.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Play className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                    {/* Episode Tag */}
                    <div className="absolute top-2 left-2 z-20 max-w-[70%]">
                      <span className="bg-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded shadow-md truncate block select-none">
                        {ep.name || `Tập ${idx + 1}`}
                      </span>
                    </div>

                    {/* VIP Plan Badge */}
                    {ep.plan && (
                      <div className="absolute top-2 right-2 z-20">
                        <span className="bg-amber-500 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded shadow-md select-none">
                          {ep.plan.name}
                        </span>
                      </div>
                    )}

                    {/* Play Button Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {ep.name}
                      </h3>
                      {ep.movie?.name && (
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                          🎬 {ep.movie.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-white/5 pt-2 mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-orange-400" />
                        {ep.views || 0}
                      </span>
                      {ep.duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {formatDuration(ep.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#131520]/40 rounded-2xl border border-white/5 space-y-2">
            <Tv className="w-10 h-10 text-gray-600 mx-auto stroke-1" />
            <p className="text-sm font-bold text-gray-400">Chưa có tập phim nào gắn thẻ nhân vật này</p>
            <p className="text-xs text-gray-600">Nội dung tập phim sẽ được cập nhật trong các phiên bản kế tiếp.</p>
          </div>
        )}
      </section>

      {/* ─── SECTION 2: AI GALLERIES OF THIS CHARACTER ─── */}
      <section id="bo-suu-tap" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>Bộ Sưu Tập Ảnh AI Của {character.name}</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              {galleries.length}
            </span>
          </h2>

          <Link
            href="/gallery"
            className="text-xs font-bold text-gray-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {galleries.map((g: any) => (
              <HomeGalleryCard key={g.id} g={g} onSelect={handleSelectGallery} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#131520]/40 rounded-2xl border border-white/5 space-y-2">
            <Camera className="w-10 h-10 text-gray-600 mx-auto stroke-1" />
            <p className="text-sm font-bold text-gray-400">Chưa có bộ sưu tập AI nào cho nhân vật này</p>
            <p className="text-xs text-gray-600">Bộ ảnh Cosplay, Anime AI sẽ sớm được bổ sung.</p>
          </div>
        )}
      </section>

      {/* ─── SECTION 3: OTHER CHARACTERS TO EXPLORE ─── */}
      {otherCharacters && otherCharacters.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2.5">
              <Users className="w-5 h-5 text-orange-500" />
              <span>Khám Phá Nhân Vật Khác</span>
            </h2>

            <Link
              href="/nhan-vat"
              className="text-xs font-bold text-gray-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
            >
              <span>Tất cả nhân vật</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5">
            {otherCharacters.map((c: any) => (
              <Link
                key={c.id}
                href={`/nhan-vat/${c.slug || c.id}`}
                className="group relative bg-[#131520] border border-white/10 hover:border-orange-500/50 rounded-2xl overflow-hidden shadow-xl aspect-[2/3] transition-all duration-300 hover:shadow-orange-500/10 hover:-translate-y-1 block"
              >
                {c.imgUrl ? (
                  <Image
                    src={getBunnyImageUrl(c.imgUrl, "display")}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0d0e15] flex items-center justify-center">
                    <User2 className="w-10 h-10 text-gray-700" />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 flex flex-col items-center text-center justify-end">
                  <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  {c.movie?.name && (
                    <span className="text-[8px] font-bold text-amber-300 bg-black/60 px-1.5 py-0.5 rounded-full mt-1 line-clamp-1 border border-amber-500/30">
                      🎬 {c.movie.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
