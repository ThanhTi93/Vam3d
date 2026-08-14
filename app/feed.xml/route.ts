import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { connection } from "next/server";

export async function GET() {
  await connection();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";

  let movies: any[] = [];
  try {
    if (db) {
      const dbMovies = await db.query.movies.findMany({
        where: (movies, { eq }) => eq(movies.status, 1),
        orderBy: (movies, { desc }) => [desc(movies.createdAt)],
        limit: 50,
      });
      movies = dbMovies || [];
    }
  } catch (error) {
    console.error("Error generating RSS Feed:", error);
  }

  const feedItemsXml = movies
    .map((movie) => {
      const movieUrl = `${siteUrl}/movie/${movie.slug || movie.id}`;
      const pubDate = movie.createdAt ? new Date(movie.createdAt).toUTCString() : new Date().toUTCString();
      const description = movie.description
        ? movie.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : `Xem phim ${movie.name} chất lượng cao Full HD Vietsub Thuyết minh tại Vam3D.`;
      const title = `${movie.name} (${movie.originalTitle || ""}) [${movie.year || 2026}] – Vietsub Thuyết Minh Full HD`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `
    <item>
      <title>${title}</title>
      <link>${movieUrl}</link>
      <guid isPermaLink="true">${movieUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      ${movie.imgUrl ? `<enclosure url="${movie.imgUrl}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vam3D – Hoạt Hình 3D Trung Quốc &amp; Phim Vietsub Thuyết Minh HD</title>
    <link>${siteUrl}</link>
    <description>Mạng xã hội xem phim trực tuyến miễn phí lớn nhất. Cập nhật phim bộ, hoạt hình 3D mới nhất hàng ngày.</description>
    <language>vi-vn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
