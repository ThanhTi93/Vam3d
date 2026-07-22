import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  
  // Basic static pages
  const staticPaths: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/phim-hot`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/phim-le`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/phim-bo`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/chieu-rap`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/hoat-hinh`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/dien-vien`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/nhan-vat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/gallery`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/gioi-thieu`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/chinh-sach-bao-mat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/dieu-khoan-su-dung`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/khieu-nai-ban-quyen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  let moviePaths: MetadataRoute.Sitemap = [];
  let categoryPaths: MetadataRoute.Sitemap = [];
  
  try {
    if (db) {
      // 1. Fetch active movies
      const dbMovies = await db.query.movies.findMany({
        columns: { id: true, createdAt: true },
        where: (movies, { eq }) => eq(movies.status, 1),
      });

      if (dbMovies && dbMovies.length > 0) {
        moviePaths = dbMovies.map((movie) => ({
          url: `${siteUrl}/movie/${movie.id}`,
          lastModified: movie.createdAt ? new Date(movie.createdAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
      }

      // 2. Fetch categories
      const dbCategories = await db.query.categories.findMany({
        columns: { name: true },
        where: (cats, { eq }) => eq(cats.status, 1),
      });

      if (dbCategories && dbCategories.length > 0) {
        // Exclude standard ones already in staticPaths to prevent duplicate entries
        const existingUrls = new Set(staticPaths.map((s) => s.url));
        categoryPaths = dbCategories
          .map((cat) => `${siteUrl}/${encodeURIComponent(cat.name)}`)
          .filter((url) => !existingUrls.has(url))
          .map((url) => ({
            url,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          }));
      }
    }
  } catch (err) {
    console.error("Sitemap dynamic generation failed:", err);
  }

  return [...staticPaths, ...categoryPaths, ...moviePaths];
}

