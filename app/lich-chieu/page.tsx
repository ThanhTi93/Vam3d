import React from "react";
import type { Metadata } from "next";
import { getAllMovies } from "@/lib/db/queries";
import { connection } from "next/server";
import SchedulePageClient from "./SchedulePageClient";

export const metadata: Metadata = {
  title: "Lịch Chiếu Phim Hoạt Hình 3D Trung Quốc Mới Nhất 2026 | Vam3D",
  description:
    "Cập nhật lịch phát sóng phim Hoạt Hình 3D Trung Quốc mới nhất theo tuần (Thứ 2 - Chủ Nhật). Xem phim vietsub, thuyết minh full HD nhanh nhất tại Vam3D.",
  keywords: [
    "lich chieu phim 3d",
    "lich chieu hoat hinh 3d",
    "hoat hinh 3d trung quoc",
    "dau la dai luc lich chieu",
    "lich phat song hh3d",
    "vam3d",
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online"}/lich-chieu`,
  },
  openGraph: {
    title: "Lịch Chiếu Phim Hoạt Hình 3D Trung Quốc Mới Nhất | Vam3D",
    description: "Cập nhật lịch phát sóng phim Hoạt Hình 3D Trung Quốc mới nhất theo từng ngày trong tuần.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online"}/lich-chieu`,
    type: "website",
  },
};

export default async function SchedulePage() {
  await connection();
  const allMovies = await getAllMovies();

  // Map movies to days of week based on ID hash or day attribute for structured schedule display
  const moviesWithDay = (allMovies || []).map((m: any, index: number) => {
    const dayKey = m.releaseDay !== undefined ? m.releaseDay : (index % 7);
    return { ...m, dayKey };
  });

  return <SchedulePageClient moviesWithDay={moviesWithDay} />;
}
