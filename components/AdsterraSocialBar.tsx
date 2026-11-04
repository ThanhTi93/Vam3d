"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";

const ADSTERRA_SOCIAL_BAR_SRC =
  "https://pl31617679.profitableratecpmnetwork.com/f5/22/5b/f5225b580cef96483ffa330d0aa0a444.js";

// Khống chế tần suất thông minh: Giãn cách 4 phút giữa các lần đổi tập
const SOCIAL_BAR_INTERVAL_MS = 4 * 60 * 1000;
// Độ trễ tối ưu: Đợi 6 giây sau khi vào trang xem phim/gallery để người dùng bấm Play ổn định
const SOCIAL_BAR_DELAY_MS = 6000;
// Thời gian hiển thị tối đa: Đúng 12 giây, sau đó tự động gỡ sạch để không làm phiền người xem
const SOCIAL_BAR_DISPLAY_DURATION_MS = 12000;
const STORAGE_KEY = "__vam_last_social_bar";

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const isSuppressedRef = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  const epParam = searchParams?.get("ep") || "";

  // Dọn dẹp triệt để các phần tử DOM mà script Adsterra Social Bar tự sinh ra
  const cleanupSocialBarDom = () => {
    try {
      // 1. Gỡ script Adsterra
      const scripts = document.querySelectorAll(
        'script[src*="profitableratecpmnetwork.com"], script[src*="f5225b580cef96483ffa330d0aa0a444.js"]'
      );
      scripts.forEach((s) => s.remove());

      // 2. Gỡ các container / iframe quảng cáo của Adsterra
      const adsterraSelectors = [
        'iframe[src*="profitableratecpmnetwork.com"]',
        'iframe[src*="profitablecpmrate.com"]',
        '[id*="asg-"]',
        '[class*="asg-"]',
        '[id*="adsterra"]',
        '[class*="adsterra"]',
        'div[data-zone-id="31617679"]',
      ];
      document.querySelectorAll(adsterraSelectors.join(", ")).forEach((el) => el.remove());

      // 3. Quét các thẻ div floating cố định góc màn hình có z-index cực cao do Adsterra tạo ra
      const allBodyChildren = Array.from(document.body.children);
      for (const el of allBodyChildren) {
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex, 10);
        const isFixed = style.position === "fixed" || style.position === "absolute";
        const innerText = el.innerHTML || "";
        const matchesAdsterra =
          innerText.includes("profitableratecpmnetwork") ||
          innerText.includes("profitablecpmrate") ||
          innerText.includes("aa0a444") ||
          el.id.startsWith("asg-");

        if (isFixed && (matchesAdsterra || zIndex > 999999)) {
          el.style.display = "none";
          el.remove();
        }
      }
    } catch (e) {
      console.warn("Lỗi dọn dẹp Adsterra Social Bar:", e);
    }
  };

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

    // 3. Không hiện ở trang Admin và trang chủ "/"
    if (!pathname || pathname.startsWith("/admin") || pathname === "/") {
      return;
    }

    // 4. KIỂM TRA TẦN SUẤT: Nếu đã hiển thị trong vòng 4 phút qua thì BỎ QUA
    try {
      const sessionKey = `__vam_social_bar_${pathname}_${epParam}`;
      if (sessionStorage.getItem(sessionKey)) {
        return; // Đã hiện trong tập này của phiên làm việc
      }

      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const timePassed = Date.now() - parseInt(lastShown, 10);
        if (!isNaN(timePassed) && timePassed < SOCIAL_BAR_INTERVAL_MS) {
          return;
        }
      }
    } catch {
      // Fallback nếu trình duyệt chặn storage
    }

    // Reset cờ ngăn chặn khi bắt đầu chu kỳ mới
    isSuppressedRef.current = false;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Hủy các timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }

    // 5. NẠP QUẢNG CÁO SAU ĐÚNG 6 GIÂY
    timerRef.current = setTimeout(async () => {
      const latestUser = userRef.current;
      if (latestUser && ((latestUser.level && latestUser.level > 0) || latestUser.role === "admin")) {
        return;
      }

      // Kiểm tra công tắc BẬT/TẮT trong Admin
      const adCfg = await getClientAdConfig();
      if (!adCfg.socialBarEnabled) {
        return;
      }

      // Dọn dẹp DOM cũ trước khi nạp
      cleanupSocialBarDom();

      // Đánh dấu đã hiển thị cho tập này và thời gian hiện tại
      try {
        const sessionKey = `__vam_social_bar_${pathname}_${epParam}`;
        sessionStorage.setItem(sessionKey, "1");
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}

      // Bơm script Adsterra
      const script = document.createElement("script");
      script.src = ADSTERRA_SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      document.head.appendChild(script);

      // 6. TỰ ĐỘNG TRIỆT TIÊU VÒNG LẶP ADSTERRA SAU 12 GIÂY HIỂN THỊ
      autoHideTimerRef.current = setTimeout(() => {
        isSuppressedRef.current = true;
        cleanupSocialBarDom();

        // Kích hoạt MutationObserver để tiêu diệt bất kỳ popup Adsterra nào cố tình nhảy ra thêm
        if (typeof MutationObserver !== "undefined") {
          const obs = new MutationObserver((mutations) => {
            if (!isSuppressedRef.current) return;
            for (const mutation of mutations) {
              for (const node of Array.from(mutation.addedNodes)) {
                if (!(node instanceof HTMLElement)) continue;
                const innerText = node.innerHTML || "";
                const isAdsterraNode =
                  innerText.includes("profitableratecpmnetwork") ||
                  innerText.includes("profitablecpmrate") ||
                  node.id.startsWith("asg-") ||
                  node.className.includes("asg-");
                if (isAdsterraNode) {
                  node.style.display = "none";
                  node.remove();
                }
              }
            }
          });
          obs.observe(document.body, { childList: true, subtree: true });
          observerRef.current = obs;
        }
      }, SOCIAL_BAR_DISPLAY_DURATION_MS);
    }, SOCIAL_BAR_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [pathname, epParam]);

  return null;
}
