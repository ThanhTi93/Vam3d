"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  X,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Multi-Step State
  // Steps: "email" -> "otp" -> "new_password" -> "success"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "new_password" | "success">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Gmail
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await requestPasswordResetOtp(forgotEmail);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setForgotStep("otp");
    } catch (err: any) {
      setForgotError(err.message || "Không thể gửi mã OTP. Vui lòng thử lại sau.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanOtp = otp.trim().replace(/\s+/g, "");
    if (cleanOtp.length !== 6) {
      setForgotError("Vui lòng nhập đúng 6 chữ số mã OTP.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await verifyPasswordResetOtp(forgotEmail, cleanOtp);
      setResetToken(res.resetToken);
      setForgotStep("new_password");
    } catch (err: any) {
      setForgotError(err.message || "Mã OTP không hợp lệ.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setForgotLoading(true);
    try {
      await resetPasswordWithToken({
        email: forgotEmail,
        resetToken,
        newPassword,
      });
      setForgotStep("success");
    } catch (err: any) {
      setForgotError(err.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Finish and prefill login
  const handleFinishReset = () => {
    setEmail(forgotEmail);
    setPassword(newPassword);
    setShowForgotModal(false);
    // Reset modal states
    setForgotStep("email");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setDevOtp(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden px-4 py-12">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-md bg-[#131520]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand logo header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Vam3D Logo"
              width={160}
              height={46}
              className="object-contain transition-all group-hover:scale-105 h-11 w-auto"
              style={{ aspectRatio: "160 / 46" }}
            />
          </Link>
          <h2 className="text-xl font-bold text-white mt-4">Chào mừng trở lại</h2>
          <p className="text-xs text-gray-400 mt-1">Đăng nhập để tiếp tục trải nghiệm kho phim HD & Tu Tiên</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 block pl-1">
              Email <span className="text-red-400">*</span>
            </label>
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
                className="pl-11 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-11 w-full rounded-xl transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-gray-400">
                Mật khẩu <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError(null);
                  setForgotStep("email");
                  setOtp("");
                  setResetToken("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowForgotModal(true);
                }}
                className="text-xs text-orange-400 hover:text-orange-300 hover:underline font-semibold transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11 pr-10 bg-[#090a0f] border-white/5 hover:border-white/10 focus:border-orange-500/50 text-sm h-11 w-full rounded-xl transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between px-1 text-xs">
            <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 rounded bg-[#090a0f] border-white/20 text-orange-500 focus:ring-orange-500/50 cursor-pointer accent-orange-500"
              />
              <span>Ghi nhớ đăng nhập (Lần sau không bị out)</span>
            </label>
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-11 rounded-xl shadow-lg border-0 gap-2 flex items-center justify-center cursor-pointer transition-all mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Form Footer info */}
        <div className="text-center mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-orange-400 hover:text-orange-500 hover:underline font-bold transition-all ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL (OTP FLOW) ── */}
      {showForgotModal && (
        <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
          <DialogContent className="max-w-md w-full bg-[#131520]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-gray-200">
            <div className="relative">
              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[
                  { key: "email", label: "Gmail" },
                  { key: "otp", label: "Mã OTP" },
                  { key: "new_password", label: "Mật khẩu mới" },
                ].map((s, idx) => {
                  const isActive = forgotStep === s.key;
                  const isPassed =
                    (s.key === "email" && (forgotStep === "otp" || forgotStep === "new_password" || forgotStep === "success")) ||
                    (s.key === "otp" && (forgotStep === "new_password" || forgotStep === "success"));

                  return (
                    <React.Fragment key={s.key}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                            isPassed
                              ? "bg-green-500 text-white"
                              : isActive
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/40"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {isPassed ? "✓" : idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isActive ? "text-orange-400" : isPassed ? "text-green-400" : "text-gray-500"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div
                          className={`w-6 h-0.5 rounded-full ${
                            isPassed ? "bg-green-500" : "bg-white/10"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Error message */}
              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl p-3 flex items-start gap-2 mb-5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* ── STEP 1: ENTER GMAIL ── */}
              {forgotStep === "email" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="text-center space-y-2 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/10">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Nhập Gmail Đăng Ký
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Hệ thống sẽ gửi <strong className="text-orange-400">mã OTP gồm 6 chữ số</strong> về hộp thư Gmail của bạn để xác thực.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 block pl-1">
                      Địa chỉ Gmail <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <Input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ten-ban@gmail.com"
                        className="pl-11 bg-[#090a0f] border-white/10 hover:border-white/20 focus:border-orange-500/50 text-sm h-11 w-full rounded-xl"
                        disabled={forgotLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotModal(false)}
                      disabled={forgotLoading}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs h-11 rounded-xl cursor-pointer"
                    >
                      Huỷ bỏ
                    </Button>

                    <Button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-11 rounded-xl shadow-lg border-0 gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi mã...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi mã OTP 6 số</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ── STEP 2: ENTER 6-DIGIT OTP ── */}
              {forgotStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-2 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Nhập Mã OTP 6 Số
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Mã OTP đã được gửi đến: <strong className="text-amber-300">{forgotEmail}</strong>. Mã có hiệu lực trong 10 phút.
                    </p>
                  </div>

                  {/* Dev mode helper badge */}
                  {devOtp && (
                    <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3 text-center space-y-1">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">
                        Mã OTP thử nghiệm (Dev Mode):
                      </span>
                      <span className="text-lg font-black text-amber-300 font-mono tracking-widest">
                        {devOtp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtp)}
                        className="text-[11px] text-orange-400 hover:underline block mx-auto font-semibold cursor-pointer"
                      >
                        (Bấm để tự điền mã này)
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 block text-center">
                      Nhập mã 6 chữ số
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="• • • • • •"
                      className="bg-[#090a0f] border-white/10 hover:border-white/20 focus:border-orange-500/50 text-center font-mono text-2xl font-black tracking-[12px] h-14 w-full rounded-2xl text-amber-300"
                      disabled={forgotLoading}
                      autoFocus
                    />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-200/90 text-center leading-relaxed">
                    💡 <strong>Mẹo:</strong> Nếu không thấy thư trong <em>Hộp thư đến</em>, bạn vui lòng kiểm tra thêm mục <strong>Thư rác (Spam / Junk)</strong> nhé.
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep("email")}
                      className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Đổi email
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={forgotLoading}
                      className="text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Gửi lại mã
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotModal(false)}
                      disabled={forgotLoading}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs h-11 rounded-xl cursor-pointer"
                    >
                      Huỷ bỏ
                    </Button>

                    <Button
                      type="submit"
                      disabled={forgotLoading || otp.length !== 6}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-11 rounded-xl shadow-lg border-0 gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang xác thực...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Xác nhận mã OTP</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: ENTER NEW PASSWORD ── */}
              {forgotStep === "new_password" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center space-y-2 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 mx-auto flex items-center justify-center shadow-lg shadow-green-500/10">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Nhập Mật Khẩu Mới
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Mã OTP hợp lệ! Hãy thiết lập mật khẩu mới (tối thiểu 6 ký tự) cho tài khoản của bạn.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 block pl-1">
                      Mật khẩu mới <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự..."
                        className="pl-11 pr-10 bg-[#090a0f] border-white/10 hover:border-white/20 focus:border-orange-500/50 text-sm h-11 w-full rounded-xl"
                        disabled={forgotLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 block pl-1">
                      Xác nhận mật khẩu mới <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="pl-11 pr-10 bg-[#090a0f] border-white/10 hover:border-white/20 focus:border-orange-500/50 text-sm h-11 w-full rounded-xl"
                        disabled={forgotLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotModal(false)}
                      disabled={forgotLoading}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs h-11 rounded-xl cursor-pointer"
                    >
                      Huỷ bỏ
                    </Button>

                    <Button
                      type="submit"
                      disabled={forgotLoading || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-11 rounded-xl shadow-lg border-0 gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Lưu mật khẩu mới</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ── STEP 4: SUCCESS ── */}
              {forgotStep === "success" && (
                <div className="space-y-5 text-center animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-3xl bg-green-500/20 border border-green-500/30 text-green-400 mx-auto flex items-center justify-center shadow-xl shadow-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">
                      Đổi Mật Khẩu Thành Công!
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Mật khẩu của tài khoản <strong className="text-green-400">{forgotEmail}</strong> đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleFinishReset}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm h-11 rounded-xl cursor-pointer border-0 shadow-lg"
                  >
                    Đăng Nhập Với Mật Khẩu Mới
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f]">
        <div className="w-10 h-10 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
