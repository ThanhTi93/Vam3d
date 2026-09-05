"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden px-4">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-md bg-[#131520]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        {/* Header Title */}
        <h1 className="text-2xl font-black text-white mb-2">Từ Chối Truy Cập</h1>
        <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
          Tài khoản của bạn không có quyền truy cập vào trang quản trị. Vui lòng liên hệ quản trị viên hoặc đăng nhập bằng tài khoản khác.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex-1">
            <Button className="w-full bg-[#161925] hover:bg-[#1f2334] text-gray-300 border border-white/5 rounded-xl h-11 flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </Button>
          </Link>

          <Button
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl h-11 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
