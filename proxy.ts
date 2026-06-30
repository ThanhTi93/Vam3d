import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/auth/session";

// Define paths that require authentication and the admin role
const ADMIN_ROUTE_PREFIX = "/admin";
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get the session token from the cookies
  const token = request.cookies.get("session")?.value;

  // 2. Check if the path is an admin route
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

  // 3. Check if the path is an auth route (login/register)
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

// Configure proxy matcher
export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
