import { db, schema, sql } from "./index";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

let tableEnsured = false;

async function ensureSettingsTableExists() {
  if (tableEnsured || !sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    tableEnsured = true;
  } catch (err) {
    console.error("Error creating system_settings table:", err);
  }
}

export const getCachedSystemSetting = (key: string, defaultValue: string = "") =>
  unstable_cache(
    async () => {
      if (!db) return defaultValue;
      try {
        await ensureSettingsTableExists();
        const setting = await db.query.systemSettings.findFirst({
          where: eq(schema.systemSettings.key, key),
        });
        return setting?.value ?? defaultValue;
      } catch (err) {
        console.error(`Error fetching system setting '${key}':`, err);
        return defaultValue;
      }
    },
    [`system-setting-${key}`],
    { revalidate: 60, tags: ["system-settings", `system-setting-${key}`] }
  )();

export async function setSystemSetting(key: string, value: string) {
  if (!db) return;
  try {
    await ensureSettingsTableExists();
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
