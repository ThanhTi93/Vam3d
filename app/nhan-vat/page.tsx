import type { Metadata } from "next";
import { getAllCharacters } from "@/lib/db/queries";
import CharactersPageClient from "./CharactersPageClient";

export const metadata: Metadata = {
  title: "Danh Sách Nhân Vật Anime, Cosplay Hot Nhất | Vam3D",
  description: "Bộ sưu tập danh sách nhân vật Anime, Cosplay, Waifu xinh đẹp nóng bỏng nhất tại Vam3D.",
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
