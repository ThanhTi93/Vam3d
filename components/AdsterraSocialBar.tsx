"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

// Khống chế tần suất: Chỉ xuất hiện tối đa 1 lần mỗi 20 phút cho mỗi người dùng
const SOCIAL_BAR_INTERVAL_MS = 20 * 60 * 1000;
// Độ trễ thông minh: Đợi 15 giây sau khi vào trang xem phim để người dùng bấm Play ổn định, tránh click nhầm
const SOCIAL_BAR_DELAY_MS = 15000;
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

    // 3. Không hiện ở trang Admin và trang chủ "/" (giữ trang chủ sạch bóng, chuẩn Core Web Vitals)
    if (!pathname || pathname.startsWith("/admin") || pathname === "/") {
      return;
    }

    // 4. KIỂM TRA TẦN SUẤT: Nếu đã hiển thị trong vòng 20 phút qua thì BỎ QUA (không hiện lại khi đổi tập)
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const timePassed = Date.now() - parseInt(lastShown, 10);
        if (!isNaN(timePassed) && timePassed < SOCIAL_BAR_INTERVAL_MS) {
          // Chưa đủ 20 phút, không kích hoạt
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

    // 5. NẠP QUẢNG CÁO SAU 15 GIÂY (Cho người dùng xem phim mượt mà, không giật màn hình)
    timerRef.current = setTimeout(() => {
      // Dọn dẹp script cũ nếu có trong DOM
      const existingScript = document.querySelector(
        `script[src*="profitableratecpmnetwork.com"], script[src*="f5225b580cef96483ffa330d0aa0a444.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Đánh dấu thời gian đã hiển thị để 20 phút sau mới cho hiện tiếp
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}

      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false"); // Tương thích Cloudflare
      document.head.appendChild(script);
    }, SOCIAL_BAR_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, searchParams, user]);

  return null;
}
