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
  
  const title = `Ảnh 3D 18+ ${character.name}${subNames ? ` (${subNames})` : ""} – Phim Hentai & Bộ Sưu Tập Sex Vam 3D | Vam3D`;
  const description = (
    character.description
      ? `${character.description} Tuyển tập ảnh 3D 18+, ảnh sex Vam 3D và các tập phim hentai 3D của ${character.name} sắc nét 4K tại Vam3D.`
      : `Tuyển tập trọn bộ ảnh sex Vam 3D, ảnh 3D 18+ và phim hentai 3D nhân vật ${character.name} sắc nét full HD 4K không che độc quyền chỉ có tại Vam3D Hentai.`
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
      `anh sex ${character.name}`,
      `anh hentai ${character.name}`,
      `sex ${character.name}`,
      `hentai ${character.name}`,
      `${character.name} 3d`,
      `anh 18+ ${character.name}`,
      `nhan vat ${character.name}`,
      "anh sex vam 3d",
      "hentai 3d trung quoc",
      "hhtq 3d",
      "vam 3d hentai",
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
