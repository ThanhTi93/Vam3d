import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";

const isBunnyConfigured =
  !!process.env.BUNNY_STORAGE_ZONE_NAME &&
  !!process.env.BUNNY_STORAGE_ACCESS_KEY &&
  process.env.BUNNY_STORAGE_ACCESS_KEY !== "your_bunny_storage_access_key" &&
  !!process.env.NEXT_PUBLIC_BUNNY_CDN_URL;

if (!isBunnyConfigured) {
  console.warn(
    "⚠️ WARNING: Bunny Storage credentials are not set or are default. Image uploads will fall back to mock images."
  );
}

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

    if (!isBunnyConfigured) {
      // Fallback mock upload for local dev/testing without credentials
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({
        isMock: true,
        secure_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600",
        message: "Bunny Storage not configured. Fallback to mock image.",
      });
    }

    // Determine final file upload path on Bunny Storage (no subdirectories)
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
    const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;
    const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY;
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL?.replace(/\/$/, ""); // remove trailing slash

    const uploadToBunny = async (buffer: ArrayBuffer, targetPath: string, retries = 3) => {
      const url = `https://storage.bunnycdn.com/${storageZone}/${targetPath}`;
      const bodyBuffer = Buffer.from(buffer);
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: {
              AccessKey: accessKey as string,
              "Content-Type": "application/octet-stream",
              "Content-Length": String(bodyBuffer.length),
            },
            body: bodyBuffer as any,
          });

          if (!res.ok) {
            const errMsg = await res.text();
            throw new Error(`Bunny returned status ${res.status}: ${errMsg}`);
          }
          return; // Success!
        } catch (err: any) {
          console.error(`Attempt ${attempt} to upload to ${targetPath} failed:`, err.message || err);
          if (err.cause) {
            console.error(`Attempt ${attempt} cause:`, err.cause);
          }
          if (attempt === retries) {
            throw err; // Re-throw if last attempt failed
          }
          // Wait before retrying (exponential backoff: 1s, 2s)
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    };

    // Upload single file directly
    await uploadToBunny(fileBuffer, uploadPath);

    const secureUrl = `${cdnUrl}/${uploadPath}`;
    const pathDir = uploadPath.substring(0, uploadPath.lastIndexOf("/")) || "";

    return NextResponse.json({
      secure_url: secureUrl,
      pathDir,
    });
  } catch (error: any) {
    console.error("Bunny upload route error:", error);
    if (error.cause) {
      console.error("Bunny upload route error cause:", error.cause);
    }
    const causeMsg = error.cause ? (error.cause.message || String(error.cause)) : null;
    return NextResponse.json(
      { 
        error: error.message || "Internal server error during upload to Bunny Storage",
        cause: causeMsg
      },
      { status: 500 }
    );
  }
}
