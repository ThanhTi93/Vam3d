import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      popunderUrl: "",
      popunderEnabled: false,
      popunderIntervalHours: 24,
      mobileStickyEnabled: false,
    },
  });
}
