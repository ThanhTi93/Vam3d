import type { Metadata } from "next";
import { getMoviesByCategory, getAllMovies, getAllCategories } from "@/lib/db/queries";
import CategoryCatalog from "@/components/CategoryCatalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { slugify } from "@/lib/utils";

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
  try {
    await connection();
  } catch {}
  
  const { categoryName } = await params;
  const decoded = decodeURIComponent(categoryName).trim();
  const inputSlug = slugify(decoded).toLowerCase();
  
  let categories: any[] = [];
  try {
    categories = (await getAllCategories()) || [];
  } catch {}

  const cat = categories.find((c: any) => {
    const catName = (c.name || "").trim().toLowerCase();
    const catSlug = (c.slug || slugify(c.name)).trim().toLowerCase();
    return catSlug === inputSlug || catName === decoded.toLowerCase() || catSlug === decoded.toLowerCase();
  });

  const titleName = cat ? cat.name : formatCategoryLabel(categoryName);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const categoryUrl = `${siteUrl}/${encodeURIComponent(categoryName)}`;
  const title = `${titleName} Mới Nhất – Xem Phim ${titleName} Vietsub HD | Vam3D`;
  const description = `Danh sách phim thuộc thể loại ${titleName} chất lượng cao Vietsub, thuyết minh cập nhật nhanh nhất tại Vam3D.`;

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      url: categoryUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const revalidate = 120;

export default async function DynamicCategoryPage({ params }: PageProps) {
  try {
    await connection();
  } catch {}
  
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName).trim();
  const inputSlug = slugify(decodedCategory).toLowerCase();

  let allDbCategories: any[] = [];
  try {
    allDbCategories = (await getAllCategories()) || [];
  } catch {}

  const targetCategory = allDbCategories.find((c: any) => {
    const catName = (c.name || "").trim().toLowerCase();
    const catSlug = (c.slug || slugify(c.name)).trim().toLowerCase();
    return (
      catSlug === inputSlug ||
      catName === decodedCategory.toLowerCase() ||
      catSlug === decodedCategory.toLowerCase()
    );
  });

  if (!targetCategory && allDbCategories.length > 0) {
    notFound();
  }

  let movies: any[] = [];
  let allMovies: any[] = [];
  try {
    const results = await Promise.all([
      targetCategory ? getMoviesByCategory(targetCategory.slug || targetCategory.name) : Promise.resolve([]),
      getAllMovies(60),
    ]);
    movies = results[0] || [];
    allMovies = results[1] || [];
  } catch (err) {
    console.error("Error loading category movies:", err);
  }

  // Format to expected Movie model shape
  const formattedMovies = (movies || []).map((m: any) => ({
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
      id: ep?.id,
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      banner: ep?.banner || "",
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
      id: ep?.id,
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      banner: ep?.banner || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  const titleName = targetCategory?.name || formatCategoryLabel(decodedCategory);

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4">
      <Breadcrumbs items={[{ label: titleName }]} />
      <CategoryCatalog
        categoryTitle={`${titleName} Mới Nhất`}
        movies={formattedMovies}
        allMovies={formattedAllMovies}
      />
    </div>
  );
}
