"use client";

import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpgradePageClientProps {
  initialPlans: any[];
}

export default function UpgradePageClient({ initialPlans }: UpgradePageClientProps) {
  const { user, refreshUser, freeVipMode } = useAuth();
  const [plans] = useState<any[]>(initialPlans);
  const [selectedPackages, setSelectedPackages] = useState<Record<number, number>>({});
  const [buyingPackageId, setBuyingPackageId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Set default package selections
    const defaults: Record<number, number> = {};
    plans?.forEach((plan: any) => {
      if (plan.packages && plan.packages.length > 0) {
        defaults[plan.id] = plan.packages[0].id;
      }
    });
    setSelectedPackages(defaults);
  }, [plans]);

  // Handle PayOS payment return check with polling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const orderCode = params.get("orderCode");

    if (paymentStatus === "success" && orderCode) {
      showNotification("Đang kiểm tra trạng thái thanh toán từ PayOS...", "success");

      let attempts = 0;
      const maxAttempts = 6; // Check up to 6 times (approx 10-12s)

      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/payment/status?orderCode=${orderCode}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.status === "paid") {
              showNotification("Thanh toán thành công! Quyền hạn tài khoản của bạn đã được nâng cấp.", "success");
              window.history.replaceState({}, document.title, window.location.pathname);
              refreshUser();
              return true;
            }
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
        return false;
      };

      const intervalId = setInterval(async () => {
        attempts++;
        const isPaid = await checkStatus();
        if (isPaid || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (!isPaid) {
            showNotification(
              "Đang xử lý giao dịch. Vui lòng chờ ít phút hoặc tải lại trang để kiểm tra trạng thái VIP.",
              "success"
            );
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }, 2000);

      // Run once immediately
      checkStatus().then((isPaid) => {
        if (isPaid) clearInterval(intervalId);
      });

      return () => clearInterval(intervalId);
    } else if (paymentStatus === "cancel") {
      showNotification("Giao dịch thanh toán đã bị hủy.", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCheckout = async (packageId: number) => {
    if (freeVipMode) {
      showNotification("Hệ thống đang mở chiếu FREE tất cả nội dung! Bạn không cần mua gói VIP lúc này.", "success");
      return;
    }
    if (!user) {
      showNotification("Vui lòng đăng nhập để nâng cấp gói cước!", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    setBuyingPackageId(packageId);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gặp sự cố khi tạo giao dịch");
      }

      if (data.checkoutUrl) {
        showNotification("Đang chuyển hướng sang cổng thanh toán...", "success");
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Không thể thực hiện thanh toán", "error");
    } finally {
      setBuyingPackageId(null);
    }
  };

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Premium Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            notification.type === "success" 
              ? "bg-[#131520]/90 border-green-500/30 text-green-400" 
              : "bg-[#131520]/90 border-red-500/30 text-red-400"
          }`}>
            <div className={`w-2 h-2 rounded-full ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} pulse-glow-dot`} />
            <span className="text-xs font-bold text-gray-200">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Free VIP Mode Notice Banner */}
      {freeVipMode ? (
        <div className="max-w-3xl mx-auto py-12 bg-gradient-to-r from-emerald-500/20 via-green-500/10 to-emerald-500/20 border border-green-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 my-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/30">
            🎉 Thông báo sự kiện đặc biệt
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider">
            Tất Cả Nội Dung VIP Đang Được Mở Cho Xem FREE!
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Hệ thống quản trị đã tạm thời hủy bỏ toàn bộ gói cước thanh toán. Bạn có thể thưởng thức toàn bộ Phim HD/4K, phim bộ, phim lẻ & Kho ảnh AI đặc quyền hoàn toàn Miễn Phí mà không cần nâng cấp!
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-green-500/30 transition-all transform hover:scale-105"
            >
              🚀 Khám Phá Xem Phim & Ảnh Free Ngay
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent uppercase tracking-wider">
              Nâng Cấp Thành Viên VIP
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Mở khóa toàn bộ đặc quyền xem phim chất lượng cao HD/4K không chứa quảng cáo và truy cập kho bộ sưu tập ảnh AI độc quyền lớn nhất.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto items-stretch">
            {plans.map((plan: any) => {
              const isFree = plan.level === 0;
              const hasPackages = plan.packages && plan.packages.length > 0;
              const selectedPkgId = selectedPackages[plan.id];
              const selectedPkg = plan.packages?.find((p: any) => p.id === selectedPkgId);

              let totalCost = 0;
              let finalMonthCost = 0;
              let hasDiscount = false;
              let discountPercent = 0;

              if (selectedPkg) {
                const baseMonthPrice = parseFloat(plan.priceMonth);
                discountPercent = parseFloat(selectedPkg.discount || "0");
                hasDiscount = discountPercent > 0;
                totalCost = Math.round(baseMonthPrice * selectedPkg.time * (1 - discountPercent / 100));
                finalMonthCost = Math.round(baseMonthPrice * (1 - discountPercent / 100));
              } else {
                totalCost = Math.round(parseFloat(plan.priceMonth));
                finalMonthCost = totalCost;
              }

              // User package tier status check
              const isUserLogged = !!user;
              const userVipLevel = user?.level || 0;
              const isUserVip = userVipLevel > 0;
              const isUserExpired = user?.expiredAt ? new Date(user.expiredAt) < new Date() : true;

              const isCurrentPlan = isUserLogged && isUserVip && !isUserExpired && userVipLevel === plan.level;
              const isLowerPlan = isUserLogged && isUserVip && !isUserExpired && plan.level > 0 && plan.level < userVipLevel;

              let cardClasses = `flex-1 min-w-[240px] max-w-[300px] bg-[#131520] border-2 rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 overflow-visible`;
              if (isFree) {
                cardClasses += " border-white/5 opacity-80";
              } else if (isCurrentPlan) {
                cardClasses += " border-amber-500 bg-[#161a2c] shadow-2xl shadow-amber-500/10 md:scale-[1.03] z-10";
              } else if (isLowerPlan) {
                cardClasses += " border-white/5 opacity-40 hover:opacity-60";
              } else {
                cardClasses += " border-orange-500/20 hover:border-orange-500/40 shadow-xl shadow-orange-500/5";
              }

              return (
                <Card key={plan.id} className={cardClasses}>
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[9px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Gói hiện tại
                    </div>
                  )}

                  {plan.level > 1 && !isCurrentPlan && !isLowerPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Phổ Biến Nhất
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white">{plan.name}</h3>
                      <div className="flex items-baseline mt-2">
                        <span className="text-2xl font-black text-white">
                          {isFree ? "0" : finalMonthCost.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-gray-400 text-xs ml-1">/tháng</span>
                      </div>
                    </div>

                    {hasPackages && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chọn thời hạn:</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {plan.packages.map((pkg: any) => {
                            const isSelected = selectedPkgId === pkg.id;
                            const disc = parseFloat(pkg.discount || "0");
                            return (
                              <button
                                key={pkg.id}
                                onClick={() => setSelectedPackages(p => ({ ...p, [plan.id]: pkg.id }))}
                                className={`p-2 rounded-xl border text-left transition-all relative ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500/10 text-white shadow-md shadow-orange-500/10"
                                    : "border-white/5 bg-[#090a0f] text-gray-400 hover:text-white hover:border-white/20"
                                }`}
                              >
                                <div className="text-xs font-bold">{pkg.time} Tháng</div>
                                {disc > 0 && (
                                  <div className="text-[9px] text-green-400 font-semibold">Giảm {disc}%</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tính năng nổi bật:</p>
                      {plan.features && plan.features.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {plan.features.map((feat: any) => (
                            <li key={feat.id} className="flex items-center gap-2">
                              {feat.available ? (
                                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400/60 shrink-0" />
                              )}
                              <span className={feat.available ? "text-gray-300" : "text-gray-500 line-through text-[11px]"}>
                                {feat.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Chưa có thông tin tính năng</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-6">
                    {isFree ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full border-white/10 text-gray-500 cursor-default h-10 text-xs font-bold"
                      >
                        Gói Miễn Phí Mặc Định
                      </Button>
                    ) : isLowerPlan ? (
                      <Button
                        disabled
                        className="w-full bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed h-10 text-xs font-bold"
                      >
                        Đang dùng gói cao hơn
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCheckout(selectedPkgId)}
                        disabled={!selectedPkgId || buyingPackageId !== null}
                        className={`w-full font-bold h-10 text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl ${
                          isCurrentPlan
                            ? "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/10"
                        }`}
                      >
                        {buyingPackageId === selectedPkgId && (
                          <div className={`w-3.5 h-3.5 rounded-full border border-r-transparent border-b-transparent border-l-transparent animate-spin ${
                            isCurrentPlan ? "border-black" : "border-white"
                          }`} />
                        )}
                        {isCurrentPlan ? (
                          `Gia Hạn Gói (${totalCost.toLocaleString("vi-VN")}đ)`
                        ) : isUserVip && !isUserExpired ? (
                          `Nâng Cấp Lên Gói Này (${totalCost.toLocaleString("vi-VN")}đ)`
                        ) : hasDiscount ? (
                          <span>Mua Ngay - {totalCost.toLocaleString("vi-VN")}đ</span>
                        ) : (
                          `Thanh Toán QR (${totalCost.toLocaleString("vi-VN")}đ)`
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
