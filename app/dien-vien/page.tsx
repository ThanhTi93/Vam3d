import type { Metadata } from "next";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { actors as actorsTable } from "@/lib/db/schema";
import ActorsPageClient from "./ActorsPageClient";

export const metadata: Metadata = {
  title: "Danh Sách Diễn Viên, Mỹ Nhân Cosplay Nóng Bỏng Nhất",
  description: "Trang tổng hợp danh sách các diễn viên, người mẫu, hot girl cosplay nóng bỏng, gợi cảm nhất tại RoPhim.",
};

export default async function ActorsPage() {
  if (!db) {
    return <ActorsPageClient actors={[]} />;
  }

  // Fetch all actors where status = 1
  const actors = await db.select({
    id: actorsTable.id,
    name: actorsTable.name,
    imgUrl: actorsTable.imgUrl,
  })
  .from(actorsTable)
  .where(eq(actorsTable.status, 1))
  .orderBy(desc(actorsTable.id));

  return <ActorsPageClient actors={actors} />;
}
