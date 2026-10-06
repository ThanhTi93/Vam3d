import type { Metadata } from "next";
import { getGalleriesPublicPaginated, getGalleryFilterOptions } from "@/lib/db/queries";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Kho Ảnh 3D 18+, Ảnh Sex Vam 3D Hentai Cực Nét 4K | Vam3D",
  description: "Tổng hợp các bộ sưu tập ảnh 3D 18+, ảnh sex Vam 3D, cosplay AI Hentai 3D Trung Quốc các mỹ nhân hoạt hình sắc nét 4K không che độc quyền tại Vam3D Hentai.",
  keywords: [
    "anh sex vam 3d",
    "anh 18+ 3d",
    "anh sex 3d",
    "vam 3d hentai",
    "vam3d sex",
    "hentai 3d trung quoc",
    "hhtq 3d",
    "anh ai 18+",
    "cosplay ai 3d",
    "vam3d",
  ],
};

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const characterParam = typeof resolvedSearchParams?.character === "string" ? resolvedSearchParams.character : undefined;
  const movieParam = typeof resolvedSearchParams?.movie === "string" ? resolvedSearchParams.movie : undefined;
  const planParam = typeof resolvedSearchParams?.plan === "string" ? resolvedSearchParams.plan : undefined;
  const sortByParam = typeof resolvedSearchParams?.sortBy === "string" ? resolvedSearchParams.sortBy : undefined;

  let initialData: any = { galleries: [], totalCount: 0 };
  let filterOptions: any = { movies: [], characters: [] };

  try {
    const results = await Promise.all([
      getGalleriesPublicPaginated({ 
        page: 1, 
        limit: 12,
        characterId: characterParam || "all",
        movieId: movieParam || "all",
        plan: planParam || "all",
        sortBy: sortByParam || "newest"
      }).catch(() => ({ galleries: [], totalCount: 0 })),
      getGalleryFilterOptions().catch(() => ({ movies: [], characters: [] }))
    ]);
    initialData = results[0] || { galleries: [], totalCount: 0 };
    filterOptions = results[1] || { movies: [], characters: [] };
  } catch (err) {
    console.error("Error in GalleryPage:", err);
  }

  return (
    <GalleryPageClient 
      initialGalleries={initialData?.galleries || []} 
      initialTotalCount={initialData?.totalCount || 0}
      filterMovies={filterOptions?.movies || []}
      filterCharacters={filterOptions?.characters || []}
      initialFilters={{
        character: characterParam || "all",
        movie: movieParam || "all",
        plan: planParam || "all",
        sortBy: sortByParam || "newest",
      }}
    />
  );
}
