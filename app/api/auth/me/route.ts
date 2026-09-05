import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { accounts, userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getFreeVipMode } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies?.get("session")?.value;
    let user: any = null;

    if (token) {
      try {
        const payload = await decryptSession(token);
        const userId = Number(payload?.userId);
        if (userId && !isNaN(userId) && db) {
          const foundUsers = await db
            .select({
              id: accounts.id,
              username: accounts.username,
              email: accounts.email,
              role: accounts.role,
              imgUrl: accounts.imgUrl,
              gender: accounts.gender,
              phone: accounts.phone,
              status: accounts.status,
              level: accounts.level,
              expiredAt: accounts.expiredAt,
            })
            .from(accounts)
            .where(eq(accounts.id, userId))
            .limit(1);

          const foundUser = foundUsers?.[0];

          if (foundUser && foundUser.status !== 0) {
            let activeLevel = foundUser.level || 0;
            let activeExpiredAt = foundUser.expiredAt;

            try {
              const activeSubs = await db.query.userSubscriptions.findMany({
                where: eq(userSubscriptions.idAccount, foundUser.id),
                with: { plan: true },
              });
              const now = new Date();
              const validSubs = (activeSubs || []).filter(
                (sub: any) => sub.plan && new Date(sub.expiredAt) > now
              );
              if (validSubs.length > 0) {
                const highestSub = validSubs.reduce((max: any, current: any) => {
                  const maxLevel = max.plan?.level || 0;
                  const currentLevel = current.plan?.level || 0;
                  return currentLevel > maxLevel ? current : max;
                }, validSubs[0]);
                activeLevel = highestSub.plan?.level || 0;
                activeExpiredAt = new Date(highestSub.expiredAt);
              }
            } catch (_) {}

            user = {
              ...foundUser,
              level: activeLevel,
              expiredAt: activeExpiredAt ? new Date(activeExpiredAt).toISOString() : null,
            };
          }
        }
      } catch (authErr) {
        console.warn("Auth token decode error in /api/auth/me:", authErr);
      }
    }

    let freeVipMode = false;
    try {
      freeVipMode = await getFreeVipMode();
    } catch (_) {}

    return NextResponse.json({
      user,
      freeVipMode,
    });
  } catch (err: any) {
    console.error("Unhandled error in /api/auth/me:", err);
    return NextResponse.json({ user: null, freeVipMode: false });
  }
}
