"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent } from "@/lib/adEligibility";

interface AdGalleryNativeBannerProps {
  className?: string;
  refreshKey?: string;
}

const NATIVE_SCRIPT_SRC =
  "https://biomanos.org/21/0e9eb19de72ab9f4abbaae739e8a148c";
const NATIVE_CONTAINER_ID = "container-0e9eb19de72ab9f4abbaae739e8a148c";

export default function AdGalleryNativeBanner({
  className = "",
  refreshKey = "gallery",
}: AdGalleryNativeBannerProps) {
  const { user, loading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ẩn với bot, Admin, VIP còn hạn; đợi xác thực xong mới nạp
  const canShow = enabled && !loading && !isAdFreeUser(user);

  useEffect(() => {
    // Chặn bot tìm kiếm (googlebot, bingbot) để tối ưu SEO và Core Web Vitals
    const isBot =
      typeof navigator !== "undefined" &&
      (/googlebot|bingbot|crawler/i.test(navigator.userAgent || "") || isBotUserAgent());
    if (isBot) return;
    let cancelled = false;
    getClientAdConfig().then((cfg) => {
      if (!cancelled) setEnabled(cfg.nativeBannerEnabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 3. Lazy-load bằng IntersectionObserver để đảm bảo 100% Viewability & 0 ảnh hưởng Core Web Vitals
  useEffect(() => {
    if (!canShow) return;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [canShow, refreshKey]);

  // 4. Nạp script Native Banner của Adsterra khi vùng chứa hiển thị & hỗ trợ chuyển trang SPA mượt mà
  useEffect(() => {
    if (!canShow || !isVisible || typeof document === "undefined") return;

    const containerEl = containerRef.current;
    if (!containerEl) return;

    // Làm sạch script & nội dung cũ khi chuyển bộ sưu tập trong SPA
    const oldScripts = document.querySelectorAll(
      'script[data-adsterra-gallery-native="true"]'
    );
    oldScripts.forEach((s) => s.remove());
    containerEl.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("async", "async");
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-adsterra-gallery-native", "true");
    script.src = NATIVE_SCRIPT_SRC;

    containerEl.parentNode?.insertBefore(script, containerEl);

    return () => {
      script.remove();
      containerEl.innerHTML = "";
    };
  }, [canShow, isVisible, refreshKey]);

  if (!canShow) return null;

  return (
    <div
      ref={wrapperRef}
      className={`my-5 w-full flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-5xl rounded-2xl bg-[#131520]/60 border border-white/5 px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] tracking-wider uppercase text-gray-500 select-none">
            Gợi ý tài trợ
          </span>
        </div>
        <div
          id={NATIVE_CONTAINER_ID}
          ref={containerRef}
          className="w-full min-h-[90px] flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}

