"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getClientAdConfig } from "@/lib/adConfigClient";
import { isAdFreeUser, isBotUserAgent } from "@/lib/adEligibility";

interface AdBanner300x250Props {
  className?: string;
  adKey?: string; // Đổi adKey khi đổi tập để tải mới quảng cáo
}

const BANNER_KEY = "a1c807f9e14c4acd0b1f92582a15c657";
const INVOKE_SRC = `https://www.highrevenueformat.com/${BANNER_KEY}/invoke.js`;

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
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canShow]);

  // 3. Nhúng script trực tiếp vào trang (đúng mã Adsterra cung cấp) để Adsterra
  //    nhận đúng domain/URL trang. Đổi adKey (đổi tập) thì nạp lại quảng cáo mới.
  useEffect(() => {
    if (!canShow || !isVisible) return;
    const slot = slotRef.current;
    if (!slot) return;

    slot.innerHTML = "";
    (window as unknown as { atOptions: unknown }).atOptions = {
      key: BANNER_KEY,
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };
    const script = document.createElement("script");
    script.src = INVOKE_SRC;
    script.async = true;
    slot.appendChild(script);

    return () => {
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
