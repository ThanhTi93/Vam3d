"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { HomeGalleryGrid } from "@/components/GalleryComponents";
import { incrementGalleryViews } from "@/app/admin/actions";

const GalleryDetailModal = dynamic(() => import("@/components/GalleryComponents").then((mod) => mod.GalleryDetailModal), {
  ssr: false,
});

interface GalleryPageClientProps {
  galleries: any[];
}

export default function GalleryPageClient({ galleries }: GalleryPageClientProps) {
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);

  const handleSelectGallery = (g: any) => {
    setSelectedGallery(g);
    if (g && g.id) {
      incrementGalleryViews(g.id);
    }
  };
  
  // Infinite scroll logic
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (visibleCount >= galleries.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, galleries.length));
        }
      },
      { rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleCount, galleries.length]);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      <HomeGalleryGrid 
        galleries={galleries.slice(0, visibleCount)} 
        onSelectGallery={handleSelectGallery} 
        totalCount={galleries.length}
      />
      
      {visibleCount < galleries.length && (
        <div ref={loadMoreRef} className="py-10 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
      )}
      
      <GalleryDetailModal
        gallery={selectedGallery}
        onClose={() => setSelectedGallery(null)}
      />
    </main>
  );
}
