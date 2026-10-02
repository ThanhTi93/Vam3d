"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lastUrlRef = useRef<string>("");

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

    const currentUrl = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastUrlRef.current === currentUrl) return;
    lastUrlRef.current = currentUrl;

    let timer: NodeJS.Timeout;

    // 4. Kích hoạt quảng cáo khi người dùng vào tập phim, đổi tập phim, vào bộ sưu tập ảnh, hoặc diễn viên/nhân vật
    const injectScript = () => {
      // Dọn dẹp script cũ nếu có để re-trigger mượt mà trên trang / tập phim mới
      const existingScript = document.querySelector(
        `script[src*="profitableratecpmnetwork.com"], script[src*="f5225b580cef96483ffa330d0aa0a444.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false"); // Tương thích Cloudflare
      document.head.appendChild(script);

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

    // Tự động nạp sau 3 giây nếu người dùng chưa tương tác
    timer = setTimeout(injectScript, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("click", onFirstInteraction);
    };
  }, [pathname, searchParams, user]);

  return null;
}
