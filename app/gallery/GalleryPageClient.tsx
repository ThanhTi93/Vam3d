"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HomeGalleryGrid, GalleryDetailModal } from "@/components/GalleryComponents";
import { incrementGalleryViews } from "@/app/admin/actions";
import { fetchMoreGalleries } from "./actions";

import { slugify } from "@/lib/utils";

interface GalleryPageClientProps {
  initialGalleries: any[];
  initialTotalCount: number;
  filterMovies: any[];
  filterCharacters: any[];
  initialFilters?: {
    plan?: string;
    movie?: string;
    character?: string;
    sortBy?: string;
  };
}

export default function GalleryPageClient({
  initialGalleries,
  initialTotalCount,
  filterMovies,
  filterCharacters,
  initialFilters,
}: GalleryPageClientProps) {
  const router = useRouter();
  const [galleries, setGalleries] = useState<any[]>(initialGalleries);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Resolve initial character filter
  const resolveInitialCharacter = () => {
    const raw = initialFilters?.character;
    if (!raw || raw === "all") return "all";
    const matched = filterCharacters.find(
      (c: any) =>
        c.id?.toString() === raw ||
        c.slug?.toLowerCase() === raw.toLowerCase() ||
        slugify(c.name || "").toLowerCase() === raw.toLowerCase()
    );
    return matched ? matched.id.toString() : raw;
  };

  // Resolve initial movie filter
  const resolveInitialMovie = () => {
    const raw = initialFilters?.movie;
    if (!raw || raw === "all") return "all";
    const matched = filterMovies.find(
      (m: any) =>
        m.id?.toString() === raw ||
        m.slug?.toLowerCase() === raw.toLowerCase() ||
        slugify(m.name || "").toLowerCase() === raw.toLowerCase()
    );
    return matched ? matched.id.toString() : raw;
  };

  const [filters, setFilters] = useState({
    plan: initialFilters?.plan || "all",
    movie: resolveInitialMovie(),
    character: resolveInitialCharacter(),
    sortBy: initialFilters?.sortBy || "newest",
  });

  const handleSelectGallery = (g: any) => {
    if (g && (g.slug || g.id)) {
      router.push(`/gallery/${g.slug || g.id}`);
    }
  };

  // When filters change, reset page to 1 and reload
  const handleFilterChange = async (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
    setLoading(true);

    // Update URL query parameters seamlessly
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newFilters.character && newFilters.character !== "all") {
        url.searchParams.set("character", newFilters.character);
      } else {
        url.searchParams.delete("character");
      }
      if (newFilters.movie && newFilters.movie !== "all") {
        url.searchParams.set("movie", newFilters.movie);
      } else {
        url.searchParams.delete("movie");
      }
      if (newFilters.plan && newFilters.plan !== "all") {
        url.searchParams.set("plan", newFilters.plan);
      } else {
        url.searchParams.delete("plan");
      }
      if (newFilters.sortBy && newFilters.sortBy !== "newest") {
        url.searchParams.set("sortBy", newFilters.sortBy);
      } else {
        url.searchParams.delete("sortBy");
      }
      window.history.replaceState(null, "", url.toString());
    }

    try {
      const res = await fetchMoreGalleries({
        page: 1,
        limit: 12,
        plan: newFilters.plan,
        movieId: newFilters.movie,
        characterId: newFilters.character,
        sortBy: newFilters.sortBy,
      });
      setGalleries(res.galleries || []);
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll load more
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (galleries.length >= totalCount || loading) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loading) {
          setLoading(true);
          try {
            const nextPage = page + 1;
            const res = await fetchMoreGalleries({
              page: nextPage,
              limit: 12,
              plan: filters.plan,
              movieId: filters.movie,
              characterId: filters.character,
              sortBy: filters.sortBy
            });
            if (res.galleries && res.galleries.length > 0) {
              setGalleries((prev) => [...prev, ...res.galleries]);
              setPage(nextPage);
            }
            if (res.totalCount !== undefined) {
              setTotalCount(res.totalCount);
            }
          } catch (err) {
            console.error("Error loading more galleries:", err);
          } finally {
            setLoading(false);
          }
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
  }, [galleries.length, totalCount, loading, page, filters]);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8">
      <HomeGalleryGrid 
        galleries={galleries} 
        onSelectGallery={handleSelectGallery} 
        totalCount={totalCount}
        filterMovies={filterMovies}
        filterCharacters={filterCharacters}
        activePlan={filters.plan}
        activeMovie={filters.movie}
        activeCharacter={filters.character}
        activeSortBy={filters.sortBy}
        onFilterChange={handleFilterChange}
      />
      
      {galleries.length < totalCount && (
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
