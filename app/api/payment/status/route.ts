import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, accounts, packages } from "@/lib/db/schema";
import { payOS } from "@/lib/payos";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCodeStr = searchParams.get("orderCode");

    if (!orderCodeStr) {
      return NextResponse.json({ error: "Thiếu orderCode" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 500 });
    }

    const orderCode = Number(orderCodeStr);

    // 1. Check in our DB first
    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.orderCode, orderCode),
    });

    if (!paymentRecord) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    // 2. If status is pending, poll PayOS directly as a fail-safe fallback
    if (paymentRecord.status === "pending") {
      try {
        const payosOrder = await payOS.paymentRequests.get(orderCode);

        // If PayOS says it's PAID, trigger database update & user upgrade
        if (payosOrder && payosOrder.status === "PAID") {
          // Update payment status in database
          await db
            .update(payments)
            .set({ status: "paid" })
            .where(eq(payments.id, paymentRecord.id));

          // Upgrade the user level and expiration
          if (paymentRecord.idPackage && paymentRecord.idAccount) {
            const pkg = await db.query.packages.findFirst({
              where: eq(packages.id, paymentRecord.idPackage),
              with: { plan: true },
            });

            if (pkg && pkg.plan) {
              const userAccount = await db.query.accounts.findFirst({
                where: eq(accounts.id, paymentRecord.idAccount),
              });

              if (userAccount) {
                const timeMonths = pkg.time;
                let currentExpiredAt = userAccount.expiredAt;
                let newExpiredAt = new Date();

                // If user has existing level that is equal/higher and not expired, extend it
                if (
                  userAccount.level !== null &&
                  userAccount.level >= pkg.plan.level &&
                  currentExpiredAt &&
                  new Date(currentExpiredAt) > new Date()
                ) {
                  newExpiredAt = new Date(currentExpiredAt);
                  newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
                } else {
                  newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
                }

                await db
                  .update(accounts)
                  .set({
                    level: pkg.plan.level,
                    expiredAt: newExpiredAt,
                  })
                  .where(eq(accounts.id, userAccount.id));

                console.log(
                  `[Fail-safe API Check] User ID ${userAccount.id} upgraded to Level ${pkg.plan.level} until ${newExpiredAt.toISOString()}`
                );

                revalidatePath("/");
                revalidatePath("/admin");
              }
            }
          }

          paymentRecord.status = "paid";
        } else if (
          payosOrder &&
          (payosOrder.status === "CANCELLED" || payosOrder.status === "EXPIRED")
        ) {
          // Update local database status to cancelled
          await db
            .update(payments)
            .set({ status: "cancelled" })
            .where(eq(payments.id, paymentRecord.id));

          paymentRecord.status = "cancelled";
        }
      } catch (payosErr) {
        console.error("Failed to query PayOS API directly:", payosErr);
      }
    }

    return NextResponse.json({ status: paymentRecord.status });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ khi kiểm tra trạng thái" },
      { status: 500 }
    );
  }
}
