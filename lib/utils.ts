import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBunnyImageUrl(
  url: string | null | undefined,
  type: 'original' | 'display' | 'thumb' = 'display'
): string {
  if (!url) {
    if (type === 'display') {
      return "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1200";
    }
    return "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400";
  }

  // Chuẩn hóa đường dẫn: Thay thế tên miền cũ bị nhà mạng chặn (b-cdn.net) bằng tên miền cdn riêng mới
  let processedUrl = url;
  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
  if (cdnUrl) {
    processedUrl = processedUrl.replace(/https?:\/\/vam3d\.b-cdn\.net/g, cdnUrl.replace(/\/$/, ""));
  }
  
  // If it's a Bunny CDN URL (ends with display.webp, thumb.webp, or original.png)
  if (processedUrl.endsWith('display.webp') || processedUrl.endsWith('thumb.webp') || processedUrl.endsWith('original.png')) {
    const lastSlashIdx = processedUrl.lastIndexOf('/');
    if (lastSlashIdx !== -1) {
      const basePath = processedUrl.substring(0, lastSlashIdx + 1); // retains the trailing slash
      if (type === 'original') {
        return `${basePath}original.png`;
      }
      if (type === 'thumb') {
        return `${basePath}thumb.webp`;
      }
      return `${basePath}display.webp`;
    }
  }
  
  // Fallback to original URL (for external image URLs)
  return processedUrl;
}

export function cleanFolderName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s-_]/g, "") // remove special characters
    .trim()
    .replace(/\s+/g, "_"); // replace spaces with underscore
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "Mới cập nhật";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMs < 0) return "Vừa xong"; // safety catch for server/client clock drift
  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  
  // Format as date: DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h} giờ`);
  if (m > 0) parts.push(`${m} phút`);
  if (s > 0 && h === 0) parts.push(`${s} giây`);

  return parts.length > 0 ? parts.join(" ") : "";
}


