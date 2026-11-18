import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    compress: true,
    staticPageGenerationTimeout: 180,
    compiler: {
      removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    },
    experimental: {
      optimizePackageImports: ["lucide-react"],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
      remotePatterns: (() => {
        const patterns: any[] = [
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
          {
            protocol: "https",
            hostname: "*.r2.dev",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "pub-990b17b26195410f8d6faba5f800f6bf.r2.dev",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "cdn.vam3dhentai.online",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "www.vam3dhentai.online",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "vam3dhentai.online",
            pathname: "/**",
          },
        ];

        const bunnyCdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || "https://cdn.vam3dhentai.online";
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

        const r2PublicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
        if (r2PublicDomain) {
          try {
            const clean = r2PublicDomain.startsWith("http") ? r2PublicDomain : `https://${r2PublicDomain}`;
            const urlObj = new URL(clean);
            patterns.push({
              protocol: urlObj.protocol.replace(":", ""),
              hostname: urlObj.hostname,
              pathname: "/**",
            });
          } catch (e) {
            console.error("Lỗi parse NEXT_PUBLIC_R2_PUBLIC_DOMAIN trong next.config.ts:", e);
          }
        }

        return patterns;
      })(),
    },
    async redirects() {
      return [
        // Chuyển hướng 301 chuẩn hóa non-www sang www để giải quyết triệt để 502 URL chưa lập chỉ mục trên GSC
        {
          source: "/:path*",
          has: [{ type: "host", value: "vam3dhentai.online" }],
          destination: "https://www.vam3dhentai.online/:path*",
          permanent: true,
        },
      ];
    },
  };

  export default nextConfig;
