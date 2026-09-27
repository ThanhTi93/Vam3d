"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Sparkles, LogIn, UserPlus, X, ShieldAlert, Award } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface CultivationLoginNoticeProps {
  className?: string;
  variant?: "banner" | "compact" | "player";
}

export default function CultivationLoginNotice({
  className = "",
  variant = "banner",
}: CultivationLoginNoticeProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState(pathname || "/");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(`${window.location.pathname}${window.location.search}`);
    }
  }, [pathname]);

  // If user is logged in or loading or dismissed, don't show
  if (loading || user || dismissed) return null;

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `/register?callbackUrl=${encodeURIComponent(currentUrl)}`;

  if (variant === "compact") {
    return (
      <div
        className={`bg-gradient-to-r from-orange-950/70 via-[#18110b]/90 to-amber-950/70 border border-orange-500/30 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-4 h-4 animate-pulse fill-orange-500/30" />
          </div>
          <div>
            <span className="font-bold text-white block">
              Đạo hữu chưa đăng nhập tu tiên!
            </span>
            <span className="text-[11px] text-gray-300">
              Đăng nhập để tự động tích luỹ <strong className="text-amber-300">Tu Vi</strong> và nhận <strong className="text-orange-400">Khung Avatar 3D</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <Link
            href={loginUrl}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg shadow transition-all flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng Nhập
          </Link>
          <Link
            href={registerUrl}
            className="text-[11px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            Đăng Ký
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950/80 via-[#1c1209]/95 to-amber-950/80 border-2 border-orange-500/40 p-4 sm:p-5 shadow-2xl shadow-orange-950/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-500 ${className}`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer z-20"
        title="Tạm ẩn thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-0.5 shadow-xl shadow-orange-500/40 animate-pulse">
              <div className="w-full h-full bg-[#131520] rounded-[14px] flex items-center justify-center text-orange-400">
                <Flame className="w-7 h-7 fill-orange-500/20" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow">
              HOT
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Đạo Hữu Chưa Gia Nhập Tu Tiên Giới!</span>
              </h3>
              <span className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Bắt đầu từ Phàm Nhân
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed max-w-3xl">
              Hãy <strong className="text-orange-400 font-bold">Đăng nhập trước khi xem</strong> để tự động tích lũy{" "}
              <strong className="text-amber-300 font-bold">Tu Vi</strong> (lượt xem), đột phá qua 10 đại cảnh giới từ{" "}
              <span className="text-gray-200 underline decoration-orange-500/50">Phàm Nhân ➔ Trúc Cơ ➔ Hợp Thể ➔ Đạo Tổ</span>, mở khóa{" "}
              <strong className="text-orange-400 font-bold">Khung Avatar 3D độc quyền</strong> và ghi danh trên{" "}
              <strong className="text-amber-400 font-bold">Bảng Xếp Hạng Tu Tiên</strong>!
            </p>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center pt-2 lg:pt-0">
          <Link
            href={loginUrl}
            className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer border border-orange-400/40"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập Tu Tiên</span>
          </Link>

          <Link
            href={registerUrl}
            className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 hover:border-orange-500/40 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-gray-400" />
            <span>Đăng Ký</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
