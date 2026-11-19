import React from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAuthorDetails } from "@/lib/db/queries";
import AuthorDetailPageClient from "./AuthorDetailPageClient";
import { getSiteUrl, getBunnyImageUrl } from "@/lib/utils";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthorDetails(slug);

  if (!data || !data.author) {
    return {
      title: "Không tìm thấy tác giả | Vam3D",
      description: "Tác giả bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { author, movies } = data;
  const siteUrl = getSiteUrl();

  const movieNames = (movies || []).map((m: any) => m.name).slice(0, 3).join(", ");
  const title = `Tác Giả ${author.name} – Tác Phẩm Phim 3D Hay Nhất | Vam3D`;
  const rawDescription = author.description
    ? `${author.name}: ${author.description}`
    : `Khám phá toàn bộ tác phẩm phim hoạt hình 3D của tác giả ${author.name}${movieNames ? ` (${movieNames})` : ""} chất lượng Full HD tại Vam3D.`;
  const description = rawDescription.replace(/\s+/g, " ").trim().slice(0, 160);

  const canonicalUrl = `${siteUrl}/tac-gia/${author.slug || author.id}`;
  const ogImage = movies?.[0]?.imgUrl ? getBunnyImageUrl(movies[0].imgUrl, "display") : `${siteUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [
      author.name,
      `tac gia ${author.name}`,
      `phim cua ${author.name}`,
      ...((movies || []).map((m: any) => m.name)),
      "hoat hinh 3d",
      "vam3d",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Tác giả ${author.name} - Vam3D`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getAuthorDetails(slug);

  if (!data || !data.author) {
    notFound();
  }

  const { author, movies, otherAuthors } = data;
  if (author.slug && slug !== author.slug) {
    permanentRedirect(`/tac-gia/${author.slug}`);
  }
  const siteUrl = getSiteUrl();

  // Person Schema + BreadcrumbList Schema for SEO
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/tac-gia/${author.slug || author.id}#person`,
        name: author.name,
        description: author.description || `Tác giả sáng tác các bộ phim hoạt hình 3D tại Vam3D.`,
        url: `${siteUrl}/tac-gia/${author.slug || author.id}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tác Giả",
            item: `${siteUrl}/tac-gia`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: author.name,
            item: `${siteUrl}/tac-gia/${author.slug || author.id}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `Tác phẩm của tác giả ${author.name}`,
        numberOfItems: movies.length,
        itemListElement: movies.map((m: any, idx: number) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Movie",
            name: m.name,
            url: `${siteUrl}/movie/${m.slug || m.id}`,
            image: m.imgUrl ? getBunnyImageUrl(m.imgUrl, "display") : `${siteUrl}/og-image.jpg`,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AuthorDetailPageClient author={author} movies={movies} otherAuthors={otherAuthors} />
    </>
  );
}
