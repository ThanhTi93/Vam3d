import type { Metadata } from "next";
import { getSubscriptionPlans } from "@/app/admin/actions";
import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Nâng Cấp Thành Viên VIP Độc Quyền",
  description: "Nâng cấp gói thành viên VIP tại Vam3D để trải nghiệm xem phim chất lượng cao HD/4K không có quảng cáo, truyền phát siêu mượt và mở khóa bộ sưu tập ảnh AI đặc quyền.",
};

export default async function UpgradePage() {
  const plans = await getSubscriptionPlans();
  
  return <UpgradePageClient initialPlans={plans || []} />;
}
