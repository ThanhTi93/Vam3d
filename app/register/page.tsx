"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { register } = useAuth();
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate password length client side for direct feedback
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        gender: gender || undefined,
      });
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin đăng ký.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden px-4 py-12">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-md bg-[#131520]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand logo header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="RoPhim Logo"
              width={160}
              height={46}
              className="object-contain transition-all group-hover:scale-105 h-11 w-auto"
              style={{ aspectRatio: "160 / 46" }}
            />
          </Link>
          <h2 className="text-xl font-bold text-white mt-4">Tạo tài khoản mới</h2>
          <p className="text-xs text-gray-400 mt-1">Đăng ký để lưu phim yêu thích và xem bộ sưu tập AI</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 block pl-1">Tên đăng nhập <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vd: nickname123"
                className="pl-11 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-10 w-full rounded-xl transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 block pl-1">Email <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="pl-11 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-10 w-full rounded-xl transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 block pl-1">Mật khẩu <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="tối thiểu 6 ký tự"
                className="pl-11 pr-10 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-10 w-full rounded-xl transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Phone input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 block pl-1">Số điện thoại (tùy chọn)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Phone className="w-4 h-4" />
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="vd: 0987654321"
                className="pl-11 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-10 w-full rounded-xl transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Gender dropdown input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 block pl-1">Giới tính (tùy chọn)</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/5 hover:border-white/10 rounded-xl h-10 px-3.5 text-sm text-gray-300 focus:outline-none focus:border-orange-500/50 cursor-pointer transition-all"
              disabled={loading}
            >
              <option value="" className="text-gray-500 bg-[#131520]">-- Chọn giới tính --</option>
              <option value="male" className="text-gray-200 bg-[#131520]">Nam</option>
              <option value="female" className="text-gray-200 bg-[#131520]">Nữ</option>
              <option value="other" className="text-gray-200 bg-[#131520]">Khác</option>
            </select>
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-10 rounded-xl shadow-lg border-0 gap-2 flex items-center justify-center cursor-pointer transition-all mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <>
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Form Footer info */}
        <div className="text-center mt-6 pt-5 border-t border-white/5">
          <p className="text-xs text-gray-400">
            Đã có tài khoản?{" "}
            <Link
              href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-orange-400 hover:text-orange-500 hover:underline font-bold transition-all ml-1"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f]">
        <div className="w-10 h-10 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
