import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const isR2Configured =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY &&
  !!process.env.R2_BUCKET_NAME;

export async function POST(request: Request) {
  try {
    const user = { role: "admin" }; // Admin check bypassed by user request

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Không tìm thấy dữ liệu tải lên." }, { status: 400 });
    }

    const file = (formData.get("file") || formData.get("original") || formData.get("display") || formData.get("thumb")) as File | null;
    const customPath = formData.get("customPath") as string | null;
    const folder = (formData.get("folder") as string | null) || "general";

    // Security check: Only admin can upload to arbitrary folders or specify custom paths (which can overwrite files). Regular users can only upload avatars.
    if (user.role !== "admin") {
      if (folder !== "avatar" && !folder.startsWith("avatar/")) {
        return NextResponse.json(
          { error: "Bạn không có quyền tải lên thư mục này." },
          { status: 403 }
        );
      }
      if (customPath) {
        return NextResponse.json(
          { error: "Bạn không có quyền thiết lập đường dẫn tùy chỉnh." },
          { status: 403 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu tệp tin tải lên." },
        { status: 400 }
      );
    }

    if (!isR2Configured) {
      // Fallback mock upload for local dev/testing without credentials
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({
        isMock: true,
        secure_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600",
        message: "Storage not configured. Fallback to mock image.",
      });
    }

    // Determine final file upload path on Cloudflare R2
    let uploadPath = "";
    if (customPath) {
      const cleanPath = customPath.replace(/^\//, "");
      const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleanPath);
      if (hasExtension) {
        uploadPath = cleanPath;
      } else {
        const ext = file.name.substring(file.name.lastIndexOf(".") + 1) || "webp";
        uploadPath = `${cleanPath}.${ext}`;
      }
    } else {
      const folder = (formData.get("folder") as string | null) || "general";
      const cleanFolder = folder.replace(/^\//, "").replace(/\/$/, "");
      const originalName = file.name || "image.webp";
      const ext = originalName.substring(originalName.lastIndexOf(".") + 1) || "webp";
      const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || "image";
      const cleanBase = baseName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]/g, "_");
      uploadPath = `${cleanFolder}/${Date.now()}_${cleanBase}.${ext}`;
    }

    const fileBuffer = await file.arrayBuffer();
    const r2Domain = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

    // Pure Cloudflare R2 upload (Zero egress fee, high speed)
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uploadPath,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type || "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const secureUrl = `https://${r2Domain}/${uploadPath}`;
    const pathDir = uploadPath.substring(0, uploadPath.lastIndexOf("/")) || "";

    return NextResponse.json({
      secure_url: secureUrl,
      pathDir,
    });
  } catch (error: any) {
    console.error("Cloudflare R2 upload route error:", error);
    if (error.cause) {
      console.error("Cloudflare R2 upload route error cause:", error.cause);
    }
    const causeMsg = error.cause ? (error.cause.message || String(error.cause)) : null;
    return NextResponse.json(
      { 
        error: error.message || "Internal server error during upload to Cloudflare R2",
        cause: causeMsg
      },
      { status: 500 }
    );
  }
}
