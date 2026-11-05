"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent } from "@/lib/adEligibility";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";
const SCRIPT_ATTR = "data-vam-social-bar";

/**
 * Social Bar chuẩn Adsterra: nạp script 1 lần cho cả phiên SPA và để Adsterra
 * tự quản lý tần suất (chỉnh trong dashboard Adsterra), không tự xóa DOM của họ.
 */
export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Chặn trên Trang Chủ '/', trang Admin, và thành viên VIP
  const blocked = !pathname || pathname === "/" || pathname.startsWith("/admin") || isAdFreeUser(user);

  useEffect(() => {
    // 1. Chặn bot thu thập dữ liệu (googlebot, bingbot) để bảo vệ điểm Core Web Vitals & SEO
    const isBot =
      typeof navigator !== "undefined" &&
      (/googlebot|bingbot|crawler/i.test(navigator.userAgent || "") || isBotUserAgent());
    if (typeof window === "undefined" || isBot) return;

    // 2. Chặn tuyệt đối trên Trang Chủ '/'
    if (pathname === "/") return;

    // Đợi xác thực xong để VIP không bị nạp quảng cáo trong lúc chờ /api/auth/me
    if (loading || blocked) return;
    if (document.querySelector(`script[${SCRIPT_ATTR}]`)) return;

    let cancelled = false;
    getClientAdConfig().then((cfg) => {
      if (cancelled || !cfg.socialBarEnabled) return;
      if (document.querySelector(`script[${SCRIPT_ATTR}]`)) return;
      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.setAttribute(SCRIPT_ATTR, "true");
      document.body.appendChild(script);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, loading, blocked]);

  return null;
}
