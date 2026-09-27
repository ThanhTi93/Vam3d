export interface CultivationRealm {
  id: string;
  name: string;
  title: string;
  requiredViews: number;
  tier: number; // 1 to 10
  color: string;
  gradient: string;
  borderGlow: string;
  haloClass: string;
  bgGradient: string;
  lore: string;
  topperIcon: "dao_to" | "dai_thua" | "hop_the" | "luyen_hu" | "hoa_than" | "nguyen_anh" | "ket_dan" | "truc_co" | "luyen_khi" | "pham_nhan";
}

export const CULTIVATION_REALMS: CultivationRealm[] = [
  {
    id: "dao_to",
    name: "Đạo Tổ",
    title: "Chí Tôn Đạo Tổ (Chân Tiên)",
    requiredViews: 1000000,
    tier: 10,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #FFE066 0%, #F59E0B 45%, #B45309 100%)",
    borderGlow: "rgba(245, 158, 11, 0.8)",
    haloClass: "animate-gold-halo",
    bgGradient: "from-amber-500/25 via-yellow-500/15 to-transparent",
    lore: "Vượt qua vạn kiếp phi thăng Tiên Giới, chưởng khống Thiên Đạo pháp tắc, cử thế vô song như Hàn Lập!",
    topperIcon: "dao_to",
  },
  {
    id: "dai_thua",
    name: "Đại Thừa",
    title: "Đại Thừa Tông Sư",
    requiredViews: 500000,
    tier: 9,
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #F3E8FF 0%, #C084FC 40%, #7E22CE 85%, #581C87 100%)",
    borderGlow: "rgba(168, 85, 247, 0.75)",
    haloClass: "animate-silver-halo",
    bgGradient: "from-purple-500/25 via-fuchsia-500/15 to-transparent",
    lore: "Đỉnh phong Linh Giới, pháp lực thông thiên triệt địa, chuẩn bị tiếp đón Cửu Cửu Lôi Kiếp phi thăng.",
    topperIcon: "dai_thua",
  },
  {
    id: "hop_the",
    name: "Hợp Thể",
    title: "Hợp Thể Chân Nhân",
    requiredViews: 100000,
    tier: 8,
    color: "#EA580C",
    gradient: "linear-gradient(135deg, #FED7AA 0%, #F97316 45%, #C2410C 85%, #7C2D12 100%)",
    borderGlow: "rgba(234, 88, 12, 0.75)",
    haloClass: "animate-bronze-halo",
    bgGradient: "from-orange-500/25 via-amber-500/15 to-transparent",
    lore: "Pháp tướng thiên địa, chân thân hợp nhất cùng linh giới nguyên khí, bá chủ một phương.",
    topperIcon: "hop_the",
  },
  {
    id: "luyen_hu",
    name: "Luyện Hư",
    title: "Luyện Hư Thượng Nhân",
    requiredViews: 50000,
    tier: 7,
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #CFFAFE 0%, #22D3EE 45%, #0891B2 85%, #164E63 100%)",
    borderGlow: "rgba(6, 182, 212, 0.65)",
    haloClass: "animate-silver-halo",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    lore: "Ngũ hành quy nhất, mượn nhờ thiên địa lực lượng, không còn bị thiên kiếp phàm trần trói buộc.",
    topperIcon: "luyen_hu",
  },
  {
    id: "hoa_than",
    name: "Hóa Thần",
    title: "Hóa Thần Tôn Giả",
    requiredViews: 25000,
    tier: 6,
    color: "#10B981",
    gradient: "linear-gradient(135deg, #D1FAE5 0%, #34D399 45%, #059669 85%, #064E3B 100%)",
    borderGlow: "rgba(16, 185, 129, 0.6)",
    haloClass: "animate-bronze-halo",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    lore: "Thiên địa nguyên khí quán đỉnh, cởi bỏ phàm thai, tìm kiếm thông thiên linh bảo phá giới phi thăng.",
    topperIcon: "hoa_than",
  },
  {
    id: "nguyen_anh",
    name: "Nguyên Anh",
    title: "Nguyên Anh Lão Quái",
    requiredViews: 10000,
    tier: 5,
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #818CF8 45%, #4F46E5 85%, #312E81 100%)",
    borderGlow: "rgba(99, 102, 241, 0.6)",
    haloClass: "animate-silver-halo",
    bgGradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    lore: "Phá đan hóa anh, thọ mệnh ngàn năm, nguyên anh xuất khiếu di sơn đảo hải, xưng bá một cõi Nhân Giới.",
    topperIcon: "nguyen_anh",
  },
  {
    id: "ket_dan",
    name: "Kết Đan",
    title: "Kim Đan Chân Tu",
    requiredViews: 5000,
    tier: 4,
    color: "#EAB308",
    gradient: "linear-gradient(135deg, #FEF08A 0%, #EAB308 45%, #A16207 85%, #713F12 100%)",
    borderGlow: "rgba(234, 179, 8, 0.55)",
    haloClass: "animate-gold-halo",
    bgGradient: "from-yellow-500/15 via-amber-500/10 to-transparent",
    lore: "Ngưng kết Kim Đan cửu chuyển, đan hỏa thuần thục, thọ nguyên kéo dài đến ngũ bách niên.",
    topperIcon: "ket_dan",
  },
  {
    id: "truc_co",
    name: "Trúc Cơ",
    title: "Trúc Cơ Tu Sĩ",
    requiredViews: 1000,
    tier: 3,
    color: "#38BDF8",
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #38BDF8 50%, #0369A1 100%)",
    borderGlow: "rgba(56, 189, 248, 0.5)",
    haloClass: "animate-silver-halo",
    bgGradient: "from-sky-500/15 via-blue-500/10 to-transparent",
    lore: "Uống Trúc Cơ Đan tẩy tủy phạt mao, đúc thành tiên cơ, ngự kiếm phi hành du ngoạn nhân gian.",
    topperIcon: "truc_co",
  },
  {
    id: "luyen_khi",
    name: "Luyện Khí",
    title: "Luyện Khí Đệ Tử",
    requiredViews: 100,
    tier: 2,
    color: "#94A3B8",
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 50%, #64748B 100%)",
    borderGlow: "rgba(148, 163, 184, 0.4)",
    haloClass: "animate-silver-halo",
    bgGradient: "from-slate-500/10 via-slate-600/5 to-transparent",
    lore: "Cảm ứng thiên địa linh khí, dẫn khí nhập thể, bắt đầu bước những bước đầu tiên trên tiên đồ.",
    topperIcon: "luyen_khi",
  },
  {
    id: "pham_nhan",
    name: "Phàm Nhân",
    title: "Phàm Nhân Nhập Đạo",
    requiredViews: 0,
    tier: 1,
    color: "#6B7280",
    gradient: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 50%, #374151 100%)",
    borderGlow: "rgba(107, 114, 128, 0.3)",
    haloClass: "",
    bgGradient: "from-gray-500/10 to-transparent",
    lore: "Người phàm trần chưa bước vào tu chân giới. Hãy xem phim để tích lũy tu vi đột phá cảnh giới!",
    topperIcon: "pham_nhan",
  },
];

