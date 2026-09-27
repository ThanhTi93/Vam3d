"use client";

import React from "react";
import {
  Crown,
  Zap,
  Flame,
  Shield,
  Sparkles,
  Sun,
  Eye,
  CircleDot,
  Sword,
  Wind,
  User,
} from "lucide-react";
import { getCultivationRealm, CultivationRealm } from "@/lib/cultivation";

interface RankBadgeProps {
  views?: number;
  realmId?: string;
  rank?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function RankBadge({
  views = 0,
  realmId,
  rank,
  size = "md",
  showLabel = true,
  className = "",
}: RankBadgeProps) {
  const realm: CultivationRealm = getCultivationRealm(views);

  const sizeClasses = {
    sm: "h-5 px-1.5 text-[9px] gap-1",
    md: "h-7 px-2.5 text-xs gap-1.5",
    lg: "h-9 px-3.5 text-sm gap-2",
  }[size];

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  // Specific Icon per Realm
  const renderIcon = () => {
    switch (realm.id) {
      case "dao_to":
        return <Crown className={`${iconSizes} text-amber-950 fill-amber-950 animate-bounce duration-1000`} />;
      case "dai_thua":
        return <Zap className={`${iconSizes} text-purple-950 fill-purple-900 animate-pulse`} />;
      case "hop_the":
        return <Flame className={`${iconSizes} text-orange-950 fill-orange-900 animate-pulse`} />;
      case "luyen_hu":
        return <Shield className={`${iconSizes} text-cyan-950 fill-cyan-900`} />;
      case "hoa_than":
        return <Sun className={`${iconSizes} text-emerald-950 fill-emerald-900`} />;
      case "nguyen_anh":
        return <Eye className={`${iconSizes} text-indigo-950 fill-indigo-900`} />;
      case "ket_dan":
        return <CircleDot className={`${iconSizes} text-yellow-950 fill-yellow-900`} />;
      case "truc_co":
        return <Sword className={`${iconSizes} text-sky-950 fill-sky-900`} />;
      case "luyen_khi":
        return <Wind className={`${iconSizes} text-slate-800`} />;
      default:
        return <User className={`${iconSizes} text-gray-400`} />;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-black rounded-lg select-none relative group transition-all duration-300 shadow-sm ${sizeClasses} ${className}`}
      style={{
        background: realm.gradient,
        color: realm.id === "pham_nhan" ? "#E5E7EB" : "#111827",
        boxShadow: `0 0 10px ${realm.borderGlow}`,
      }}
      title={`${realm.name} – ${realm.title}`}
    >
      <span className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Rank number if present */}
      {rank && (
        <span className="font-mono font-black text-[10px] px-1 py-0.2 rounded bg-black/20 text-current mr-0.5">
          #{rank}
        </span>
      )}

      {renderIcon()}

      {showLabel && (
        <span className="font-extrabold uppercase tracking-tight drop-shadow-sm whitespace-nowrap">
          {realm.name}
        </span>
      )}
    </div>
  );
}
