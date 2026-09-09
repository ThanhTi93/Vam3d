import React from "react";
import type { Metadata } from "next";
import { getEpisodesPaginated, getAllMovies } from "@/lib/db/queries";
import TapPhimClient from "./TapPhimClient";

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = (await searchParams) || {};
  const sortParam = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";
  const movieParam = typeof resolvedParams.movie === "string" ? resolvedParams.movie : "all";
  const searchParam = typeof resolvedParams.q === "string" ? resolvedParams.q : "";

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  let title = "Danh Sách Tập Phim Hoạt Hình 3D Mới Nhất & Xem Nhiều Nhất | Vam3D";
  let description = "Tổng hợp toàn bộ các tập phim hoạt hình 3D, anime vietsub mới nhất và được xem nhiều nhất chất lượng cao Full HD tại Vam3D.";

  if (sortParam === "views") {
    title = "Tập Phim Xem Nhiều Nhất – Tuyển Tập Hoạt Hình 3D Đỉnh Cao | Vam3D";
    description = "Khám phá các tập phim hoạt hình 3D và anime có lượt xem nhiều nhất, được yêu thích nhất với chất lượng Full HD sắc nét tại Vam3D.";
  } else if (searchParam) {
    title = `Tìm Kiếm Tập Phim: "${searchParam}" | Vam3D`;
    description = `Kết quả tìm kiếm tập phim hoạt hình 3D cho từ khóa "${searchParam}" tại Vam3D.`;
  }

  const canonicalUrl = `${siteUrl}/tap-phim${sortParam === "views" ? "?sort=views" : ""}`;

  return {
    title,
    description,
    keywords: [
      "tap phim 3d",
      "tap phim moi nhat",
      "tap phim xem nhieu nhat",
      "hoat hinh 3d",
      "anime vietsub",
      "phim 3d trung quoc",
      "vam3d",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Vam3D - Tập Phim",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
  };
}

export default async function TapPhimPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) || {};
  const sortParam = (typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest") as "newest" | "views";
  const movieParam = typeof resolvedParams.movie === "string" ? resolvedParams.movie : "all";
  const searchParam = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const pageParam = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  let initialData: any = { episodes: [], totalCount: 0, movies: [] };
  let allMovies: any[] = [];

  try {
    const [epResults, moviesResult] = await Promise.all([
      getEpisodesPaginated({
        page: pageParam,
        limit: 24,
        sortBy: sortParam,
        movieId: movieParam,
        search: searchParam,
      }).catch(() => ({ episodes: [], totalCount: 0, movies: [] })),
      getAllMovies(60).catch(() => []),
    ]);

    initialData = epResults || { episodes: [], totalCount: 0, movies: [] };
    allMovies = moviesResult || [];
  } catch (err) {
    console.error("Error loading TapPhimPage:", err);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  // ItemList Schema for SEO
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: sortParam === "views" ? "Tập Phim Xem Nhiều Nhất" : "Tập Phim Mới Nhất",
    description: "Danh sách các tập phim hoạt hình 3D và anime chất lượng cao tại Vam3D",
    numberOfItems: initialData.totalCount || initialData.episodes?.length || 0,
    itemListElement: (initialData.episodes || []).slice(0, 20).map((ep: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "VideoObject",
        name: `${ep.movie?.name || "Phim"} - ${ep.name || `Tập ${ep.id}`}`,
        description: `Xem ${ep.name} của ${ep.movie?.name || "phim"} Full HD tại Vam3D.`,
        thumbnailUrl: ep.banner || ep.movie?.imgUrl || `${siteUrl}/og-image.jpg`,
        uploadDate: ep.createdAt ? new Date(ep.createdAt).toISOString() : new Date().toISOString(),
        duration: ep.duration ? `PT${Math.floor(ep.duration / 60)}M${ep.duration % 60}S` : undefined,
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: { "@type": "WatchAction" },
          userInteractionCount: ep.views || 0,
        },
      },
    })),
  };

  const formattedAllMovies = (allMovies || []).map((m: any) => ({
    id: m?.id?.toString() || "",
    title: m?.name || m?.title || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || m?.thumbnail || "",
    banner: m?.banner || m?.imgUrl || m?.thumbnail || "",
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
    views: m?.viewCount || m?.views || 0,
    isHot: m?.isHot || false,
    episodes: m?.episodes || [],
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <TapPhimClient
        initialEpisodes={initialData.episodes || []}
        initialTotalCount={initialData.totalCount || 0}
        filterMovies={initialData.movies || []}
        allMoviesForSidebar={formattedAllMovies}
        initialFilters={{
          sort: sortParam,
          movie: movieParam,
          q: searchParam,
          page: pageParam,
        }}
      />
    </>
  );
}
