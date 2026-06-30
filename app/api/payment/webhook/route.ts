import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, accounts, packages, plans } from "@/lib/db/schema";
import { payOS } from "@/lib/payos";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("PayOS Webhook received:", JSON.stringify(body));

    if (!db) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 500 });
    }

    // 1. Verify the signature of webhook data from PayOS
    let webhookData;
    try {
      webhookData = await payOS.webhooks.verify(body);
    } catch (err: any) {
      console.error("PayOS Signature verification failed:", err);
      return NextResponse.json({ error: "Chữ ký không hợp lệ" }, { status: 400 });
    }

    console.log("Verified webhook data:", JSON.stringify(webhookData));

    // Handle webhook validation test requests from PayOS (e.g., when registering webhook)
    if (webhookData.orderCode === 0 || webhookData.description === "Ma xac nhan kenh thanh toan") {
      return NextResponse.json({ success: true, message: "Xác thực webhook thành công" });
    }

    // 2. Query the payment record in the database
    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.orderCode, webhookData.orderCode),
    });

    if (!paymentRecord) {
      console.warn(`No payment record found for orderCode ${webhookData.orderCode}`);
      return NextResponse.json({ success: true, message: "Không tìm thấy thông tin thanh toán, bỏ qua" });
    }

    // Prevent double processing if already marked as paid
    if (paymentRecord.status === "paid") {
      return NextResponse.json({ success: true, message: "Giao dịch đã được xử lý trước đó" });
    }

    // 3. Process subscription upgrade if payment succeeded
    // Success code from PayOS webhook data is "00"
    if (body.success === true || body.code === "00" || webhookData.code === "00") {
      // Update payment status to paid conditionally to prevent race conditions
      const updatedRows = await db
        .update(payments)
        .set({ status: "paid" })
        .where(and(eq(payments.id, paymentRecord.id), eq(payments.status, "pending")))
        .returning({ id: payments.id });

      if (updatedRows.length === 0) {
        return NextResponse.json({ success: true, message: "Giao dịch đã được xử lý trước đó" });
      }

      // Fetch package and plan details
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

            // If the user's active membership is of the same or higher tier and has not expired, extend it
            if (
              userAccount.level !== null &&
              userAccount.level >= pkg.plan.level &&
              currentExpiredAt &&
              new Date(currentExpiredAt) > new Date()
            ) {
              newExpiredAt = new Date(currentExpiredAt);
              newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
            } else {
              // Otherwise start from today
              newExpiredAt.setMonth(newExpiredAt.getMonth() + timeMonths);
            }

            // Update user accounts level and expiredAt
            await db
              .update(accounts)
              .set({
                level: pkg.plan.level,
                expiredAt: newExpiredAt,
              })
              .where(eq(accounts.id, userAccount.id));

            console.log(
              `User ID ${userAccount.id} upgraded/extended to Level ${pkg.plan.level} until ${newExpiredAt.toISOString()}`
            );

            // Revalidate paths to update VIP access state globally
            revalidatePath("/");
            revalidatePath("/admin");
          }
        }
      }
    } else {
      // If payment failed or was cancelled
      await db
        .update(payments)
        .set({ status: "cancelled" })
        .where(eq(payments.id, paymentRecord.id));
      
      console.log(`Payment failed or cancelled for orderCode ${webhookData.orderCode}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ error: error.message || "Lỗi máy chủ khi nhận webhook" }, { status: 500 });
  }
}
