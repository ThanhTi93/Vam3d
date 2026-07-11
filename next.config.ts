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
      remotePatterns: [
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
      ],
    },
  };

  if (!isBuild) {
    nextConfig.cacheHandler = require.resolve("./cache-handler.js");
  }

  return nextConfig;
};
