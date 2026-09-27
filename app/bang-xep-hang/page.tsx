import type { Metadata } from "next";
import { getAccountLeaderboard } from "@/lib/db/queries";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Lượt Xem Thành Viên – Vam3D",
  description: "Bảng vinh danh Top thành viên có lượt xem phim nhiều nhất tại Vam3D. Đua top nhận huy hiệu Quán Quân Hoàng Kim, Á Quân Bạch Kim, Quý Quân Hoàng Đồng và khung avatar độc quyền.",
  alternates: {
    canonical: "/bang-xep-hang",
  },
};

export const revalidate = 60; // Refresh every minute

export default async function LeaderboardPage() {
  const data = await getAccountLeaderboard(100);

  return <LeaderboardClient initialData={data} />;
}
