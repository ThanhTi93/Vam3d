import { z } from "zod";

// 1. Author Validation
export const insertAuthorSchema = z.object({
  name: z.string().min(1, "Tên tác giả không được để trống").max(255, "Tên quá dài"),
  description: z.string().optional().nullable(),
  status: z.number().int().default(1),
});

// 2. Plan Validation
export const insertPlanSchema = z.object({
  level: z.number().int().min(0, "Cấp độ gói phải từ 0 trở lên"),
  priceMonth: z.number().min(0, "Giá phải là số dương"),
  name: z.string().min(1, "Tên gói không được để trống").max(255),
  status: z.number().int().default(1),
});

// 3. Feature Validation
export const insertFeatureSchema = z.object({
  idPlan: z.number().int(),
  name: z.string().min(1, "Tên tính năng không được để trống").max(255),
  available: z.boolean().default(true),
});

// 4. Package Validation
export const insertPackageSchema = z.object({
  discount: z.number().min(0).max(100).default(0),
  idPlan: z.number().int(),
  time: z.number().int().min(1, "Thời gian phải ít nhất là 1 tháng"),
});

// 5. Movie Validation
export const insertMovieSchema = z.object({
  name: z.string().min(1, "Tên phim không được để trống").max(255),
  description: z.string().optional().nullable(),
  idAuthor: z.number().int().optional().nullable(),
  imgUrl: z.string().url("Đường dẫn ảnh không hợp lệ").optional().nullable(),
  status: z.number().int().default(1),
});

// 6. Category Validation
export const insertCategorySchema = z.object({
  name: z.string().min(1, "Tên thể loại không được để trống").max(255),
  description: z.string().optional().nullable(),
  status: z.number().int().default(1),
});

// 7. Character Validation
export const insertCharacterSchema = z.object({
  imgUrl: z.string().url("Ảnh nhân vật không hợp lệ").optional().nullable(),
  name: z.string().min(1, "Tên nhân vật không được để trống").max(255),
  description: z.string().optional().nullable(),
  status: z.number().int().default(1),
});

// 8. Actor Validation
export const insertActorSchema = z.object({
  imgUrl: z.string().url("Ảnh diễn viên không hợp lệ").optional().nullable(),
  name: z.string().min(1, "Tên diễn viên không được để trống").max(255),
  description: z.string().optional().nullable(),
  status: z.number().int().default(1),
});

// 9. Episode Validation
export const insertEpisodeSchema = z.object({
  name: z.string().min(1, "Tên tập phim không được để trống"),
  banner: z.string().optional().nullable(),
  url: z.string().url("Đường dẫn video không hợp lệ").optional().nullable(),
  idMovie: z.string().min(1, "Mã phim không được để trống"),
  idPlan: z.number().int().optional().nullable(),
  status: z.number().int().default(1),
});

// 10. Account / Auth Validation
export const registerSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự").max(50),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  gender: z.string().optional().nullable(),
  phone: z.string().regex(/^[0-9+]{9,15}$/, "Số điện thoại không hợp lệ").optional().nullable(),
  role: z.string().default("user"),
  imgUrl: z.string().optional().nullable(),
  status: z.number().int().default(1),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// 11. Like & Favorites Validation
export const likeSchema = z.object({
  idMovie: z.string().min(1),
  idAccount: z.number().int(),
});

// 12. Watch History Validation
export const watchHistorySchema = z.object({
  idEpisodes: z.number().int(),
  idAccount: z.number().int(),
});
