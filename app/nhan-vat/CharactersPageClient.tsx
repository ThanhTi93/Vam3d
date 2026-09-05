"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, User2 } from "lucide-react";
import { getBunnyImageUrl } from "@/lib/utils";

interface Character {
  id: number;
  name: string;
  nameEn?: string | null;
  nameZh?: string | null;
  imgUrl: string | null;
  movie?: { id: number; name: string } | null;
}

interface CharactersPageClientProps {
  characters: Character[];
}

export default function CharactersPageClient({ characters }: CharactersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = characters.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
      (c.nameZh && c.nameZh.toLowerCase().includes(q)) ||
      (c.movie && c.movie.name.toLowerCase().includes(q))
    );
  });

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            Danh sách nhân vật
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Tổng hợp các nhân vật Anime/Cosplay trong kho lưu trữ
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên Việt, Anh, Trung, Phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131520] border border-white/5 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Grid List */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredCharacters.map((c) => (
            <div
              key={c.id}
              className="group relative bg-[#131520] border border-white/10 hover:border-orange-500/50 rounded-2xl overflow-hidden shadow-xl aspect-[2/3] transition-all duration-300 hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              {/* Profile Background Image */}
              {c.imgUrl ? (
                <Image
                  src={getBunnyImageUrl(c.imgUrl, "display")}
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0d0e15] flex items-center justify-center">
                  <User2 className="w-12 h-12 text-gray-700" />
                </div>
              )}

              {/* Text Info Overlay floating ON TOP of Image */}
              <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 flex flex-col items-center text-center justify-end pointer-events-none">
                {/* Main Name */}
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-orange-400 transition-colors line-clamp-1 drop-shadow-md">
                  {c.name}
                </h3>

                {/* EN & ZH Sub-names */}
                {(c.nameEn || c.nameZh) && (
                  <p className="text-[10px] text-gray-300 font-medium line-clamp-1 mt-0.5 drop-shadow">
                    {[c.nameEn, c.nameZh].filter(Boolean).join(" · ")}
                  </p>
                )}

                {/* Movie Tag */}
                {c.movie?.name && (
                  <span className="text-[9px] font-bold text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full mt-1.5 line-clamp-1 border border-amber-500/30 shadow-md">
                    🎬 {c.movie.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#131520]/20 rounded-2xl border border-white/5 text-center">
          <User2 className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-gray-300 mb-1">
            Không tìm thấy nhân vật nào
          </h3>
          <p className="text-gray-500 text-xs">
            Thử tìm kiếm với tên hoặc từ khoá khác.
          </p>
        </div>
      )}
    </main>
  );
}
