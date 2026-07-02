import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("No DATABASE_URL found");
    return;
  }
  
  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });
  
  const user = await db.query.accounts.findFirst({
    where: eq(schema.accounts.username, "tiprokid1")
  });
  
  if (!user) {
    console.log("User not found");
    return;
  }

  // Simulate getCurrentUser VIP calculation logic
  let activeLevel = 0;
  let activeExpiredAt: Date | null = null;
  let vipDebugInfo = "";

  try {
    const activeSubs = await db.query.userSubscriptions.findMany({
      where: eq(schema.userSubscriptions.idAccount, user.id),
      with: {
        plan: true
      }
    });

    vipDebugInfo += `rawSubsCount:${activeSubs?.length || 0}; `;

    const now = new Date();
    // Filter subscriptions that have active plan levels and are not expired
    const validSubs = (activeSubs || []).filter(sub => sub.plan && new Date(sub.expiredAt) > now);
    vipDebugInfo += `validSubsCount:${validSubs.length}; `;

    if (validSubs.length > 0) {
      // Find the subscription with the highest level plan
      const highestSub = validSubs.reduce((max, current) => {
        const maxLevel = max.plan?.level || 0;
        const currentLevel = current.plan?.level || 0;
        return currentLevel > maxLevel ? current : max;
      }, validSubs[0]);

      activeLevel = highestSub.plan?.level || 0;
      activeExpiredAt = new Date(highestSub.expiredAt);
      vipDebugInfo += `activePlan:${highestSub.plan?.name}, level:${activeLevel}; `;
    } else {
      // Check if there is an admin-assigned direct active VIP in the DB
      const dbVipActive = (user.level || 0) > 0 && user.expiredAt && new Date(user.expiredAt) > now;
      if (dbVipActive) {
        activeLevel = user.level || 0;
        activeExpiredAt = user.expiredAt;
        vipDebugInfo += `adminVipLevel:${activeLevel}; `;
      }
    }
  } catch (e: any) {
    console.error("Error calculating dynamic VIP from userSubscriptions:", e);
    vipDebugInfo += `err:${e.message}; `;
  }

  const resultUser = {
    ...user,
    level: activeLevel,
    expiredAt: activeExpiredAt ? activeExpiredAt.toISOString() : null,
    vipDebugInfo,
  };

  console.log("SIMULATED RESULT:", JSON.stringify(resultUser, null, 2));
}

run();
