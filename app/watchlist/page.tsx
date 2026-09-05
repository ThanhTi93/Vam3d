import type { Metadata } from "next";
import { getAllMovies } from "@/lib/db/queries";
import WatchlistPageClient from "./WatchlistPageClient";

export const metadata: Metadata = {
  title: "Tủ Phim Yêu Thích Của Bạn",
  description: "Xem lại danh sách các bộ phim chiếu rạp, phim bộ, phim lẻ và anime yêu thích đã được lưu trữ trong tủ phim cá nhân của bạn tại Vam3D.",
};

export default async function WatchlistPage() {
  const allMovies = await getAllMovies();

  // Format to expected Movie model shape
  const formattedAllMovies = allMovies.map((m: any) => ({
    id: m.id.toString(),
    title: m.name,
    originalTitle: m.originalTitle || "",
    thumbnail: m.imgUrl || "",
    banner: m.banner || m.imgUrl || "",
    category: (m.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m.movieCategories?.map((mc: any) => mc.category?.name).filter(Boolean) || [],
    rating: typeof m.rating === "string" ? parseFloat(m.rating) : m.rating || 0.0,
    votes: m.likeCount || 0,
    year: m.year || 2026,
    duration: m.duration ? `${m.duration} phút` : "—",
    quality: m.quality || "HD",
    sub: m.sub || "Vietsub",
    director: m.author?.name || "—",
    cast: m.movieActors?.map((ma: any) => ma.actor?.name) || [],
    description: m.description || "",
    videoUrl: m.episodes?.[0]?.url || "",
    views: m.viewCount || 0,
    isHot: m.isHot || false,
    episodes: m.episodes?.map((ep: any) => ({
      name: ep.name || `Tập ${ep.id}`,
      url: ep.url || "",
      bunnyVideoId: ep.bunnyVideoId,
      bunnyStatus: ep.bunnyStatus,
      duration: ep.duration || 0,
    })) || [],
  }));

  return <WatchlistPageClient allMovies={formattedAllMovies} />;
}
