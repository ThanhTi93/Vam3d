import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { getBunnyImageUrl, slugify } from "@/lib/utils";

export const maxDuration = 60; // Hỗ trợ tải và nén nhiều ảnh

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id || !db) {
      return new NextResponse("Invalid gallery ID or DB offline", { status: 400 });
    }

    const galleryId = parseInt(id, 10);
    if (isNaN(galleryId)) {
      return new NextResponse("Invalid gallery ID", { status: 400 });
    }

    // 1. Lấy thông tin album và danh sách ảnh gốc
    const gallery: any = await db.query.aiGalleries.findFirst({
      where: eq(schema.aiGalleries.id, galleryId),
      with: {
        images: {
          orderBy: (img, { asc }) => [asc(img.id)],
          columns: { id: true, imgUrl: true },
        },
      },
    });

    if (!gallery || !gallery.images || gallery.images.length === 0) {
      return new NextResponse("Bộ sưu tập ảnh không tồn tại hoặc rỗng", { status: 404 });
    }

    const zip = new JSZip();
    const cleanName = slugify(gallery.name || `gallery-${gallery.id}`) || "bo-anh-4k";
    const folder = zip.folder(`Vam3D_${cleanName}_4K`);

    // 2. Tải song song tối đa 15-20 ảnh chất lượng cao để nén vào ZIP
    const imagesToPack = gallery.images.slice(0, 30);
    const downloadPromises = imagesToPack.map(async (img: any, idx: number) => {
      try {
        const fullImgUrl = getBunnyImageUrl(img.imgUrl, "original");
        const res = await fetch(fullImgUrl, {
          headers: {
            "User-Agent": "Vam3d-Downloader/1.0",
          },
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const ext = fullImgUrl.endsWith(".png") ? "png" : fullImgUrl.endsWith(".webp") ? "webp" : "jpg";
          const paddedIdx = String(idx + 1).padStart(2, "0");
          folder?.file(`${cleanName}_${paddedIdx}.${ext}`, arrayBuffer);
        }
      } catch (e) {
        console.warn(`Lỗi tải ảnh #${idx + 1} cho zip:`, e);
      }
    });

    await Promise.all(downloadPromises);

    // Thêm 1 file README nhỏ ghi nhận bản quyền & link Vam3D
    folder?.file(
      "README_VAM3D.txt",
      `Trọn bộ ảnh AI 4K độc quyền từ Vam3D (https://vam3dhentai.online)\nBộ sưu tập: ${gallery.name}\nTổng số ảnh: ${imagesToPack.length} ảnh.\nChúc bạn xem vui vẻ!`
    );

    // 3. Đóng gói ZIP
    const zipArrayBuffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const filename = `Vam3D_${cleanName}_4K.zip`;

    // 4. Trả về file tải thật với header attachment chuẩn
    return new NextResponse(new Blob([zipArrayBuffer], { type: "application/zip" }), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipArrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Gallery download error:", err);
    return new NextResponse(`Lỗi tải bộ ảnh: ${err?.message}`, { status: 500 });
  }
}
