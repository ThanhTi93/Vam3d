"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Calendar, Play, Clock, Flame } from "lucide-react";

const DAYS_OF_WEEK = [
  { key: 1, label: "Thứ Hai", short: "T2" },
  { key: 2, label: "Thứ Ba", short: "T3" },
  { key: 3, label: "Thứ Tư", short: "T4" },
  { key: 4, label: "Thứ Năm", short: "T5" },
  { key: 5, label: "Thứ Sáu", short: "T6" },
  { key: 6, label: "Thứ Bảy", short: "T7" },
  { key: 0, label: "Chủ Nhật", short: "CN" },
];

export default function SchedulePageClient({ moviesWithDay }: { moviesWithDay: any[] }) {
  const [clientToday, setClientToday] = useState<number | null>(null);

  useEffect(() => {
    setClientToday(new Date().getDay());
  }, []);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: "Lịch Chiếu Phim 3D" }]} />

      <header className="mb-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-orange-500/20 backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/40 text-orange-400">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lịch Chiếu Phim Hoạt Hình 3D Trung Quốc
          </h1>
        </div>
        <p className="text-gray-300 text-sm max-w-2xl mt-1 leading-relaxed">
          Danh sách cập nhật thời gian phát sóng các bộ phim 3D Trung Quốc hot nhất theo từng ngày trong tuần.
          Tập mới nhất luôn được cập nhật sớm nhất với chất lượng Full HD Vietsub &amp; Thuyết minh.
        </p>
      </header>

      {/* Days Tabs & Schedule Sections */}
      <div className="space-y-12">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = clientToday !== null && day.key === clientToday;
          const dayMovies = moviesWithDay.filter((m: any) => m.dayKey === day.key);

          return (
            <section
              key={day.key}
              id={`day-${day.key}`}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                isToday
                  ? "bg-[#131520] border-2 border-orange-500/50 shadow-xl shadow-orange-500/5"
                  : "bg-[#0d0f17] border border-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                      isToday
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {isToday ? "Hôm Nay" : day.short}
                  </span>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    Lịch Chiếu {day.label}
                    {isToday && <Flame className="w-5 h-5 text-orange-500 animate-bounce" />}
                  </h2>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {dayMovies.length} bộ phim
                </span>
              </div>

              {dayMovies.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 italic">
                  Chưa có lịch phát sóng bộ phim nào vào {day.label}.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {dayMovies.map((movie: any) => {
                    const epCount = movie.episodes?.length || 0;
                    const latestEp = epCount > 0 ? epCount : "Mới";
                    return (
                      <Link
                        key={movie.id}
                        href={`/movie/${movie.id}`}
                        className="group relative bg-[#181a26] rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
                          <Image
                            src={movie.imgUrl || movie.banner || "/og-image.jpg"}
                            alt={`Lịch chiếu phim ${movie.name} Vietsub HD`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                          {/* Episode badge */}
                          <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-md text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                            Tập {latestEp}
                          </div>

                          {/* Quality badge */}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-gray-200 text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/10">
                            {movie.sub || "Vietsub"}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <h3
                            className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1"
                            title={movie.name}
                          >
                            {movie.name}
                          </h3>
                          {movie.originalTitle && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {movie.originalTitle}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-400" />
                              {movie.duration ? (typeof movie.duration === "string" ? movie.duration : `${movie.duration} phút`) : "24 phút"}
                            </span>
                            <span className="text-orange-400 font-semibold">Cập nhật hàng tuần</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
