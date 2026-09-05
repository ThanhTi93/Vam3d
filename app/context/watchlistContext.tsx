"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WatchlistContextType {
  watchlist: string[];
  toggleWatchlist: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    let saved = localStorage.getItem("vam3d_watchlist");
    if (!saved) {
      saved = localStorage.getItem("rophim_watchlist");
    }
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("vam3d_watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, mounted]);

  const toggleWatchlist = (movieId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(movieId)) {
        return prev.filter((id) => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.includes(movieId);
  };

  // Prevent hydration mismatches by returning empty watchlist during server rendering
  const value = {
    watchlist: mounted ? watchlist : [],
    toggleWatchlist,
    isInWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    return {
      watchlist: [],
      toggleWatchlist: () => {},
      isInWatchlist: () => false,
    };
  }
  return context;
}
