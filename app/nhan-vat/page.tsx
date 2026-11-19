import type { Metadata } from "next";
import { getAllCharacters } from "@/lib/db/queries";
import CharactersPageClient from "./CharactersPageClient";

const charactersTitle = "Danh Sách Nhân Vật Anime 3D & Cosplay Hot Nhất | Vam3D";
const charactersDescription = "Khám phá danh sách nhân vật hoạt hình 3D, Anime, Cosplay và Waifu nổi tiếng nhất cùng trọn bộ phim 3D và album ảnh AI 4K sắc nét tại Vam3D.";

export const metadata: Metadata = {
  title: charactersTitle,
  description: charactersDescription,
  alternates: {
    canonical: "/nhan-vat",
  },
  openGraph: {
    title: charactersTitle,
    description: charactersDescription,
    url: "/nhan-vat",
    type: "website",
    locale: "vi_VN",
    siteName: "Vam3D",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: charactersTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: charactersTitle,
    description: charactersDescription,
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 3600;

export default async function CharactersPage() {
  try {
    const characters = await getAllCharacters();
    return <CharactersPageClient characters={characters || []} />;
  } catch (err) {
    console.error("Error loading characters page:", err);
    return <CharactersPageClient characters={[]} />;
  }
}
