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

  let processedUrl = url.trim();
  const r2Domain = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "pub-990b17b26195410f8d6faba5f800f6bf.r2.dev")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const cdnUrl = `https://${r2Domain}`;

  // Handle leading protocol-relative //
  if (processedUrl.startsWith("//")) {
    processedUrl = `https:${processedUrl}`;
  }

  // Convert old Bunny CDN domains over to Cloudflare R2 automatically
  processedUrl = processedUrl.replace(/https?:\/\/[a-zA-Z0-9._-]*b-cdn\.net/gi, cdnUrl);
  processedUrl = processedUrl.replace(/https?:\/\/cdn\.vam3dhentai\.online/gi, cdnUrl);
  processedUrl = processedUrl.replace(/^[a-zA-Z0-9._-]*b-cdn\.net/gi, cdnUrl);
  processedUrl = processedUrl.replace(/^cdn\.vam3dhentai\.online/gi, cdnUrl);

  if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
    const cleanPath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;
    processedUrl = `${cdnUrl}${cleanPath}`;
  }

  // For original high-resolution files / raw source: return untouched
  if (type === 'original') {
    if (processedUrl.endsWith('display.webp') || processedUrl.endsWith('thumb.webp') || processedUrl.endsWith('original.png')) {
      const lastSlashIdx = processedUrl.lastIndexOf('/');
      if (lastSlashIdx !== -1) {
        return `${processedUrl.substring(0, lastSlashIdx + 1)}original.png`;
      }
    }
    return processedUrl;
  }

  // Prevent double wrapping if already processed by wsrv.nl
  if (processedUrl.includes('wsrv.nl')) {
    return processedUrl;
  }

  // If it's an AI gallery that already has dedicated pre-rendered sizes
  if (processedUrl.endsWith('display.webp') || processedUrl.endsWith('thumb.webp') || processedUrl.endsWith('original.png')) {
    const lastSlashIdx = processedUrl.lastIndexOf('/');
    if (lastSlashIdx !== -1) {
      const basePath = processedUrl.substring(0, lastSlashIdx + 1); // retains the trailing slash
      if (type === 'thumb') {
        return `${basePath}thumb.webp`;
      }
      return `${basePath}display.webp`;
    }
  }

  // For movie banners and UI displayed images (which are large ~1620x707):
  // Use Cloudflare-backed wsrv.nl Edge CDN to resize on the fly without consuming VPS CPU/RAM
  const cleanTarget = processedUrl.replace(/^https?:\/\//, '');
  if (type === 'thumb') {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanTarget)}&w=500&output=webp&q=80`;
  }
  if (type === 'display') {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanTarget)}&w=900&output=webp&q=85`;
  }

  // Fallback to processed URL
  return processedUrl;
}

export const getR2ImageUrl = getBunnyImageUrl;

export function getUserAvatarUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "/images/default_avatar.webp";
  }
  return getBunnyImageUrl(url, "thumb");
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

export function slugify(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeSearchText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
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

export function formatNumber(num: number | null | undefined): string {
  if (!num || num <= 0) return "0";
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${val}M`;
  }
  if (num >= 10_000) {
    const val = (num / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${val}K`;
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatFullNumber(num: number | null | undefined): string {
  if (!num || num <= 0) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Chuẩn hóa domain chính (luôn ép có www để khớp 100% với 277+ trang đã index trên Google) cho canonical, sitemap và JSON-LD. */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && !envUrl.includes("localhost")) {
    const clean = envUrl.replace(/\/$/, "");
    if (clean.includes("vam3dhentai.online") && !clean.includes("www.vam3dhentai.online")) {
      return clean.replace(/https?:\/\/vam3dhentai\.online/i, "https://www.vam3dhentai.online");
    }
    return clean;
  }
  return "https://www.vam3dhentai.online";
}

/** Tìm vị trí tập phim theo tham số `?ep=`; trả về -1 nếu không khớp. */
export function resolveMovieEpisodeIndex(
  episodes: any[] | null | undefined,
  paramVal?: string | null
): number {
  if (!paramVal || !episodes || episodes.length === 0) return -1;
  let decoded = paramVal.trim();
  try {
    decoded = decodeURIComponent(paramVal).trim();
  } catch {
    // Giữ nguyên chuỗi gốc nếu query chứa % không hợp lệ
  }
  const slugParam = slugify(decoded);

  const bySlug = episodes.findIndex((e: any) => {
    const eSlug = e.slug || (e.name ? slugify(e.name) : "");
    return (
      e.slug === decoded ||
      eSlug === decoded ||
      (slugParam !== "" && (eSlug === slugParam || slugify(e.name) === slugParam))
    );
  });
  if (bySlug !== -1) return bySlug;

  const byId = episodes.findIndex((e: any) => e.id?.toString() === paramVal);
  if (byId !== -1) return byId;

  if (/^\d+$/.test(paramVal)) {
    const byIdx = parseInt(paramVal, 10) - 1;
    if (byIdx >= 0 && byIdx < episodes.length) return byIdx;
  }
  return -1;
}

/** Chỉ tạo JSON-LD AggregateRating khi phim thực sự có điểm và lượt đánh giá. */
export function buildAggregateRating(rawRating: unknown, rawVotes: unknown) {
  const parsedRating = typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating ?? ""));
  const parsedVotes = Number(rawVotes);
  if (!Number.isFinite(parsedRating) || parsedRating <= 0 || !Number.isFinite(parsedVotes) || parsedVotes <= 0) {
    return undefined;
  }

  return {
    "@type": "AggregateRating",
    ratingValue: Number(Math.min(10, Math.max(1, parsedRating)).toFixed(1)),
    bestRating: 10,
    worstRating: 1,
    ratingCount: Math.floor(parsedVotes),
  };
}




