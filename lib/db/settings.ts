import { db, schema } from "./index";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getCachedSystemSetting(key: string, defaultValue: string = "") {
  if (!db) return defaultValue;
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, key),
    });
    return setting?.value ?? defaultValue;
  } catch (err) {
    console.error(`Error fetching system setting '${key}':`, err);
    return defaultValue;
  }
}

export async function setSystemSetting(key: string, value: string) {
  if (!db) return;
  try {
    await db
      .insert(schema.systemSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: { value, updatedAt: new Date() },
      });

    revalidateTag("system-settings", "default");
    revalidatePath("/", "layout");
  } catch (err) {
    console.error(`Error setting system setting '${key}':`, err);
    throw err;
  }
}

export async function getFreeVipMode(): Promise<boolean> {
  const val = await getCachedSystemSetting("free_vip_mode", "false");
  return val === "true";
}

export async function setFreeVipMode(enabled: boolean): Promise<void> {
  await setSystemSetting("free_vip_mode", enabled ? "true" : "false");
}

let turnstileMemoryCache: { value: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000; // 15s in-memory cache for fast proxy/middleware execution

export async function getTurnstileMode(): Promise<boolean> {
  const now = Date.now();
  if (turnstileMemoryCache && now - turnstileMemoryCache.timestamp < CACHE_TTL_MS) {
    return turnstileMemoryCache.value;
  }
  if (!db) return false;
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, "turnstile_enabled"),
    });
    const enabled = setting ? setting.value === "true" : false;
    turnstileMemoryCache = { value: enabled, timestamp: now };
    return enabled;
  } catch (err) {
    console.error("Error fetching turnstile mode:", err);
    return turnstileMemoryCache ? turnstileMemoryCache.value : false;
  }
}

export async function setTurnstileMode(enabled: boolean): Promise<void> {
  await setSystemSetting("turnstile_enabled", enabled ? "true" : "false");
  turnstileMemoryCache = { value: enabled, timestamp: Date.now() };
}
