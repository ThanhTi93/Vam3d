export interface Episode {
  id?: number;
  name: string;
  url: string;
  banner?: string;
  duration?: number;
  bunnyVideoId?: string | null;
  bunnyStatus?: string | null;
  plan?: any;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  thumbnail: string;
  banner: string;
  category: "phim-le" | "phim-bo" | "chieu-rap" | "hoat-hinh" | string;
  genres: string[];
  rating: number;
  votes: number;
  year: number;
  duration: string;
  quality: string;
  sub: string;
  director: string;
  cast: string[];
  description: string;
  videoUrl: string;
  views: number;
  isHot: boolean;
  episodes?: Episode[];
  aiGalleries?: any[];
  plan?: any;
}
