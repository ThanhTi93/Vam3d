import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { episodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Bunny Webhook received:", body);

    const videoId = body.VideoGuid || body.videoGuid;
    const statusNum = body.Status;
    const action = body.Action;

    if (!videoId) {
      return NextResponse.json({ error: "Missing VideoGuid" }, { status: 400 });
    }

    let finalStatus = "processing";
    if (statusNum === 3 || statusNum === 4 || action === "Video.Transcoding.Completed") {
      finalStatus = "completed";
    } else if (statusNum === 5 || statusNum === 8 || action === "Video.Transcoding.Failed" || action === "Video.Transcoding.Error") {
      finalStatus = "failed";
    } else if (statusNum === 6 || statusNum === 7 || statusNum === 1 || action === "Video.Created") {
      finalStatus = "uploading";
    } else if (statusNum === 0 || statusNum === 2 || action === "Video.Transcoding.Started") {
      finalStatus = "processing";
    } else {
      // Return success but log that no status mapping matched
      return NextResponse.json({ success: true, message: `No action taken for status ${statusNum} / action ${action}` });
    }

    if (!db) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const result = await db
      .update(episodes)
      .set({ bunnyStatus: finalStatus })
      .where(eq(episodes.bunnyVideoId, videoId))
      .returning({ id: episodes.id, idMovie: episodes.idMovie });

    console.log(`Updated episodes status for videoId ${videoId}:`, result);
    
    revalidatePath("/");
    revalidatePath("/admin");
    revalidateTag("episodes:latest", "default");
    revalidateTag("episodes:most-viewed", "default");
    revalidateTag("movies:all", "default");
    revalidateTag("movies:hot", "default");
    
    for (const row of result) {
      if (row.idMovie) {
        revalidateTag(`movie:detail-${row.idMovie}`, "default");
      }
    }

    return NextResponse.json({ success: true, updatedCount: result.length, status: finalStatus });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
