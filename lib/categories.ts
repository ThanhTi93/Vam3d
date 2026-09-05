export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 1, name: "Phim Lẻ", slug: "phim-le" },
  { id: 2, name: "Phim Bộ", slug: "phim-bo" },
  { id: 3, name: "Chiếu Rạp", slug: "chieu-rap" },
  { id: 4, name: "Hoạt Hình", slug: "hoat-hinh" },
  { id: 5, name: "AI", slug: "ai" },
  { id: 6, name: "Sex 3D", slug: "sex-3d" },
  { id: 7, name: "Hentai 3D", slug: "hentai-3d" },
  { id: 8, name: "Sex AI", slug: "sex-ai" },
  { id: 9, name: "HH Trung Quốc", slug: "hh-trung-quoc" },
  { id: 10, name: "Phim Sex JAV HD", slug: "phim-sex-jav-hd" },
  { id: 11, name: "Sex Mỹ Châu Âu", slug: "sex-my-chau-au" },
  { id: 12, name: "Ảnh Sex", slug: "anh-sex" },
  { id: 13, name: "Ảnh 3D", slug: "anh-3d" },
  { id: 14, name: "Ảnh Sex 3D", slug: "anh-sex-3d" },
  { id: 15, name: "Hoạt Hình 3D Trung Quốc", slug: "hoat-hinh-3d-trung-quoc" },
  { id: 16, name: "Hoạt Hình 3D", slug: "hoat-hinh-3d" },
  { id: 17, name: "Girl Xinh", slug: "girl-xinh" },
  { id: 18, name: "Gái Xinh", slug: "gai-xinh" },
  { id: 19, name: "Sexy", slug: "sexy" },
  { id: 20, name: "China Animation", slug: "china-animation" },
  { id: 21, name: "Ảnh Sex AI", slug: "anh-sex-ai" },
  { id: 22, name: "Vú bự", slug: "vu-bu" },
  { id: 23, name: "Phim Lẻ Mới Nhất", slug: "phim-le-moi-nhat" },
];
