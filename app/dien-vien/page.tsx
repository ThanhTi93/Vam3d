import type { Metadata } from "next";
import { getAllActors } from "@/lib/db/queries";
import ActorsPageClient from "./ActorsPageClient";

export const metadata: Metadata = {
  title: "Danh Sách Diễn Viên, Mỹ Nhân Cosplay Nóng Bỏng Nhất | Vam3D",
  description: "Trang tổng hợp danh sách các diễn viên, người mẫu, hot girl cosplay nóng bỏng, gợi cảm nhất tại Vam3D.",
};

export const revalidate = 3600;

export default async function ActorsPage() {
  try {
    const actors = await getAllActors();
    return <ActorsPageClient actors={actors || []} />;
  } catch (err) {
    console.error("Error loading actors page:", err);
    return <ActorsPageClient actors={[]} />;
  }
}
