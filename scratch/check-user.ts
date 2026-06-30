import { db } from "../lib/db";
import { accounts, payments } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  if (!db) {
    console.error("No database");
    return;
  }
  const allAccounts = await db.query.accounts.findMany();
  console.log("--- Accounts ---");
  console.log(allAccounts.map(a => ({
    id: a.id,
    username: a.username,
    level: a.level,
    expiredAt: a.expiredAt
  })));

  const allPayments = await db.query.payments.findMany({
    with: {
      package: {
        with: {
          plan: true
        }
      }
    }
  });
  console.log("--- Payments ---");
  console.log(allPayments.map(p => ({
    id: p.id,
    orderCode: p.orderCode,
    idAccount: p.idAccount,
    idPackage: p.idPackage,
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt,
    packageTime: p.package?.time,
    planName: p.package?.plan?.name
  })));
}

check();
