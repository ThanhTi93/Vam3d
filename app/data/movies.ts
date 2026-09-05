export interface Episode {
  name: string;
  url: string;
  bunnyVideoId?: string;
  bunnyStatus?: string;
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
}
