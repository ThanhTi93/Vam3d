import type { Metadata } from "next";
import { getSubscriptionPlans, getUserPaymentHistory, getUserSubscriptions } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "Thông Tin Tài Khoản & Lịch Sử VIP",
  description: "Quản lý thông tin tài khoản thành viên, kiểm tra thời hạn gói VIP và lịch sử thanh toán đăng ký gói dịch vụ.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  console.log("Server side user in /profile:", user);
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const [plans, payments, subscriptions] = await Promise.all([
    getSubscriptionPlans(),
    getUserPaymentHistory(),
    getUserSubscriptions()
  ]);

  return (
    <ProfilePageClient
      initialPlans={plans || []}
      initialPayments={payments || []}
      initialSubscriptions={subscriptions || []}
    />
  );
}
