import type { Metadata } from "next";
import { getMoviesByCategory, getAllMovies, getAllCategories } from "@/lib/db/queries";
import CategoryCatalog from "@/components/CategoryCatalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { slugify } from "@/lib/utils";
import { getCategoryDetails } from "@/lib/categories";

interface PageProps {
  params: Promise<{ categoryName: string }>;
}

const formatCategoryLabel = (name: string) => {
  const decoded = decodeURIComponent(name);
  if (decoded === "phim-le") return "Phim Lẻ";
  if (decoded === "phim-bo") return "Phim Bộ";
  if (decoded === "chieu-rap") return "Chiếu Rạp";
  if (decoded === "hoat-hinh") return "Hoạt Hình";
  
  return decoded.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

// Generate dynamic metadata for search engine indexing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryName } = await params;
  const decoded = decodeURIComponent(categoryName).trim();
  const inputSlug = slugify(decoded).toLowerCase();
  
  let categories: any[] = [];
  try {
    categories = (await getAllCategories()) || [];
  } catch {}

  const cat = categories.find((c: any) => {
    const catName = (c.name || "").trim().toLowerCase();
    const catSlug = (c.slug || slugify(c.name)).trim().toLowerCase();
    return catSlug === inputSlug || catName === decoded.toLowerCase() || catSlug === decoded.toLowerCase();
  });

  const categoryDetails = getCategoryDetails(decoded, cat);
  const titleName = categoryDetails.name;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const categoryUrl = `${siteUrl}/${encodeURIComponent(categoryName)}`;
  
  const title = `Phim ${titleName} Mới Nhất 2026 – Tuyển Tập Phim ${titleName} Vietsub HD | Vam3D`;
  const description = (
    categoryDetails.description ||
    `Tuyển tập phim ${titleName} chất lượng cao Vietsub Full HD, thuyết minh cập nhật nhanh nhất tại Vam3D.`
  ).slice(0, 160);

  const keywords = [
    titleName,
    `phim ${titleName}`,
    `phim ${titleName} vietsub`,
    `xem phim ${titleName}`,
    `phim ${titleName} moi nhat`,
    `phim 3d ${titleName}`,
    `hoat hinh 3d ${titleName}`,
    "vam3d",
    "phim 3d online",
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      url: categoryUrl,
      type: "website",
      siteName: "Vam3D - Xem Phim 3D Online",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `Phim ${titleName} Vietsub HD | Vam3D`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const categories = (await getAllCategories()) || [];
    const baseCategories = ["phim-le", "phim-bo", "chieu-rap", "hoat-hinh"];
    const allSlugs = new Set([
      ...baseCategories,
      ...categories.map((c: any) => c.slug || slugify(c.name)).filter(Boolean),
    ]);
    return Array.from(allSlugs).map((categoryName) => ({
      categoryName,
    }));
  } catch {
    return [
      { categoryName: "phim-le" },
      { categoryName: "phim-bo" },
      { categoryName: "chieu-rap" },
      { categoryName: "hoat-hinh" },
    ];
  }
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName).trim();
  const inputSlug = slugify(decodedCategory).toLowerCase();

  let allDbCategories: any[] = [];
  try {
    allDbCategories = (await getAllCategories()) || [];
  } catch {}

  const targetCategory = allDbCategories.find((c: any) => {
    const catName = (c.name || "").trim().toLowerCase();
    const catSlug = (c.slug || slugify(c.name)).trim().toLowerCase();
    return (
      catSlug === inputSlug ||
      catName === decodedCategory.toLowerCase() ||
      catSlug === decodedCategory.toLowerCase()
    );
  });

  const categoryDetails = getCategoryDetails(decodedCategory, targetCategory);
  const titleName = categoryDetails.name;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  const categoryUrl = `${siteUrl}/${encodeURIComponent(categoryName)}`;

  let movies: any[] = [];
  let allMovies: any[] = [];
  try {
    const results = await Promise.all([
      getMoviesByCategory(targetCategory?.slug || targetCategory?.name || decodedCategory),
      getAllMovies(60),
    ]);
    movies = results[0] || [];
    allMovies = results[1] || [];

    // Fallback: match by title, category string or originalTitle
    if (movies.length === 0 && allMovies.length > 0) {
      const matched = allMovies.filter((m: any) =>
        m?.movieCategories?.some((mc: any) =>
          mc?.category?.name?.toLowerCase().includes(inputSlug) ||
          slugify(mc?.category?.name || "").includes(inputSlug)
        )
      );
      movies = matched.length > 0 ? matched : allMovies;
    }
  } catch (err) {
    console.error("Error loading category movies:", err);
  }

  // Format to expected Movie model shape
  const formattedMovies = (movies || []).map((m: any) => ({
    id: m?.id?.toString() || "",
    slug: m?.slug || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    banner: m?.banner || m?.imgUrl || "",
    category: (m?.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m?.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m?.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m?.movieCategories?.map((mc: any) => mc?.category?.name).filter(Boolean) || [],
    rating: typeof m?.rating === "string" ? parseFloat(m?.rating) : m?.rating || 0.0,
    votes: m?.likeCount || 0,
    year: m?.year || 2026,
    duration: m?.duration ? `${m.duration} phút` : "—",
    quality: m?.quality || "HD",
    sub: m?.sub || "Vietsub",
    director: m?.author?.name || "—",
    cast: m?.movieActors?.map((ma: any) => ma?.actor?.name) || [],
    description: m?.description || "",
    videoUrl: m?.episodes?.[0]?.url || "",
    views: m?.viewCount || 0,
    isHot: m?.isHot || false,
    episodes: m?.episodes?.map((ep: any) => ({
      id: ep?.id,
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      banner: ep?.banner || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  const formattedAllMovies = (allMovies || []).map((m: any) => ({
    id: m?.id?.toString() || "",
    slug: m?.slug || "",
    title: m?.name || "",
    originalTitle: m?.originalTitle || "",
    thumbnail: m?.imgUrl || "",
    banner: m?.banner || m?.imgUrl || "",
    category: (m?.movieCategories?.[0]?.category?.name === "phim-bo" ? "phim-bo" : 
              m?.movieCategories?.[0]?.category?.name === "hoat-hinh" ? "hoat-hinh" :
              m?.movieCategories?.[0]?.category?.name === "chieu-rap" ? "chieu-rap" : "phim-le") as any,
    genres: m?.movieCategories?.map((mc: any) => mc?.category?.name).filter(Boolean) || [],
    rating: typeof m?.rating === "string" ? parseFloat(m?.rating) : m?.rating || 0.0,
    votes: m?.likeCount || 0,
    year: m?.year || 2026,
    duration: m?.duration ? `${m.duration} phút` : "—",
    quality: m?.quality || "HD",
    sub: m?.sub || "Vietsub",
    director: m?.author?.name || "—",
    cast: m?.movieActors?.map((ma: any) => ma?.actor?.name) || [],
    description: m?.description || "",
    videoUrl: m?.episodes?.[0]?.url || "",
    views: m?.viewCount || 0,
    isHot: m?.isHot || false,
    episodes: m?.episodes?.map((ep: any) => ({
      id: ep?.id,
      name: ep?.name || `Tập ${ep?.id}`,
      url: ep?.url || "",
      banner: ep?.banner || "",
      bunnyVideoId: ep?.bunnyVideoId,
      bunnyStatus: ep?.bunnyStatus,
      duration: ep?.duration || 0,
    })) || [],
  }));

  // Build JSON-LD Collection & ItemList Schemas for SEO
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Phim ${titleName} Vietsub Mới Nhất`,
    description: categoryDetails.description,
    url: categoryUrl,
    inLanguage: "vi-VN",
    publisher: {
      "@type": "Organization",
      name: "Vam3D",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      name: `Danh Sách Phim ${titleName}`,
      numberOfItems: formattedMovies.length,
      itemListElement: formattedMovies.slice(0, 24).map((movie, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/movie/${movie.slug || movie.id}`,
        name: movie.title,
        image: movie.thumbnail || movie.banner,
      })),
    },
  };

  const faqSchema = categoryDetails.faqs && categoryDetails.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: categoryDetails.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <>
      {/* Dynamic JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4">
        <Breadcrumbs items={[{ label: titleName }]} />
        <CategoryCatalog
          categoryTitle={titleName}
          categorySlug={categoryDetails.slug || inputSlug}
          categoryDescription={categoryDetails.description || ""}
          categoryLongDescription={categoryDetails.longDescription || ""}
          categoryHighlights={categoryDetails.highlights || []}
          categoryFaqs={categoryDetails.faqs || []}
          movies={formattedMovies}
          allMovies={formattedAllMovies}
          allCategories={allDbCategories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug || slugify(c.name),
          }))}
        />
      </div>
    </>
  );
}

