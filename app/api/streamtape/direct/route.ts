import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for direct video URLs (streamtapeId -> { directUrl, expiresAt })
const cache = new Map<string, { directUrl: string; expiresAt: number }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get("url");
    const videoId = searchParams.get("id");

    let streamtapeId = videoId;
    if (!streamtapeId && videoUrl) {
      const match = videoUrl.match(/streamtape\.com\/(?:e|v)\/([a-zA-Z0-9]+)/);
      if (match) {
        streamtapeId = match[1];
      }
    }

    if (!streamtapeId) {
      return NextResponse.json({ error: "Missing Streamtape ID" }, { status: 400 });
    }

    // Check cache first (valid for 2 hours)
    const cached = cache.get(streamtapeId);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        success: true,
        directUrl: cached.directUrl,
        streamtapeId,
        cached: true,
      });
    }

    const embedUrl = `https://streamtape.com/e/${streamtapeId}`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.vam3dhentai.online/",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Streamtape embed" }, { status: 502 });
    }

    const html = await res.text();

    if (
      html.includes("Video blocked") ||
      html.includes("File not found") ||
      html.includes("Video is being converted")
    ) {
      return NextResponse.json({
        success: false,
        blocked: true,
        error: "Video đang được máy chủ chuyển đổi hoặc tạm thời chưa khả dụng trên Streamtape",
      });
    }

    const robotLine = html
      .split("\n")
      .find(
        (l) =>
          l.includes("document.getElementById('robotlink').innerHTML") ||
          l.includes("document.getElementById('botlink').innerHTML")
      );

    if (!robotLine) {
      return NextResponse.json({ error: "Cannot parse Streamtape video link" }, { status: 500 });
    }

    const expr = robotLine
      .replace(/document\.getElementById\(['"](?:robotlink|botlink)['"]\)\.innerHTML\s*=\s*/, "")
      .replace(/;\s*$/, "");

    let evaluated: string;
    try {
      evaluated = new Function(`return (${expr})`)();
    } catch {
      return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
    }

    const streamUrl = evaluated.includes("stream=1") ? evaluated : `${evaluated}&stream=1`;
    const getUrl = streamUrl.startsWith("//") ? `https:${streamUrl}` : streamUrl;

    // Follow redirect to obtain direct CDN URL
    const headRes = await fetch(getUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "manual",
    });

    const directMp4Url = headRes.headers.get("location") || getUrl;

    // Cache for 2 hours
    cache.set(streamtapeId, {
      directUrl: directMp4Url,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      success: true,
      directUrl: directMp4Url,
      streamtapeId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

