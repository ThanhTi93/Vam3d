"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, payments } from "@/lib/db/schema";
import { registerSchema, loginSchema } from "@/lib/validations/schemas";
import { hashPassword, comparePassword } from "./password";
import { encryptSession, decryptSession } from "./session";

/**
 * Registers a new user. 
 * If it's the first user in the database, automatically grants the "admin" role.
 */
export async function registerUser(formData: any) {
  if (!db) {
    throw new Error("Cơ sở dữ liệu chưa sẵn sàng");
  }

  // Validate the inputs
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(errorMsg || "Dữ liệu không hợp lệ");
  }

  const { username, email, password, gender, phone, imgUrl } = result.data;

  // Check if email already exists
  const existingEmail = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);

  if (existingEmail.length > 0) {
    throw new Error("Email đã được sử dụng");
  }

  // Check if username already exists
  const existingUsername = await db
    .select()
    .from(accounts)
    .where(eq(accounts.username, username))
    .limit(1);

  if (existingUsername.length > 0) {
    throw new Error("Tên đăng nhập đã được sử dụng");
  }

  // Everyone registers as a normal user with level 0
  const role = "user";
  const hashedPassword = await hashPassword(password);

  // Insert user into accounts table
  const [newUser] = await db
    .insert(accounts)
    .values({
      username,
      email,
      password: hashedPassword,
      gender: gender || null,
      phone: phone || null,
      role,
      imgUrl: imgUrl || null,
      status: 1,
      level: 0,
    })
    .returning({
      id: accounts.id,
      username: accounts.username,
      email: accounts.email,
      role: accounts.role,
      imgUrl: accounts.imgUrl,
      level: accounts.level,
    });

  // Create session
  const sessionToken = await encryptSession({ userId: newUser.id, role: newUser.role });

  // Store in secure HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return newUser;
}

/**
 * Logins a user by verifying password hash.
 * Stores JWT in a cookie on success.
 */
export async function loginUser(formData: any) {
  if (!db) {
    throw new Error("Cơ sở dữ liệu chưa sẵn sàng");
  }

  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(errorMsg || "Dữ liệu không hợp lệ");
  }

  const { email, password } = result.data;

  // Retrieve user by email
  const [user] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Tài khoản không tồn tại");
  }

  if (user.status === 0) {
    throw new Error("Tài khoản đã bị khóa");
  }

  // Compare passwords
  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    throw new Error("Mật khẩu không chính xác");
  }

  // Create session token
  const sessionToken = await encryptSession({ userId: user.id, role: user.role });

  // Store in secure HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    imgUrl: user.imgUrl,
    level: user.level,
  };
}

/**
 * Clears the session cookie to log out the user.
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

/**
 * Retrieves the current logged-in user profile by decrypting the session cookie.
 */
export async function getCurrentUser() {
  if (!db) return null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const payload = await decryptSession(token);
    if (!payload || !payload.userId) return null;

    const [user] = await db
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

    if (!user || user.status === 0) {
      cookieStore.delete("session");
      return null;
    }

    // Dynamic VIP calculation and fallback
    let activeLevel = user.level || 0;
    let activeExpiredAt = user.expiredAt;
    let vipDebugInfo = "";

    try {
      const userPayments = await db.query.payments.findMany({
        where: eq(payments.idAccount, user.id),
        with: {
          package: {
            with: {
              plan: true
            }
          }
        }
      });

      vipDebugInfo += `rawCount:${userPayments?.length || 0}; `;

      if (userPayments && userPayments.length > 0) {
        // Filter paid payments
        const paidPayments = userPayments.filter((p: any) => p.status === "paid" && p.package?.plan);
        vipDebugInfo += `paidCount:${paidPayments.length}; `;

        const now = new Date();
        const paymentsByLevel: { [key: number]: any[] } = {};
        
        for (const p of paidPayments) {
          const lvl = p.package?.plan?.level || 0;
          if (lvl > 0) {
            if (!paymentsByLevel[lvl]) {
              paymentsByLevel[lvl] = [];
            }
            paymentsByLevel[lvl].push(p);
          }
        }

        const levels = Object.keys(paymentsByLevel).map(Number).sort((a, b) => b - a);
        let calculatedVip: { level: number; expiredAt: Date | null } | null = null;

        for (const lvl of levels) {
          const list = paymentsByLevel[lvl];
          list.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          let expireDate: Date | null = null;
          for (const p of list) {
            const pDate = new Date(p.createdAt);
            const months = p.package?.time || 0;
            
            if (!expireDate || pDate > expireDate) {
              expireDate = new Date(pDate);
              expireDate.setMonth(expireDate.getMonth() + months);
            } else {
              expireDate.setMonth(expireDate.getMonth() + months);
            }
          }

          vipDebugInfo += `Lvl${lvl}Exp:${expireDate ? expireDate.toISOString().substring(0, 10) : "null"}; `;

          if (expireDate && expireDate > now) {
            calculatedVip = { level: lvl, expiredAt: expireDate };
            break;
          }
        }

        vipDebugInfo += `calcVipLvl:${calculatedVip ? calculatedVip.level : "none"}; `;

        if (calculatedVip) {
          const dbVipActive = activeLevel > 0 && activeExpiredAt && new Date(activeExpiredAt) > now;
          if (!dbVipActive || calculatedVip.level >= activeLevel) {
            activeLevel = calculatedVip.level;
            activeExpiredAt = calculatedVip.expiredAt;
          }
        } else {
          // If calculated VIP has expired but database value is also not active, ensure we drop back to level 0
          const dbVipActive = activeLevel > 0 && activeExpiredAt && new Date(activeExpiredAt) > now;
          if (!dbVipActive) {
            activeLevel = 0;
            activeExpiredAt = null;
          }
        }
      }
    } catch (e: any) {
      console.error("Error calculating dynamic VIP:", e);
      vipDebugInfo += `err:${e.message}; `;
    }

    return {
      ...user,
      level: activeLevel,
      expiredAt: activeExpiredAt ? activeExpiredAt.toISOString() : null,
      vipDebugInfo,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    try {
      const cookieStore = await cookies();
      cookieStore.delete("session");
    } catch (_) {}
    return null;
  }
}

/**
 * Updates the current logged-in user's avatar image URL.
 */
export async function updateUserAvatar(url: string) {
  if (!db) throw new Error("Cơ sở dữ liệu chưa sẵn sàng");
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) throw new Error("Bạn chưa đăng nhập");

    const payload = await decryptSession(token);
    if (!payload || !payload.userId) throw new Error("Phiên đăng nhập không hợp lệ");

    await db
      .update(accounts)
      .set({ imgUrl: url })
      .where(eq(accounts.id, Number(payload.userId)));

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user avatar:", error);
    throw new Error(error.message || "Không thể cập nhật ảnh đại diện");
  }
}
