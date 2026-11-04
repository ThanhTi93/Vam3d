import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export function getR2PublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  const domain =
    process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN ||
    process.env.R2_PUBLIC_DOMAIN ||
    "";
  if (domain) {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return `https://${cleanDomain}/${cleanKey}`;
  }
  return "";
}

/**
 * Tạo Pre-signed URL cho trình duyệt upload trực tiếp lên Cloudflare R2
 * Tránh 100% tải và băng thông cho máy chủ VPS
 */
export async function createR2PresignedUploadUrl(
  key: string,
  contentType: string = "video/mp4",
  expiresInSeconds: number = 3600
): Promise<{ presignedUrl: string; publicUrl: string; key: string } | null> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    return null;
  }

  const cleanKey = key.replace(/^\/+/, "");
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  const publicUrl = getR2PublicUrl(cleanKey);

  return {
    presignedUrl,
    publicUrl,
    key: cleanKey,
  };
}

/**
 * Tải trực tiếp một luồng stream video lên Cloudflare R2 (Multipart streaming)
 * Dùng cho migration kéo video từ Streamtape sang R2
 */
export async function uploadStreamToR2(
  key: string,
  body: any,
  contentType: string = "video/mp4"
): Promise<{ publicUrl: string; key: string } | null> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    return null;
  }

  const cleanKey = key.replace(/^\/+/, "");
  const upload = new Upload({
    client,
    params: {
      Bucket: bucketName,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
    },
  });

  await upload.done();
  const publicUrl = getR2PublicUrl(cleanKey);

  return {
    publicUrl,
    key: cleanKey,
  };
}
