import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export default (phase: string) => {
  const isBuild = phase === PHASE_PRODUCTION_BUILD;

  const nextConfig: NextConfig = {
    cacheComponents: true,
    experimental: {
      instantNavigationDevToolsToggle: true,
    },
    images: {
      unoptimized: true,
      remotePatterns: (() => {
        const patterns = [
          {
            protocol: "https",
            hostname: "images.unsplash.com",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "www.gravatar.com",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "lh3.googleusercontent.com",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "*.b-cdn.net",
            pathname: "/**",
          },
        ];

        const bunnyCdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
        if (bunnyCdnUrl) {
          try {
            const urlObj = new URL(bunnyCdnUrl);
            patterns.push({
              protocol: urlObj.protocol.replace(":", ""),
              hostname: urlObj.hostname,
              pathname: "/**",
            });
          } catch (e) {
            console.error("Lỗi parse NEXT_PUBLIC_BUNNY_CDN_URL trong next.config.ts:", e);
          }
        }
        return patterns;
      })(),
    },
  };

  if (!isBuild) {
    nextConfig.cacheHandler = require.resolve("./cache-handler.js");
  }

  return nextConfig;
};
