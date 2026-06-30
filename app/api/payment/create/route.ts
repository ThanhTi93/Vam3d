import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, packages, plans } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/actions";
import { payOS } from "@/lib/payos";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { packageId } = body;
    if (!packageId) {
      return NextResponse.json({ error: "Thiếu packageId" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 500 });
    }

    // 1. Fetch package details including plan
    const pkg = await db.query.packages.findFirst({
      where: eq(packages.id, Number(packageId)),
      with: {
        plan: true,
      },
    });

    if (!pkg || !pkg.plan) {
      return NextResponse.json({ error: "Gói cước không tồn tại" }, { status: 404 });
    }

    // 2. Calculate amount
    // Price formula: plan.priceMonth * package.time * (1 - package.discount / 100)
    const priceMonth = parseFloat(pkg.plan.priceMonth);
    const timeMonths = pkg.time;
    const discount = parseFloat(pkg.discount || "0");
    const amountFloat = priceMonth * timeMonths * (1 - discount / 100);
    
    // Amount must be integer
    const amount = Math.round(amountFloat);

    if (amount <= 0) {
      return NextResponse.json({ error: "Số tiền thanh toán phải lớn hơn 0" }, { status: 400 });
    }

    // 3. Generate unique orderCode (up to 9007199254740991)
    // We can use a 9 digit timestamp suffix + a 2-digit random number to ensure uniqueness and fit in JS safe integer limits
    const orderCode = Number(String(Date.now()).slice(-8)) * 100 + Math.floor(Math.random() * 100);

    // 4. Create pending payment in DB
    await db.insert(payments).values({
      orderCode,
      idAccount: user.id,
      idPackage: pkg.id,
      amount: amount.toString(),
      status: "pending",
    });

    // 5. Create payment link in PayOS
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const returnUrl = `${siteUrl}/upgrade?payment=success&orderCode=${orderCode}`;
    const cancelUrl = `${siteUrl}/upgrade?payment=cancel&orderCode=${orderCode}`;

    // Description must be maximum 25 characters per PayOS rules
    const description = `VIP ${pkg.plan.level} ${timeMonths}T`.slice(0, 25);

    const paymentData = {
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
      items: [
        {
          name: `${pkg.plan.name} - ${timeMonths} tháng`,
          quantity: 1,
          price: amount,
        },
      ],
    };

    const paymentLinkRes = await payOS.paymentRequests.create(paymentData);

    return NextResponse.json({
      checkoutUrl: paymentLinkRes.checkoutUrl,
      orderCode,
    });
  } catch (error: any) {
    console.error("Error creating payment link:", error);
    return NextResponse.json({ error: error.message || "Lỗi máy chủ khi tạo link thanh toán" }, { status: 500 });
  }
}
