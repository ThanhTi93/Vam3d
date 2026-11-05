export interface AdUserLike {
  level?: number | null;
  role?: string | null;
  expiredAt?: Date | string | null;
}

const BOT_UA_RE =
  /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i;

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
