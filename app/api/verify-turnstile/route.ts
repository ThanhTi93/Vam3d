import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encryptChallengeClearance } from "@/lib/auth/challenge";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing Turnstile verification token" },
        { status: 400 }
      );
    }

    // Get user IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               (request as any).ip || 
               "127.0.0.1";

    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

    // Verify token with Cloudflare Turnstile
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      console.warn("Turnstile verification failed:", verifyData);
      return NextResponse.json(
        { success: false, error: "Turnstile verification failed", details: verifyData["error-codes"] },
        { status: 400 }
      );
    }

    // Turnstile passed, encrypt clearance token
    const clearanceToken = await encryptChallengeClearance(ip);

    // Create response with cookies
    const response = NextResponse.json({ success: true });
    
    // Set cf_clearance cookie, secure, HttpOnly, expiring in 2 hours
    response.cookies.set("cf_clearance", clearanceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch (error: any) {
    console.error("Error in Turnstile verification API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
