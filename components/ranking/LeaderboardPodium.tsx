"use client";

import React from "react";
import { Crown, Zap, Flame, Eye, Lock, Sparkles } from "lucide-react";
import AvatarFrame from "./AvatarFrame";
import RankBadge from "./RankBadge";
import { formatNumber } from "@/lib/utils";
import { LeaderboardPodiumSlot } from "@/lib/db/queries";
import { getCultivationRealm } from "@/lib/cultivation";

interface LeaderboardPodiumProps {
  top1: LeaderboardPodiumSlot;
  top2: LeaderboardPodiumSlot;
  top3: LeaderboardPodiumSlot;
}

export default function LeaderboardPodium({ top1, top2, top3 }: LeaderboardPodiumProps) {
  return (
    <div className="relative pt-6 pb-4">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 bg-gradient-to-r from-purple-500/10 via-amber-500/15 to-orange-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Podium Grid: Order [Top 2, Top 1, Top 3] on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end max-w-4xl mx-auto relative z-10">

        {/* ════ TOP 2: Á QUÂN ĐẠI THỪA ════ */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          <CultivationPodiumCard
            slot={top2}
            rank={2}
            pedestalHeight="h-44 md:h-52"
            defaultRealmId="dai_thua"
            accentColor="text-purple-300"
            borderGlow="border-purple-500/40"
            bgGradient="from-purple-500/20 via-[#181124] to-[#0e1017]"
            topLineGradient="from-purple-300 via-fuchsia-400 to-purple-600"
            crownIcon={<Zap className="w-5 h-5 text-purple-300" />}
          />
        </div>

        {/* ════ TOP 1: CHÍ TÔN ĐẠO TỔ (CENTER) ════ */}
        <div className="order-1 md:order-2 flex flex-col items-center -mt-6 md:-mt-10">
          <CultivationPodiumCard
            slot={top1}
            rank={1}
            pedestalHeight="h-56 md:h-64"
            defaultRealmId="dao_to"
            accentColor="text-amber-400"
            borderGlow="border-amber-400/50"
            bgGradient="from-amber-500/25 via-[#1f1910] to-[#0e1017]"
            topLineGradient="from-amber-300 via-yellow-400 to-amber-600"
            isCenter={true}
            crownIcon={<Crown className="w-6 h-6 text-amber-300" />}
          />
        </div>

        {/* ════ TOP 3: QUÝ QUÂN HỢP THỂ ════ */}
        <div className="order-3 flex flex-col items-center">
          <CultivationPodiumCard
            slot={top3}
            rank={3}
            pedestalHeight="h-36 md:h-44"
            defaultRealmId="hop_the"
            accentColor="text-orange-400"
            borderGlow="border-orange-500/40"
            bgGradient="from-orange-500/20 via-[#1a1310] to-[#0e1017]"
            topLineGradient="from-orange-300 via-amber-400 to-orange-600"
            crownIcon={<Flame className="w-5 h-5 text-orange-300" />}
          />
        </div>
      </div>
    </div>
  );
}

function CultivationPodiumCard({
  slot,
  rank,
  pedestalHeight,
  defaultRealmId,
  accentColor,
  borderGlow,
  bgGradient,
  topLineGradient,
  isCenter = false,
  crownIcon,
}: {
  slot: LeaderboardPodiumSlot;
  rank: number;
  pedestalHeight: string;
  defaultRealmId: string;
  accentColor: string;
  borderGlow: string;
  bgGradient: string;
  topLineGradient: string;
  isCenter?: boolean;
  crownIcon: React.ReactNode;
}) {
  const account = slot.account;
  const isClaimed = !!account;
  const realm = account?.realm || getCultivationRealm(rank === 1 ? 1000000 : rank === 2 ? 500000 : 100000);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Avatar with cultivation frame */}
      <div className="relative mb-3">
        {isClaimed ? (
          <AvatarFrame
            src={account.imgUrl}
            alt={account.username}
            views={account.views}
            rank={rank}
            size={isCenter ? "xl" : "lg"}
          />
        ) : (
          <div
            className={`relative flex items-center justify-center rounded-full border-2 border-dashed ${borderGlow} ${
              isCenter ? "w-28 h-28" : "w-20 h-20"
            } bg-[#131520]/80 backdrop-blur-md shadow-lg group`}
          >
            <div className="flex flex-col items-center justify-center text-center p-2">
              <Lock className={`w-6 h-6 mb-1 ${accentColor} opacity-70 group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Đang tìm</span>
            </div>
            {/* Rank corner tag */}
            <div
              className="absolute -bottom-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-md select-none"
              style={{ background: realm.gradient }}
            >
              TOP {rank}
            </div>
          </div>
        )}
      </div>

      {/* Account Info Or Realm Target */}
      <div className="text-center w-full px-2 mb-3">
        {isClaimed ? (
          <>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className={`font-black text-sm sm:text-base text-white truncate max-w-[180px] ${isCenter ? "text-amber-200" : ""}`}>
                {account.username}
              </h3>
              {account.level && account.level > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  VIP
                </span>
              )}
            </div>

            {/* Realm Badge */}
            <div className="flex items-center justify-center mb-1.5">
              <RankBadge views={account.views} size="sm" showLabel={true} />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#090a0f]/80 px-3 py-1 rounded-full border border-white/10 shadow-inner">
              <Flame className={`w-3.5 h-3.5 ${accentColor} fill-current`} />
              <span className="text-xs font-black text-white">{formatNumber(account.views)}</span>
              <span className="text-[10px] text-gray-400 font-medium">tu vi (views)</span>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-wider ${accentColor}`}>
              {realm.title}
            </h4>
            <div className="inline-flex items-center gap-1 bg-[#090a0f]/80 px-2.5 py-0.5 rounded-full border border-white/5 text-[11px] text-gray-300">
              <span>Mốc mở khóa:</span>
              <span className="font-extrabold text-white">≥ {formatNumber(realm.requiredViews)}</span>
              <Eye className="w-3 h-3 text-orange-400" />
            </div>
          </div>
        )}
      </div>

      {/* 3D Cultivation Stage */}
      <div
        className={`w-full ${pedestalHeight} rounded-t-3xl relative overflow-hidden flex flex-col justify-between p-4 transition-all duration-300 border-t-2 ${borderGlow} bg-gradient-to-b ${bgGradient}`}
        style={{
          boxShadow: `0 -8px 30px ${realm.borderGlow}33`,
        }}
      >
        {/* Shimmer line on top */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${topLineGradient}`}
        />

        {/* Big Rank Number Watermark */}
        <div className="absolute right-3 bottom-0 font-black text-6xl md:text-7xl opacity-5 select-none pointer-events-none text-white font-mono">
          {rank}
        </div>

        {/* Pedestal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            {crownIcon}
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {realm.name}
            </span>
          </div>
          <span
            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-black shadow-sm"
            style={{ background: realm.gradient }}
          >
            TOP {rank}
          </span>
        </div>

        {/* Pedestal Bottom Status */}
        <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">{isClaimed ? "Cảnh giới:" : "Yêu cầu:"}</span>
          <span className={`font-bold ${accentColor}`}>
            {isClaimed ? realm.title : `≥ ${formatNumber(realm.requiredViews)} tu vi`}
          </span>
        </div>
      </div>
    </div>
  );
}
