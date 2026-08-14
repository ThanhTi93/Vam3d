import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.vam3dhentai.online";
  
  // Basic static pages
  const staticPaths: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/phim-hot`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/lich-chieu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
  let actorPaths: MetadataRoute.Sitemap = [];
  let characterPaths: MetadataRoute.Sitemap = [];
  let authorPaths: MetadataRoute.Sitemap = [];
  let galleryPaths: MetadataRoute.Sitemap = [];
  let collectionPaths: MetadataRoute.Sitemap = [];
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

      // 3. Actors (Diễn viên)
      const dbActors = await db.query.actors.findMany({
        columns: { id: true, name: true, slug: true },
        where: (actors, { eq }) => eq(actors.status, 1),
      });

      if (dbActors && dbActors.length > 0) {
        actorPaths = dbActors.map((actor) => {
          const slug = actor.slug || slugify(actor.name) || actor.id.toString();
          return {
            url: `${siteUrl}/dien-vien/${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          };
        });
      }

      // 4. Characters (Nhân vật)
      const dbCharacters = await db.query.characters.findMany({
        columns: { id: true, name: true, slug: true },
        where: (chars, { eq }) => eq(chars.status, 1),
      });

      if (dbCharacters && dbCharacters.length > 0) {
        characterPaths = dbCharacters.map((char) => {
          const slug = char.slug || slugify(char.name) || char.id.toString();
          return {
            url: `${siteUrl}/nhan-vat/${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          };
        });
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

      // 7. Collections (Bộ sưu tập ảnh)
      const dbCollections = await db.query.collections.findMany({
        columns: { id: true, name: true, slug: true, createdAt: true },
      });

      if (dbCollections && dbCollections.length > 0) {
        collectionPaths = dbCollections.map((col) => {
          const slug = col.slug || slugify(col.name) || col.id.toString();
          return {
            url: `${siteUrl}/collections/${slug}`,
            lastModified: col.createdAt ? new Date(col.createdAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          };
        });
      }

      // 8. Episodes (Tập phim)
      const dbEpisodes = await db.query.episodes.findMany({
        columns: { id: true, name: true, slug: true, createdAt: true },
        where: (eps, { eq }) => eq(eps.status, 1),
        with: {
          movie: { columns: { id: true, name: true, slug: true } }
        }
      });

      if (dbEpisodes && dbEpisodes.length > 0) {
        episodePaths = dbEpisodes.map((ep) => {
          const movieSlug = ep.movie?.slug || (ep.movie?.name ? slugify(ep.movie.name) : ep.movie?.id.toString());
          const epSlug = ep.slug || (ep.name ? slugify(ep.name) : ep.id.toString());
          return {
            url: movieSlug ? `${siteUrl}/movie/${movieSlug}?ep=${ep.id}` : `${siteUrl}/tap/${epSlug}`,
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

  return [
    ...staticPaths,
    ...categoryPaths,
    ...moviePaths,
    ...episodePaths,
    ...actorPaths,
    ...characterPaths,
    ...authorPaths,
    ...galleryPaths,
    ...collectionPaths,
  ];
}