/**
 * Lấy cảnh giới hiện tại dựa trên số lượt xem (tu vi)
 */
export function getCultivationRealm(views: number): CultivationRealm {
  const safeViews = Math.max(0, Number(views) || 0);
  for (const realm of CULTIVATION_REALMS) {
    if (safeViews >= realm.requiredViews) {
      return realm;
    }
  }
  return CULTIVATION_REALMS[CULTIVATION_REALMS.length - 1];
}

/**
 * Tính toán cảnh giới tiếp theo và tiến độ phần trăm (%) đột phá
 */
export function getNextRealmProgress(views: number): {
  currentRealm: CultivationRealm;
  nextRealm: CultivationRealm | null;
  neededViews: number;
  progressPercent: number;
} {
  const safeViews = Math.max(0, Number(views) || 0);
  const currentRealm = getCultivationRealm(safeViews);

  const currentIndex = CULTIVATION_REALMS.findIndex((r) => r.id === currentRealm.id);
  const nextRealm = currentIndex > 0 ? CULTIVATION_REALMS[currentIndex - 1] : null;

  if (!nextRealm) {
    return {
      currentRealm,
      nextRealm: null,
      neededViews: 0,
      progressPercent: 100,
    };
  }

  const baseViews = currentRealm.requiredViews;
  const targetViews = nextRealm.requiredViews;
  const viewsEarnedInRealm = Math.max(0, safeViews - baseViews);
  const viewsSpan = Math.max(1, targetViews - baseViews);
  const progressPercent = Math.min(99, Math.round((viewsEarnedInRealm / viewsSpan) * 100));

  return {
    currentRealm,
    nextRealm,
    neededViews: Math.max(0, targetViews - safeViews),
    progressPercent,
  };
}
