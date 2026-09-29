import { NextRequest, NextResponse } from "next/server";

const BUNNY_STREAM_HOST = process.env.BUNNY_STREAM_HOST || "vz-df52fbd4-040.b-cdn.net";

function isAllowedRequest(request: NextRequest): { allowed: boolean; originHeader: string } {
  const referer = request.headers.get("referer") || "";
  const origin = request.headers.get("origin") || "";
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  const secFetchSite = request.headers.get("sec-fetch-site");

  // 1. Block common bot / scraper tools
  const botAgents = [
    "python",
    "curl",
    "wget",
    "scrapy",
    "aiohttp",
    "urllib",
    "httpclient",
    "requests",
    "node-fetch",
    "axios",
    "postman",
    "insomnia",
    "bot",
    "spider",
    "crawler",
  ];
  if (botAgents.some((b) => userAgent.includes(b))) {
    return { allowed: false, originHeader: "" };
  }

  // 2. Reject explicit cross-site requests (hotlinking from other websites)
  if (secFetchSite === "cross-site") {
    return { allowed: false, originHeader: "" };
  }

  const isAllowedHost = (hostname: string) => {
    return (
      hostname === "vam3dhentai.online" ||
      hostname.endsWith(".vam3dhentai.online") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".workers.dev") ||
      hostname.endsWith(".pages.dev")
    );
  };

  let matchedOrigin = "";

  // 3. Verify Origin header if present
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (isAllowedHost(originHost)) {
        matchedOrigin = origin;
      } else {
        return { allowed: false, originHeader: "" };
      }
    } catch {
      return { allowed: false, originHeader: "" };
    }
  }

  // 4. Verify Referer header if present
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (isAllowedHost(refUrl.hostname)) {
        if (!matchedOrigin) {
          matchedOrigin = `${refUrl.protocol}//${refUrl.host}`;
        }
      } else {
        // Hotlinked from an external website
        return { allowed: false, originHeader: "" };
      }
    } catch {
      return { allowed: false, originHeader: "" };
    }
  }

  // 5. In production, if neither Referer nor Origin is present, reject direct calls
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && !referer && !origin) {
    return { allowed: false, originHeader: "" };
  }

  return {
    allowed: true,
    originHeader: matchedOrigin || "https://www.vam3dhentai.online",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  // Anti-scraping and anti-hotlinking protection
  const { allowed, originHeader } = isAllowedRequest(request);
  if (!allowed) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse("Invalid stream path", { status: 400 });
    }

    const path = slug.join("/");
    const targetUrl = `https://${BUNNY_STREAM_HOST}/${path}`;

    // Redirect directly to Bunny CDN to prevent VPS outgoing bandwidth consumption
    return NextResponse.redirect(targetUrl, {
      status: 307,
      headers: {
        "Access-Control-Allow-Origin": originHeader,
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      },
    });
  } catch (err: any) {
    console.error("Stream proxy redirect error:", err);
    return new NextResponse("Stream proxy internal error", { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const { allowed, originHeader } = isAllowedRequest(request);
  if (!allowed) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": originHeader,
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}
