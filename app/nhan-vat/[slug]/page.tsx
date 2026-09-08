import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharacterDetails, getAllCharacters } from "@/lib/db/queries";
import CharacterDetailPageClient from "./CharacterDetailPageClient";
import { getBunnyImageUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

// Generate Static Params for SSG Prerendering
export async function generateStaticParams() {
  try {
    const characters = await getAllCharacters();
    return (characters || []).map((c: any) => ({
      slug: c.slug || c.id.toString(),
    }));
  } catch {
    return [];
  }
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCharacterDetails(slug);

  if (!data || !data.character) {
    return {
      title: "Không Tìm Thấy Nhân Vật | Vam3D",
      description: "Nhân vật bạn tìm kiếm không tồn tại hoặc đã được cập nhật lại.",
    };
  }

  const { character } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const charUrl = `${siteUrl}/nhan-vat/${encodeURIComponent(character.slug || character.id)}`;
  const subNames = [character.nameEn, character.nameZh].filter(Boolean).join(" · ");
  
  const title = `Nhân Vật ${character.name}${subNames ? ` (${subNames})` : ""} – Tập Phim & Bộ Sưu Tập AI | Vam3D`;
  const description = (
    character.description ||
    `Khám phá thông tin nhân vật ${character.name}, tổng hợp các tập phim có mặt và kho bộ sưu tập ảnh Cosplay, Anime AI chất lượng cao tại Vam3D.`
  ).substring(0, 160);

  const posterUrl = character.imgUrl
    ? getBunnyImageUrl(character.imgUrl, "display")
    : `${siteUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [
      character.name,
      character.nameEn,
      character.nameZh,
      `nhan vat ${character.name}`,
      `anh ai ${character.name}`,
      `cosplay ${character.name}`,
      "vam3d",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: charUrl,
    },
    openGraph: {
      title,
      description,
      url: charUrl,
      type: "profile",
      images: [
        {
          url: posterUrl,
          alt: character.name,
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

export default async function CharacterDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCharacterDetails(slug);

  if (!data || !data.character) {
    notFound();
  }

  return <CharacterDetailPageClient data={data} />;
}
