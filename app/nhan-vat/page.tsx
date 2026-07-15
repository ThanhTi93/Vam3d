import type { Metadata } from "next";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { characters as charactersTable } from "@/lib/db/schema";
import CharactersPageClient from "./CharactersPageClient";

export const metadata: Metadata = {
  title: "Danh Sách Nhân Vật Anime, Cosplay Hot Nhất",
  description: "Bộ sưu tập danh sách nhân vật Anime, Cosplay, Waifu xinh đẹp nóng bỏng nhất tại Vam3D.",
};

export default async function CharactersPage() {
  if (!db) {
    return <CharactersPageClient characters={[]} />;
  }

  // Fetch all characters where status = 1
  const characters = await db.select({
    id: charactersTable.id,
    name: charactersTable.name,
    imgUrl: charactersTable.imgUrl,
  })
  .from(charactersTable)
  .where(eq(charactersTable.status, 1))
  .orderBy(desc(charactersTable.id));

  return <CharactersPageClient characters={characters} />;
}
