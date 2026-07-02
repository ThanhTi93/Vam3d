import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import ProfileContentWrapper from "./ProfileContentWrapper";
import ProfileSkeleton from "./ProfileSkeleton";

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

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContentWrapper currentUser={user} />
    </Suspense>
  );
}
