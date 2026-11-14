"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent, isAdBlockedRoute } from "@/lib/adEligibility";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://biomanos.org/14/f5225b580cef96483ffa330d0aa0a444";
const SCRIPT_ATTR = "data-vam-social-bar";

/**
 * Social Bar chuẩn Adsterra: nạp script 1 lần cho cả phiên SPA và để Adsterra
 * tự quản lý tần suất (chỉnh trong dashboard Adsterra), không tự xóa DOM của họ.
 * Chặn 100% trên Trang Chủ '/', '/sex-ai', '/anh-sex-ai', Admin, và VIP.
 */
export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Chặn trên Trang Chủ '/', /sex-ai, /anh-sex-ai, trang Admin, và thành viên VIP
  const isBlocked = isAdBlockedRoute(pathname);
  const blocked = isBlocked || isAdFreeUser(user);

  useEffect(() => {
    // 1. Chặn bot thu thập dữ liệu (googlebot, bingbot) để bảo vệ điểm Core Web Vitals & SEO
    const isBot =
      typeof navigator !== "undefined" &&
      (/googlebot|bingbot|crawler/i.test(navigator.userAgent || "") || isBotUserAgent());
    if (typeof window === "undefined" || isBot) return;

    // 2. Chặn tuyệt đối trên Trang Chủ '/', /sex-ai, /anh-sex-ai
    if (isBlocked) {
      // Dọn dẹp script & container nếu người dùng vừa chuyển trang sang route bị chặn
      const existingScript = document.querySelector(`script[${SCRIPT_ATTR}]`);
      if (existingScript) existingScript.remove();
      return;
    }

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
