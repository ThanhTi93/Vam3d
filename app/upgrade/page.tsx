import type { Metadata } from "next";
import { getAllPlans } from "@/lib/db/queries";
import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Nâng Cấp Thành Viên VIP Độc Quyền | Vam3D",
  description: "Nâng cấp gói thành viên VIP tại Vam3D để trải nghiệm xem phim chất lượng cao HD/4K không có quảng cáo, truyền phát siêu mượt và mở khóa bộ sưu tập ảnh AI đặc quyền.",
};

export const revalidate = 300;

export default async function UpgradePage() {
  try {
    const plans = await getAllPlans();
    return <UpgradePageClient initialPlans={plans || []} />;
  } catch (err) {
    console.error("Error in UpgradePage:", err);
    return <UpgradePageClient initialPlans={[]} />;
  }
}
