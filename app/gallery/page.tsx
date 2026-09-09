import type { Metadata } from "next";
import { getGalleriesPublicPaginated, getGalleryFilterOptions } from "@/lib/db/queries";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Ảnh AI Độc Quyền | Vam3D",
  description: "Khám phá kho bộ sưu tập ảnh nhân vật AI, Cosplay chất lượng cao từ các bộ phim bom tấn độc quyền chỉ có tại Vam3D.",
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
