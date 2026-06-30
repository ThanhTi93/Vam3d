import type { Metadata } from "next";
import { getSubscriptionPlans, getUserPaymentHistory } from "@/app/admin/actions";
import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Nâng Cấp Thành Viên VIP Độc Quyền",
  description: "Nâng cấp gói thành viên VIP tại RoPhim để trải nghiệm xem phim chất lượng cao HD/4K không có quảng cáo, truyền phát siêu mượt và mở khóa bộ sưu tập ảnh AI đặc quyền.",
};

export default async function UpgradePage() {
  const [plans, payments] = await Promise.all([
    getSubscriptionPlans(),
    getUserPaymentHistory()
  ]);
  
  return <UpgradePageClient initialPlans={plans || []} initialPayments={payments || []} />;
}
