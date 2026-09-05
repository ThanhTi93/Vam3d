import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/auth/session";

const ADMIN_ROUTE_PREFIX = "/admin";
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    request.headers.has("next-action")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await decryptSession(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (AUTH_ROUTES.includes(pathname)) {
    if (token) {
      const payload = await decryptSession(token);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|challenge).*)",
  ],
};
