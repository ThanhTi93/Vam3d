import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rophim.vn";
  
  const staticPaths: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/phim-le`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/phim-bo`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/chieu-rap`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/hoat-hinh`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  let dynamicPaths: MetadataRoute.Sitemap = [];
  
  try {
    if (db) {
      const dbMovies = await db.query.movies.findMany({
        columns: { id: true },
        where: (movies, { eq }) => eq(movies.status, 1),
      });

      if (dbMovies && dbMovies.length > 0) {
        dynamicPaths = dbMovies.map((movie) => ({
          url: `${siteUrl}/movie/${movie.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        }));
      }
    }
  } catch (err) {
    console.error("Sitemap dynamic generation failed:", err);
  }

  return [...staticPaths, ...dynamicPaths];
}
