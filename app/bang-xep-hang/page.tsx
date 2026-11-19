import type { Metadata } from "next";
import { getAccountLeaderboard } from "@/lib/db/queries";
import LeaderboardClient from "./LeaderboardClient";

const leaderboardTitle = "Bảng Xếp Hạng Lượt Xem Thành Viên | Vam3D";
const leaderboardDescription = "Bảng vinh danh Top thành viên xem phim nhiều nhất tại Vam3D. Đua top nhận huy hiệu Quán Quân Hoàng Kim, Á Quân Bạch Kim và khung avatar độc quyền.";

export const metadata: Metadata = {
  title: leaderboardTitle,
  description: leaderboardDescription,
  alternates: {
    canonical: "/bang-xep-hang",
  },
  openGraph: {
    title: leaderboardTitle,
    description: leaderboardDescription,
    url: "/bang-xep-hang",
    type: "website",
    locale: "vi_VN",
    siteName: "Vam3D",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: leaderboardTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: leaderboardTitle,
    description: leaderboardDescription,
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 60; // Refresh every minute

export default async function LeaderboardPage() {
  const data = await getAccountLeaderboard(100);

  return <LeaderboardClient initialData={data} />;
}
