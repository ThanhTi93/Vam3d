import type { Metadata } from "next";
import { getAllActors } from "@/lib/db/queries";
import ActorsPageClient from "./ActorsPageClient";

const actorsTitle = "Danh Sách Diễn Viên & Mỹ Nhân Cosplay 3D Hot Nhất | Vam3D";
const actorsDescription = "Tổng hợp danh sách diễn viên, người mẫu và mỹ nhân cosplay 3D nổi bật nhất cùng các bộ phim hoạt hình 3D Vietsub chất lượng cao Full HD tại Vam3D.";

export const metadata: Metadata = {
  title: actorsTitle,
  description: actorsDescription,
  alternates: {
    canonical: "/dien-vien",
  },
  openGraph: {
    title: actorsTitle,
    description: actorsDescription,
    url: "/dien-vien",
    type: "website",
    locale: "vi_VN",
    siteName: "Vam3D",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: actorsTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: actorsTitle,
    description: actorsDescription,
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 3600;

export default async function ActorsPage() {
  try {
    const actors = await getAllActors();
    return <ActorsPageClient actors={actors || []} />;
  } catch (err) {
    console.error("Error loading actors page:", err);
    return <ActorsPageClient actors={[]} />;
  }
}
