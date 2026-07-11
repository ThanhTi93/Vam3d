import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/auth/session";
import { decryptChallengeClearance } from "./lib/auth/challenge";

// Define paths that require authentication and the admin role
const ADMIN_ROUTE_PREFIX = "/admin";
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip challenge check for static assets, files, APIs, the challenge page, and Server Actions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/challenge" ||
    pathname.includes(".") ||
    request.headers.has("next-action")
  ) {
    return NextResponse.next();
  }

  // 2. Cloudflare Turnstile bot verification check
  const clearanceCookie = request.cookies.get("cf_clearance")?.value;
  const clearance = await decryptChallengeClearance(clearanceCookie || "");

  if (!clearance || !clearance.verified) {
    // User is not verified, redirect to challenge page with callback URL
    const challengeUrl = new URL("/challenge", request.url);
    challengeUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(challengeUrl);
  }

  // 3. Get the session token from the cookies
  const token = request.cookies.get("session")?.value;

  // 4. Check if the path is an admin route
  if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decrypt and verify the token
    const payload = await decryptSession(token);
    if (!payload || payload.role !== "admin") {
      // Redirect to unauthorized page if not an admin
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 5. Check if the path is an auth route (login/register)
  if (AUTH_ROUTES.includes(pathname)) {
    if (token) {
      // If session exists, try decrypting it
      const payload = await decryptSession(token);
      if (payload) {
        // Redirect already logged-in users to home page
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure proxy matcher to run on all page routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png (static assets)
     * - challenge (Turnstile challenge page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|challenge).*)",
  ],
};
