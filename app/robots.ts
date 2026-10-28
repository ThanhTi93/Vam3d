import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/profile/", "/_next/", "/static/"],
    },
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/feed.xml`],
  };
}
