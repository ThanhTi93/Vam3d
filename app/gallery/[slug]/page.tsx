import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGalleryBySlug, getAllGalleriesForStaticParams } from "@/lib/db/queries";
import GalleryDetailClient from "./GalleryDetailClient";
import { getBunnyImageUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const galleries = await getAllGalleriesForStaticParams();
    const params: { slug: string }[] = [];
    const seenSlugs = new Set<string>();

    for (const g of galleries || []) {
      const primarySlug = g.slug || g.id.toString();
      if (primarySlug && !seenSlugs.has(primarySlug)) {
        seenSlugs.add(primarySlug);
        params.push({ slug: primarySlug });
      }
      const idSlug = g.id.toString();
      if (idSlug && !seenSlugs.has(idSlug)) {
        seenSlugs.add(idSlug);
        params.push({ slug: idSlug });
      }
    }

    return params;
  } catch {
    return [];
  }
}

function formatGalleryTitle(gallery: any): string {
  const rawTitle = gallery.name ? gallery.name.trim() : "";
  if (rawTitle && (rawTitle.includes("| Vam 3D Hentai") || rawTitle.includes("| Vam3D"))) {
    return rawTitle;
  }

  const charNames: string[] = (gallery.galleryCharacters || [])
    .map((gc: any) => gc.character?.name)
    .filter(Boolean);

  if (charNames.length > 0) {
    const mainChar = charNames[0];
    let cleanBstName = rawTitle;
    const regex = new RegExp(`^${mainChar}\\s*[-–—:]*\\s*`, "i");
    cleanBstName = cleanBstName.replace(regex, "").trim();

    const bstPart = cleanBstName ? ` ${cleanBstName}` : " Tuyệt Mỹ";
    return `${mainChar} – Ảnh 3D 18+${bstPart} | Vam 3D Hentai 4K`;
  }

  return rawTitle ? `${rawTitle} | Vam 3D Hentai 4K` : `Ảnh 3D 18+ Mỹ Nhân Tuyệt Sắc | Vam 3D Hentai 4K`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGalleryBySlug(slug);

  if (!data || !data.gallery) {
    return {
      title: "Không Tìm Thấy Bộ Sưu Tập | Vam3D",
      description: "Bộ sưu tập ảnh AI bạn tìm kiếm không tồn tại hoặc đã được cập nhật lại.",
    };
  }

  const gallery = data.gallery as any;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const galleryUrl = `${siteUrl}/gallery/${gallery.slug || gallery.id}`;
  const firstImage = gallery.images?.[0]?.imgUrl;
  const posterUrl = firstImage ? getBunnyImageUrl(firstImage, "display") : `${siteUrl}/og-image.jpg`;

  const title = formatGalleryTitle(gallery);

  const charNames: string[] = (gallery.galleryCharacters || [])
    .map((gc: any) => gc.character?.name)
    .filter(Boolean);
  const charListStr = charNames.length > 0 ? `nhân vật ${charNames.join(", ")}` : "";
  const movieStr = gallery.movie?.name ? `trong phim ${gallery.movie.name}` : "";

  const description = gallery.description
    ? `${gallery.description} Trọn bộ ảnh sex Vam 3D, ảnh 3D 18+ ${charListStr} ${movieStr} sắc nét 4K không che độc quyền tại Vam 3D.`
    : `Xem trọn bộ ảnh sex Vam 3D, ảnh 3D 18+ ${charNames[0] || gallery.name} ${movieStr} gồm ${gallery.imageCount || gallery.images?.length || 0} ảnh sắc nét full HD 4K không che độc quyền tại Vam 3D Hentai.`;

  return {
    title,
    description,
    keywords: [
      gallery.name,
      ...charNames.flatMap((c) => [
        c,
        `anh sex ${c}`,
        `anh hentai ${c}`,
        `sex ${c}`,
        `hentai ${c}`,
        `${c} 3d`,
      ]),
      ...(gallery.movie?.name
        ? [
            gallery.movie.name,
            `hentai ${gallery.movie.name}`,
            `sex ${gallery.movie.name}`,
            `anh sex ${gallery.movie.name}`,
          ]
        : []),
      "anh sex vam 3d",
      "anh 18+ 3d",
      "anh sex 3d",
      "hentai vam3d",
      "vam 3d hentai",
      "sex vam 3d",
      "hentai 3d trung quoc",
      "hhtq 3d",
      "anh ai 18+",
      "cosplay ai 3d",
      "vam3d",
    ],
    alternates: {
      canonical: galleryUrl,
    },
    openGraph: {
      type: "article",
      url: galleryUrl,
      title,
      description,
      images: [
        {
          url: posterUrl,
          alt: title,
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

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getGalleryBySlug(slug);

  if (!data || !data.gallery) {
    notFound();
  }

  const gallery = data.gallery as any;
  const relatedGalleries = data.relatedGalleries || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const galleryUrl = `${siteUrl}/gallery/${gallery.slug || gallery.id}`;

  const firstImage = gallery.images?.[0]?.imgUrl;
  const posterUrl = firstImage ? getBunnyImageUrl(firstImage, "display") : `${siteUrl}/og-image.jpg`;

  const galleryTitle = formatGalleryTitle(gallery);

  // JSON-LD ImageGallery Schema
  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: galleryTitle,
    description: gallery.description || `Trọn bộ ${galleryTitle} sắc nét 4K tại Vam 3D Hentai.`,
    url: galleryUrl,
    image: posterUrl,
    numberOfItems: gallery.imageCount || gallery.images?.length || 0,
    associatedMedia: (gallery.images || []).slice(0, 30).map((img: any, idx: number) => ({
      "@type": "ImageObject",
      contentUrl: getBunnyImageUrl(img.imgUrl, "display"),
      thumbnailUrl: getBunnyImageUrl(img.imgUrl, "thumb"),
      name: `${galleryTitle} - Ảnh #${idx + 1}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdGallery).replace(/</g, "\\u003c"),
        }}
      />
      <React.Suspense fallback={<div className="min-h-screen bg-[#090a0f]" />}>
        <GalleryDetailClient
          gallery={gallery}
          relatedGalleries={relatedGalleries}
        />
      </React.Suspense>
    </>
  );
}
