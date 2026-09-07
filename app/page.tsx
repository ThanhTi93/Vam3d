import { getHotMovies, getAllMovies, getMostViewedEpisodes, getLatestEpisodes, getLatestGalleries } from "@/lib/db/queries";
import HeroCarousel from "@/components/HeroCarousel";
import HomeCatalog from "@/components/HomeCatalog";

export const revalidate = 60;

export default async function Home() {
  let allMovies: any[] = [];
  let galleries: any[] = [];
  let mostViewedEpisodes: any[] = [];
  let latestEpisodes: any[] = [];

  try {
    const results = await Promise.all([
      getAllMovies(60).catch(() => []),
      getLatestGalleries().catch(() => []),
      getMostViewedEpisodes(12).catch(() => []),
      getLatestEpisodes(12).catch(() => []),
    ]);
    allMovies = results[0] || [];
    galleries = results[1] || [];
    mostViewedEpisodes = results[2] || [];
    latestEpisodes = results[3] || [];
  } catch (err) {
    console.error("Error loading home page data:", err);
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

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
      <HeroCarousel hotMovies={formattedHotMovies} />
      <HomeCatalog 
        movies={formattedAllMovies} 
        galleries={galleries || []} 
        mostViewedEpisodes={mostViewedEpisodes || []} 
        latestEpisodes={latestEpisodes || []} 
      />
    </div>
  );
}
