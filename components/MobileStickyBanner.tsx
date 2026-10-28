"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { X } from "lucide-react";

interface MobileStickyBannerProps {
  className?: string;
  adKey?: string;
}

const DEFAULT_BANNER_KEY = "a1c807f9e14c4acd0b1f92582a15c657";
const SESSION_CLOSED_KEY = "__vam_sticky_banner_closed";

export default function MobileStickyBanner({ className = "", adKey = DEFAULT_BANNER_KEY }: MobileStickyBannerProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [canShow, setCanShow] = useState(false);
  const [isClosed, setIsClosed] = useState(true);

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

    // 4. Kiểm tra xem người dùng đã bấm tắt trong phiên hiện tại chưa
    try {
      const closed = sessionStorage.getItem(SESSION_CLOSED_KEY);
      if (closed === "true") {
        return;
      }
    } catch {}

    // Đợi 3 giây sau khi tải trang để không cản trở tương tác ban đầu
    const timer = setTimeout(() => {
      setCanShow(true);
      setIsClosed(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, user]);

  const handleClose = () => {
    setIsClosed(true);
    try {
      sessionStorage.setItem(SESSION_CLOSED_KEY, "true");
    } catch {}
  };

  if (!canShow || isClosed) return null;

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: transparent; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      width: 320px; 
      height: 50px; 
      overflow: hidden; 
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${adKey}',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${adKey}/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center md:hidden pointer-events-auto bg-[#090a0f]/95 backdrop-blur-md border-t border-white/10 py-1 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom ${className}`}
    >
      <div className="relative w-[320px] h-[50px] flex items-center justify-center">
        {/* Nút đóng banner nhẹ nhàng */}
        <button
          onClick={handleClose}
          aria-label="Đóng quảng cáo"
          className="absolute -top-3 -right-2 bg-neutral-900/90 text-gray-400 hover:text-white border border-white/20 rounded-full p-1 shadow-md text-[10px] flex items-center gap-0.5 px-1.5 cursor-pointer z-50 transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Đóng</span>
        </button>

        {/* Khung iframe banner 320x50 */}
        <iframe
          title="Mobile Sponsor Banner"
          srcDoc={srcDoc}
          width={320}
          height={50}
          scrolling="no"
          style={{ border: 0, width: "320px", height: "50px", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}
