import type { Metadata } from "next";
import { getLatestGalleries } from "@/lib/db/queries";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Ảnh AI Độc Quyền",
  description: "Khám phá kho bộ sưu tập ảnh nhân vật AI, Cosplay chất lượng cao từ các bộ phim bom tấn độc quyền chỉ có tại RoPhim.",
};

export default async function GalleryPage() {
  const galleries = await getLatestGalleries();
  
  return <GalleryPageClient galleries={galleries || []} />;
}
