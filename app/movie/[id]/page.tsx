import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getMovieById, getAllMovies, getRecommendedEpisodes } from "@/lib/db/queries";
import MoviePageClient from "./MoviePageClient";
import RankingsSidebar from "@/components/RankingsSidebar";

// Enable Instant Nav dev validation and production speed
export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      params: { id: "dune-part-two" },
      searchParams: { ep: "1" },
    },
  ],
};

interface MoviePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

// Generate dynamic metadata for SEO crawling
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(id);
  
  if (!movie) {
    return {
      title: "Không Tìm Thấy Phim | Vam3D",
      description: "Xin lỗi, bộ phim bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.",
    };
  }

  const movieData = movie as any;
  const title = `${movieData.name} (${movieData.originalTitle || ""}) [${movieData.year || 2026}] – Thuyết Minh Vietsub Full HD`;
  const description = movieData.description || `Xem phim ${movieData.name} chất lượng cao Full HD Vietsub, Thuyết minh cập nhật nhanh nhất tại Vam3D.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const movieUrl = `${siteUrl}/movie/${movieData.id}`;
  const posterUrl = movieData.imgUrl || `${siteUrl}/og-image.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: movieUrl,
    },
    openGraph: {
      type: "video.movie",
      url: movieUrl,
      title,
      description,
      images: [
        {
          url: posterUrl,
          alt: movieData.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [posterUrl],
    },
  };
}

