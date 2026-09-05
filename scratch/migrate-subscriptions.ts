import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
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
  
  console.log("Starting subscriptions migration from payments history...");
  
  // 1. Fetch all accounts
  const allAccounts = await db.select().from(schema.accounts);
  
  for (const account of allAccounts) {
    // 2. Fetch all paid payments for this account
    const userPayments = await db.query.payments.findMany({
      where: eq(schema.payments.idAccount, account.id),
      with: {
        package: {
          with: {
            plan: true
          }
        }
      }
    });
    
    if (!userPayments || userPayments.length === 0) continue;
    
    const paidPayments = userPayments.filter(p => p.status === "paid" && p.package?.plan) as any[];
    if (paidPayments.length === 0) continue;
    
    // 3. Group payments by plan level
    const paymentsByPlan: { [key: number]: { planId: number, payments: any[] } } = {};
    for (const p of paidPayments) {
      const plan = p.package.plan;
      if (plan.level > 0) {
        if (!paymentsByPlan[plan.id]) {
          paymentsByPlan[plan.id] = { planId: plan.id, payments: [] };
        }
        paymentsByPlan[plan.id].payments.push(p);
      }
    }
    
    // 4. Calculate stacked expiredAt for each plan and upsert userSubscriptions
    for (const planIdKey of Object.keys(paymentsByPlan)) {
      const planId = Number(planIdKey);
      const { payments: list } = paymentsByPlan[planId];
      
      // Sort payments ascending by purchase date
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      let expireDate: Date | null = null;
      for (const p of list) {
        const pDate = new Date(p.createdAt);
        const months = p.package.time || 0;
        
        if (!expireDate || pDate > expireDate) {
          expireDate = new Date(pDate);
          expireDate.setMonth(expireDate.getMonth() + months);
        } else {
          expireDate.setMonth(expireDate.getMonth() + months);
        }
      }
      
      if (expireDate) {
        console.log(`User ID ${account.id} -> Plan ID ${planId}: expiredAt=${expireDate.toISOString()}`);
        
        // Delete existing sub record if any to prevent duplicate insert
        await db.delete(schema.userSubscriptions)
          .where(
            and(
              eq(schema.userSubscriptions.idAccount, account.id),
              eq(schema.userSubscriptions.idPlan, planId)
            )
          );
          
        await db.insert(schema.userSubscriptions)
          .values({
            idAccount: account.id,
            idPlan: planId,
            expiredAt: expireDate,
          });
      }
    }
  }
  
  console.log("Migration completed successfully!");
}

run();
