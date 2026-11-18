"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't track admin panel or internal API calls
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    if (lastTrackedPath.current === currentUrl) return;
    lastTrackedPath.current = currentUrl;

    const track = () => {
      // Detect initial referrer or stored session referrer
      let referrer = document.referrer || "";
      try {
        const storedRef = sessionStorage.getItem("__vam_initial_referrer");
        if (!storedRef && document.referrer) {
          sessionStorage.setItem("__vam_initial_referrer", document.referrer);
        }
        if (!referrer && storedRef) {
          referrer = storedRef;
        }
      } catch {}

      // Detect device type without forced geometric reflow (use matchMedia instead of window.innerWidth)
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      );
      const isMobileWidth = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
      const isMobile = isMobileAgent || isMobileWidth;

      const isTabletAgent = /iPad|Tablet/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "");
      const isTabletWidth = typeof window !== "undefined" && window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches;
      const isTablet = isTabletAgent || isTabletWidth;

      const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

      const payload = {
        path: currentUrl,
        title: typeof document !== "undefined" ? document.title : "",
        referrer,
        device,
      };

      try {
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          navigator.sendBeacon("/api/analytics/track", blob);
        } else {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Ignore network errors on background tracking
      }
    };

    // Defer tracking to idle time to never block main thread or cause forced reflow during hydration
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(track, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(track, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return null;
}
