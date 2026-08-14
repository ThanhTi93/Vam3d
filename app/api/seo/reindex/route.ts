import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  
  // If siteUrl is localhost or empty, fallback to production domain for IndexNow validation
  if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
    siteUrl = "https://vam3dhentai.online";
  }

  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const indexNowKey = "e5b6a789c0d1e2f3a4b5c6d7e8f9a0b1";
  const keyLocation = `${siteUrl}/${indexNowKey}.txt`;

  // 1. Flush internal Next.js Server Caches
  try {
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/lich-chieu");
    revalidateTag("movies:all", "default");
    revalidateTag("movies:hot", "default");
  } catch (cacheErr) {
    console.warn("Server cache revalidation note:", cacheErr);
  }

  // 2. Gather full list of URLs for IndexNow Protocol
  const urlList: string[] = [
    siteUrl,
    `${siteUrl}/phim-hot`,
    `${siteUrl}/lich-chieu`,
    `${siteUrl}/dien-vien`,
    `${siteUrl}/nhan-vat`,
    `${siteUrl}/gallery`,
    `${siteUrl}/gioi-thieu`,
    `${siteUrl}/chinh-sach-bao-mat`,
    `${siteUrl}/dieu-khoan-su-dung`,
    `${siteUrl}/khieu-nai-ban-quyen`,
    `${siteUrl}/feed.xml`,
    `${siteUrl}/sitemap.xml`,
  ];

  try {
    if (db) {
      // Fetch dynamic category URLs
      const dbCategories = await db.query.categories.findMany({
        columns: { name: true, slug: true },
        where: (cats, { eq }) => eq(cats.status, 1),
      });
      dbCategories?.forEach((cat) => {
        urlList.push(`${siteUrl}/${cat.slug || encodeURIComponent(cat.name)}`);
      });

      // Fetch dynamic movie & episode URLs
      const dbMovies = await db.query.movies.findMany({
        columns: { id: true, slug: true },
        where: (movies, { eq }) => eq(movies.status, 1),
        with: { episodes: { columns: { id: true } } },
      });

      dbMovies?.forEach((movie) => {
        const movieKey = movie.slug || movie.id;
        urlList.push(`${siteUrl}/movie/${movieKey}`);
        movie.episodes?.forEach((ep) => {
          urlList.push(`${siteUrl}/movie/${movieKey}?ep=${ep.id}`);
        });
      });
    }
  } catch (error) {
    console.error("Error gathering URLs for re-indexing:", error);
  }

  const results: Record<string, any> = {
    totalUrlsSubmitted: urlList.length,
    timestamp: new Date().toISOString(),
    indexNowBing: null,
    indexNowGlobal: null,
  };

  // 3. Submit to Bing IndexNow Endpoint
  try {
    const indexNowPayload = {
      host,
      key: indexNowKey,
      keyLocation,
      urlList: urlList.slice(0, 10000),
    };

    const bingRes = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(indexNowPayload),
    });

    results.indexNowBing = {
      status: bingRes.status,
      ok: bingRes.ok || bingRes.status === 200 || bingRes.status === 202,
      message: bingRes.ok || bingRes.status === 202
        ? "Đã gửi thành công tới Bing IndexNow API!"
        : `Bing IndexNow HTTP ${bingRes.status}`,
    };
  } catch (err: any) {
    results.indexNowBing = { ok: false, error: err.message };
  }

  // 4. Submit to Global IndexNow Endpoint
  try {
    const indexNowPayload = {
      host,
      key: indexNowKey,
      keyLocation,
      urlList: urlList.slice(0, 10000),
    };

    const globalRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(indexNowPayload),
    });

    results.indexNowGlobal = {
      status: globalRes.status,
      ok: globalRes.ok || globalRes.status === 200 || globalRes.status === 202,
      message: globalRes.ok || globalRes.status === 202
        ? "Đã gửi thành công tới Global IndexNow protocol (Yandex, Naver, Seznam)!"
        : `Global IndexNow HTTP ${globalRes.status}`,
    };
  } catch (err: any) {
    results.indexNowGlobal = { ok: false, error: err.message };
  }

  return NextResponse.json({
    success: true,
    message: `🚀 Đã kích hoạt lập chỉ mục cho toàn bộ ${urlList.length} URL trên hệ thống!`,
    details: results,
    sampleUrls: urlList.slice(0, 8),
  });
}
