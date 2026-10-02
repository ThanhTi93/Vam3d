"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Tránh nạp quảng cáo cho Googlebot / Web crawlers / Lighthouse để bảo vệ SEO 100%
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i.test(
        navigator.userAgent || ""
      );
    if (isBot) return;

    // 2. Ẩn quảng cáo nếu người dùng là tài khoản VIP hoặc Admin
    const isVipOrAdmin = !!user && ((user.level && user.level > 0) || user.role === "admin");
    if (isVipOrAdmin) return;

    // 3. Không hiện ở trang Admin và trang chủ "/" (giữ trang chủ sạch bóng, chuẩn Core Web Vitals)
    if (!pathname || pathname.startsWith("/admin") || pathname === "/") {
      return;
    }

    // 4. Nếu đã nạp script rồi thì không nạp lại
    if (loadedRef.current) return;

    // 5. Lazy-load thông minh: Đợi 3.5 giây sau khi trang tải xong hoặc đợi người dùng tương tác đầu tiên
    const injectScript = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;

      // Kiểm tra nếu script đã tồn tại trong DOM
      if (document.querySelector(`script[src="${ADSTERRA_SOCIAL_BAR_SRC}"]`)) {
        return;
      }

      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false"); // Tương thích Cloudflare
      document.head.appendChild(script);

      // Dọn dẹp listener tương tác
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("click", onFirstInteraction);
    };

    const onFirstInteraction = () => {
      injectScript();
    };

    // Lắng nghe tương tác người dùng
    window.addEventListener("scroll", onFirstInteraction, { passive: true, once: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true, once: true });
    window.addEventListener("click", onFirstInteraction, { passive: true, once: true });

    // Fallback: Tự động nạp sau 3.5s nếu người dùng không cuộn
    const timer = setTimeout(injectScript, 3500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("click", onFirstInteraction);
    };
  }, [pathname, user]);

  return null;
}
