"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

// Khống chế tần suất thông minh: Giãn cách 8 phút (vừa khít 1 tập phim 3D, chuyển tập mới kích hoạt lại, tránh bão hòa làm giảm CPM)
const SOCIAL_BAR_INTERVAL_MS = 8 * 60 * 1000;
// Độ trễ tối ưu: Đợi 5 giây sau khi vào trang xem phim/gallery để người dùng bấm Play ổn định, tỷ lệ chú ý & CTR cao nhất
const SOCIAL_BAR_DELAY_MS = 5000;
const STORAGE_KEY = "__vam_last_social_bar";

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  const epParam = searchParams?.get("ep") || "";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Chặn bot Google / Web crawlers / Lighthouse để bảo vệ SEO 100%
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i.test(
        navigator.userAgent || ""
      );
    if (isBot) return;

    // 2. Ẩn hoàn toàn với tài khoản VIP hoặc Admin
    const currentUser = userRef.current;
    const isVipOrAdmin =
      !!currentUser && ((currentUser.level && currentUser.level > 0) || currentUser.role === "admin");
    if (isVipOrAdmin) return;

    // 3. Không hiện ở trang Admin và trang chủ "/" (dành trọn 100% lượt nổ cho trang Xem Phim & Gallery nơi CTR đạt 40-50%)
    if (!pathname || pathname.startsWith("/admin") || pathname === "/") {
      return;
    }

    // 4. KIỂM TRA TẦN SUẤT: Nếu đã hiển thị trong vòng 8 phút qua thì BỎ QUA (tránh spam làm tụt CPM)
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

    // 5. NẠP QUẢNG CÁO SAU 5 GIÂY Ở TRANG NỘI DUNG
    timerRef.current = setTimeout(() => {
      // Kiểm tra lại VIP/Admin tại thời điểm nạp (phòng trường hợp AuthContext vừa tải xong)
      const latestUser = userRef.current;
      if (latestUser && ((latestUser.level && latestUser.level > 0) || latestUser.role === "admin")) {
        return;
      }

      // Dọn dẹp script cũ nếu có trong DOM để kích hoạt lại mượt mà
      const existingScript = document.querySelector(
        `script[src*="profitableratecpmnetwork.com"], script[src*="f5225b580cef96483ffa330d0aa0a444.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Đánh dấu thời gian đã hiển thị
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
  }, [pathname, epParam]);

  return null;
}
