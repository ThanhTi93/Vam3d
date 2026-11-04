"use client";

export interface ClientAdConfig {
  socialBarEnabled: boolean;
  banner300Enabled: boolean;
  nativeBannerEnabled: boolean;
  popunderUrl: string;
  popunderEnabled: boolean;
  popunderIntervalHours: number;
}

const DEFAULT_AD_CONFIG: ClientAdConfig = {
  socialBarEnabled: true,
  banner300Enabled: true,
  nativeBannerEnabled: true,
  popunderUrl: "",
  popunderEnabled: false,
  popunderIntervalHours: 12,
};

let cachedConfig: ClientAdConfig | null = null;
let cachedAt = 0;
let inflightPromise: Promise<ClientAdConfig> | null = null;
const CLIENT_CACHE_TTL_MS = 10_000;

export async function getClientAdConfig(): Promise<ClientAdConfig> {
  const now = Date.now();
  if (cachedConfig && now - cachedAt < CLIENT_CACHE_TTL_MS) {
    return cachedConfig;
  }
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetch("/api/ads/config", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) return DEFAULT_AD_CONFIG;
      const json = await res.json();
      const data = json?.data || {};
      const next: ClientAdConfig = {
        socialBarEnabled: data.socialBarEnabled !== false,
        banner300Enabled: data.banner300Enabled !== false,
        nativeBannerEnabled: data.nativeBannerEnabled !== false,
        popunderUrl: typeof data.popunderUrl === "string" ? data.popunderUrl : "",
        popunderEnabled: Boolean(data.popunderEnabled),
        popunderIntervalHours: typeof data.popunderIntervalHours === "number" ? data.popunderIntervalHours : 12,
      };
      cachedConfig = next;
      cachedAt = Date.now();
      return next;
    })
    .catch(() => DEFAULT_AD_CONFIG)
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

