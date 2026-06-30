export async function uploadFileToBunny(
  rawFile: File,
  folder: string = "general",
  customPath?: string
): Promise<string> {
  if (!rawFile.type.startsWith("image/")) {
    throw new Error("Chỉ hỗ trợ tải lên các tệp tin hình ảnh.");
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
    console.error("Bunny upload API failed:", errText);
    let errMsg = "Lỗi khi tải ảnh lên máy chủ Bunny Storage.";
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error) {
        errMsg += ` Chi tiết: ${errJson.error}`;
        if (errJson.cause) {
          errMsg += ` (Nguyên nhân: ${errJson.cause})`;
        }
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data.secure_url;
}
