import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";
import { createR2PresignedUploadUrl, isR2Configured } from "@/lib/r2";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền thực hiện." }, { status: 403 });
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "Cloudflare R2 chưa được cấu hình. Vui lòng thêm R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME vào .env.local",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.filename) {
      return NextResponse.json({ error: "Thiếu tên file cần tải lên." }, { status: 400 });
    }

    const { filename, contentType = "video/mp4", folder = "movies" } = body;

    const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "mp4";
    const baseName = filename.replace(/\.[a-zA-Z0-9]+$/, "");
    const cleanBase = slugify(baseName) || "video";
    const timestamp = Date.now();
    const cleanFolder = folder.replace(/^\/+/, "").replace(/\/+$/, "") || "movies";

    const key = `${cleanFolder}/${cleanBase}-${timestamp}.${ext}`;

    const res = await createR2PresignedUploadUrl(key, contentType, 7200);
    if (!res) {
      return NextResponse.json(
        { error: "Không thể tạo liên kết tải lên Cloudflare R2." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      presignedUrl: res.presignedUrl,
      publicUrl: res.publicUrl,
      key: res.key,
    });
  } catch (err: any) {
    console.error("Error creating R2 presigned upload URL:", err);
    return NextResponse.json(
      { error: err?.message || "Lỗi máy chủ khi tạo cổng upload R2" },
      { status: 500 }
    );
  }
}

