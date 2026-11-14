export interface AdUserLike {
  level?: number | null;
  role?: string | null;
  expiredAt?: Date | string | null;
}

const BOT_UA_RE =
  /bot|googlebot|googleother|crawler|spider|robot|crawling|lighthouse|google-inspectiontool|headlesschrome|bingpreview|slurp/i;

export function isBotUserAgent(): boolean {
  if (typeof navigator === "undefined") return true;
  return BOT_UA_RE.test(navigator.userAgent || "");
}

/** Admin hoặc VIP còn hạn thì không hiện quảng cáo. VIP hết hạn vẫn xem quảng cáo. */
export function isAdFreeUser(user: AdUserLike | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.level || user.level <= 0) return false;
  // Giống quy ước trong Header/UpgradePage: không có expiredAt = coi như hết hạn
  if (!user.expiredAt) return false;
  const exp = new Date(user.expiredAt).getTime();
  return !isNaN(exp) && exp > Date.now();
}

/**
 * Các route cấm hiển thị quảng cáo 100% để bảo vệ SEO, trang chủ và các danh mục nhạy cảm:
 * - Trang Chủ '/'
 * - Danh mục Sex AI ('/sex-ai', '/anh-sex-ai')
 * - Các trang bảo mật, đăng nhập, thanh toán, quản trị
 */
export function isAdBlockedRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  const clean = pathname.toLowerCase().trim();
  if (clean === "/" || clean === "") return true;

  const blockedPrefixes = [
    "/admin",
    "/login",
    "/register",
    "/upgrade",
    "/challenge",
    "/unauthorized",
    "/sex-ai",
    "/anh-sex-ai",
  ];

  return blockedPrefixes.some(
    (prefix) => clean === prefix || clean.startsWith(prefix + "/") || clean.startsWith(prefix + "?")
  );
}
