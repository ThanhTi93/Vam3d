import type { Metadata } from "next";
import { getAllMovies } from "@/lib/db/queries";
import CategoryCatalog from "@/components/CategoryCatalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSiteUrl, getBunnyImageUrl } from "@/lib/utils";

const phimHotTitle = "Phim Hot Đề Cử Mới Nhất 2026 – Phim 3D Vietsub HD | Vam3D";
const phimHotDescription = "Tuyển tập phim hot, phim hoạt hình 3D, phim bộ và phim lẻ hay được cộng đồng đề cử xem nhiều nhất chất lượng Full HD / 4K Vietsub cập nhật liên tục tại Vam3D.";

export const metadata: Metadata = {
  title: phimHotTitle,
  description: phimHotDescription,
  alternates: {
    canonical: "/phim-hot",
  },
  openGraph: {
    title: phimHotTitle,
    description: phimHotDescription,
    url: "/phim-hot",
    type: "website",
    locale: "vi_VN",
    siteName: "Vam3D",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: phimHotTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: phimHotTitle,
    description: phimHotDescription,
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 3600;

export default async function PhimHotPage() {
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
    slug: m?.slug || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    mobileThumbnail: m?.mobileImgUrl || "",
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
    slug: m?.slug || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    mobileThumbnail: m?.mobileImgUrl || "",
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

  const siteUrl = getSiteUrl();
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Phim Hot Đề Cử Vietsub Mới Nhất",
    description: phimHotDescription,
    url: `${siteUrl}/phim-hot`,
    inLanguage: "vi-VN",
    mainEntity: {
      "@type": "ItemList",
      name: "Danh Sách Phim Hot Đề Cử",
      numberOfItems: formattedMovies.length,
      itemListElement: formattedMovies.slice(0, 24).map((movie, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/movie/${movie.slug || movie.id}`,
        name: movie.title,
        image: getBunnyImageUrl(movie.thumbnail || movie.banner, "display"),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4">
        <Breadcrumbs items={[{ label: "Phim Hot Đề Cử", href: "/phim-hot" }]} />
        <CategoryCatalog
          categoryTitle="Hot Đề Cử"
          categorySlug="phim-hot"
          categoryDescription="Tuyển tập những bộ phim hoạt hình 3D hot nhất, được xem nhiều nhất và đánh giá cao nhất bởi cộng đồng. Chất lượng Full HD / 4K, Vietsub chuẩn cập nhật liên tục."
          categoryHighlights={[
            "Phim đề cử xem nhiều nhất",
            "Chất lượng Full HD & 4K",
            "Vietsub mượt mà",
            "Cập nhật liên tục",
          ]}
          movies={formattedMovies}
          allMovies={formattedAllMovies}
        />
      </div>
    </>
  );
}

