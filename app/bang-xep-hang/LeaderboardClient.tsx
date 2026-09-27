"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Crown,
  Flame,
  Search,
  ArrowLeft,
  Sparkles,
  Play,
  Zap,
  BookOpen,
  Filter,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { AccountLeaderboardData, RankedAccount } from "@/lib/db/queries";
import { CULTIVATION_REALMS, CultivationRealm, getCultivationRealm, getNextRealmProgress } from "@/lib/cultivation";
import LeaderboardPodium from "@/components/ranking/LeaderboardPodium";
import AvatarFrame from "@/components/ranking/AvatarFrame";
import RankBadge from "@/components/ranking/RankBadge";
import { formatNumber } from "@/lib/utils";

interface LeaderboardClientProps {
  initialData: AccountLeaderboardData;
}

export default function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedRealmFilter, setSelectedRealmFilter] = useState<string>("all");
  const [showRealmsGuide, setShowRealmsGuide] = useState(false);

  const { top1, top2, top3, rankedList, totalAccounts } = initialData;

  // Filtered list
  const filteredList = useMemo(() => {
    let list = rankedList;
    if (selectedRealmFilter !== "all") {
      list = list.filter((a) => a.realm.id === selectedRealmFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => a.username.toLowerCase().includes(q));
    }

    return list;
  }, [rankedList, selectedRealmFilter, search]);

  // Current logged in user details
  const userViews = Number(user?.views) || 0;
  const myRealmProgress = useMemo(() => {
    if (!user) return null;
    return getNextRealmProgress(userViews);
  }, [user, userViews]);

  const myRankItem = useMemo(() => {
    if (!user?.id) return null;
    return rankedList.find((a) => a.id === user.id) || null;
  }, [user, rankedList]);

  return (
    <main className="min-h-screen bg-[#090a0f] text-gray-100 pb-20">
      {/* ════ HERO HEADER ════ */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-orange-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang chủ</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRealmsGuide(!showRealmsGuide)}
                className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showRealmsGuide ? "Đóng Cẩm Nang" : "Cẩm Nang Cảnh Giới"}</span>
              </button>
              <span className="hidden sm:inline-flex text-xs text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Thời gian thực
              </span>
            </div>
          </div>

          {/* Title and Tagline */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wider uppercase shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Bảng Vàng Tu Tiên Giới · Phàm Nhân Tu Tiên
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              Bảng Xếp Hạng <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-purple-400 bg-clip-text text-transparent">Cảnh Giới Tu Vi</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              Bảng Vàng Thiên Đạo chỉ ghi danh các bậc đại năng từ cảnh giới <span className="text-amber-300 font-black">Nguyên Anh trở lên (≥ 10.000 tu vi)</span>. Tích lũy tu vi để đột phá cảnh giới và sở hữu vòng khung Avatar 3D tương ứng!
            </p>
          </div>

          {/* ════ 10 CULTIVATION REALMS GUIDE (ACCORDION / TOGGLE) ════ */}
          <div className={`mt-8 transition-all duration-300 ${showRealmsGuide ? "block" : "hidden sm:block"}`}>
            <div className="bg-[#131520]/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>10 Đại Cảnh Giới Phàm Nhân Tu Tiên & Mốc Tu Vi (Lượt Xem):</span>
                </div>
                <span className="text-[10px] text-gray-400">Xem phim/ảnh AI = Tăng Tu Vi</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 text-center">
                {CULTIVATION_REALMS.map((r) => (
                  <div
                    key={r.id}
                    className="p-2 sm:p-2.5 rounded-xl border transition-all flex flex-col items-center justify-between hover:scale-105 duration-200 group relative overflow-hidden"
                    style={{
                      borderColor: `${r.color}50`,
                      background: `linear-gradient(180deg, ${r.color}18, rgba(19, 21, 32, 0.95))`,
                      boxShadow: `0 4px 20px ${r.color}15`,
                    }}
                  >
                    <div className="my-1 flex items-center justify-center">
                      <AvatarFrame
                        realmId={r.id}
                        views={r.requiredViews}
                        alt={r.name}
                        size="sm"
                        showTag={false}
                      />
                    </div>
                    <span className="text-xs font-black text-white block truncate w-full mt-1">
                      {r.name}
                    </span>
                    <span
                      className="text-[10px] font-extrabold mt-0.5 block"
                      style={{ color: r.color }}
                    >
                      {r.requiredViews >= 1000000
                        ? "1 Triệu"
                        : r.requiredViews >= 1000
                        ? `${r.requiredViews / 1000}k`
                        : `${r.requiredViews}`}{" "}
                      views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ PODIUM: TOP 1, 2, 3 ════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <LeaderboardPodium top1={top1} top2={top2} top3={top3} />
      </section>

      {/* ════ CURRENT USER REALM & PROGRESS CARD (IF LOGGED IN) ════ */}
      {user && myRealmProgress && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-gradient-to-r from-purple-500/15 via-[#161925] to-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <AvatarFrame
                src={user.imgUrl}
                alt={user.username || "User"}
                views={userViews}
                rank={myRankItem?.rank}
                size="lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Cảnh Giới Của Bạn
                  </span>
                  {Number(user.level) > 0 && (
                    <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      VIP
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white">{user.username}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <RankBadge views={userViews} size="sm" showLabel={true} />
                  <span className="text-xs text-gray-300 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                    {formatNumber(userViews)} tu vi
                  </span>
                  {myRankItem && (
                    <span className="text-xs text-gray-400 font-medium">
                      • Đang đứng hạng #{myRankItem.rank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress to next breakthrough */}
            <div className="w-full sm:w-72 bg-[#090a0f]/80 p-3 rounded-xl border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Đột phá tiếp theo:</span>
                <span className="font-extrabold text-amber-300">
                  {myRealmProgress.nextRealm ? myRealmProgress.nextRealm.name : "Đỉnh Phong"}
                </span>
              </div>
              <div className="w-full bg-[#1c1f2f] h-2 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${myRealmProgress.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Tiến trình: {myRealmProgress.progressPercent}%</span>
                {myRealmProgress.neededViews > 0 ? (
                  <span>Còn {formatNumber(myRealmProgress.neededViews)} views</span>
                ) : (
                  <span className="text-amber-400 font-bold">Chí Tôn Đạo Tổ</span>
                )}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/phim-hot"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Xem Phim Tăng Tu Vi</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════ CULTIVATION LEADERBOARD TABLE ════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        {/* Controls: Search & Realm Filters */}
        <div className="bg-[#131520] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-xl mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm tên đạo hữu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedRealmFilter}
                onChange={(e) => setSelectedRealmFilter(e.target.value)}
                className="bg-[#090a0f] border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">Tất cả cảnh giới đủ điều kiện ({totalAccounts})</option>
                {CULTIVATION_REALMS.filter(r => r.tier >= 5).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (≥ {formatNumber(r.requiredViews)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Member Table List */}
        <div className="bg-[#131520] border border-white/5 rounded-2xl shadow-xl overflow-hidden divide-y divide-white/5">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <Crown className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
              <p className="text-sm font-semibold">Chưa có đạo hữu nào đạt cảnh giới này.</p>
              <p className="text-xs text-gray-600">Hãy cùng xem phim để tích lũy tu vi và đột phá!</p>
            </div>
          ) : (
            filteredList.map((acc) => {
              const isCurrentUser = user?.id === acc.id;

              return (
                <div
                  key={acc.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 gap-3 transition-colors ${
                    isCurrentUser
                      ? "bg-amber-500/10 hover:bg-amber-500/15"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Left: Rank & Avatar & User Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Badge */}
                    <RankBadge views={acc.views} rank={acc.rank} size="md" showLabel={false} />

                    {/* Avatar with Realm Custom Frame */}
                    <AvatarFrame
                      src={acc.imgUrl}
                      alt={acc.username}
                      views={acc.views}
                      rank={acc.rank}
                      size="sm"
                    />

                    {/* Username & Realm Title */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-100 truncate">
                          {acc.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Bạn
                          </span>
                        )}
                        {acc.level && acc.level > 0 ? (
                          <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30 uppercase">
                            VIP
                          </span>
                        ) : null}
                      </div>

                      {/* Cultivation Title & Next Breakthrough */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        <span className="font-bold text-amber-300/90">{acc.realm.title}</span>
                        {acc.nextRealm && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">
                              Đột phá {acc.nextRealm.name}: {acc.progressPercent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Tu Vi (Views) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-black text-xs sm:text-sm text-white">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                        <span>{formatNumber(acc.views)}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">tu vi</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