// Render dynamic JSON-LD structured schema on server-side for search engines
function MovieSchemaScript({ movie }: { movie: any }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const movieUrl = `${siteUrl}/movie/${movie.id}`;
  const posterUrl = movie.thumbnail || movie.banner || `${siteUrl}/og-image.jpg`;

  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title || movie.name,
    alternateName: movie.originalTitle,
    description: movie.description,
    image: posterUrl,
    url: movieUrl,
    dateCreated: movie.year?.toString() || "2026",
    director: { "@type": "Person", name: movie.director || "—" },
    actor: movie.cast?.map((name: string) => ({ "@type": "Person", name })) || [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: movie.rating?.toString() || "10",
      bestRating: "10",
      ratingCount: movie.votes || 1,
    },
  };

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: movie.title || movie.name,
    description: movie.description || `Xem phim ${movie.title} Vietsub HD`,
    thumbnailUrl: [posterUrl],
    uploadDate: new Date().toISOString(),
    contentUrl: movie.videoUrl || movieUrl,
    embedUrl: movieUrl,
  };

  const breadcrumbSchema = {
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
        name: movie.category === "phim-bo" ? "Phim Bộ" : movie.category === "hoat-hinh" ? "Hoạt Hình" : movie.category === "chieu-rap" ? "Chiếu Rạp" : "Phim Lẻ",
        item: `${siteUrl}/${movie.category || "phim-le"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: movie.title || movie.name,
        item: movieUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(movieSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

export default async function MovieDetailPage({ params, searchParams }: MoviePageProps) {
  const { id } = await params;
  const [movie, allMovies, resolvedSearchParams] = await Promise.all([
    getMovieById(id),
    getAllMovies(),
    searchParams,
  ]);

  if (!movie) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <h2 className="text-2xl font-black text-red-500 mb-2">404 - Không Tìm Thấy Phim</h2>
        <p className="text-gray-400 text-sm max-w-md">
          Bộ phim bạn yêu cầu không tồn tại hoặc đã được gỡ bỏ khỏi website.
        </p>
      </div>
    );
  }

  const movieData = movie as any;
  const epParam = resolvedSearchParams?.ep;
  const epIndex = epParam ? Math.max(0, parseInt(epParam, 10) - 1) : 0;
  const currentEpisode = movieData.episodes?.[epIndex] || movieData.episodes?.[0];
  const currentEpisodeId = currentEpisode ? currentEpisode.id : 0;

  const relatedEpisodes = await getRecommendedEpisodes(currentEpisodeId, movieData.id);

  // Format to standard Client model shape
  const formattedMovie = {
    id: movieData.id.toString(),
    title: movieData.name,
    originalTitle: movieData.originalTitle || "",
    thumbnail: movieData.imgUrl || "",
    banner: movieData.banner || movieData.imgUrl || "",
    category: (movieData.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              movieData.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              movieData.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: movieData.movieCategories?.map((mc: any) => mc.category?.name).filter(Boolean) || movieData.genres || [],
    rating: typeof movieData.rating === "string" ? parseFloat(movieData.rating) : movieData.rating || 0.0,
    votes: movieData.votes || movieData.likeCount || 0,
    year: movieData.year || 2026,
    duration: movieData.duration ? (movieData.duration.toString().includes("phút") ? movieData.duration : `${movieData.duration} phút`) : "—",
    quality: movieData.quality || "HD",
    sub: movieData.sub || "Vietsub",
    director: movieData.author?.name || movieData.director || "—",
    cast: movieData.movieActors?.map((ma: any) => ma.actor?.name) || movieData.cast || [],
    description: movieData.description || "",
    videoUrl: movieData.episodes?.[0]?.url || movieData.videoUrl || "",
    views: movieData.views || movieData.viewCount || 0,
    isHot: movieData.isHot || false,
    episodes: movieData.episodes?.map((ep: any) => ({
      id: ep.id,
      name: ep.name || `Tập ${ep.id}`,
      url: ep.url || "",
      banner: ep.banner || "",
      duration: ep.duration || 0,
      bunnyVideoId: ep.bunnyVideoId,
      bunnyStatus: ep.bunnyStatus,
      plan: ep.plan || null,
    })) || [],
    aiGalleries: movieData.aiGalleries?.map((g: any) => ({
      ...g,
      movie: { id: movieData.id, name: movieData.name }
    })) || [],
    plan: movieData.aiGalleries?.[0]?.plan || movieData.plan || null, // Check dynamic VIP access plan if nested
  };

  const formattedAllMovies = allMovies.map((m: any) => ({
    id: m.id.toString(),
    title: m.name,
    originalTitle: m.originalTitle || "",
    thumbnail: m.imgUrl || "",
    banner: m.banner || m.imgUrl || "",
    category: (m.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m.movieCategories?.map((mc: any) => mc.category?.name).filter(Boolean) || m.genres || [],
    rating: typeof m.rating === "string" ? parseFloat(m.rating) : m.rating || 0.0,
    votes: m.votes || m.likeCount || 0,
    year: m.year || 2026,
    duration: m.duration ? (m.duration.toString().includes("phút") ? m.duration : `${m.duration} phút`) : "—",
    quality: m.quality || "HD",
    sub: m.sub || "Vietsub",
    director: m.author?.name || m.director || "—",
    cast: m.movieActors?.map((ma: any) => ma.actor?.name) || m.cast || [],
    description: m.description || "",
    videoUrl: m.episodes?.[0]?.url || m.videoUrl || "",
    views: m.views || m.viewCount || 0,
    isHot: m.isHot || false,
    episodes: m.episodes?.map((ep: any) => ({
      id: ep.id,
      name: ep.name || `Tập ${ep.id}`,
      url: ep.url || "",
      duration: ep.duration || 0,
      bunnyVideoId: ep.bunnyVideoId,
      bunnyStatus: ep.bunnyStatus,
    })) || [],
  }));

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
      <MovieSchemaScript movie={formattedMovie} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left col: Movie Player and Info */}
        <div className="lg:col-span-3">
          <Suspense fallback={
            <div className="w-full bg-[#131520] border border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <p className="text-gray-400 text-sm">Đang chuẩn bị trình phát...</p>
            </div>
          }>
            <MoviePageClient movie={formattedMovie} relatedEpisodes={relatedEpisodes} />
          </Suspense>
        </div>

        {/* Right col: Rankings Sidebar */}
        <div>
          <RankingsSidebar movies={formattedAllMovies} />
        </div>
      </div>
    </main>
  );
}
