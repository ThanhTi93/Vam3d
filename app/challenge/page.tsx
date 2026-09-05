"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, ShieldAlert, Loader2, Server } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error: any) => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

function ChallengeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rayId, setRayId] = useState("");
  const [userIp, setUserIp] = useState("Detecting...");
  const widgetIdRef = useRef<string | null>(null);

  // Generate a realistic Cloudflare Ray ID and get temporary IP visual info
  useEffect(() => {
    const chars = "0123456789abcdef";
    let hex = "";
    for (let i = 0; i < 16; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    setRayId(hex);

    // Fetch user IP just for UI visualization
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch(() => setUserIp("127.0.0.1"));
  }, []);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "3x00000000000000000000FF";

    // Define the global callback for when the Turnstile script loads
    window.onloadTurnstileCallback = () => {
      initializeTurnstile(siteKey);
    };

    // If the script is already loaded
    if (window.turnstile) {
      initializeTurnstile(siteKey);
    } else {
      // Inject script tag
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    return () => {
      // Clean up widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error("Failed to remove turnstile widget:", e);
        }
      }
      // Remove global callback
      delete window.onloadTurnstileCallback;
    };
  }, []);

  const initializeTurnstile = (siteKey: string) => {
    if (!window.turnstile || !turnstileContainerRef.current) return;

    try {
      setStatus("ready");
      const id = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: async (token: string) => {
          await handleVerification(token);
        },
        "expired-callback": () => {
          setStatus("ready");
          setErrorMessage("Phiên xác minh đã hết hạn. Vui lòng xác minh lại.");
        },
        "error-callback": (err: any) => {
          setStatus("error");
          setErrorMessage("Không thể tải widget bảo mật. Vui lòng thử lại.");
          console.error("Turnstile widget error:", err);
        },
      });
      widgetIdRef.current = id;
    } catch (err) {
      console.error("Turnstile render error:", err);
      setStatus("error");
    }
  };

  const handleVerification = async (token: string) => {
    setStatus("verifying");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        // Redirect back to nextUrl or home
        setTimeout(() => {
          window.location.href = nextUrl;
        }, 1000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Xác minh không thành công. Bạn có thể là bot.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Không thể kết nối đến máy chủ bảo mật. Vui lòng tải lại trang.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#090a0f] relative overflow-hidden px-4 py-8">
      {/* Background ambient glowing lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Spacer Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Vam3D Logo"
            width={110}
            height={32}
            className="object-contain h-8 w-auto"
            style={{ aspectRatio: "110 / 32" }}
          />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">SECURITY</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Server className="w-3.5 h-3.5" />
          <span>Gateway v2.0.1</span>
        </div>
      </div>

      {/* Main Glass Card container */}
      <div className="flex-1 flex items-center justify-center py-10 z-10">
        <div className="w-full max-w-lg bg-[#131520]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Animated Spinner/Icon block */}
          <div className="flex justify-center mb-8 relative">
            {status === "success" ? (
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 scale-in-center">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>
            ) : status === "error" ? (
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 scale-in-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
            ) : (
              <div className="relative w-16 h-16">
                {/* Slow spinning outer gradient ring */}
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/10 border-t-orange-500 animate-spin" />
                {/* Pulsing inner dot */}
                <div className="absolute inset-2 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-orange-500 pulse-glow-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Một lát...</h1>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Đang xác minh trình duyệt của bạn để bảo mật kết nối.
            </p>
          </div>

          {/* Core quote security text */}
          <div className="bg-[#090a0f]/60 rounded-2xl p-5 border border-white/5 mb-8 text-center">
            <p className="text-xs text-gray-300 leading-relaxed font-semibold">
              Trang web này sử dụng dịch vụ bảo mật để chống bot độc hại. Trang này hiển thị trong khi trang web xác minh bạn không phải là bot.
            </p>
          </div>

          {/* Error alerts */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 mb-6">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Turnstile Widget Anchor */}
          <div className="flex flex-col items-center justify-center min-h-[65px] transition-all">
            {status === "loading" && (
              <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tải mô-đun an toàn...</span>
              </div>
            )}
            
            {status === "verifying" && (
              <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xác minh phản hồi thử thách...</span>
              </div>
            )}

            {status === "success" && (
              <div className="text-xs text-green-400 font-bold animate-bounce">
                Xác minh hoàn tất! Đang chuyển hướng...
              </div>
            )}

            {/* Turnstile target container div */}
            <div 
              ref={turnstileContainerRef} 
              className={`transition-opacity duration-300 ${
                status === "ready" || status === "error" ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
              }`}
            />
          </div>

        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="w-full max-w-4xl mx-auto border-t border-white/5 pt-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span>Ray ID: <span className="font-mono text-gray-500">{rayId}</span></span>
            <span className="hidden sm:inline text-gray-800">|</span>
            <span>IP của bạn: <span className="font-mono text-gray-500">{userIp}</span></span>
          </div>
          <div className="text-center sm:text-right">
            <span>Performance & security by <span className="font-bold text-gray-500 hover:text-gray-400 transition-colors">Cloudflare Turnstile</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f]">
        <div className="w-10 h-10 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    }>
      <ChallengeContent />
    </Suspense>
  );
}
