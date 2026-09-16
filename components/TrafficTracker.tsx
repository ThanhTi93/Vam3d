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

    // Detect initial referrer or stored session referrer
    let referrer = document.referrer || "";
    if (typeof window !== "undefined") {
      const storedRef = sessionStorage.getItem("__vam_initial_referrer");
      if (!storedRef && document.referrer) {
        sessionStorage.setItem("__vam_initial_referrer", document.referrer);
      }
      if (!referrer && storedRef) {
        referrer = storedRef;
      }
    }

    // Detect device type
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      ) || (typeof window !== "undefined" && window.innerWidth < 768);

    const isTablet =
      /iPad|Tablet/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "") ||
      (typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024);

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
  }, [pathname, searchParams]);

  return null;
}
