export interface CategoryFAQ {
  question: string;
  answer: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  longDescription?: string;
  highlights?: string[];
  keywords?: string[];
  faqs?: CategoryFAQ[];
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { 
    id: 1, 
    name: "Phim Lẻ", 
    slug: "phim-le",
    description: "Tuyển tập phim lẻ 3D, anime vietsub Full HD trọn bộ 1 tập đặc sắc nhất tại Vam3D. Xem phim lẻ 3D miễn phí, tốc độ cao, cập nhật liên tục 2026.",
    longDescription: "Tổng hợp các siêu phẩm phim lẻ 3D đặc sắc với đa dạng thể loại từ hành động, huyền huyễn, tiên hiệp đến tình cảm lãng mạn. Thưởng thức trọn vẹn từng tập phim với kỹ xảo điện ảnh đỉnh cao, âm thanh chân thực và chất lượng hình ảnh sắc nét chuẩn 4K / Full HD không giật lag.",
    highlights: ["Trọn vẹn 1 tập", "Đồ họa 3D đỉnh cao", "Vietsub Full HD", "Cập nhật liên tục 24/7"],
    keywords: ["phim le 3d", "phim le vietsub", "xem phim le 3d", "phim le hoat hinh 3d", "vam3d phim le"],
    faqs: [
      {
        question: "Phim lẻ 3D tại Vam3D có gì nổi bật?",
        answer: "Phim lẻ 3D tại Vam3D được tuyển chọn kỹ lưỡng, mang đến cốt truyện hoàn chỉnh trong 1 tập, kỹ xảo 3D mãn nhãn và độ phân giải từ Full HD đến 4K sắc nét."
      },
      {
        question: "Xem phim lẻ tại Vam3D có cần đăng ký tài khoản không?",
        answer: "Bạn có thể xem nhiều bộ phim lẻ miễn phí ngay lập tức với tốc độ truyền phát cực nhanh trên cả điện thoại và máy tính."
      }
    ]
  },
  { 
    id: 2, 
    name: "Phim Bộ", 
    slug: "phim-bo",
    description: "Kho phim bộ 3D dài tập, hoạt hình 3D Trung Quốc vietsub thuyết minh trọn bộ mới nhất tại Vam3D. Cập nhật tập mới hàng ngày chất lượng 4K siêu mượt.",
    longDescription: "Khám phá thế giới phim bộ 3D phong phú với các series dài tập đình đám, theo dõi hành trình ly kỳ của từng nhân vật qua từng mùa phát sóng. Toàn bộ phim bộ đều có phụ đề Vietsub chuẩn, thuyết minh rõ ràng và hệ thống máy chủ tốc độ cao.",
    highlights: ["Series dài tập", "Lịch chiếu đều đặn", "Phụ đề Vietsub chuẩn", "Hình ảnh sắc nét 4K"],
    keywords: ["phim bo 3d", "phim bo hoat hinh 3d", "phim bo vietsub", "phim bo trung quoc 3d", "vam3d phim bo"],
    faqs: [
      {
        question: "Phim bộ 3D cập nhật tập mới vào thời gian nào?",
        answer: "Các tập mới của phim bộ được cập nhật liên tục theo lịch chiếu chính thức, thường ngay sau khi phát hành bản gốc."
      }
    ]
  },
  { 
    id: 3, 
    name: "Chiếu Rạp", 
    slug: "chieu-rap",
    description: "Tổng hợp phim hoạt hình 3D chiếu rạp bom tấn vietsub thuyết minh Full HD tại Vam3D. Âm thanh vòm sống động, kỹ xảo điện ảnh 3D đỉnh cao mãn nhãn.",
    longDescription: "Những tuyệt tác điện ảnh hoạt hình 3D chiếu rạp được đầu tư kinh phí khủng, đồ họa mãn nhãn cùng kỹ xảo kỹ thuật số tiên tiến nhất. Mang đến trải nghiệm rạp chiếu phim đỉnh cao ngay tại nhà với chất lượng 4K siêu sắc nét.",
    highlights: ["Chất lượng rạp chiếu", "Kỹ xảo bom tấn", "Âm thanh sống động", "Cốt truyện hấp dẫn"],
    keywords: ["phim 3d chieu rap", "hoat hinh chieu rap", "phim chieu rap vietsub", "vam3d chieu rap"]
  },
  { 
    id: 4, 
    name: "Hoạt Hình", 
    slug: "hoat-hinh",
    description: "Kho phim hoạt hình 3D, anime vietsub mới nhất 2026 độc quyền tại Vam3D. Tuyển tập các siêu phẩm hoạt hình 3D lôi cuốn, đồ họa sắc nét không giật lag.",
    longDescription: "Thế giới hoạt hình 3D đỉnh cao hội tụ các tác phẩm xuất sắc từ nhiều studio danh tiếng. Đa dạng từ thể loại hành động, viễn tưởng, phiêu lưu kỳ thú đến hài hước và tình cảm, mang lại trải nghiệm mãn nhãn cho mọi lứa tuổi.",
    highlights: ["Đa dạng thể loại", "Chuyển động mượt mà", "Vietsub sắc nét", "Cập nhật 24/7"],
    keywords: ["hoat hinh 3d", "anime 3d", "xem hoat hinh 3d", "hoat hinh vietsub", "vam3d hoat hinh"]
  },
  { 
    id: 5, 
    name: "AI", 
    slug: "ai",
    description: "Tuyển tập phim và video hoạt cảnh AI 3D nghệ thuật đỉnh cao tại Vam3D. Đồ họa siêu thực 4K, tạo hình nhân vật hoàn mỹ và chuyển động sống động.",
    longDescription: "Khám phá kỷ nguyên giải trí đột phá với thể loại AI tại Vam3D. Ứng dụng công nghệ trí tuệ nhân tạo thế hệ mới nhất, mỗi tác phẩm tái hiện độ chi tiết kinh ngạc từ thần thái nhân vật, làn da siêu thực đến hiệu ứng ánh sáng chân thực như đời thực.",
    highlights: ["Công nghệ AI tiên tiến", "Đồ họa siêu thực 4K", "Tạo hình nhân vật hoàn mỹ", "Cập nhật siêu phẩm mới mỗi ngày"],
    keywords: ["phim ai 3d", "video ai 3d", "hoat canh ai", "nghe thuat ai 3d", "vam3d ai"],
    faqs: [
      {
        question: "Phim thể loại AI tại Vam3D có gì đặc biệt?",
        answer: "Các tác phẩm AI tận dụng công nghệ tạo hình trí tuệ nhân tạo thế hệ mới nhất, mang lại hình ảnh siêu thực, đường nét mượt mà và phong cách nghệ thuật độc đáo chưa từng có."
      },
      {
        question: "Xem phim AI tại Vam3D có hỗ trợ độ phân giải cao không?",
        answer: "Toàn bộ video và phim thuộc danh mục AI đều được tối ưu hóa ở định dạng Full HD và 4K sắc nét, tải nhanh và không bị giật lag trên cả máy tính lẫn điện thoại."
      }
    ]
  },
  { 
    id: 6, 
    name: "Sex 3D", 
    slug: "sex-3d",
    description: "Tuyển tập phim sex 3D vietsub, hoạt hình 3D 18+ thuyết minh chất lượng cao Full HD tại Vam3D. Đồ họa 3D chân thực, chuyển động bốc lửa mượt mà.",
    longDescription: "Kho phim sex 3D chọn lọc hàng đầu với đồ họa 3D sắc nét đỉnh cao, âm thanh sống động và chuyển động chân thực đến từng chi tiết. Toàn bộ nội dung đều có phụ đề Vietsub và thuyết minh rõ ràng, không giật lag và không quảng cáo phiền toái.",
    highlights: ["Đồ họa 3D chân thực", "Chất lượng Full HD & 4K", "Nội dung phong phú 18+", "Tải mượt mà không che"],
    keywords: ["sex 3d", "phim sex 3d", "phim sex 3d vietsub", "sex 3d thuyet minh", "vam3d sex 3d", "sex vam 3d"]
  },
  { 
    id: 7, 
    name: "Hentai 3D", 
    slug: "hentai-3d",
    description: "Kho phim Hentai 3D Trung Quốc vietsub, anime 3D 18+ không che mới nhất 2026 trên Vam3D. Thưởng thức tuyệt phẩm Hentai 3D Full HD sắc nét đỉnh cao.",
    longDescription: "Kho phim Hentai 3D chọn lọc với chất lượng đồ họa cao cấp, góc quay điện ảnh, tạo hình nhân vật waifu bốc lửa và phụ đề tiếng Việt đầy đủ mang đến trải nghiệm giải trí thăng hoa tuyệt đỉnh.",
    highlights: ["Tạo hình chuẩn nét", "Vietsub nhanh nhất", "Full HD không che", "Cập nhật hàng ngày"],
    keywords: ["hentai 3d", "hentai 3d trung quoc", "phim hentai 3d", "hentai 3d vietsub", "vam3d hentai", "vam 3d hentai"],
    faqs: [
      {
        question: "Hentai 3D tại Vam3D có phụ đề tiếng Việt không?",
        answer: "Có, toàn bộ các tựa phim Hentai 3D đều được cập nhật kèm phụ đề Vietsub chuẩn xác, hỗ trợ độ phân giải Full HD / 4K sắc nét."
      }
    ]
  },
  { 
    id: 8, 
    name: "Sex AI", 
    slug: "sex-ai",
    description: "Kho phim sex AI Vietsub và hoạt cảnh 3D AI công nghệ cao siêu nét tại Vam3D. Tạo hình waifu, nhân vật ảo 18+ nóng bỏng chuẩn 4K không che độc quyền.",
    longDescription: "Trải nghiệm đỉnh cao công nghệ với danh mục Sex AI tại Vam3D. Ứng dụng thuật toán AI tạo hình siêu thực, mang đến những thước phim 18+ với dàn nhân vật nữ ảo quyến rũ, body bốc lửa và đường nét sắc sảo vượt trội.",
    highlights: ["Công nghệ AI tiên tiến", "Đồ họa siêu thực 4K", "Tạo hình 18+ bốc lửa", "Nội dung độc quyền không che"],
    keywords: ["sex ai", "sex ai vietsub", "phim sex ai", "sex ai 3d", "vam3d sex ai", "sex ai moi nhat"]
  },
  { 
    id: 9, 
    name: "HH Trung Quốc", 
    slug: "hh-trung-quoc",
    description: "Kho phim hoạt hình 3D Trung Quốc (HHTQ) vietsub thuyết minh full tập tại Vam3D. Siêu phẩm tiên hiệp, huyền huyễn Đấu Phá, Đấu La sắc nét 4K.",
    longDescription: "Tổng hợp các siêu phẩm hoạt hình 3D Trung Quốc đình đám như Đấu Phá Thương Khung, Đấu La Đại Lục, Phàm Nhân Tu Tiên, Thôn Phệ Tinh Không,... với đồ họa 3D sắc sảo, kỹ xảo võ thuật mãn nhãn và bản quyền Vietsub chuẩn nhất.",
    highlights: ["Tiên hiệp huyền huyễn", "Kỹ xảo 3D hoành tráng", "Vietsub & Thuyết minh", "Cập nhật theo lịch chiếu 24/7"],
    keywords: ["hh trung quoc", "hoat hinh trung quoc 3d", "hh3d", "donghua vietsub", "vamhh3d", "vam3d china"]
  },
  { 
    id: 10, 
    name: "Phim Sex JAV HD", 
    slug: "phim-sex-jav-hd",
    description: "Tuyển tập phim sex 3D phong cách JAV HD vietsub chất lượng cao tại Vam3D. Hình ảnh 3D sắc nét, cốt truyện hấp dẫn xem mượt mà không quảng cáo.",
    longDescription: "Tuyển tập phim 3D phong cách JAV HD chất lượng cao, hình ảnh sắc nét, mô phỏng nhân vật nữ sinh, ngự tỷ và waifu Nhật Bản gợi cảm với phụ đề tiếng Việt rõ ràng.",
    highlights: ["Chất lượng HD & 4K", "Phụ đề Vietsub sắc nét", "Nội dung phong phú", "Tải mượt không quảng cáo"],
    keywords: ["phim sex jav hd", "sex jav 3d", "jav 3d vietsub", "vam 3d jav", "vam3d jav"]
  },
  { 
    id: 11, 
    name: "Sex Mỹ Châu Âu", 
    slug: "sex-my-chau-au",
    description: "Kho phim sex 3D Âu Mỹ vietsub Full HD tại Vam3D. Đồ họa 3D phương Tây hiện đại, tạo hình nhân vật ảo bốc lửa và nội dung hấp dẫn.",
    longDescription: "Danh sách phim sex 3D phong cách Âu Mỹ với dàn nhân vật ảo mô phỏng chân thực theo phong cách phương Tây, kỹ xảo 3D hiện đại và chất lượng hình ảnh sắc nét Full HD.",
    highlights: ["Phong cách Âu Mỹ", "Đồ họa 3D hiện đại", "Chất lượng Full HD", "Nội dung lôi cuốn"],
    keywords: ["sex my chau au 3d", "sex au my 3d", "phim 3d chau au", "vam3d sex my"]
  },
  { 
    id: 12, 
    name: "Ảnh Sex", 
    slug: "anh-sex",
    description: "Kho ảnh sex 3D, bộ sưu tập ảnh 18+ cosplay waifu nghệ thuật sắc nét 4K tại Vam3D. Tải ảnh chất lượng cao không watermark hoàn toàn miễn phí.",
    longDescription: "Khám phá kho ảnh sex 3D và ảnh nghệ thuật 18+ chất lượng cao được tuyển chọn kỹ lưỡng. Đầy đủ các bộ sưu tập cosplay anime, waifu 3D gợi cảm với độ phân giải siêu nét không watermark.",
    highlights: ["Hình ảnh 4K sắc nét", "Không watermark", "Xem & tải nhanh", "Cập nhật hàng ngày"],
    keywords: ["anh sex", "anh sex 3d", "anh sex vam 3d", "kho anh 18+", "vam3d anh sex"]
  },
  { 
    id: 13, 
    name: "Ảnh 3D", 
    slug: "anh-3d",
    description: "Bộ sưu tập ảnh 3D nghệ thuật render 4K siêu sắc nét tại Vam3D. Kho hình nền 3D anime, waifu và nhân vật game độc quyền tuyệt mỹ.",
    longDescription: "Bộ sưu tập ảnh 3D nghệ thuật dựng hình tỉ mỉ với độ phân giải cao 4K, phù hợp làm hình nền điện thoại và máy tính cho người yêu thích phong cách 3D rendering và anime.",
    highlights: ["Render 3D chất lượng cao", "Độ phân giải 4K", "Hình nền nghệ thuật", "Tải miễn phí"],
    keywords: ["anh 3d", "hinh nen 3d", "anh 3d nghe thuat", "anh render 3d", "vam3d anh 3d"]
  },
  { 
    id: 14, 
    name: "Ảnh Sex 3D", 
    slug: "anh-sex-3d",
    description: "Tổng hợp kho ảnh sex 3D, ảnh hentai 3D Trung Quốc không che siêu nét tại Vam3D. Chiêm ngưỡng vẻ đẹp bốc lửa của các mỹ nhân 3D chuẩn 4K.",
    longDescription: "Tổng hợp các bộ ảnh sex 3D rendering nghệ thuật siêu thực, chi tiết sắc nét đến từng đường cong và góc nhìn bốc lửa của các nhân vật hoạt hình 3D, waifu và nữ đế nổi tiếng.",
    highlights: ["3D Rendering siêu thực", "Độ nét 4K không che", "Mỹ nhân 3D bốc lửa", "Cập nhật thường xuyên"],
    keywords: ["anh sex 3d", "anhsex3d", "anh sex vam 3d", "anh hentai 3d", "kho anh sex 3d", "vam3d anh sex 3d"]
  },
  { 
    id: 15, 
    name: "Hoạt Hình 3D Trung Quốc", 
    slug: "hoat-hinh-3d-trung-quoc",
    description: "Tổng hợp phim hoạt hình 3D Trung Quốc mới nhất 2026 vietsub chuẩn tại Vam3D. Xem phim 3D Trung Quốc tiên hiệp, tu chân đồ họa đỉnh cao Full HD.",
    longDescription: "Tổng hợp phim hoạt hình 3D Trung Quốc đặc sắc với các tuyệt phẩm huyền huyễn, tiên hiệp, tu chân sống động, cập nhật tập mới nhanh nhất kèm phụ đề Vietsub và thuyết minh chất lượng cao.",
    highlights: ["Đồ họa tiên hiệp 3D", "Kỹ xảo võ thuật đỉnh", "Vietsub nhanh nhất", "Tập mới mỗi ngày"],
    keywords: ["hoat hinh 3d trung quoc", "phim 3d trung quoc", "donghua 3d", "hoat hinh 3d thuyet minh", "vam3d hhtq"]
  },
  { 
    id: 16, 
    name: "Hoạt Hình 3D", 
    slug: "hoat-hinh-3d",
    description: "Kho phim hoạt hình 3D đỉnh cao vietsub Full HD tại Vam3D. Trải nghiệm thế giới 3D mãn nhãn, âm thanh sống động và cốt truyện hấp dẫn cập nhật 24/7.",
    longDescription: "Kho tàng phim hoạt hình 3D đỉnh cao với hình ảnh sắc sảo, cốt truyện hấp dẫn, tạo hình nhân vật độc đáo và âm thanh sống động, mang lại trải nghiệm xem phim chân thực nhất.",
    highlights: ["Đồ họa sắc sảo", "Âm thanh chân thực", "Vietsub chuẩn", "Phát sóng 24/7"],
    keywords: ["hoat hinh 3d", "phim hoat hinh 3d", "hoat hinh 3d vietsub", "xem hoat hinh 3d", "vam3d hoat hinh 3d"]
  },
  { 
    id: 17, 
    name: "Girl Xinh", 
    slug: "girl-xinh",
    description: "Bộ sưu tập ảnh và video girl xinh 3D, mỹ nhân anime tạo hình quyến rũ lung linh chuẩn 4K tại Vam3D. Vẻ đẹp kiêu sa cuốn hút mọi ánh nhìn.",
    longDescription: "Tuyển tập hình ảnh và video người đẹp 3D, mỹ nhân ảo và waifu tạo hình lung linh, phong cách quyến rũ với đường nét thanh tú và vóc dáng đồng hồ cát cực phẩm.",
    highlights: ["Tạo hình quyến rũ", "Hình ảnh 4K lung linh", "Vóc dáng cực phẩm", "Cập nhật mới mỗi ngày"],
    keywords: ["girl xinh 3d", "my nhan 3d", "anh girl xinh 3d", "waifu xinh dep", "vam3d girl xinh"]
  },
  { 
    id: 18, 
    name: "Gái Xinh", 
    slug: "gai-xinh",
    description: "Kho hình ảnh và clip gái xinh 3D, waifu hoạt hình gợi cảm nhất tại Vam3D. Đường nét hoàn mỹ, thân hình bốc lửa cập nhật liên tục 24/7.",
    longDescription: "Kho nội dung hình ảnh, video các nhân vật nữ 3D đẹp mắt, đường nét thanh tú và phong cách lôi cuốn, thỏa mãn niềm đam mê ngắm nhìn cái đẹp của người hâm mộ.",
    highlights: ["Nhân vật nữ đẹp mắt", "Hình ảnh sắc nét 4K", "Body bốc lửa", "Cập nhật liên tục"],
    keywords: ["gai xinh 3d", "gai dep hoat hinh", "waifu 3d goi cam", "anh gai xinh 3d", "vam3d gai xinh"]
  },
  { 
    id: 19, 
    name: "Sexy", 
    slug: "sexy",
    description: "Danh mục video và hình ảnh sexy 3D quyến rũ đốt mắt tại Vam3D. Phong cách tạo hình nhân vật 18+ bốc lửa, dáng chuẩn sắc nét Full HD.",
    longDescription: "Danh mục nội dung quyến rũ, phong cách nghệ thuật hiện đại, tạo hình nhân vật nữ 18+ ấn tượng với những bộ cánh gợi cảm, đường cong nghẹt thở và chất lượng hình ảnh sắc nét.",
    highlights: ["Phong cách quyến rũ", "Đồ họa đẹp", "Chất lượng cao 4K", "Nội dung đốt mắt"],
    keywords: ["sexy 3d", "anh sexy 3d", "video sexy 3d", "anime 3d sexy", "vam3d sexy"]
  },
  { 
    id: 20, 
    name: "China Animation", 
    slug: "china-animation",
    description: "Tuyển tập các siêu phẩm China Animation 3D (Donghua) vietsub thuyết minh chất lượng cao tại Vam3D. Kỹ xảo võ thuật mãn nhãn, cập nhật nhanh nhất.",
    longDescription: "Tuyển tập các tác phẩm hoạt hình 3D xuất sắc từ các studio hoạt hình hàng đầu Trung Quốc. Khám phá những câu chuyện huyền bí, tu tiên, kiếm hiệp với kỹ xảo đỉnh cao.",
    highlights: ["Hoạt hình Trung Quốc", "Cốt truyện huyền bí", "Kỹ xảo võ thuật đỉnh cao", "Vietsub chuẩn"],
    keywords: ["china animation", "donghua 3d", "hoat hinh 3d china", "china animation vietsub", "vam3d china animation"]
  },
  { 
    id: 21, 
    name: "Ảnh Sex AI", 
    slug: "anh-sex-ai",
    description: "Bộ sưu tập ảnh sex AI 4K, album ảnh AI 18+ cosplay waifu nóng bỏng không watermark tại Vam3D. Cập nhật ảnh sex AI mới nhất hàng ngày.",
    longDescription: "Kho ảnh sex AI 18+ nghệ thuật áp dụng công nghệ tạo hình AI thế hệ mới nhất. Chiêm ngưỡng trọn bộ album ảnh AI sắc nét 4K không che, màu sắc sống động và bố cục hoàn hảo.",
    highlights: ["Trí tuệ nhân tạo AI", "Độ phân giải 4K sắc nét", "Không watermark", "Bộ sưu tập phong phú"],
    keywords: ["anh sex ai", "anh sex ai vietsub", "anh 18+ ai", "anh cosplay ai", "vam3d anh sex ai", "anh sex ai moi nhat"]
  },
  { 
    id: 22, 
    name: "Vú bự", 
    slug: "vu-bu",
    description: "Tuyển tập phim và ảnh 3D nhân vật nữ ngực khủng, body bốc lửa quyến rũ tại Vam3D. Hình ảnh sắc nét 4K, vietsub mượt mà thỏa mãn đam mê.",
    longDescription: "Tuyển tập các nội dung hoạt hình 3D và ảnh AI tạo hình nhân vật nữ với vòng một nở nang, thân hình bốc lửa và quyến rũ khó cưỡng với độ nét cao 4K.",
    highlights: ["Tạo hình nóng bỏng", "Đồ họa sắc nét 4K", "Vietsub Full HD", "Nội dung cuốn hút"],
    keywords: ["vu bu 3d", "nguc khung 3d", "anh sex 3d vu bu", "anime 3d vu to", "vam3d vu bu"]
  },
  { 
    id: 23, 
    name: "Phim Lẻ Mới Nhất", 
    slug: "phim-le-moi-nhat",
    description: "Danh sách phim lẻ 3D mới nhất 2026 cập nhật liên tục tại Vam3D. Thưởng thức trọn bộ phim 3D vietsub Full HD tốc độ cao không giật lag.",
    longDescription: "Danh sách các bộ phim lẻ 3D mới phát hành gần đây nhất, chất lượng âm thanh và hình ảnh tuyệt hảo, mang lại trải nghiệm xem phim hoàn hảo không có quảng cáo.",
    highlights: ["Mới phát hành 2026", "Chất lượng Full HD & 4K", "Xem không quảng cáo", "Tốc độ truyền phát cao"],
    keywords: ["phim le moi nhat", "phim le 3d moi", "phim le 2026", "vam3d phim le moi nhat"]
  },
  {
    id: 24,
    name: "Cosplay 18+",
    slug: "cosplay-18",
    description: "Kho ảnh và video Cosplay 18+ nhân vật hoạt hình 3D, waifu anime siêu gợi cảm tại Vam3D. Bộ sưu tập cosplay nóng bỏng sắc nét chuẩn 4K độc quyền.",
    longDescription: "Tổng hợp các bộ ảnh và video Cosplay 18+ nghệ thuật tái hiện chân thực các mỹ nhân hoạt hình 3D và anime đình đám. Tạo hình gợi cảm, body bốc lửa và độ phân giải 4K không watermark mang đến trải nghiệm thăng hoa.",
    highlights: ["Cosplay 18+ siêu thực", "Độ nét 4K không watermark", "Waifu & Mỹ nhân 3D", "Cập nhật mới mỗi ngày"],
    keywords: ["cosplay 18+", "anh cosplay 18+", "cosplay 3d anime", "cosplay waifu", "vam3d cosplay 18+"]
  },
  {
    id: 25,
    name: "3D Không Che",
    slug: "3d-khong-che",
    description: "Tuyển tập phim và ảnh 3D không che (Uncensored) Full HD / 4K siêu sắc nét tại Vam3D. Trải nghiệm kho nội dung 18+ chân thực, mượt mà không che chắn.",
    longDescription: "Kho phim và album ảnh hoạt hình 3D Uncensored không che chất lượng cao, hình ảnh sắc nét đến từng milimet, âm thanh sống động và chuyển động chân thực đỉnh cao.",
    highlights: ["100% Không che (Uncensored)", "Chất lượng 4K siêu nét", "Nội dung phong phú", "Tải mượt mà"],
    keywords: ["3d khong che", "phim 3d khong che", "anh 3d khong che", "hentai 3d uncensored", "vam3d 3d khong che"]
  },
  {
    id: 26,
    name: "Phim 3D Thuyết Minh",
    slug: "phim-3d-thuyet-minh",
    description: "Kho phim hoạt hình 3D và sex 3D thuyết minh tiếng Việt chuẩn giọng đọc lôi cuốn tại Vam3D. Thưởng thức trọn bộ phim 3D Full HD âm thanh sống động.",
    longDescription: "Tuyển tập các bộ phim hoạt hình 3D và phim 3D 18+ có lồng tiếng, thuyết minh tiếng Việt chuẩn xác, chất lượng âm thanh đỉnh cao, giúp bạn tận hưởng trọn vẹn từng thước phim hấp dẫn.",
    highlights: ["Thuyết minh tiếng Việt chuẩn", "Chất lượng Full HD & 4K", "Cốt truyện lôi cuốn", "Không quảng cáo"],
    keywords: ["phim 3d thuyet minh", "hoat hinh 3d thuyet minh", "phim sex 3d thuyet minh", "vam3d thuyet minh"]
  },
  {
    id: 27,
    name: "Tiên Hiệp 18+",
    slug: "tien-hiep-18",
    description: "Tuyển tập phim và hoạt cảnh 3D Tiên Hiệp 18+, tu chân huyễn tưởng bốc lửa tại Vam3D. Chiêm ngưỡng các đại năng, nữ thần tu tiên tuyệt mỹ chuẩn 4K.",
    longDescription: "Khám phá thế giới tiên hiệp tu chân kỳ ảo kết hợp yếu tố 18+ nóng bỏng tại Vam3D. Những thước phim hoạt cảnh 3D tái hiện thần thái tiên tử, nữ đế và sư phụ kiêu sa tuyệt mỹ.",
    highlights: ["Tiên hiệp tu chân 18+", "Đồ họa 3D huyền ảo", "Mỹ nhân tiên hiệp", "Full HD 4K"],
    keywords: ["tien hiep 18+", "tu chan 18+", "hoat hinh 3d tien hiep", "sex 3d tien hiep", "vam3d tien hiep"]
  },
  {
    id: 28,
    name: "Huyền Huyễn 3D",
    slug: "huyen-huyen-3d",
    description: "Kho phim hoạt hình 3D Huyền Huyễn dị giới đỉnh cao vietsub thuyết minh tại Vam3D. Kỹ xảo ma pháp hoành tráng, cốt truyện ly kỳ cập nhật 24/7.",
    longDescription: "Thế giới huyền huyễn 3D đỉnh cao với những trận đại chiến võ đạo, ma pháp mãn nhãn từ các xưởng phim hàng đầu, mang đến cảm xúc thăng hoa không thể rời mắt.",
    highlights: ["Huyền huyễn dị giới", "Kỹ xảo ma pháp đỉnh", "Vietsub chuẩn", "Phát sóng 24/7"],
    keywords: ["huyen huyen 3d", "donghua huyen huyen", "phim 3d di gioi", "vam3d huyen huyen"]
  },
  {
    id: 29,
    name: "Waifu 3D",
    slug: "waifu-3d",
    description: "Kho tổng hợp hình ảnh và video Waifu 3D, nữ thần anime xinh đẹp gợi cảm nhất tại Vam3D. Tải ngay trọn bộ ảnh waifu 3D 4K không watermark miễn phí.",
    longDescription: "Thánh địa dành cho người hâm mộ ngắm nhìn các nhân vật nữ waifu 3D xinh đẹp bậc nhất. Tổng hợp đầy đủ hình ảnh, video hoạt cảnh chất lượng cao 4K độc quyền.",
    highlights: ["Nữ thần & Waifu 3D", "Hình ảnh 4K không watermark", "Body gợi cảm cuốn hút", "Cập nhật hàng ngày"],
    keywords: ["waifu 3d", "nu than 3d", "anh waifu 3d", "anime waifu 3d", "vam3d waifu 3d"]
  },
  {
    id: 30,
    name: "Ngự Tỷ 3D",
    slug: "ngu-ty-3d",
    description: "Bộ sưu tập phim và ảnh 3D Ngự Tỷ kiêu sa, quyến rũ và đầy mê hoặc tại Vam3D. Thần thái nữ đế đỉnh cao cùng vóc dáng đồng hồ cát đốt mắt 4K.",
    longDescription: "Tuyển tập những siêu phẩm 3D dành riêng cho hình tượng Ngự Tỷ (nữ cường nhân, nữ đế, sư tỷ) trưởng thành, body bốc lửa, kiêu hãnh và mê hoặc lòng người.",
    highlights: ["Phong cách Ngự Tỷ", "Vóc dáng đồng hồ cát", "Thần thái nữ đế", "Đồ họa siêu nét 4K"],
    keywords: ["ngu ty 3d", "nu de 3d", "my do toa 3d", "anh ngu ty 3d", "vam3d ngu ty"]
  },
  {
    id: 31,
    name: "Anime 3D Nhật Bản",
    slug: "anime-3d-nhat-ban",
    description: "Tuyển tập phim hoạt hình và Hentai Anime 3D phong cách Nhật Bản vietsub tại Vam3D. Tạo hình dễ thương, chuyển động mượt mà chất lượng Full HD.",
    longDescription: "Kho phim Anime 3D theo phong cách Nhật Bản đặc trưng với dàn nhân vật nữ sinh, waifu xinh đẹp, cốt truyện độc đáo và phụ đề tiếng Việt đầy đủ.",
    highlights: ["Anime 3D Nhật Bản", "Phong cách Nhật chuẩn", "Vietsub sắc nét", "Nội dung phong phú"],
    keywords: ["anime 3d nhat ban", "hentai anime 3d", "anime 3d vietsub", "vam3d anime 3d"]
  },
  {
    id: 32,
    name: "Bikini 3D",
    slug: "bikini-3d",
    description: "Kho ảnh và video 3D Bikini nóng bỏng của dàn mỹ nhân, waifu hoạt hình tại Vam3D. Khung cảnh bãi biển gợi cảm, body sexy chuẩn 4K sắc nét.",
    longDescription: "Bộ sưu tập hình ảnh và video 3D phong cách bikini, đồ bơi bãi biển mùa hè với thân hình gợi cảm, đường cong bốc lửa của các nhân vật nữ 3D được yêu thích nhất.",
    highlights: ["Bikini & Đồ bơi gợi cảm", "Khung cảnh bãi biển 4K", "Body bốc lửa", "Xem & tải miễn phí"],
    keywords: ["bikini 3d", "anh bikini 3d", "waifu bikini", "sexy bikini 3d", "vam3d bikini 3d"]
  },
  {
    id: 33,
    name: "Harem 3D",
    slug: "harem-3d",
    description: "Tổng hợp phim 3D Harem quy tụ dàn mỹ nhân tuyệt sắc vây quanh tại Vam3D. Cốt truyện lôi cuốn, hình ảnh 3D sắc sảo và phụ đề vietsub đầy đủ.",
    longDescription: "Danh mục phim 3D thể loại Harem với cốt truyện xoay quanh nam chính được vô số nữ thần, ngự tỷ và mỹ nhân vây quanh, mang đến những tình tiết hấp dẫn và mãn nhãn.",
    highlights: ["Dàn mỹ nhân Harem", "Cốt truyện hấp dẫn", "Vietsub chuẩn", "Chất lượng Full HD"],
    keywords: ["harem 3d", "phim 3d harem", "hoat hinh 3d harem", "hentai 3d harem", "vam3d harem"]
  },
];

