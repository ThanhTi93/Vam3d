import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Đã tắt toàn bộ quảng cáo theo cấu hình tập trung 100% vào SEO.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      socialBarEnabled: false,
      banner300Enabled: false,
      nativeBannerEnabled: false,
      popunderUrl: "",
      popunderEnabled: false,
      popunderIntervalHours: 24,
      mobileStickyEnabled: false,
    },
  });
}
