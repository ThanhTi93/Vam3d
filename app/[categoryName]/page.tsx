import type { Metadata } from "next";
import { getMoviesByCategory, getAllMovies } from "@/lib/db/queries";
import { getAdminCategories } from "@/app/admin/actions";
import CategoryCatalog from "@/components/CategoryCatalog";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ categoryName: string }>;
}

const formatCategoryLabel = (name: string) => {
  const decoded = decodeURIComponent(name);
  if (decoded === "phim-le") return "Phim Lẻ";
  if (decoded === "phim-bo") return "Phim Bộ";
  if (decoded === "chieu-rap") return "Chiếu Rạp";
  if (decoded === "hoat-hinh") return "Hoạt Hình";
  
  return decoded.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryName } = await params;
  const titleName = formatCategoryLabel(categoryName);
  return {
    title: `${titleName} Mới Nhất - Vam3D`,
    description: `Danh sách phim thuộc thể loại ${titleName} chất lượng cao Vietsub, thuyết minh cập nhật nhanh nhất tại Vam3D.`,
  };
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName);

  // Check if this category exists in the database
  const allDbCategories = await getAdminCategories();
  const exists = allDbCategories.some(
    (c) => c.name.toLowerCase() === decodedCategory.toLowerCase()
  );

  // If not found in database and is not one of the default standard ones
  const isDefault = ["phim-le", "phim-bo", "chieu-rap", "hoat-hinh"].includes(decodedCategory.toLowerCase());

  if (!exists && !isDefault) {
    notFound();
  }

  const [movies, allMovies] = await Promise.all([
    getMoviesByCategory(decodedCategory),
    getAllMovies(),
  ]);

  // Format to expected Movie model shape
  const formattedMovies = movies.map((m: any) => ({
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
      id: ep.id,
      name: ep.name || `Tập ${ep.id}`,
      url: ep.url || "",
      banner: ep.banner || "",
      bunnyVideoId: ep.bunnyVideoId,
      bunnyStatus: ep.bunnyStatus,
      duration: ep.duration || 0,
    })) || [],
  }));

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
      id: ep.id,
      name: ep.name || `Tập ${ep.id}`,
      url: ep.url || "",
      banner: ep.banner || "",
      bunnyVideoId: ep.bunnyVideoId,
      bunnyStatus: ep.bunnyStatus,
      duration: ep.duration || 0,
    })) || [],
  }));

  const titleName = formatCategoryLabel(decodedCategory);

  return (
    <CategoryCatalog
      categoryTitle={`${titleName} Mới Nhất`}
      movies={formattedMovies}
      allMovies={formattedAllMovies}
    />
  );
}
