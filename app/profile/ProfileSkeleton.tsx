import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ProfileSkeleton() {
  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
      {/* Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-2 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>
        <h1 className="text-lg font-black text-white uppercase tracking-wider">
          Thông tin tài khoản
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: User Profile & VIP Status */}
        <div className="space-y-6 md:col-span-1">
          {/* User Profile Card Skeleton */}
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-xl">
            {/* Avatar skeleton */}
            <div className="w-24 h-24 rounded-full bg-white/5 mb-4" />
            {/* Username skeleton */}
            <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
            {/* Email skeleton */}
            <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
            {/* Change Avatar Button skeleton */}
            <div className="h-8 bg-white/5 rounded-xl w-full" />
          </Card>

          {/* VIP Information Card Skeleton */}
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-1/5" />
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
                <div className="pt-2">
                  <div className="h-8 bg-white/5 rounded-xl w-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Manage packages & transaction history */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#131520] border-white/5 p-6 rounded-2xl shadow-xl min-h-[380px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header with Switch Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-white/5 rounded w-24" />
                    <div className="h-2 bg-white/5 rounded w-48" />
                  </div>
                </div>
                {/* Tab Switcher Skeleton */}
                <div className="w-48 h-8 bg-white/5 rounded-xl" />
              </div>

              {/* Table Skeleton */}
              <div className="space-y-4 pt-2">
                {/* Table Header */}
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-1/6" />
                  <div className="h-3 bg-white/5 rounded w-1/6" />
                  <div className="h-3 bg-white/5 rounded w-1/5" />
                </div>
                {/* Table Rows */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-white/5">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-12" />
                    <div className="h-3 bg-white/5 rounded w-12" />
                    <div className="h-3 bg-white/5 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
