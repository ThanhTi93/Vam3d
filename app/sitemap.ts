import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { slugify, getSiteUrl } from "@/lib/utils";
import { getSeoExcludedUrls } from "@/lib/db/settings";

function normalizeUrlPath(raw: string): string {
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "https://www.vam3dhentai.online");
    const path = parsed.pathname.toLowerCase().replace(/\/$/, "") || "/";
    return parsed.search ? `${path}${parsed.search}` : path;
  } catch {
    return raw.toLowerCase().replace(/\/$/, "");
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const siteUrl = getSiteUrl();
  
  // Basic static pages
  const staticPaths: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/tap-phim`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/phim-hot`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/tac-gia`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
  let characterPaths: MetadataRoute.Sitemap = [];
  let authorPaths: MetadataRoute.Sitemap = [];
  let galleryPaths: MetadataRoute.Sitemap = [];
  let episodePaths: MetadataRoute.Sitemap = [];
  
  try {
    if (db) {
      // 1. Movies (Phim)
      const dbMovies = await db.query.movies.findMany({
        columns: { id: true, name: true, slug: true, createdAt: true },
        where: (movies, { eq }) => eq(movies.status, 1),
      });

      if (dbMovies && dbMovies.length > 0) {
        moviePaths = dbMovies.map((movie) => {
          const slug = movie.slug || slugify(movie.name) || movie.id.toString();
          return {
            url: `${siteUrl}/movie/${slug}`,
            lastModified: movie.createdAt ? new Date(movie.createdAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          };
        });
      }

      // 2. Categories (Thể loại)
      const dbCategories = await db.query.categories.findMany({
        columns: { id: true, name: true, slug: true },
        where: (cats, { eq }) => eq(cats.status, 1),
      });

      if (dbCategories && dbCategories.length > 0) {
        categoryPaths = dbCategories.map((cat) => {
          const slug = cat.slug || slugify(cat.name) || encodeURIComponent(cat.name);
          return {
            url: `${siteUrl}/${slug}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          };
        });
      }

      // 3. Characters (Nhân vật) - Chỉ đưa URL canonical chính vào sitemap để tránh trùng lặp
      const dbCharacters = await db.query.characters.findMany({
        columns: { id: true, name: true, slug: true },
        where: (chars, { eq }) => eq(chars.status, 1),
      });

      if (dbCharacters && dbCharacters.length > 0) {
        const seenUrls = new Set<string>();
        characterPaths = [];

        for (const char of dbCharacters) {
          const mainSlug = char.slug || slugify(char.name) || char.id.toString();
          const mainUrl = `${siteUrl}/nhan-vat/${encodeURIComponent(mainSlug)}`;
          if (!seenUrls.has(mainUrl)) {
            seenUrls.add(mainUrl);
            characterPaths.push({
              url: mainUrl,
              lastModified: new Date(),
              changeFrequency: "weekly",
              priority: 0.7,
            });
          }
        }
      }

      // 5. Authors (Tác giả)
      const dbAuthors = await db.query.authors.findMany({
        columns: { id: true, name: true, slug: true },
        where: (authors, { eq }) => eq(authors.status, 1),
      });

      if (dbAuthors && dbAuthors.length > 0) {
        authorPaths = dbAuthors.map((author) => {
          const slug = author.slug || slugify(author.name) || author.id.toString();
          return {
            url: `${siteUrl}/tac-gia/${slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          };
        });
      }

      // 6. AI Galleries (Bộ sưu tập AI)
      const dbGalleries = await db.query.aiGalleries.findMany({
        columns: { id: true, name: true, slug: true, createdAt: true },
        where: (galleries, { eq }) => eq(galleries.status, 1),
      });

      if (dbGalleries && dbGalleries.length > 0) {
        galleryPaths = dbGalleries.map((gallery) => {
          const slug = gallery.slug || slugify(gallery.name) || gallery.id.toString();
          return {
            url: `${siteUrl}/gallery/${slug}`,
            lastModified: gallery.createdAt ? new Date(gallery.createdAt) : new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          };
        });
      }

      // 6. Episodes (Tập phim) - Chỉ xuất tập thuộc phim đang hiển thị (status = 1)
      const dbEpisodes = await db.query.episodes.findMany({
        columns: { id: true, name: true, slug: true, createdAt: true },
        where: (eps, { eq }) => eq(eps.status, 1),
        with: {
          movie: { columns: { id: true, name: true, slug: true, status: true } },
        },
      });

      if (dbEpisodes && dbEpisodes.length > 0) {
        episodePaths = dbEpisodes
          .filter((ep) => ep.movie && ep.movie.status === 1)
          .map((ep) => {
            const movie = ep.movie!;
            const movieSlug = movie.slug || (movie.name ? slugify(movie.name) : "") || movie.id.toString();
            const epSlug = ep.slug || (ep.name ? slugify(ep.name) : "") || ep.id.toString();
            return {
              url: `${siteUrl}/movie/${movieSlug}?ep=${epSlug}`,
              lastModified: ep.createdAt ? new Date(ep.createdAt) : new Date(),
              changeFrequency: "weekly",
              priority: 0.7,
            };
          });
      }

    }
  } catch (err) {
    console.error("Sitemap dynamic generation failed:", err);
  }

  let excludedSet = new Set<string>();
  try {
    const excludedList = await getSeoExcludedUrls();
    excludedSet = new Set(excludedList.map((item) => normalizeUrlPath(item.url)));
  } catch {}

  const allEntries = [
    ...staticPaths,
    ...categoryPaths,
    ...moviePaths,
    ...episodePaths,
    ...characterPaths,
    ...authorPaths,
    ...galleryPaths,
  ];

  if (excludedSet.size === 0) {
    return allEntries;
  }

  return allEntries.filter((item) => !excludedSet.has(normalizeUrlPath(item.url)));
}


