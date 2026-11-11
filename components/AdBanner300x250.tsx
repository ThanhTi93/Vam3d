"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent } from "@/lib/adEligibility";
import { enqueueAdsterraBanner } from "@/lib/adsterraBannerLoader";

interface AdBanner300x250Props {
  className?: string;
  adKey?: string; // Đổi adKey khi đổi tập để tải mới quảng cáo
}

const BANNER_KEY = "a1c807f9e14c4acd0b1f92582a15c657";
const INVOKE_SRC = `https://biomanos.org/22/${BANNER_KEY}`;

export default function AdBanner300x250({ className = "", adKey }: AdBanner300x250Props) {
  const { user, loading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);

  const canShow = enabled && !loading && !isAdFreeUser(user);

  // 1. Đọc công tắc BẬT/TẮT trong Admin
  useEffect(() => {
    if (isBotUserAgent()) return;
    let cancelled = false;
    getClientAdConfig().then((cfg) => {
      if (!cancelled) setEnabled(cfg.banner300Enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Chỉ nạp khi gần vào màn hình
  useEffect(() => {
    if (!canShow) return;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canShow]);

  // 3. Nhúng script Anti-Adblock theo hàng đợi tuần tự để không xung đột window.atOptions
  //    với MobileStickyBanner (320x50). Đổi adKey (đổi tập) thì nạp lại quảng cáo mới.
  useEffect(() => {
    if (!canShow || !isVisible) return;
    const slot = slotRef.current;
    if (!slot) return;

    let cancelled = false;
    enqueueAdsterraBanner({
      key: BANNER_KEY,
      width: 300,
      height: 250,
      scriptSrc: INVOKE_SRC,
      container: slot,
      isCancelled: () => cancelled,
    });

    return () => {
      cancelled = true;
      slot.innerHTML = "";
    };
  }, [canShow, isVisible, adKey]);

  if (!canShow) return null;

  return (
    <div ref={wrapperRef} className={`my-6 flex flex-col items-center justify-center w-full ${className}`}>
      <span className="text-[10px] tracking-wider uppercase text-gray-500 mb-1 select-none">
        Quảng cáo
      </span>
      <div
        ref={slotRef}
        className="w-[300px] h-[250px] overflow-hidden rounded-md bg-[#13161f] shadow-lg flex items-center justify-center border border-gray-800/40"
      />
    </div>
  );
}
