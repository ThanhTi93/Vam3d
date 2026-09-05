import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { accounts, userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getFreeVipMode } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    let user: any = null;

    if (token && db) {
      const payload = await decryptSession(token);
      if (payload?.userId) {
        const [foundUser] = await db
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
          .where(eq(accounts.id, Number(payload.userId)))
          .limit(1);

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
              (sub) => sub.plan && new Date(sub.expiredAt) > now
            );
            if (validSubs.length > 0) {
              const highestSub = validSubs.reduce((max, current) => {
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
    }

    const freeVipMode = await getFreeVipMode().catch(() => false);

    return NextResponse.json({
      user,
      freeVipMode,
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, freeVipMode: false });
  }
}
