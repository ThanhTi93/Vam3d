"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent } from "@/lib/adEligibility";
import { enqueueAdsterraBanner } from "@/lib/adsterraBannerLoader";

interface MobileStickyBannerProps {
  className?: string;
  adKey?: string;
}

const DEFAULT_BANNER_KEY = "651bb3282573ec62f4c54586864916b7";
const SESSION_CLOSED_KEY = "__vam_sticky_banner_closed";
const BLOCKED_PREFIXES = ["/admin", "/login", "/register", "/upgrade"];

/**
 * Sticky Banner 320x50 dành riêng cho Mobile (< 768px):
 * - Dùng unit & key 320x50 độc lập qua domain Anti-Adblock biomanos.org.
 * - Chỉ chạy trên màn hình Mobile thật để tránh impression ẩn trên Desktop.
 * - Chặn Trang Chủ '/', trang quản trị, đăng nhập/nâng cấp, Googlebot và VIP.
 */
export default function MobileStickyBanner({
  className = "",
  adKey = DEFAULT_BANNER_KEY,
}: MobileStickyBannerProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [readyToShow, setReadyToShow] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const slotRef = useRef<HTMLDivElement | null>(null);

  const isBlockedRoute =
    !pathname ||
    pathname === "/" ||
    BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const canShow =
    Boolean(adKey) &&
    enabled &&
    isMobile &&
    !loading &&
    !isBlockedRoute &&
    !isAdFreeUser(user) &&
    !isClosed &&
    readyToShow;

  // 1. Kiểm tra công tắc hệ thống + kích thước màn hình mobile (< 768px)
  useEffect(() => {
    if (typeof window === "undefined" || isBotUserAgent()) return;

    const mq = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mq.matches);
    updateMobile();
    mq.addEventListener("change", updateMobile);

    try {
      if (sessionStorage.getItem(SESSION_CLOSED_KEY) === "true") {
        setIsClosed(true);
      }
    } catch {}

    let cancelled = false;
    getClientAdConfig().then((cfg) => {
      if (!cancelled) setEnabled(cfg.mobileStickyEnabled);
    });

    return () => {
      cancelled = true;
      mq.removeEventListener("change", updateMobile);
    };
  }, []);

  // 2. Đợi 3 giây sau khi mở trang hợp lệ mới hiện thanh dính đáy
  useEffect(() => {
    if (!enabled || !isMobile || loading || isBlockedRoute || isAdFreeUser(user) || isClosed) {
      setReadyToShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setReadyToShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [enabled, isMobile, loading, isBlockedRoute, user, isClosed]);

  // 3. Nạp script 320x50 Anti-Adblock qua hàng đợi tuần tự (làm mới khi chuyển trang SPA)
  useEffect(() => {
    if (!canShow) return;
    const slot = slotRef.current;
    if (!slot) return;

    let cancelled = false;
    enqueueAdsterraBanner({
      key: adKey,
      width: 320,
      height: 50,
      scriptSrc: `https://biomanos.org/22/${adKey}`,
      container: slot,
      isCancelled: () => cancelled,
    });

    return () => {
      cancelled = true;
      slot.innerHTML = "";
    };
  }, [canShow, adKey, pathname]);

  const handleClose = () => {
    setIsClosed(true);
    try {
      sessionStorage.setItem(SESSION_CLOSED_KEY, "true");
    } catch {}
  };

  if (!canShow) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center md:hidden pointer-events-auto bg-[#090a0f]/95 backdrop-blur-md border-t border-white/10 py-1 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom ${className}`}
    >
      <div className="relative w-[320px] h-[50px] flex items-center justify-center">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng quảng cáo"
          className="absolute -top-3 -right-2 bg-neutral-900/90 text-gray-400 hover:text-white border border-white/20 rounded-full p-1 shadow-md text-[10px] flex items-center gap-0.5 px-1.5 cursor-pointer z-50 transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Đóng</span>
        </button>

        <div
          ref={slotRef}
          className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center"
        />
      </div>
    </div>
  );
}
