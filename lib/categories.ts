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
    description: "Tuyển tập những bộ phim lẻ 3D đặc sắc, trọn vẹn trong một tập với cốt truyện kịch tính, đồ họa 3D đỉnh cao và phụ đề Vietsub Full HD cập nhật liên tục.",
    longDescription: "Tổng hợp các siêu phẩm phim lẻ 3D với đa dạng chủ đề từ hành động, huyền huyễn, tiên hiệp cho đến tình cảm lãng mạn. Mỗi bộ phim đều có thời lượng trọn vẹn, kỹ xảo điện ảnh sống động, âm thanh chân thực và chất lượng hình ảnh sắc nét chuẩn HD/4K.",
    highlights: ["Trọn vẹn 1 tập", "Đồ họa 3D đỉnh cao", "Vietsub Full HD", "Cập nhật liên tục"],
    faqs: [
      {
        question: "Phim lẻ 3D tại Vam3D có gì nổi bật?",
        answer: "Phim lẻ 3D tại Vam3D được tuyển chọn kỹ lưỡng, mang đến cốt truyện hoàn chỉnh, kỹ xảo 3D mãn nhãn và chất lượng hình ảnh sắc nét từ 1080p đến 4K."
      },
      {
        question: "Xem phim lẻ tại Vam3D có cần đăng ký tài khoản không?",
        answer: "Bạn có thể xem nhiều bộ phim lẻ miễn phí ngay lập tức, hoặc đăng ký tài khoản VIP để thưởng thức toàn bộ kho phim không giới hạn và không quảng cáo."
      }
    ]
  },
  { 
    id: 2, 
    name: "Phim Bộ", 
    slug: "phim-bo",
    description: "Kho phim bộ 3D dài tập hấp dẫn, cốt truyện lôi cuốn với các phần mới nhất được cập nhật đều đặn mỗi tuần với chất lượng Full HD và Vietsub chuẩn.",
    longDescription: "Khám phá thế giới phim bộ 3D phong phú với các series dài tập đình đám, theo dõi hành trình ly kỳ của từng nhân vật qua các mùa phát sóng. Chất lượng video luôn được đảm bảo ở mức cao nhất cùng phụ đề chuẩn xác.",
    highlights: ["Series dài tập", "Lịch chiếu đều đặn", "Phụ đề Vietsub chuẩn", "Hình ảnh sắc nét"],
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
    description: "Danh sách phim hoạt hình 3D chiếu rạp bom tấn với âm thanh vòm sống động, kỹ xảo điện ảnh hoành tráng và trải nghiệm mãn nhãn tuyệt đối.",
    longDescription: "Những tuyệt tác điện ảnh 3D chiếu rạp được đầu tư kinh phí khủng, đồ họa mãn nhãn cùng kỹ xảo kỹ thuật số tiên tiến nhất. Thưởng thức cảm giác như đang ngồi trước màn ảnh rộng ngay tại nhà.",
    highlights: ["Chất lượng rạp chiếu", "Kỹ xảo bom tấn", "Âm thanh sống động", "Cốt truyện hấp dẫn"]
  },
  { 
    id: 4, 
    name: "Hoạt Hình", 
    slug: "hoat-hinh",
    description: "Kho phim hoạt hình 3D tổng hợp phong phú đa dạng thể loại, phong cách tạo hình đẹp mắt, chuyển động mượt mà và nội dung giàu cảm xúc.",
    longDescription: "Thế giới hoạt hình 3D đỉnh cao hội tụ các tác phẩm xuất sắc từ nhiều studio danh tiếng. Đa dạng từ thể loại hành động, viễn tưởng, phiêu lưu kỳ thú đến hài hước vui nhộn.",
    highlights: ["Đa dạng thể loại", "Chuyển động mượt mà", "Vietsub sắc nét", "Cập nhật 24/7"]
  },
  { 
    id: 5, 
    name: "AI", 
    slug: "ai",
    description: "Tuyển tập các tác phẩm phim, hoạt cảnh 3D và nghệ thuật thị giác ứng dụng trí tuệ nhân tạo (AI) đỉnh cao với đồ họa siêu thực, tạo hình hoàn mỹ và chuyển động sống động.",
    longDescription: "Khám phá kỷ nguyên giải trí đột phá với thể loại AI tại Vam3D. Ứng dụng các thuật toán sinh hình ảnh và video AI hiện đại nhất, mỗi tác phẩm mang lại độ chi tiết kinh ngạc từ biểu cảm nhân vật, làn da siêu thực đến hiệu ứng ánh sáng chân thực như đời thực.",
    highlights: ["Công nghệ AI tiên tiến", "Đồ họa siêu thực 4K", "Tạo hình nhân vật hoàn mỹ", "Cập nhật siêu phẩm mới mỗi ngày"],
    faqs: [
      {
        question: "Phim thể loại AI tại Vam3D có gì đặc biệt?",
        answer: "Các tác phẩm AI tận dụng công nghệ tạo hình trí tuệ nhân tạo thế hệ mới nhất, mang lại hình ảnh siêu thực, đường nét mượt mà và phong cách nghệ thuật độc đáo chưa từng có."
      },
      {
        question: "Xem phim AI tại Vam3D có hỗ trợ độ phân giải cao không?",
        answer: "Toàn bộ video và phim thuộc danh mục AI đều được tối ưu hóa ở định dạng Full HD và 4K sắc nét, tải nhanh và không bị giật lag trên cả máy tính lẫn điện thoại."
      },
      {
        question: "Tần suất cập nhật nội dung AI như thế nào?",
        answer: "Nội dung AI được hệ thống Vam3D bổ sung liên tục mỗi ngày, bao gồm cả phim ngắn, video hoạt cảnh lẫn bộ sưu tập ảnh nghệ thuật AI độc quyền."
      }
    ]
  },
  { 
    id: 6, 
    name: "Sex 3D", 
    slug: "sex-3d",
    description: "Tuyển tập phim 3D đồ họa sắc nét, chuyển động mềm mại chân thực, âm thanh sống động và chất lượng Full HD vietsub chuẩn.",
    highlights: ["Đồ họa 3D chân thực", "Chất lượng Full HD", "Nội dung phong phú", "Tải mượt mà"]
  },
  { 
    id: 7, 
    name: "Hentai 3D", 
    slug: "hentai-3d",
    description: "Tổng hợp các bộ phim hoạt hình Hentai 3D đặc sắc, kỹ xảo chuyển động siêu mượt, nhân vật mô phỏng chân thực và cập nhật tập mới nhanh nhất.",
    longDescription: "Kho phim Hentai 3D chọn lọc với chất lượng đồ họa cao cấp, góc quay điện ảnh, tạo hình nhân vật đẹp mắt và phụ đề tiếng Việt đầy đủ mang đến trải nghiệm giải trí tuyệt vời.",
    highlights: ["Tạo hình chuẩn nét", "Vietsub nhanh nhất", "Full HD không cắt", "Cập nhật hàng ngày"],
    faqs: [
      {
        question: "Hentai 3D tại Vam3D có phụ đề tiếng Việt không?",
        answer: "Có, toàn bộ các tựa phim Hentai 3D đều được cập nhật kèm phụ đề Vietsub chuẩn xác, dễ theo dõi."
      }
    ]
  },
  { 
    id: 8, 
    name: "Sex AI", 
    slug: "sex-ai",
    description: "Danh sách phim và hoạt cảnh Sex AI công nghệ cao, tạo hình nhân vật siêu thực với từng đường nét chi tiết và độ nét 4K vượt trội.",
    highlights: ["Công nghệ AI tiên tiến", "Đồ họa siêu thực", "Độ nét 4K", "Nội dung độc quyền"]
  },
  { 
    id: 9, 
    name: "HH Trung Quốc", 
    slug: "hh-trung-quoc",
    description: "Kho phim hoạt hình 3D Trung Quốc (HHTQ) tiên hiệp, huyền huyễn, tu chân đỉnh cao với kỹ xảo hoành tráng và cốt truyện hấp dẫn bậc nhất.",
    longDescription: "Tổng hợp các siêu phẩm hoạt hình 3D Trung Quốc đình đám như Đấu Phá Thương Khung, Đấu La Đại Lục, Phàm Nhân Tu Tiên, Thôn Phệ Tinh Không,... với đồ họa 3D sắc sảo và võ thuật mãn nhãn.",
    highlights: ["Tiên hiệp huyền huyễn", "Kỹ xảo 3D hoành tráng", "Vietsub & Thuyết minh", "Cập nhật theo lịch chiếu"]
  },
  { 
    id: 10, 
    name: "Phim Sex JAV HD", 
    slug: "phim-sex-jav-hd",
    description: "Tuyển tập phim giải trí phong cách JAV HD chất lượng cao, hình ảnh sắc nét, phụ đề tiếng Việt rõ ràng.",
    highlights: ["Chất lượng HD", "Phụ đề sắc nét", "Nội dung phong phú"]
  },
  { 
    id: 11, 
    name: "Sex Mỹ Châu Âu", 
    slug: "sex-my-chau-au",
    description: "Danh sách phim 3D phong cách Âu Mỹ với dàn diễn viên ảo mô phỏng chân thực, kỹ xảo hiện đại và nội dung hấp dẫn.",
    highlights: ["Phong cách Âu Mỹ", "Đồ họa hiện đại", "Chất lượng cao"]
  },
  { 
    id: 12, 
    name: "Ảnh Sex", 
    slug: "anh-sex",
    description: "Bộ sưu tập hình ảnh nghệ thuật chất lượng cao, độ phân giải sắc nét, tuyển chọn kỹ lưỡng.",
    highlights: ["Hình ảnh chất lượng cao", "Độ nét vượt trội", "Xem & tải nhanh"]
  },
  { 
    id: 13, 
    name: "Ảnh 3D", 
    slug: "anh-3d",
    description: "Bộ sưu tập ảnh 3D nghệ thuật dựng hình tỉ mỉ, độ phân giải cao, phù hợp cho người yêu thích phong cách 3D rendering.",
    highlights: ["Render 3D chất lượng cao", "Độ phân giải 4K", "Hình ảnh nghệ thuật"]
  },
  { 
    id: 14, 
    name: "Ảnh Sex 3D", 
    slug: "anh-sex-3d",
    description: "Tổng hợp các bộ ảnh 3D rendering nghệ thuật siêu thực, chi tiết sắc nét và bố cục ấn tượng.",
    highlights: ["3D Rendering", "Độ nét cao", "Cập nhật thường xuyên"]
  },
  { 
    id: 15, 
    name: "Hoạt Hình 3D Trung Quốc", 
    slug: "hoat-hinh-3d-trung-quoc",
    description: "Tổng hợp phim hoạt hình 3D Trung Quốc đặc sắc với các tuyệt phẩm huyền huyễn, tiên hiệp, tu chân sống động, cập nhật tập mới nhanh nhất.",
    highlights: ["Đồ họa tiên hiệp", "Kỹ xảo võ thuật đỉnh", "Vietsub nhanh nhất", "Tập mới mỗi ngày"]
  },
  { 
    id: 16, 
    name: "Hoạt Hình 3D", 
    slug: "hoat-hinh-3d",
    description: "Kho tàng phim hoạt hình 3D đỉnh cao, hình ảnh sắc sảo, cốt truyện hấp dẫn và âm thanh chân thực.",
    highlights: ["Đồ họa sắc sảo", "Âm thanh chân thực", "Vietsub chuẩn"]
  },
  { 
    id: 17, 
    name: "Girl Xinh", 
    slug: "girl-xinh",
    description: "Tuyển tập hình ảnh và video người đẹp 3D, nhân vật nữ ảo tạo hình lung linh, phong cách quyến rũ.",
    highlights: ["Tạo hình quyến rũ", "Hình ảnh lung linh", "Độ nét cao"]
  },
  { 
    id: 18, 
    name: "Gái Xinh", 
    slug: "gai-xinh",
    description: "Kho nội dung hình ảnh, video các nhân vật nữ 3D đẹp mắt, đường nét thanh tú và phong cách lôi cuốn.",
    highlights: ["Nhân vật nữ đẹp mắt", "Hình ảnh sắc nét", "Cập nhật liên tục"]
  },
  { 
    id: 19, 
    name: "Sexy", 
    slug: "sexy",
    description: "Danh mục nội dung quyến rũ, phong cách nghệ thuật hiện đại, tạo hình nhân vật ấn tượng.",
    highlights: ["Phong cách quyến rũ", "Đồ họa đẹp", "Chất lượng cao"]
  },
  { 
    id: 20, 
    name: "China Animation", 
    slug: "china-animation",
    description: "Tuyển tập các tác phẩm hoạt hình 3D xuất sắc từ các xưởng phim hoạt hình hàng đầu Trung Quốc.",
    highlights: ["Hoạt hình Trung Quốc", "Cốt truyện huyền bí", "Kỹ xảo võ thuật đỉnh cao"]
  },
  { 
    id: 21, 
    name: "Ảnh Sex AI", 
    slug: "anh-sex-ai",
    description: "Kho ảnh nghệ thuật AI với độ phân giải siêu nét, áp dụng công nghệ tạo hình AI thế hệ mới.",
    highlights: ["Trí tuệ nhân tạo AI", "Độ phân giải siêu nét", "Bộ sưu tập phong phú"]
  },
  { 
    id: 22, 
    name: "Vú bự", 
    slug: "vu-bu",
    description: "Tuyển tập các nội dung hoạt hình 3D tạo hình nhân vật nở nang, nóng bỏng và quyến rũ.",
    highlights: ["Tạo hình nóng bỏng", "Đồ họa sắc nét", "Vietsub Full HD"]
  },
  { 
    id: 23, 
    name: "Phim Lẻ Mới Nhất", 
    slug: "phim-le-moi-nhat",
    description: "Danh sách các bộ phim lẻ 3D mới phát hành gần đây nhất, chất lượng âm thanh hình ảnh tuyệt hảo.",
    highlights: ["Mới phát hành", "Chất lượng Full HD", "Xem không quảng cáo"]
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

  // Prefer DB description if available, otherwise use default description
  const description =
    (dbCategory?.description && dbCategory.description.trim().length > 0)
      ? dbCategory.description.trim()
      : matched?.description ||
        `Tuyển tập phim và nội dung thuộc thể loại ${name} chất lượng cao Full HD Vietsub, cập nhật nhanh nhất tại Vam3D.`;

  const longDescription =
    matched?.longDescription ||
    `${description} Cung cấp trải nghiệm xem phim trực tuyến mượt mà, tốc độ cao, hỗ trợ đa thiết bị và cập nhật liên tục các siêu phẩm mới.`;

  const highlights = matched?.highlights || [
    "Cập nhật liên tục 24/7",
    "Chất lượng Full HD & 4K",
    "Phụ đề Vietsub chuẩn",
    "Tốc độ tải nhanh & mượt",
  ];

  const faqs = matched?.faqs || [
    {
      question: `Xem phim thể loại ${name} tại Vam3D có gì nổi bật?`,
      answer: `Toàn bộ phim ${name} tại Vam3D được tuyển chọn với chất lượng hình ảnh Full HD / 4K, âm thanh sống động và phụ đề tiếng Việt cập nhật nhanh nhất.`,
    },
    {
      question: `Có cần đăng ký tài khoản để xem phim ${name} không?`,
      answer: `Bạn có thể xem nhiều phim ${name} hoàn toàn miễn phí. Đăng ký tài khoản VIP để mở khóa toàn bộ kho phim chất lượng cao nhất và không giới hạn.`,
    },
    {
      question: `Lịch cập nhật phim ${name} mới như thế nào?`,
      answer: `Các tập phim và tác phẩm mới thuộc thể loại ${name} được cập nhật liên tục hàng ngày ngay khi có bản phát hành mới nhất.`,
    },
  ];

  return {
    id: dbCategory?.id || matched?.id || 0,
    name,
    slug,
    description,
    longDescription,
    highlights,
    faqs,
  };
}

