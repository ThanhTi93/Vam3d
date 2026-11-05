import { NextResponse } from "next/server";
import { getCachedSystemSetting } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      socialBarEnabled,
      banner300Enabled,
      nativeBannerEnabled,
      popunderUrl,
      popunderEnabled,
      popunderInterval,
    ] = await Promise.all([
      getCachedSystemSetting("ad_social_bar_enabled", "true"),
      getCachedSystemSetting("ad_banner_300x250_enabled", "true"),
      getCachedSystemSetting("ad_native_banner_enabled", "true"),
      getCachedSystemSetting("ad_popunder_url", ""),
      getCachedSystemSetting("ad_popunder_enabled", "false"),
      getCachedSystemSetting("ad_popunder_interval_hours", "12"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        socialBarEnabled: socialBarEnabled !== "false",
        banner300Enabled: banner300Enabled !== "false",
        nativeBannerEnabled: nativeBannerEnabled !== "false",
        popunderUrl: "",
        popunderEnabled: false,
        popunderIntervalHours: parseInt(popunderInterval, 10) || 12,
        mobileStickyEnabled: false,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        socialBarEnabled: true,
        banner300Enabled: true,
        nativeBannerEnabled: true,
        popunderUrl: "",
        popunderEnabled: false,
        popunderIntervalHours: 24,
        mobileStickyEnabled: false,
      },
    });
  }
}
