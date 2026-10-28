import { NextResponse } from "next/server";
import { getCachedSystemSetting } from "@/lib/db/settings";

export const revalidate = 60; // Cache 60 seconds

export async function GET() {
  try {
    const [popunderUrl, popunderEnabled, popunderInterval, mobileStickyEnabled] = await Promise.all([
      getCachedSystemSetting("ad_popunder_url", ""),
      getCachedSystemSetting("ad_popunder_enabled", "true"),
      getCachedSystemSetting("ad_popunder_interval_hours", "12"),
      getCachedSystemSetting("ad_mobile_sticky_enabled", "true"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        popunderUrl: popunderUrl || "",
        popunderEnabled: popunderEnabled !== "false",
        popunderIntervalHours: parseInt(popunderInterval, 10) || 12,
        mobileStickyEnabled: mobileStickyEnabled !== "false",
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message,
      data: {
        popunderUrl: "",
        popunderEnabled: true,
        popunderIntervalHours: 12,
        mobileStickyEnabled: true,
      },
    });
  }
}
