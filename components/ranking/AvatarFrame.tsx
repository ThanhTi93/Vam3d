"use client";

import React, { useId } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { getUserAvatarUrl, formatFullNumber } from "@/lib/utils";
import { getCultivationRealm, CultivationRealm, CULTIVATION_REALMS } from "@/lib/cultivation";

export interface AvatarFrameProps {
  src?: string | null;
  alt: string;
  views?: number;
  rank?: number;
  realmId?: string;
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showTopper?: boolean;
  showTag?: boolean;
  onEditClick?: () => void;
}

// 3D Master Artwork Frames per Realm
const FRAME_MAP: Record<string, string> = {
  dao_to: "/frames/frame_dao_to.webp",
  dai_thua: "/frames/frame_dai_thua.webp",
  hop_the: "/frames/frame_hop_the.webp",
  luyen_hu: "/frames/frame_luyen_hu.webp",
  hoa_than: "/frames/frame_hoa_than.webp",
  nguyen_anh: "/frames/frame_nguyen_anh.webp",
  ket_dan: "/frames/frame_ket_dan.webp",
  truc_co: "/frames/frame_truc_co.webp",
  luyen_khi: "/frames/frame_luyen_khi.webp",
  pham_nhan: "/frames/frame_pham_nhan.webp",
};

// Aura Glow Settings per Realm
const REALM_AURA: Record<string, { dropShadow: string; haloGradient: string }> = {
  dao_to: {
    dropShadow: "filter drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]",
    haloGradient: "from-amber-500/25 via-cyan-400/20 to-purple-600/30",
  },
  dai_thua: {
    dropShadow: "filter drop-shadow-[0_0_13px_rgba(168,85,247,0.7)]",
    haloGradient: "from-purple-500/25 via-fuchsia-500/20 to-amber-500/15",
  },
  hop_the: {
    dropShadow: "filter drop-shadow-[0_0_13px_rgba(234,88,12,0.7)]",
    haloGradient: "from-red-500/25 via-orange-500/20 to-amber-500/15",
  },
  luyen_hu: {
    dropShadow: "filter drop-shadow-[0_0_13px_rgba(6,182,212,0.7)]",
    haloGradient: "from-cyan-500/25 via-blue-500/20 to-purple-500/15",
  },
  hoa_than: {
    dropShadow: "filter drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]",
    haloGradient: "from-emerald-500/25 via-teal-500/20 to-green-500/15",
  },
  nguyen_anh: {
    dropShadow: "filter drop-shadow-[0_0_12px_rgba(99,102,241,0.7)]",
    haloGradient: "from-indigo-500/25 via-purple-500/20 to-blue-500/15",
  },
  ket_dan: {
    dropShadow: "filter drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]",
    haloGradient: "from-yellow-500/25 via-amber-500/20 to-orange-500/15",
  },
  truc_co: {
    dropShadow: "filter drop-shadow-[0_0_11px_rgba(56,189,248,0.65)]",
    haloGradient: "from-sky-500/25 via-blue-500/20 to-cyan-500/15",
  },
  luyen_khi: {
    dropShadow: "filter drop-shadow-[0_0_10px_rgba(148,163,184,0.6)]",
    haloGradient: "from-slate-400/20 via-blue-300/15 to-transparent",
  },
  pham_nhan: {
    dropShadow: "filter drop-shadow-[0_0_8px_rgba(107,114,128,0.5)]",
    haloGradient: "from-zinc-500/15 via-stone-500/10 to-transparent",
  },
};

export default function AvatarFrame({
  src,
  alt,
  views = 0,
  rank,
  realmId,
  size = "md",
  className = "",
  showTopper = true,
  showTag = true,
  onEditClick,
}: AvatarFrameProps) {
  // Resolve realm: priority to explicit realmId, then actual views
  let realm: CultivationRealm;
  if (realmId) {
    realm = CULTIVATION_REALMS.find((r) => r.id === realmId) || getCultivationRealm(views);
  } else {
    realm = getCultivationRealm(views);
  }

  const tier = realm.tier;
  const isDaoTo = tier === 10;
  const frameSrc = FRAME_MAP[realm.id] || "/frames/frame_pham_nhan.webp";
  const aura = REALM_AURA[realm.id] || REALM_AURA.pham_nhan;

  // Dimension presets (synchronized heights: 34px for 2xs, 53px for xs, 67px for sm, 96px for md, 134px for lg, 173px for xl, 211px for 2xl)
  const sizeMap = isDaoTo
    ? {
        "2xs": "w-[36px] h-[34px]",
        xs: "w-[56px] h-[53px]",
        sm: "w-[71px] h-[67px]",
        md: "w-[102px] h-[96px]",
        lg: "w-[142px] h-[134px]",
        xl: "w-[183px] h-[173px]",
        "2xl": "w-[223px] h-[211px]",
      }[size]
    : {
        "2xs": "w-[34px] h-[34px]",
        xs: "w-[53px] h-[53px]",
        sm: "w-[67px] h-[67px]",
        md: "w-[96px] h-[96px]",
        lg: "w-[134px] h-[134px]",
        xl: "w-[173px] h-[173px]",
        "2xl": "w-[211px] h-[211px]",
      }[size];

  const imageUrl = getUserAvatarUrl(src);

  // Precise circular portal coordinates for avatar
  const avatarStyle = isDaoTo
    ? {
        left: "27.85%",
        top: "28.65%",
        width: "44.56%",
        height: "47.19%",
      }
    : {
        left: "26.5%",
        top: "26.5%",
        width: "47%",
        height: "47%",
      };

  return (
    <div
      className={`relative inline-block select-none shrink-0 ${sizeMap} ${className}`}
      title={`${realm.name} - Cấp ${tier} (≥ ${formatFullNumber(realm.requiredViews)} tu vi)`}
    >
      {/* ── 1. AVATAR IMAGE (Positioned perfectly behind circular portal) ── */}
      <div
        className="absolute rounded-full overflow-hidden bg-[#0d0f17] z-0 shadow-inner"
        style={avatarStyle}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="200px"
          className="object-cover"
          unoptimized={typeof imageUrl === "string" && imageUrl.startsWith("data:")}
        />
      </div>

      {/* ── 2. CELESTIAL PULSING AURA BEHIND THE MASTER FRAME ── */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${aura.haloGradient} blur-md animate-pulse pointer-events-none -z-10`}
      />

      {/* ── 3. AUTHENTIC 3D MASTER ARTWORK OVERLAY (High-Res WebP) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <Image
          src={frameSrc}
          alt={`Khung ${realm.name}`}
          fill
          priority={size === "xl" || size === "lg"}
          className={`object-contain ${aura.dropShadow}`}
        />
      </div>

      {/* ── 4. OPTIONAL CAMERA BUTTON FOR EDITING ── */}
      {onEditClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          className="absolute right-0 bottom-1 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg border border-white/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Thay đổi ảnh đại diện"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow" />
        </button>
      )}
    </div>
  );
}
