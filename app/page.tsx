import type { Metadata } from "next";
import { getHotMovies, getAllMovies, getMostViewedEpisodes, getLatestEpisodes, getLatestGalleries } from "@/lib/db/queries";
import HeroCarousel from "@/components/HeroCarousel";
import HomeCatalog from "@/components/HomeCatalog";

export const metadata: Metadata = {
  title: "Vam3D – Xem Phim Hoạt Hình 3D & Anime Vietsub Thuyết Minh HD",
  description: "Website xem phim trực tuyến miễn phí hàng đầu. Cập nhật liên tục phim hoạt hình 3D, anime vietsub, thuyết minh Full HD cùng kho bộ sưu tập ảnh AI 4K độc quyền tại Vam3D.",
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 3600;

export default async function Home() {
  let allMovies: any[] = [];
  let galleries: any[] = [];
  let latestEpisodes: any[] = [];
  let mostViewedEpisodes: any[] = [];

  try {
    const results = await Promise.all([
      getAllMovies(60).catch(() => []),
      getLatestGalleries(12).catch(() => []),
      getLatestEpisodes(4).catch(() => []),
      getMostViewedEpisodes(4).catch(() => []),
    ]);
    allMovies = results[0] || [];
    galleries = results[1] || [];
    latestEpisodes = results[2] || [];
    mostViewedEpisodes = results[3] || [];
  } catch (err) {
    console.error("Error loading home page data:", err);
  }

  // If direct queries returned empty, fallback to deriving from allMovies
  if (latestEpisodes.length === 0 || mostViewedEpisodes.length === 0) {
    const allEps = allMovies.flatMap((m: any) =>
      (m.episodes || []).map((ep: any) => ({
        ...ep,
        idMovie: m.id,
        movie: {
          id: m.id,
          name: m.name,
          imgUrl: m.imgUrl,
          bannerUrl: m.banner,
          episodes: m.episodes,
        },
      }))
    );
    if (latestEpisodes.length === 0) latestEpisodes = allEps.slice(0, 4);
    if (mostViewedEpisodes.length === 0) mostViewedEpisodes = [...allEps].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  }

  const hotMoviesList = (allMovies || []).filter((m: any) => m?.isHot);
  const hotMovies = hotMoviesList.length > 0 ? hotMoviesList.slice(0, 6) : (allMovies || []).slice(0, 6);

  // Format to standard Client Movie model shape
  const formattedHotMovies = (hotMovies || []).map((m: any) => ({
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
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      banner: ep?.banner || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";

  const homeItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Phim Hoạt Hình 3D & Anime Đề Cử Hot Nhất",
    description: "Danh sách phim hoạt hình 3D, anime vietsub và bộ sưu tập AI hot nhất tại Vam3D",
    itemListElement: formattedHotMovies.map((m: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Movie",
        name: m.title,
        alternateName: m.originalTitle || undefined,
        image: m.thumbnail || `${siteUrl}/og-image.jpg`,
        url: `${siteUrl}/movie/${m.id}`,
        description: m.description || undefined,
        aggregateRating: m.rating > 0 ? {
          "@type": "AggregateRating",
          ratingValue: m.rating,
          bestRating: 10,
          ratingCount: m.votes || 1,
        } : undefined,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeItemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="flex-1 flex flex-col animate-in fade-in duration-300">
        <HeroCarousel hotMovies={formattedHotMovies} />
        <HomeCatalog 
          movies={formattedAllMovies} 
          galleries={galleries || []} 
          mostViewedEpisodes={mostViewedEpisodes || []} 
          latestEpisodes={latestEpisodes || []} 
        />
      </div>
    </>
  );
}
