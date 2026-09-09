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

  const movieName = gallery.movie?.name ? ` - Phim ${gallery.movie.name}` : "";
  const charNames = (gallery.galleryCharacters || [])
    .map((gc: any) => gc.character?.name)
    .filter(Boolean);
  const charText = charNames.length > 0 ? ` [${charNames.join(", ")}]` : "";

  const title = `${gallery.name}${charText}${movieName} – Bộ Sưu Tập Ảnh AI Sắc Nét Full HD | Vam3D`;
  const description = gallery.description
    ? `${gallery.description}${movieName ? ` Phim ${gallery.movie?.name}.` : ""} Xem trọn bộ chất lượng cao tại Vam3D.`
    : `Khám phá bộ sưu tập ảnh AI ${gallery.name} gồm ${gallery.imageCount || gallery.images?.length || 0} ảnh chất lượng cao 4K độc quyền${movieName ? ` từ ${gallery.movie?.name}` : ""} chỉ có tại Vam3D.`;

  return {
    title,
    description,
    keywords: [
      gallery.name,
      ...charNames,
      ...(gallery.movie?.name ? [gallery.movie.name] : []),
      "anh ai",
      "bo suu tap ai",
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
          alt: gallery.name,
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

  // JSON-LD ImageGallery Schema
  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.name,
    description: gallery.description || `Bộ sưu tập ảnh AI ${gallery.name} gồm ${gallery.imageCount || gallery.images?.length || 0} ảnh sắc nét tại Vam3D.`,
    url: galleryUrl,
    image: posterUrl,
    numberOfItems: gallery.imageCount || gallery.images?.length || 0,
    associatedMedia: (gallery.images || []).slice(0, 30).map((img: any, idx: number) => ({
      "@type": "ImageObject",
      contentUrl: getBunnyImageUrl(img.imgUrl, "display"),
      thumbnailUrl: getBunnyImageUrl(img.imgUrl, "thumb"),
      name: `${gallery.name} - Ảnh #${idx + 1}`,
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
      <GalleryDetailClient
        gallery={gallery}
        relatedGalleries={relatedGalleries}
      />
    </>
  );
}
