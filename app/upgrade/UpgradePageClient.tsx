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
  const { user, refreshUser } = useAuth();
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

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent uppercase tracking-wider">
          Nâng Cấp Thành Viên VIP
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Mở khóa toàn bộ đặc quyền xem phim chất lượng cao HD/4K không chứa quảng cáo và truy cập kho bộ sưu tập ảnh AI độc quyền lớn nhất.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
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

          return (
            <Card
              key={plan.id}
              className={`flex-1 min-w-[220px] max-w-[300px] bg-[#131520] border-2 rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 overflow-visible ${
                !isFree
                  ? "border-orange-500/20 hover:border-orange-500/40 shadow-xl shadow-orange-500/5"
                  : "border-white/5 opacity-80"
              }`}
            >
              {plan.level > 1 && (
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

                {!isFree && hasPackages && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      Chọn Thời Hạn:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.packages.map((pkg: any) => {
                        const pkgDiscount = parseFloat(pkg.discount || "0");
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() =>
                              setSelectedPackages((prev) => ({ ...prev, [plan.id]: pkg.id }))
                            }
                            className={`border px-2.5 py-2 rounded-xl text-left transition-all ${
                              selectedPkgId === pkg.id
                                ? "border-orange-500 bg-orange-500/10 text-white"
                                : "border-white/5 bg-[#090a0f] text-gray-400 hover:text-white"
                            }`}
                          >
                            <div className="text-xs font-bold">{pkg.time} Tháng</div>
                            {pkgDiscount > 0 && (
                              <div className="text-[9px] text-green-400 font-semibold mt-0.5">
                                Giảm {pkgDiscount}%
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                    Tính Năng Nổi Bật:
                  </span>
                  <ul className="space-y-2 text-xs">
                    {plan.features?.map((f: any) => (
                      <li key={f.id} className="flex items-center gap-2 text-gray-300">
                        {f.available ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-500/50 shrink-0" />
                        )}
                        <span className={f.available ? "" : "text-gray-500 line-through"}>
                          {f.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5">
                {isFree ? (
                  <Button
                    disabled
                    className="w-full bg-white/5 border border-white/10 text-gray-400 cursor-default h-10 text-xs"
                  >
                    Gói Mặc Định
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCheckout(selectedPkgId)}
                    disabled={!selectedPkgId || buyingPackageId !== null}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-10 text-xs shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {buyingPackageId === selectedPkgId && (
                      <div className="w-3.5 h-3.5 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    )}
                    {hasDiscount ? (
                      <div className="flex flex-col items-center">
                        <span>Mua Ngay - {totalCost.toLocaleString("vi-VN")}đ</span>
                      </div>
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
    </main>
  );
}
