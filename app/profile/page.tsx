import type { Metadata } from "next";
import { getSubscriptionPlans, getUserPaymentHistory } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "Thông Tin Tài Khoản & Lịch Sử VIP",
  description: "Quản lý thông tin tài khoản thành viên, kiểm tra thời hạn gói VIP và lịch sử thanh toán đăng ký gói dịch vụ.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const [plans, payments] = await Promise.all([
    getSubscriptionPlans(),
    getUserPaymentHistory()
  ]);

  return <ProfilePageClient initialPlans={plans || []} initialPayments={payments || []} />;
}
