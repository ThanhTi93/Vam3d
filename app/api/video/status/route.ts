import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bunnyVideoId = searchParams.get("bunnyVideoId")?.trim();
    const episodeIdStr = searchParams.get("episodeId")?.trim();
    const episodeId = episodeIdStr ? parseInt(episodeIdStr, 10) : null;

    if (!bunnyVideoId && !episodeId) {
      return NextResponse.json({ error: "Missing bunnyVideoId or episodeId" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // 1. Tìm episode trong Database
    const episode = await db.query.episodes.findFirst({
      where: (ep, { eq, or }) => {
        if (episodeId && bunnyVideoId) {
          return or(eq(ep.id, episodeId), eq(ep.bunnyVideoId, bunnyVideoId));
        }
        if (episodeId) return eq(ep.id, episodeId);
        return eq(ep.bunnyVideoId, bunnyVideoId!);
      },
      with: {
        movie: {
          columns: { id: true, slug: true },
        },
      },
    });

    const activeVideoId = bunnyVideoId || episode?.bunnyVideoId;

    // Nếu trong DB đã đánh dấu completed, trả về ngay lập tức
    if (episode && episode.bunnyStatus === "completed") {
      return NextResponse.json({
        status: "completed",
        cachedInDb: true,
      });
    }

    // 2. Nếu DB chưa completed và có bunnyVideoId, gọi Bunny API để kiểm tra trạng thái thật
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "689414";
    const apiKey = process.env.BUNNY_API_KEY;

    if (activeVideoId && apiKey) {
      try {
        const bunnyRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${activeVideoId}`, {
          method: "GET",
          headers: {
            AccessKey: apiKey,
            accept: "application/json",
          },
          cache: "no-store",
        });

        if (bunnyRes.ok) {
          const data = await bunnyRes.json();
          // Status code Bunny:
          // 0 = Queued, 1 = Processing, 2 = Encoding, 3 = Finished, 4 = Resolution Finished, 5 = Failed, 6 = PresignedUploadStarted, 7 = PresignedUploadFinished, 8 = PresignedUploadFailed
          let finalStatus = episode?.bunnyStatus || "processing";

          if (data.status === 3 || data.status === 4 || data.encodeProgress === 100) {
            finalStatus = "completed";
          } else if (data.status === 5 || data.status === 8) {
            finalStatus = "failed";
          } else if (data.status === 6 || data.status === 7 || data.status === 1) {
            finalStatus = "uploading";
          } else {
            finalStatus = "processing";
          }

          // Nếu trạng thái thay đổi hoặc đã hoàn tất, cập nhật Database và revalidate cache
          if (episode && finalStatus !== episode.bunnyStatus) {
            await db
              .update(schema.episodes)
              .set({ bunnyStatus: finalStatus })
              .where(eq(schema.episodes.id, episode.id));

            // Revalidate các trang liên quan để người xem khác cũng hết bị kẹt cache
            try {
              if (episode.movie?.slug) {
                revalidatePath(`/movie/${episode.movie.slug}`, "page");
              }
              if (episode.movie?.id) {
                revalidatePath(`/movie/${episode.movie.id}`, "page");
                revalidateTag(`movie:detail-${episode.movie.id}`, "default");
              }
              revalidatePath("/movie/[id]", "page");
              revalidatePath("/", "layout");
              revalidatePath("/tap-phim");
              revalidateTag("episodes:latest", "default");
            } catch (revErr) {
              console.warn("Revalidation error in video status route:", revErr);
            }
          }

          return NextResponse.json({
            status: finalStatus,
            encodeProgress: data.encodeProgress ?? null,
            bunnyStatusRaw: data.status,
          });
        }
      } catch (bunnyErr) {
        console.error("Error querying Bunny API in video status route:", bunnyErr);
      }
    }

    // Fallback: trả về trạng thái hiện có trong DB
    return NextResponse.json({
      status: episode?.bunnyStatus || "processing",
    });
  } catch (err: any) {
    console.error("Video status route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
