"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global crash caught:", error);
  }, [error]);

  return (
    <html lang="vi" className="dark h-full bg-[#090a0f] text-gray-100">
      <body className="min-h-full flex flex-col items-center justify-center p-6 text-center bg-[#090a0f] text-gray-100 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 shadow-lg shadow-orange-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Đang cập nhật phiên bản mới
        </h1>

        <p className="text-gray-400 text-sm max-w-md mb-8">
          Hệ thống vừa nâng cấp hoặc mạng gián đoạn. Vui lòng bấm làm mới để tiếp tục.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới trang
          </button>
        </div>
      </body>
    </html>
  );
}
