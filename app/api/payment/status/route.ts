import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, accounts, packages, userSubscriptions } from "@/lib/db/schema";
import { payOS } from "@/lib/payos";
import { eq, and } from "drizzle-orm";
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
          // Update payment status in database conditionally to prevent race conditions
          const updatedRows = await db
            .update(payments)
            .set({ status: "paid" })
            .where(and(eq(payments.id, paymentRecord.id), eq(payments.status, "pending")))
            .returning({ id: payments.id });

          if (updatedRows.length === 0) {
            return NextResponse.json({ status: "paid" });
          }

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
                let newExpiredAt = new Date();

                // Find existing subscription for this user and this plan
                const existingSub = await db.query.userSubscriptions.findFirst({
                  where: and(
                    eq(userSubscriptions.idAccount, userAccount.id),
                    eq(userSubscriptions.idPlan, pkg.plan.id)
                  ),
                });

                if (existingSub) {
                  const currentSubExpiredAt = existingSub.expiredAt;
                  if (currentSubExpiredAt && new Date(currentSubExpiredAt) > new Date()) {
                    // Extend existing active subscription
                    newExpiredAt = new Date(currentSubExpiredAt);
                    newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
                  } else {
                    // Start fresh since it was expired
                    newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
                  }

                  await db
                    .update(userSubscriptions)
                    .set({
                      expiredAt: newExpiredAt,
                      updatedAt: new Date(),
                    })
                    .where(eq(userSubscriptions.id, existingSub.id));
                } else {
                  // Insert new subscription record
                  newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
                  await db
                    .insert(userSubscriptions)
                    .values({
                      idAccount: userAccount.id,
                      idPlan: pkg.plan.id,
                      expiredAt: newExpiredAt,
                    });
                }

                // Query all active subscriptions for the user to sync accounts table
                const allUserSubs = await db.query.userSubscriptions.findMany({
                  where: eq(userSubscriptions.idAccount, userAccount.id),
                  with: { plan: true },
                });
                const now = new Date();
                const activeSubsList = (allUserSubs || []).filter(sub => sub.plan && new Date(sub.expiredAt) > now);

                let highestLevel = 0;
                let highestExpiredAt: Date | null = null;
                
                if (activeSubsList.length > 0) {
                  const highestSub = activeSubsList.reduce((max, current) => {
                    const maxLevel = max.plan?.level || 0;
                    const currentLevel = current.plan?.level || 0;
                    return currentLevel > maxLevel ? current : max;
                  }, activeSubsList[0]);
                  highestLevel = highestSub.plan?.level || 0;
                  highestExpiredAt = new Date(highestSub.expiredAt);
                }

                await db
                  .update(accounts)
                  .set({
                    level: highestLevel,
                    expiredAt: highestExpiredAt,
                  })
                  .where(eq(accounts.id, userAccount.id));

                console.log(
                  `[Fail-safe API Check] User ID ${userAccount.id} subscriptions updated. Highest Active: Level ${highestLevel} until ${highestExpiredAt ? highestExpiredAt.toISOString() : "N/A"}`
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
