import React from "react";
import type { Metadata } from "next";
import { getAllAuthors } from "@/lib/db/queries";
import AuthorsPageClient from "./AuthorsPageClient";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  const title = "Danh Sách Tác Giả & Tác Phẩm Hoạt Hình 3D Nổi Tiếng | Vam3D";
  const description =
    "Tổng hợp danh sách các tác giả tiểu thuyết tiên hiệp, huyền huyễn và nhà sáng tạo nội dung hoạt hình 3D nổi tiếng như Đường Gia Tam Thiếu, Thiên Tàm Thổ Đậu, Vong Ngữ... tại Vam3D.";

  const canonicalUrl = `${siteUrl}/tac-gia`;

  return {
    title,
    description,
    keywords: [
      "tac gia phim 3d",
      "tac gia hoat hinh 3d",
      "duong gia tam thieu",
      "thien tam tho dau",
      "vong ngu",
      "tac gia tien hiep",
      "tac pham hoat hinh 3d",
      "vam3d",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Vam3D - Tác Giả",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
  };
}

export default async function AuthorsPage() {
  let authors: any[] = [];
  try {
    authors = (await getAllAuthors()) || [];
  } catch (err) {
    console.error("Error loading authors page:", err);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";

  // ItemList Schema for SEO
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Danh Sách Tác Giả Phim Hoạt Hình 3D",
    description: "Tổng hợp các tác giả tiểu thuyết và phim hoạt hình 3D nổi tiếng tại Vam3D",
    numberOfItems: authors.length,
    itemListElement: authors.map((author: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Person",
        name: author.name,
        description: author.description || `Tác giả sáng tác các bộ phim hoạt hình 3D đặc sắc tại Vam3D.`,
        url: `${siteUrl}/tac-gia/${author.slug || author.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AuthorsPageClient authors={authors} />
    </>
  );
}
