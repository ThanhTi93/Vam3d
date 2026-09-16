import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ success: false, error: "No DB" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { path, title, referrer, device } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }

    // Ignore admin routes and static assets
    if (
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.includes(".")
    ) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Determine client IP for unique visitor hashing
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const dateStr = new Date().toISOString().slice(0, 10);
    const ipHash = crypto
      .createHash("sha256")
      .update(`${ip}-${dateStr}`)
      .digest("hex")
      .substring(0, 32);

    // Determine source from referrer
    let source = "direct";
    const ref = (referrer || "").toLowerCase();

    if (ref.includes("google.") || ref.includes("googleadservices") || ref.includes("googlesyndication")) {
      source = "google";
    } else if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("instagram.com")) {
      source = "facebook";
    } else if (ref.includes("tiktok.com")) {
      source = "tiktok";
    } else if (ref.includes("bing.com")) {
      source = "bing";
    } else if (ref.includes("coccoc.com")) {
      source = "coccoc";
    } else if (ref.includes("youtube.com") || ref.includes("youtu.be")) {
      source = "youtube";
    } else if (ref && !ref.includes(req.headers.get("host") || "vam3d")) {
      source = "other";
    }

    const cleanTitle = (title || "").substring(0, 490);
    const cleanPath = path.substring(0, 490);
    const cleanReferrer = (referrer || "").substring(0, 490);

    // Check device from client payload AND server User-Agent header as fallback
    const userAgent = req.headers.get("user-agent") || "";
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk/i.test(userAgent);
    const cleanDevice = device === "mobile" || device === "tablet" || isMobileUa ? "mobile" : "desktop";

    await db.insert(schema.trafficLogs).values({
      path: cleanPath,
      title: cleanTitle || cleanPath,
      referrer: cleanReferrer || null,
      source,
      device: cleanDevice,
      ipHash,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Traffic tracker error:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
