"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, User2 } from "lucide-react";
import { getBunnyImageUrl } from "@/lib/utils";

interface Character {
  id: number;
  name: string;
  imgUrl: string | null;
}

interface CharactersPageClientProps {
  characters: Character[];
}

export default function CharactersPageClient({ characters }: CharactersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Tìm kiếm nhân vật..."
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
              className="group bg-[#131520]/40 border border-white/5 hover:border-orange-500/30 rounded-2xl p-3 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:shadow-orange-500/5 hover:-translate-y-1"
            >
              {/* Profile Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#0d0e15] border border-white/5 flex items-center justify-center">
                {c.imgUrl ? (
                  <Image
                    src={getBunnyImageUrl(c.imgUrl, "thumb")}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 15vw"
                  />
                ) : (
                  <User2 className="w-12 h-12 text-gray-700" />
                )}
              </div>

              {/* Name */}
              <h3 className="text-xs font-bold text-gray-200 group-hover:text-orange-500 transition-colors line-clamp-1">
                {c.name}
              </h3>
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
