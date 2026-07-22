import React, { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WatchlistProvider } from "./context/watchlistContext";
import { AuthProvider } from "./context/AuthContext";
import JsonLd from "./components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vam3D – Xem Phim Online Thuyết Minh Vietsub HD",
    template: "%s | Vam3D",
  },
  description:
    "Mạng xã hội xem phim trực tuyến miễn phí lớn nhất Việt Nam. Phim lẻ, phim bộ, chiếu rạp, hoạt hình HD – Vietsub, Thuyết Minh, Lồng Tiếng cập nhật nhanh nhất.",
  keywords: [
    "xem phim online",
    "phim vietsub",
    "phim thuyết minh",
    "phim hd",
    "vam3d",
    "phim lẻ",
    "phim bộ",
    "phim chiếu rạp",
    "anime vietsub",
  ],
  authors: [{ name: "Vam3D", url: siteUrl }],
  creator: "Vam3D",
  publisher: "Vam3D",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "Vam3D",
    title: "Vam3D – Xem Phim Online Thuyết Minh Vietsub HD",
    description:
      "Xem hàng ngàn bộ phim chất lượng cao miễn phí. Cập nhật liên tục mỗi ngày.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Vam3D – Xem Phim Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vam3D – Xem Phim Online Thuyết Minh Vietsub HD",
    description:
      "Xem hàng ngàn bộ phim chất lượng cao miễn phí. Cập nhật liên tục mỗi ngày.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: { canonical: siteUrl },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vam3D",
  url: siteUrl,
  description:
    "Mạng xã hội xem phim trực tuyến miễn phí lớn nhất Việt Nam.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vam3D",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [
    "https://facebook.com/vam3d",
    "https://youtube.com/@vam3d",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased bg-[#090a0f] text-gray-100`}
    >
      <head>
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FND8B4GNWE"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FND8B4GNWE');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-gray-100 selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <WatchlistProvider>
            <Suspense fallback={
              <div className="h-16 bg-[#090a0f] border-b border-white/5 animate-pulse w-full" />
            }>
              <Header />
            </Suspense>
            <div className="flex-1 flex flex-col">
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center py-20 bg-[#090a0f]">
                  <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
              }>
                {children}
              </Suspense>
            </div>
            <Suspense fallback={
              <div className="h-40 bg-[#090a0f] animate-pulse w-full" />
            }>
              <Footer />
            </Suspense>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
