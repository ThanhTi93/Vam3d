"use client";

import React, { useState, Suspense } from "react";
import { User, Award, History, ArrowLeft, ShieldCheck, Mail, AlertTriangle, CreditCard, ExternalLink } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { updateUserAvatar } from "@/lib/auth/actions";
import { getBunnyImageUrl } from "@/lib/utils";
import Image from "next/image";

const AvatarUpload = React.lazy(() => import("@/app/components/AvatarUpload"));

interface ProfilePageClientProps {
  currentUser: any;
  initialPlans: any[];
  initialPayments: any[];
  initialSubscriptions?: any[];
}

export default function ProfilePageClient({ currentUser, initialPlans, initialPayments, initialSubscriptions = [] }: ProfilePageClientProps) {
  const { user: authUser, refreshUser } = useAuth();
  const user = currentUser || authUser;
  const [plans] = useState<any[]>(initialPlans);
  const [payments] = useState<any[]>(initialPayments);
  const [subscriptions] = useState<any[]>(initialSubscriptions);
  const [showProfileUploader, setShowProfileUploader] = useState(false);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "history">("subscriptions");

  if (!user) return null;

  const isVip = user.level && user.level > 0;
  const isExpired = user.expiredAt ? new Date(user.expiredAt) < new Date() : true;
  const daysRemaining = user.expiredAt
    ? Math.max(0, Math.ceil((new Date(user.expiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  console.log("ProfilePageClient DEBUG:", {
    username: user.username,
    level: user.level,
    expiredAt: user.expiredAt,
    isVip,
    isExpired,
    daysRemaining
  });

  const currentPlan = isVip && !isExpired ? plans.find(p => p.level === user.level) : null;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">

      {/* Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-2 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>
        <h1 className="text-lg font-black text-white uppercase tracking-wider">
          Thông tin tài khoản
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Left Column: User Profile & VIP Status */}
        <div className="space-y-6 md:col-span-1">
          {/* User Profile Card */}
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />

            {/* User Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500/20 group shadow-lg mb-4 bg-[#1a1d2e]">
              <Image
                src={getBunnyImageUrl(user.imgUrl, 'thumb') || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                alt={user.username}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <h2 className="text-base font-black text-white truncate max-w-full">{user.username}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 justify-center mb-4 truncate max-w-full">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              {user.email}
            </p>
            <button
              onClick={() => setShowProfileUploader(true)}
              className="text-xs font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer w-full"
            >
              Thay đổi ảnh đại diện
            </button>
          </Card>

          {/* VIP Information Card */}
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Gói thành viên</h3>
                  <p className="text-[10px] text-gray-500">Trạng thái đặc quyền tài khoản</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
                  <span className="text-gray-400">Gói hiện tại:</span>
                  <span className={`font-black uppercase flex items-center gap-1.5 ${isVip && !isExpired ? "text-amber-400" : "text-gray-400"}`}>
                    {isVip && !isExpired ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        {currentPlan?.name || `VIP Cấp ${user.level}`}
                      </>
                    ) : (
                      "Thành viên Thường"
                    )}
                  </span>
                </div>

                {isVip ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className={`font-bold ${isExpired ? "text-red-400" : "text-green-400"}`}>
                        {isExpired ? "Đã hết hạn" : "Đang hoạt động"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
                      <span className="text-gray-400">Ngày hết hạn:</span>
                      <span className="font-bold text-gray-200 tabular-nums">
                        {user.expiredAt ? new Date(user.expiredAt).toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>
                    {!isExpired && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Thời gian còn lại:</span>
                        <span className="font-black text-orange-400 tabular-nums">{daysRemaining} ngày</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-amber-400/80 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Bạn chưa sở hữu đặc quyền VIP. Hãy đăng ký ngay để thưởng thức phim HD/4K mượt mà không quảng cáo.</span>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/upgrade" className="w-full block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      {isVip && !isExpired ? "Gia hạn / Nâng cấp VIP" : "Nâng cấp VIP ngay"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Manage packages & transaction history */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl shadow-xl min-h-[380px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header with Switch Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {activeTab === "subscriptions" ? <Award className="w-5 h-5" /> : <History className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      {activeTab === "subscriptions" ? "Gói đã đăng ký" : "Lịch sử đăng ký"}
                    </h2>
                    <p className="text-[10px] text-gray-500">
                      {activeTab === "subscriptions"
                        ? "Thông tin các gói cước và thời hạn hiệu lực của tài khoản"
                        : "Danh sách các giao dịch thanh toán gói cước của tài khoản"}
                    </p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[#090a0f] p-1 rounded-xl border border-white/5 shrink-0 select-none">
                  <button
                    onClick={() => setActiveTab("subscriptions")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${activeTab === "subscriptions"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    Gói đã đăng ký
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${activeTab === "history"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    Lịch sử đăng ký
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                {activeTab === "subscriptions" ? (
                  subscriptions && subscriptions.length > 0 ? (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 uppercase font-black tracking-wide">
                            <th className="pb-3 font-bold">Gói cước</th>
                            <th className="pb-3 font-bold text-center">Thời hạn</th>
                            <th className="pb-3 font-bold text-center">Hiệu lực</th>
                            <th className="pb-3 font-bold text-right">Ngày mua</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                          {subscriptions.map((sub) => {
                            const planName = sub.plan?.name || "VIP";
                            const isSubExpired = new Date(sub.expiredAt) < new Date();
                            const subDaysRemaining = Math.max(
                              0,
                              Math.ceil((new Date(sub.expiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            );

                            return (
                              <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 font-bold text-white flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubExpired ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                                  {planName}
                                </td>
                                <td className="py-3 text-center font-bold font-mono text-amber-400 tabular-nums">
                                  {isSubExpired ? "Hết hạn" : `${subDaysRemaining} ngày`}
                                </td>
                                <td className="py-3 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${isSubExpired
                                      ? "text-gray-500 bg-gray-500/5 border-gray-500/10"
                                      : "text-green-400 bg-green-400/5 border-green-400/20"
                                    }`}>
                                    {isSubExpired ? "Hết hạn" : "Còn hạn"}
                                  </span>
                                </td>
                                <td className="py-3 text-right text-gray-400 tabular-nums">
                                  {new Date(sub.createdAt || new Date()).toLocaleDateString("vi-VN")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-xs text-gray-500 italic">
                      Bạn chưa có bất kỳ gói cước đã đăng ký nào.
                    </div>
                  )
                ) : (
                  payments && payments.length > 0 ? (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 uppercase font-black tracking-wide">
                            <th className="pb-3 font-bold">Mã</th>
                            <th className="pb-3 font-bold">Gói cước</th>
                            <th className="pb-3 font-bold">Thời hạn</th>
                            <th className="pb-3 font-bold text-center">Trạng thái</th>
                            <th className="pb-3 font-bold text-right">Ngày mua</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                          {payments.map((p) => {
                            const planName = p.package?.plan?.name || "VIP";
                            const time = p.package?.time ? `${p.package.time} tháng` : "—";

                            let statusLabel = "Đang xử lý";
                            let statusClass = "text-yellow-400 bg-yellow-400/5 border-yellow-400/20";
                            if (p.status === "paid") {
                              statusLabel = "Thành công";
                              statusClass = "text-green-400 bg-green-400/5 border-green-400/20";
                            } else if (p.status === "cancelled") {
                              statusLabel = "Đã hủy";
                              statusClass = "text-red-400 bg-red-400/5 border-red-400/20";
                            }

                            return (
                              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 font-bold text-gray-500 tabular-nums">#{p.orderCode}</td>
                                <td className="py-3 font-bold text-white">{planName}</td>
                                <td className="py-3 font-medium">{time}</td>
                                <td className="py-3 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${statusClass}`}>
                                    {statusLabel}
                                  </span>
                                </td>
                                <td className="py-3 text-right text-gray-400 tabular-nums">
                                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-xs text-gray-500 italic">
                      Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào.
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-4 pt-3 border-t border-white/5">
              <span>Nếu có bất kỳ sai sót nào trong giao dịch thanh toán của bạn, vui lòng liên hệ admin hỗ trợ.</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Avatar Uploader Dialog */}
      {showProfileUploader && (
        <Dialog open={showProfileUploader} onOpenChange={setShowProfileUploader}>
          <DialogContent showCloseButton={false} className="bg-[#131520] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm [&_.absolute.top-2]:hidden">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Thay đổi ảnh đại diện (Test)</h3>
              <DialogClose className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-bold select-none">
                ✕
              </DialogClose>
            </div>
            <Suspense fallback={<div className="w-24 h-24 rounded-full bg-[#1c1f2f] animate-pulse mx-auto" />}>
              <AvatarUpload
                currentImageUrl={user.imgUrl}
                onUploadSuccess={async (url) => {
                  try {
                    await updateUserAvatar(url);
                    await refreshUser();
                    setShowProfileUploader(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                folder="avatar"
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
