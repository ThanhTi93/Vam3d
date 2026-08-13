import type { Metadata } from "next";
import { getMoviesByCategory, getAllMovies } from "@/lib/db/queries";
import { getAdminCategories } from "@/app/admin/actions";
import CategoryCatalog from "@/components/CategoryCatalog";
import Breadcrumbs from "@/components/Breadcrumbs";
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

export async function generateStaticParams() {
  try {
    const categories = await getAdminCategories();
    return (categories || []).map((c: any) => ({ categoryName: encodeURIComponent(c.name) }));
  } catch {
    return [];
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryName } = await params;
  const titleName = formatCategoryLabel(categoryName);
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

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName);

  // Check if this category exists in the database
  const allDbCategories = await getAdminCategories();
  const exists = allDbCategories.some(
    (c) => c.name.toLowerCase() === decodedCategory.toLowerCase()
  );

  if (!exists) {
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const categoryUrl = `${siteUrl}/${encodeURIComponent(decodedCategory)}`;

  const categoryBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: titleName,
        item: categoryUrl,
      },
    ],
  };

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
