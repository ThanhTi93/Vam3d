import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/profile/",
        "/login",
        "/register",
        "/challenge",
        "/unauthorized",
        "/watchlist",
      ],
    },
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/feed.xml`],
  };
}
