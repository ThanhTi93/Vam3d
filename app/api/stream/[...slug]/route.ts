import { NextRequest, NextResponse } from "next/server";

const BUNNY_STREAM_HOST = "vz-df52fbd4-840.b-cdn.net";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse("Invalid stream path", { status: 400 });
    }

    const path = slug.join("/");
    const targetUrl = `https://${BUNNY_STREAM_HOST}/${path}`;

    // Forward range header if present for byte-range streaming
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; Vam3dStreamProxy/1.0)",
    };

    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      headers["range"] = rangeHeader;
    }

    const bunnyRes = await fetch(targetUrl, {
      headers,
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
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      });
    }

    // For video segments (.ts, .mp4, audio), stream the response body directly
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType || "video/MP2T");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
