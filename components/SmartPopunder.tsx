"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface SmartPopunderProps {
  /** Số giờ giãn cách giữa 2 lần nổ Popunder cho 1 khách truy cập (Mặc định: 12 giờ) */
  intervalHours?: number;
  /** Link trực tiếp Adsterra Smartlink/Direct Link hoặc URL tài trợ */
  directLinkUrl?: string;
  /** Bật/tắt */
  enabled?: boolean;
}

const STORAGE_KEY = "__vam_last_smart_pop";

// Link Adsterra Smartlink / Direct Link (hoặc link tài trợ tương thích CPM cao)
const DEFAULT_DIRECT_LINK =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

export default function SmartPopunder({
  intervalHours = 12,
  directLinkUrl,
  enabled = true,
}: SmartPopunderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const hasTriggeredRef = useRef(false);
  const configRef = useRef<{ url: string; interval: number; isEnabled: boolean }>({
    url: directLinkUrl || "",
    interval: intervalHours,
    isEnabled: enabled,
  });

  // Tự động đồng bộ cấu hình từ API nếu chưa truyền trực tiếp
  useEffect(() => {
    if (directLinkUrl !== undefined) {
      configRef.current.url = directLinkUrl;
    } else {
      fetch("/api/ads/config")
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && json?.data) {
            if (json.data.popunderUrl) configRef.current.url = json.data.popunderUrl;
            if (json.data.popunderIntervalHours) configRef.current.interval = json.data.popunderIntervalHours;
            if (json.data.popunderEnabled !== undefined) configRef.current.isEnabled = json.data.popunderEnabled;
          }
        })
        .catch(() => {});
    }
  }, [directLinkUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || !configRef.current.isEnabled) return;

    // 1. Chặn bot Google / Web crawlers / Lighthouse để bảo vệ SEO 100%
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i.test(
        navigator.userAgent || ""
      );
    if (isBot) return;

    // 2. Ẩn hoàn toàn với tài khoản VIP hoặc Admin
    const isVipOrAdmin = !!user && ((user.level && user.level > 0) || user.role === "admin");
    if (isVipOrAdmin) return;

    // 3. Không kích hoạt trong trang Admin
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    // 4. KIỂM TRA TẦN SUẤT: Nếu đã nổ trong vòng X giờ qua thì KHÔNG bật
    try {
      const lastPop = localStorage.getItem(STORAGE_KEY);
      if (lastPop) {
        const timePassedMs = Date.now() - parseInt(lastPop, 10);
      const maxIntervalMs = (configRef.current.interval || intervalHours) * 3600 * 1000;
      if (!isNaN(timePassedMs) && timePassedMs < maxIntervalMs) {
        // Chưa đủ thời gian giãn cách
        return;
      }
    }
  } catch {
    // Fallback nếu chặn localStorage
  }

  // 5. Lắng nghe cú click thật đầu tiên của người dùng (User gesture)
  const handleUserInteraction = (event: MouseEvent | TouchEvent) => {
    if (hasTriggeredRef.current) return;

    // Không popunder nếu click vào thanh điều hướng đăng nhập hoặc admin
    const target = event.target as HTMLElement | null;
    if (target && target.closest("a[href^='/admin'], a[href^='/login'], button[data-no-pop='true']")) {
      return;
    }

    hasTriggeredRef.current = true;

    // Đánh dấu thời gian đã nổ vào localStorage ngay lập tức
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {}

    // Gỡ bỏ toàn bộ event listener ngay lập tức để không ảnh hưởng các click tiếp theo
    cleanupListeners();

    // Kích hoạt mở Popunder/Direct Link ngầm
    const targetUrl = configRef.current.url?.trim() || DEFAULT_DIRECT_LINK;
    if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
      try {
        const newWindow = window.open(targetUrl, "_blank");
        if (newWindow) {
          // Đưa cửa sổ hiện tại trở lại tiêu điểm (Focus) để người xem tiếp tục xem phim
          window.focus();
        }
      } catch {
        // Trình duyệt chặn pop-up thì bỏ qua êm đẹp
      }
    }
  };

    const cleanupListeners = () => {
      window.removeEventListener("click", handleUserInteraction, true);
      window.removeEventListener("touchend", handleUserInteraction, true);
    };

    // Đợi 2 giây sau khi load trang rồi mới gắn listener để tránh xung đột tải trang
    const timer = setTimeout(() => {
      window.addEventListener("click", handleUserInteraction, { capture: true, once: true });
      window.addEventListener("touchend", handleUserInteraction, { capture: true, once: true });
    }, 2000);

    return () => {
      clearTimeout(timer);
      cleanupListeners();
    };
  }, [pathname, user, intervalHours, directLinkUrl, enabled]);

  return null;
}
