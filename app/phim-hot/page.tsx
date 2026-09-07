import type { Metadata } from "next";
import { getAllMovies } from "@/lib/db/queries";
import { connection } from "next/server";
import CategoryCatalog from "@/components/CategoryCatalog";

export const metadata: Metadata = {
  title: "Phim Hot Mới Nhất - Phim Hay Đề Cử | Vam3D",
  description: "Danh sách phim hot, phim bộ phim lẻ hay được đề cử xem nhiều nhất tại Vam3D.",
};

export const revalidate = 120;

export default async function PhimHotPage() {
  try {
    await connection();
  } catch {}

  let allMovies: any[] = [];
  try {
    allMovies = (await getAllMovies(60)) || [];
  } catch (err) {
    console.error("Error loading hot movies page:", err);
  }
  
  // Filter for hot movies
  const hotMovies = (allMovies || []).filter((m: any) => m?.isHot);

  // Format to expected Movie model shape
  const formattedMovies = (hotMovies.length > 0 ? hotMovies : allMovies).map((m: any) => ({
    id: m?.id?.toString() || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    banner: m?.banner || m?.imgUrl || "",
    category: (m?.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m?.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m?.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m?.movieCategories?.map((mc: any) => mc?.category?.name).filter(Boolean) || [],
    rating: typeof m?.rating === "string" ? parseFloat(m?.rating) : m?.rating || 0.0,
    votes: m?.likeCount || 0,
    year: m?.year || 2026,
    duration: m?.duration ? `${m.duration} phút` : "—",
    quality: m?.quality || "HD",
    sub: m?.sub || "Vietsub",
    director: m?.author?.name || "—",
    cast: m?.movieActors?.map((ma: any) => ma?.actor?.name) || [],
    description: m?.description || "",
    videoUrl: m?.episodes?.[0]?.url || "",
    views: m?.viewCount || 0,
    isHot: m?.isHot || false,
    episodes: m?.episodes?.map((ep: any) => ({
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  const formattedAllMovies = (allMovies || []).map((m: any) => ({
    id: m?.id?.toString() || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    banner: m?.banner || m?.imgUrl || "",
    category: (m?.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m?.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m?.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m?.movieCategories?.map((mc: any) => mc?.category?.name).filter(Boolean) || [],
    rating: typeof m?.rating === "string" ? parseFloat(m?.rating) : m?.rating || 0.0,
    votes: m?.likeCount || 0,
    year: m?.year || 2026,
    duration: m?.duration ? `${m.duration} phút` : "—",
    quality: m?.quality || "HD",
    sub: m?.sub || "Vietsub",
    director: m?.author?.name || "—",
    cast: m?.movieActors?.map((ma: any) => ma?.actor?.name) || [],
    description: m?.description || "",
    videoUrl: m?.episodes?.[0]?.url || "",
    views: m?.viewCount || 0,
    isHot: m?.isHot || false,
    episodes: m?.episodes?.map((ep: any) => ({
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  return (
    <CategoryCatalog
      categoryTitle="Phim Hot Đề Cử (New)"
      movies={formattedMovies}
      allMovies={formattedAllMovies}
    />
  );
}
