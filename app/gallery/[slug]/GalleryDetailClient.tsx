"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Film, 
  Eye, 
  Sparkles, 
  Share2, 
  Check, 
  Lock, 
  Play, 
  Download, 
  ArrowLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import { getBunnyImageUrl, slugify } from "@/lib/utils";
import { incrementGalleryViews } from "@/app/admin/actions";
import { HomeGalleryCard, HomeGalleryLightbox } from "@/components/GalleryComponents";

interface GalleryDetailClientProps {
  gallery: any;
  relatedGalleries?: any[];
}

export default function GalleryDetailClient({
  gallery,
  relatedGalleries = [],
}: GalleryDetailClientProps) {
  const router = useRouter();
  const { user, freeVipMode } = useAuth();

  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [copied, setCopied] = useState(false);
  const [restrictedError, setRestrictedError] = useState<string | null>(null);

  // Auto count views on page visit
  useEffect(() => {
    if (gallery?.id) {
      incrementGalleryViews(gallery.id);
    }
  }, [gallery?.id]);

  // Check VIP access
  const checkAccess = (requiredPlan: any) => {
    if (freeVipMode) return true;
    if (!requiredPlan) return true;
    const requiredLevel = requiredPlan.level || 0;
    if (requiredLevel === 0) return true;
    if (!user) return false;
    if (user.role === "admin") return true;
    const userLevel = user.level || 0;
    const isExpired = user.expiredAt ? new Date(user.expiredAt) < new Date() : true;
    if (userLevel < requiredLevel) return false;
    if (requiredLevel > 0 && isExpired) return false;
    return true;
  };

  const isRestricted = !freeVipMode && gallery.plan && (gallery.plan.level || 0) > 0 && !checkAccess(gallery.plan);

  useEffect(() => {
    if (isRestricted) {
      if (!user) {
        setRestrictedError("Bạn cần đăng nhập để xem trọn bộ sưu tập này.");
      } else {
        setRestrictedError(`Bộ sưu tập này yêu cầu gói cước từ ${gallery.plan?.name || "VIP"} trở lên và tài khoản phải còn hạn.`);
      }
    } else {
      setRestrictedError(null);
    }
  }, [isRestricted, user]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const images = gallery.images || [];
  const displayImages = isRestricted ? images.slice(0, 4) : images.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 pb-20">
      {/* Top Header / Breadcrumbs */}
      <div className="border-b border-white/5 bg-[#131520]/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: "Bộ Sưu Tập AI", href: "/gallery" },
              { label: gallery.name },
            ]}
          />
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tất cả bộ sưu tập</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Gallery Info Hero Card */}
        <div className="relative bg-gradient-to-br from-[#131520] via-[#161826] to-[#0f111c] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              {/* Badges line */}
              <div className="flex flex-wrap items-center gap-2">
                {freeVipMode ? (
                  <span className="bg-green-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-md">
                    MIỄN PHÍ
                  </span>
                ) : gallery.plan ? (
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded tracking-wide shadow-md">
                    {gallery.plan.name}
                  </span>
                ) : (
                  <span className="bg-green-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-md">
                    MIỄN PHÍ
                  </span>
                )}

                <span className="text-[10px] font-bold text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {images.length} hình ảnh
                </span>

                <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  <Eye className="w-3 h-3 text-orange-400" />
                  {gallery.views || 0} lượt xem
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {gallery.name}
              </h1>

              {/* Meta: Movie & Characters */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {gallery.movie?.name && (
                  <Link
                    href={`/movie/${gallery.movie.id}`}
                    className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-semibold bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/20 transition-all"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Phim: {gallery.movie.name}</span>
                  </Link>
                )}

                {gallery.galleryCharacters && gallery.galleryCharacters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-gray-400">Nhân vật:</span>
                    {gallery.galleryCharacters.map((gc: any, idx: number) => {
                      const charName = gc.character?.name || gc.name;
                      if (!charName) return null;
                      const charSlug = gc.character?.slug || gc.character?.id || slugify(charName);
                      return (
                        <Link
                          key={gc.character?.id || gc.id || idx}
                          href={`/nhan-vat/${charSlug}`}
                          className="text-xs bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 px-2.5 py-0.5 rounded-full border border-white/10 hover:border-orange-500/30 transition-colors"
                        >
                          {charName}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              {gallery.description && (
                <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                  {gallery.description}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {images.length > 0 && !isRestricted && (
                <Button
                  onClick={() => setActiveLightboxIdx(0)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Xem Trọn Bộ (Slide)</span>
                </Button>
              )}

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 text-xs h-10 px-4 rounded-xl cursor-pointer flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-bold">Đã sao chép link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-gray-400" />
                    <span>Chia sẻ</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Restricted Banner if VIP required */}
        {isRestricted && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-orange-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nội dung có giới hạn gói thành viên</h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto">
              {restrictedError || "Bộ sưu tập này yêu cầu gói VIP. Dưới đây là 4 ảnh xem thử miễn phí."}
            </p>
            <div className="pt-2">
              <Link href="/profile">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-6 h-9 rounded-xl shadow-lg shadow-orange-500/20">
                  {!user ? "Đăng Nhập Ngay" : "Nâng Cấp Gói Ngay"}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Images Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-400" />
              <span>Danh Sách Ảnh ({images.length})</span>
            </h2>
            <span className="text-xs text-gray-500">Click vào ảnh để phóng to toàn màn hình</span>
          </div>

          {displayImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {displayImages.map((img: any, idx: number) => (
                <div
                  key={img.id || idx}
                  onClick={() => setActiveLightboxIdx(idx)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#131520] border border-white/5 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src={getBunnyImageUrl(img.imgUrl, "thumb")}
                    alt={`${gallery.name} - Ảnh ${idx + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />

                  {/* Image Number Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] font-bold text-gray-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <span className="text-[10px] font-bold text-white bg-black/70 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-orange-400" />
                      <span>Phóng to</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500 text-sm">
              Bộ sưu tập này hiện chưa có ảnh nào.
            </div>
          )}

          {/* Load More Button */}
          {!isRestricted && images.length > visibleCount && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs px-6 h-10 rounded-xl cursor-pointer hover:border-orange-500/30 transition-all"
              >
                Xem thêm ({images.length - visibleCount} ảnh còn lại)
              </Button>
            </div>
          )}
        </div>

        {/* Related Galleries Section */}
        {relatedGalleries && relatedGalleries.length > 0 && (
          <div className="space-y-4 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Bộ Sưu Tập Liên Quan</span>
              </h2>
              <Link
                href="/gallery"
                className="text-xs text-orange-400 hover:text-orange-300 font-bold hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedGalleries.map((rg: any) => (
                <HomeGalleryCard key={rg.id} g={rg} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIdx !== null && (
        <HomeGalleryLightbox
          images={displayImages}
          activeIndex={activeLightboxIdx}
          galleryName={gallery.name}
          onClose={() => setActiveLightboxIdx(null)}
          onPrev={() =>
            setActiveLightboxIdx((prev) =>
              prev !== null && prev > 0 ? prev - 1 : displayImages.length - 1
            )
          }
          onNext={() =>
            setActiveLightboxIdx((prev) =>
              prev !== null && prev < displayImages.length - 1 ? prev + 1 : 0
            )
          }
        />
      )}
    </div>
  );
}
