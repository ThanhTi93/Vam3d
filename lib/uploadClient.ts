export async function uploadFileToR2(
  rawFile: File,
  folder: string = "general",
  customPath?: string
): Promise<string> {
  if (!rawFile.type.startsWith("image/") && !rawFile.type.startsWith("video/")) {
    throw new Error("Chỉ hỗ trợ tải lên các tệp tin hình ảnh hoặc video.");
  }

  // Prepare FormData with just the raw file
  const formData = new FormData();
  formData.append("file", rawFile);
  formData.append("folder", folder);
  if (customPath) {
    formData.append("customPath", customPath);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Cloudflare R2 upload API failed:", errText);
    let errMsg = "Lỗi khi tải tệp lên máy chủ Cloudflare R2.";
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error) {
        errMsg += ` Chi tiết: ${errJson.error}`;
        if (errJson.cause) {
          errMsg += ` (Nguyên nhân: ${errJson.cause})`;
        }
      }
    } catch {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data.secure_url;
}

// Backward-compatible alias
export const uploadFileToBunny = uploadFileToR2;
