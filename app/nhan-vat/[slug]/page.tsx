import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharacterDetails, getAllCharacters } from "@/lib/db/queries";
import CharacterDetailPageClient from "./CharacterDetailPageClient";
import { getBunnyImageUrl, slugify } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

// Generate Static Params for SSG Prerendering (supports primary slug, English slug, and Chinese name)
export async function generateStaticParams() {
  try {
    const characters = await getAllCharacters();
    const params: { slug: string }[] = [];
    const seenSlugs = new Set<string>();

    for (const c of characters || []) {
      const primarySlug = c.slug || slugify(c.name) || c.id.toString();
      if (primarySlug && !seenSlugs.has(primarySlug)) {
        seenSlugs.add(primarySlug);
        params.push({ slug: primarySlug });
      }

      if (c.nameEn) {
        const enSlug = slugify(c.nameEn);
        if (enSlug && !seenSlugs.has(enSlug)) {
          seenSlugs.add(enSlug);
          params.push({ slug: enSlug });
        }
      }

      if (c.nameZh && c.nameZh.trim()) {
        const zhSlug = c.nameZh.trim();
        if (zhSlug && !seenSlugs.has(zhSlug)) {
          seenSlugs.add(zhSlug);
          params.push({ slug: zhSlug });
        }
      }
    }

    return params;
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
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  // Canonical is ALWAYS the primary URL (Google SEO best practice to avoid duplicate content)
  const canonicalSlug = character.slug || slugify(character.name) || character.id.toString();
  const charUrl = `${siteUrl}/nhan-vat/${encodeURIComponent(canonicalSlug)}`;
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

  const { character } = data;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  const canonicalSlug = character.slug || slugify(character.name) || character.id.toString();
  const charUrl = `${siteUrl}/nhan-vat/${encodeURIComponent(canonicalSlug)}`;
  const posterUrl = character.imgUrl
    ? getBunnyImageUrl(character.imgUrl, "display")
    : `${siteUrl}/og-image.jpg`;

  const characterJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: character.name,
    alternateName: [character.nameEn, character.nameZh].filter(Boolean),
    url: charUrl,
    image: posterUrl,
    description: character.description || `Thông tin nhân vật ${character.name}, tổng hợp tập phim và kho ảnh AI tại Vam3D.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(characterJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CharacterDetailPageClient data={data} />
    </>
  );
}
