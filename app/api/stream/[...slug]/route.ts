import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";
import { Agent } from "undici";

const BUNNY_STREAM_HOST = process.env.BUNNY_STREAM_HOST || "vz-df52fbd4-040.b-cdn.net";

// Custom DNS Resolver using Google and Cloudflare Public DNS
const customResolver = new dns.Resolver();
customResolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);

// In-memory DNS cache to eliminate repeated DNS resolution latency
const dnsCache = new Map<string, { ip: string; expires: number }>();

function customLookup(hostname: string, opts: any, cb: any) {
  const callback = typeof opts === "function" ? opts : cb;
  const options = typeof opts === "object" ? opts : {};

  // Check in-memory DNS cache
  const cached = dnsCache.get(hostname);
  const now = Date.now();
  if (cached && cached.expires > now) {
    if (options.all) {
      return callback(null, [{ address: cached.ip, family: 4 }]);
    }
    return callback(null, cached.ip, 4);
  }

  customResolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      // Fallback to default system DNS lookup
      return dns.lookup(hostname, options, callback);
    }

    const ip = addresses[0];
    // Cache for 10 minutes
    dnsCache.set(hostname, { ip, expires: now + 10 * 60 * 1000 });

    if (options.all) {
      callback(null, addresses.map((a) => ({ address: a, family: 4 })));
    } else {
      callback(null, ip, 4);
    }
  });
}

const streamAgent = new Agent({
  connect: {
    lookup: customLookup,
  },
  pipelining: 1,
  keepAliveTimeout: 30000,
});

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

    // Forward range header if present for byte-range streaming
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://iframe.mediadelivery.net/",
      "Origin": "https://iframe.mediadelivery.net",
    };

    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      headers["range"] = rangeHeader;
    }

    const bunnyRes = await fetch(targetUrl, {
      headers,
      // @ts-ignore
      dispatcher: streamAgent,
      // @ts-ignore
      cf: {
        cacheTtl: path.endsWith(".m3u8") ? 60 : 86400 * 30,
        cacheEverything: true,
      },
    });

    if (!bunnyRes.ok && bunnyRes.status !== 206) {
      return new NextResponse(`Stream upstream error: ${bunnyRes.status}`, {
        status: bunnyRes.status,
      });
    }

    const contentType = bunnyRes.headers.get("content-type") || "";

    // If it's an HLS playlist (.m3u8), rewrite any absolute b-cdn.net URLs to our proxy path
    if (path.endsWith(".m3u8") || contentType.includes("mpegurl") || contentType.includes("application/x-mpegurl")) {
      const playlistText = await bunnyRes.text();
      // Replace absolute b-cdn.net URLs if any with /api/stream/
      const rewrittenPlaylist = playlistText.replace(
        new RegExp(`https?://${BUNNY_STREAM_HOST}/`, "g"),
        "/api/stream/"
      );

      return new NextResponse(rewrittenPlaylist, {
        status: bunnyRes.status,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": originHeader,
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      });
    }

    // For video segments (.ts, .mp4, audio), stream the response body directly
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType || "video/MP2T");
    responseHeaders.set("Access-Control-Allow-Origin", originHeader);
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type, Accept");
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

    const contentRange = bunnyRes.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    const contentLength = bunnyRes.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    const acceptRanges = bunnyRes.headers.get("accept-ranges");
    if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);

    return new NextResponse(bunnyRes.body, {
      status: bunnyRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Stream proxy error:", err);
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
