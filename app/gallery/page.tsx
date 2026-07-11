import type { Metadata } from "next";
import { getGalleriesPublicPaginated, getGalleryFilterOptions } from "@/lib/db/queries";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Ảnh AI Độc Quyền",
  description: "Khám phá kho bộ sưu tập ảnh nhân vật AI, Cosplay chất lượng cao từ các bộ phim bom tấn độc quyền chỉ có tại RoPhim.",
};

export default async function GalleryPage() {
  const [initialData, filterOptions] = await Promise.all([
    getGalleriesPublicPaginated({ page: 1, limit: 12 }),
    getGalleryFilterOptions()
  ]);
  
  return (
    <GalleryPageClient 
      initialGalleries={initialData.galleries || []} 
      initialTotalCount={initialData.totalCount || 0}
      filterMovies={filterOptions.movies || []}
      filterCharacters={filterOptions.characters || []}
    />
  );
}