/**
 * Get comprehensive SEO metadata, descriptions, highlights, and FAQs for a category
 */
export function getCategoryDetails(slugOrName: string, dbCategory?: any): CategoryItem {
  const clean = (slugOrName || "").trim().toLowerCase();
  
  // Find in default categories by slug or name
  const matched = DEFAULT_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === clean || c.name.toLowerCase() === clean
  );

  const name = dbCategory?.name || matched?.name || slugOrName;
  const slug = dbCategory?.slug || matched?.slug || clean;

  // Use matched rich SEO description, or dbCategory description if customized
  const description =
    matched?.description ||
    (dbCategory?.description && dbCategory.description.trim().length > 0
      ? dbCategory.description.trim()
      : `Tuyển tập phim và nội dung thuộc thể loại ${name} chất lượng cao Full HD Vietsub, cập nhật nhanh nhất tại Vam3D.`);

  const longDescription =
    matched?.longDescription ||
    `${description} Cung cấp trải nghiệm xem trực tuyến mượt mà, tốc độ cao, hỗ trợ đa thiết bị và cập nhật liên tục các siêu phẩm mới độc quyền tại Vam3D.`;

  const highlights = matched?.highlights || [
    "Cập nhật liên tục 24/7",
    "Chất lượng Full HD & 4K",
    "Phụ đề Vietsub chuẩn",
    "Tốc độ tải nhanh & mượt",
  ];

  const keywords = matched?.keywords || [
    name,
    `phim ${name}`,
    `phim ${name} vietsub`,
    `xem phim ${name}`,
    "vam3d",
    "phim 3d online",
  ];

  const faqs = matched?.faqs || [
    {
      question: `Xem nội dung thể loại ${name} tại Vam3D có gì nổi bật?`,
      answer: `Toàn bộ nội dung ${name} tại Vam3D được tuyển chọn với chất lượng hình ảnh Full HD / 4K, âm thanh sống động và cập nhật nhanh nhất.`,
    },
    {
      question: `Có cần đăng ký tài khoản để xem thể loại ${name} không?`,
      answer: `Bạn có thể xem nhiều nội dung ${name} hoàn toàn miễn phí. Đăng ký tài khoản VIP để mở khóa toàn bộ kho nội dung chất lượng cao nhất và không giới hạn.`,
    },
    {
      question: `Lịch cập nhật thể loại ${name} mới như thế nào?`,
      answer: `Các tác phẩm mới thuộc thể loại ${name} được cập nhật liên tục hàng ngày ngay khi có bản phát hành mới nhất.`,
    },
  ];

  return {
    id: dbCategory?.id || matched?.id || 0,
    name,
    slug,
    description,
    longDescription,
    highlights,
    keywords,
    faqs,
  };
}
