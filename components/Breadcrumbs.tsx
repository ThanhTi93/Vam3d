import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vam3dhentai.online";

  // Build JSON-LD BreadcrumbList Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.href ? { item: item.href.startsWith("http") ? item.href : `${siteUrl}${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto py-1.5 scrollbar-none">
        <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center hover:text-orange-400 transition-colors text-gray-400"
            >
              <Home className="w-3.5 h-3.5 mr-1 text-orange-500" />
              <span>Trang chủ</span>
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="inline-flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                {isLast || !item.href ? (
                  <span className="font-semibold text-orange-400 truncate max-w-[200px] sm:max-w-[300px]" title={item.label}>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-orange-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
