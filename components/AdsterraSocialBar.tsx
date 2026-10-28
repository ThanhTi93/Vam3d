"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

// Khống chế tần suất thông minh: Giãn cách 4 phút (thích hợp với nhịp xem anime 3D & chuyển tập/gallery)
const SOCIAL_BAR_INTERVAL_MS = 4 * 60 * 1000;
// Độ trễ tối ưu: 5 giây cho trang xem phim, 7 giây cho trang chủ (đảm bảo Core Web Vitals & SEO Googlebot 100%)
const SOCIAL_BAR_DELAY_DEFAULT_MS = 5000;
const SOCIAL_BAR_DELAY_HOME_MS = 7000;
const STORAGE_KEY = "__vam_last_social_bar";

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Chặn bot Google / Web crawlers / Lighthouse để bảo vệ SEO 100%
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i.test(
        navigator.userAgent || ""
      );
    if (isBot) return;

    // 2. Ẩn hoàn toàn với tài khoản VIP hoặc Admin
    const isVipOrAdmin = !!user && ((user.level && user.level > 0) || user.role === "admin");
    if (isVipOrAdmin) return;

    // 3. Không hiện ở trang Admin
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    // 4. KIỂM TRA TẦN SUẤT: Nếu đã hiển thị trong vòng 4 phút qua thì BỎ QUA (tránh spam)
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const timePassed = Date.now() - parseInt(lastShown, 10);
        if (!isNaN(timePassed) && timePassed < SOCIAL_BAR_INTERVAL_MS) {
          return;
        }
      }
    } catch {
      // Fallback nếu trình duyệt chặn localStorage
    }

    // Hủy bỏ timer cũ nếu người dùng chuyển trang nhanh
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 5. NẠP QUẢNG CÁO: 7s nếu ở trang chủ, 5s nếu ở trang xem phim/gallery
    const delayMs = pathname === "/" ? SOCIAL_BAR_DELAY_HOME_MS : SOCIAL_BAR_DELAY_DEFAULT_MS;

    timerRef.current = setTimeout(() => {
      // Dọn dẹp script cũ nếu có trong DOM
      const existingScript = document.querySelector(
        `script[src*="profitableratecpmnetwork.com"], script[src*="f5225b580cef96483ffa330d0aa0a444.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Đánh dấu thời gian đã hiển thị để 4 phút sau mới cho hiện tiếp
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}

      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false"); // Tương thích Cloudflare
      document.head.appendChild(script);
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, searchParams, user]);

  return null;
}
