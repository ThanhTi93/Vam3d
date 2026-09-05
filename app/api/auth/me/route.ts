import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";
import { getFreeVipMode } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user, freeVipMode] = await Promise.all([
      getCurrentUser().catch(() => null),
      getFreeVipMode().catch(() => false),
    ]);

    return NextResponse.json({
      user,
      freeVipMode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { user: null, freeVipMode: false, error: err.message },
      { status: 200 }
    );
  }
}
