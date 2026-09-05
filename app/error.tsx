"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 shadow-lg shadow-orange-500/10 animate-bounce">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
        Đang tải lại trang...
      </h1>

      <p className="text-gray-400 text-sm max-w-md mb-8">
        Hệ thống đang kết nối và đồng bộ dữ liệu. Bạn có thể bấm &quot;Thử lại&quot; hoặc quay về trang chủ.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium px-6 py-2.5 rounded-xl border border-white/10 transition-all text-sm"
        >
          <Home className="w-4 h-4" /> Trang chủ
        </Link>
      </div>
    </div>
  );
}
