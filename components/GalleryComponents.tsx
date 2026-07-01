"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, X, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { getBunnyImageUrl } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ─── Sub-component: Home Gallery Card ────────────────────────────────────────
export function HomeGalleryCard({ g, onSelect }: { g: any; onSelect: (g: any) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!g.images || g.images.length <= 1) return;
    const maxSlides = Math.min(g.images.length, 5);
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % maxSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [g.images]);

  const activeImage = g.images && g.images.length > 0 ? g.images[currentIdx] : null;
  const [displaySrc, setDisplaySrc] = useState(activeImage?.imgUrl || "");

  useEffect(() => {
    if (activeImage) {
      setDisplaySrc(activeImage.imgUrl);
    }
  }, [activeImage]);

  return (
    <Card
      onClick={() => onSelect(g)}
      className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden group flex flex-col relative aspect-[2/3] shadow-xl hover:border-orange-500/50 hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer p-0 gap-0"
    >
      <div className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden">
        {displaySrc ? (
          <Image
            key={displaySrc}
            src={getBunnyImageUrl(displaySrc, 'thumb')}
            alt={g.name}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-500 absolute inset-0 animate-in fade-in"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-700" />
          </div>
        )}

        <div className="absolute top-2 left-2 z-10">
          {g.plan ? (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide shadow-md border-0">
              {g.plan.name}
            </Badge>
          ) : (
            <Badge className="bg-green-600 hover:bg-green-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded border-0 shadow-md">
              MIỄN PHÍ
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10">
          <span className="text-[9px] font-bold text-gray-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            {g.images?.length || 0} ảnh
          </span>
        </div>

        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10">
          <span className="text-[10px] font-bold text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            Xem Bộ Sưu Tập 🔍
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-[3px] border-t border-white/5 z-10 flex flex-col justify-between min-h-[85px] group-hover:bg-black/60 transition-colors">
        <div>
          <h4 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">{g.name}</h4>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            {g.movie?.name ? (
              <p className="text-[9px] text-orange-400 font-medium line-clamp-1">
                🎬 {g.movie.name}
              </p>
            ) : <div />}
            <span className="text-[8px] text-gray-400 shrink-0">
              👁️ {g.views || 0} lượt xem
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {g.galleryCharacters && g.galleryCharacters.length > 0 ? (
              g.galleryCharacters.slice(0, 2).map((gc: any) => (
                <span key={gc.character.id} className="text-[8px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded-full border border-white/5">
                  {gc.character.name}
                </span>
              ))
            ) : (
              <span className="text-[8px] text-gray-600">—</span>
            )}
            {g.galleryCharacters && g.galleryCharacters.length > 2 && (
              <span className="text-[8px] bg-white/5 text-gray-400 px-1 py-0.5 rounded-full border border-white/5">
                +{g.galleryCharacters.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Sub-component: Home Gallery Section ─────────────────────────────────────
export function HomeGallerySection({
  title, galleries, onViewAll, onSelectGallery
}: {
  title: React.ReactNode;
  galleries: any[];
  onViewAll?: () => void;
  onSelectGallery: (g: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-sm md:text-lg font-extrabold tracking-widest text-white uppercase flex items-center gap-2">
          <Camera className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-orange-500/20" /> {title}
        </h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs font-bold text-orange-500 hover:text-orange-400 hover:underline cursor-pointer animate-in fade-in">
            Xem tất cả →
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {galleries.map((g) => (
          <HomeGalleryCard key={g.id} g={g} onSelect={onSelectGallery} />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-component: Home Gallery Grid (Full Tab View) ────────────────────────
export function HomeGalleryGrid({
  galleries, onSelectGallery, totalCount
}: {
  galleries: any[];
  onSelectGallery: (g: any) => void;
  totalCount?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider animate-in slide-in-from-left duration-200">
          <Camera className="w-5 h-5 text-orange-500" />
          BỘ SƯU TẬP AI
        </h1>
        <span className="text-gray-400 text-xs font-semibold bg-[#131520] border border-white/5 px-2.5 py-1 rounded">
          {totalCount ?? galleries.length} bộ sưu tập
        </span>
      </div>
      {galleries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
          {galleries.map((g) => (
            <HomeGalleryCard key={g.id} g={g} onSelect={onSelectGallery} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[#131520]/50 rounded-xl border border-white/5 text-center px-4">
          <Camera className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-gray-300 mb-1">Chưa có bộ sưu tập nào</h3>
          <p className="text-gray-500 text-xs">Vui lòng quay lại sau.</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Home Gallery Lightbox ────────────────────────────────────
function HomeGalleryLightbox({
  images, activeIndex, galleryName, onClose, onPrev, onNext
}: {
  images: any[];
  activeIndex: number;
  galleryName?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const image = images[activeIndex];

  useEffect(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setDragOffsetX(0);
  }, [activeIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { onNext(); }
      else if (e.key === "ArrowLeft") { onPrev(); }
      else if (e.key === "Escape") { onClose(); }
      else if (e.key === "+" || e.key === "=") { setZoom(z => Math.min(5, +(z + 0.25).toFixed(2))); }
      else if (e.key === "-") {
        setZoom(z => {
          const nz = Math.max(1, +(z - 0.25).toFixed(2));
          if (nz === 1) { setPanX(0); setPanY(0); }
          return nz;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  const clampPan = (z: number, nx: number, ny: number) => {
    if (!containerRef.current) return { nx, ny };
    const el = containerRef.current;
    const maxX = (el.clientWidth * (z - 1)) / 2;
    const maxY = (el.clientHeight * (z - 1)) / 2;
    return {
      nx: Math.max(-maxX, Math.min(maxX, nx)),
      ny: Math.max(-maxY, Math.min(maxY, ny)),
    };
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom === 1) { setPanX(0); setPanY(0); }
    else {
      const { nx, ny } = clampPan(newZoom, panX, panY);
      setPanX(nx);
      setPanY(ny);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const STEP = 0.15;
    setZoom(prev => {
      const next = e.deltaY < 0
        ? Math.min(5, +(prev + STEP).toFixed(2))
        : Math.max(1, +(prev - STEP).toFixed(2));
      if (next === 1) { setPanX(0); setPanY(0); }
      else {
        const { nx, ny } = clampPan(next, panX, panY);
        setPanX(nx);
        setPanY(ny);
      }
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 100) {
        onPrev();
      } else if (dragOffsetX < -100) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    isDragging.current = true;
    dragStart.current = { x: t.clientX, y: t.clientY, panX, panY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 80) {
        onPrev();
      } else if (dragOffsetX < -80) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm select-none animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 shadow-2xl"
        title="Đóng (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Ảnh trước"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Ảnh sau"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 px-4 lg:px-6 py-3 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between bg-[#131520]/95 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3 shadow-2xl">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => handleZoomChange(Math.max(1, +(zoom - 0.25).toFixed(2)))} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0">-</button>
            <div className="flex-1 flex flex-col gap-1">
              <input type="range" min={1} max={5} step={0.05} value={zoom} onChange={(e) => handleZoomChange(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full accent-orange-500 cursor-pointer" style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) 100%)` }} />
              <div className="text-center text-[10px] text-orange-400 font-bold tabular-nums">{zoom.toFixed(2)}x</div>
            </div>
            <button onClick={() => handleZoomChange(Math.min(5, +(zoom + 0.25).toFixed(2)))} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0">+</button>
            <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} className="text-[10px] text-gray-500 hover:text-white transition-colors flex-shrink-0 border border-white/10 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10">Reset</button>
          </div>
          <div className="w-px h-10 bg-white/10 flex-shrink-0 mx-4" />
          <div className="text-right min-w-0">
            {galleryName && <p className="text-xs font-bold text-white truncate">{galleryName}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">Ảnh {activeIndex + 1} / {images.length}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bottom-[88px] px-4 lg:px-6 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className={`w-full h-full ${images.length >= 3 ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "flex items-center justify-center"}`}>
          {images.length >= 3 && (
            <div onClick={onPrev} className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 group/side overflow-hidden">
              <img src={getBunnyImageUrl(images[(activeIndex - 1 + images.length) % images.length].imgUrl, 'display')} alt="Prev" className="absolute inset-0 w-full h-full object-contain p-3" draggable={false} />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center"><ChevronLeft className="w-8 h-8 text-white/40" /></div>
            </div>
          )}
          <div
            ref={containerRef}
            className="relative rounded-xl bg-[#090a0f]/60 border border-white/10 overflow-hidden h-full"
            style={{ cursor: isDragging.current ? "grabbing" : "grab", ...(images.length < 3 ? { flex: "1", maxWidth: "56rem" } : {}) }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <div
              key={activeIndex}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={getBunnyImageUrl(image.imgUrl, 'display')}
                alt={`Anh ${activeIndex + 1}`}
                draggable={false}
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                  userSelect: "none",
                  display: "block",
                  transform: zoom > 1 ? `translate(${panX}px, ${panY}px) scale(${zoom})` : `translate(${dragOffsetX}px, 0px) scale(1)`,
                  transformOrigin: "center center",
                  transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              />
            </div>
            {zoom === 1 && <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded-full border border-white/5 pointer-events-none">Kéo ảnh để chuyển tiếp · Lăn chuột để zoom</div>}
            {zoom > 1 && <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-black/60 px-2 py-1 rounded-full border border-white/10 pointer-events-none backdrop-blur-md">Giữ và kéo để di chuyển</div>}
          </div>
          {images.length >= 3 && (
            <div onClick={onNext} className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 group/side overflow-hidden">
              <img src={getBunnyImageUrl(images[(activeIndex + 1) % images.length].imgUrl, 'display')} alt="Next" className="absolute inset-0 w-full h-full object-contain p-3" draggable={false} />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center"><ChevronRight className="w-8 h-8 text-white/40" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Exported Component: GalleryDetailModal ─────────────────────────────
interface GalleryDetailModalProps {
  gallery: any | null;
  onClose: () => void;
}

export function GalleryDetailModal({ gallery, onClose }: GalleryDetailModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [restrictedError, setRestrictedError] = useState<string | null>(null);
  const [galleryVisibleCount, setGalleryVisibleCount] = useState(24);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [lightboxGallery, setLightboxGallery] = useState<any | null>(null);

  // Check user subscription level access
  const checkAccess = (requiredPlan: any) => {
    if (!requiredPlan) return true;
    const requiredLevel = requiredPlan.level || 0;
    if (requiredLevel === 0) return true; // Free level 0 is open to all
    if (!user) return false;
    if (user.role === "admin") return true;
    const userLevel = user.level || 0;
    const isExpired = user.expiredAt ? new Date(user.expiredAt) < new Date() : true;
    if (userLevel < requiredLevel) return false;
    if (requiredLevel > 0 && isExpired) return false;
    return true;
  };

  useEffect(() => {
    if (!gallery) {
      setRestrictedError(null);
      return;
    }

    // Access check on gallery load
    if (gallery.plan) {
      const requiredLevel = gallery.plan.level || 0;
      if (requiredLevel > 0) {
        if (!user) {
          setRestrictedError("Bạn cần đăng nhập để xem bộ sưu tập này.");
          return;
        }
        if (!checkAccess(gallery.plan)) {
          setRestrictedError(`Bộ sưu tập này yêu cầu gói cước từ ${gallery.plan.name} trở lên và gói phải còn hạn dùng.`);
          return;
        }
      }
    }
    
    setRestrictedError(null);
    setGalleryVisibleCount(24);
  }, [gallery, user]);

  return (
    <>
      {/* Detail Gallery Dialog */}
      {gallery && !restrictedError && (
        <Dialog open={!!gallery} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-4xl p-6 text-gray-100 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex flex-col gap-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-white">Ảnh trong bộ sưu tập: {gallery.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {gallery.movie?.name ? `Phim: ${gallery.movie.name}` : "Không liên kết phim"}
                  {gallery.plan?.name ? ` · Gói xem: ${gallery.plan.name}` : " · Gói xem: Miễn phí"}
                  {` · ${gallery.images?.length || 0} ảnh`}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.images?.slice(0, galleryVisibleCount).map((img: any, idx: number) => (
                  <div
                    key={img.id}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 cursor-pointer group hover:border-orange-500/50 hover:shadow-lg transition-all"
                    onClick={() => {
                      setLightboxGallery(gallery);
                      setActivePreviewIndex(idx);
                    }}
                  >
                    <Image
                      src={getBunnyImageUrl(img.imgUrl, 'thumb')}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="Gallery image"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/10 animate-in fade-in">Xem ảnh 🔍</span>
                    </div>
                  </div>
                ))}
              </div>

              {gallery.images && gallery.images.length > galleryVisibleCount && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => setGalleryVisibleCount(prev => prev + 24)}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs px-4 h-9 cursor-pointer"
                  >
                    Xem thêm ({gallery.images.length - galleryVisibleCount} ảnh)
                  </Button>
                </div>
              )}

              {(!gallery.images || gallery.images.length === 0) && (
                <div className="text-center py-12 text-sm text-gray-500">
                  Chưa có ảnh nào trong bộ sưu tập này.
                </div>
              )}

              <div className="flex justify-end border-t border-white/5 pt-4 mt-2">
                <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs h-9 cursor-pointer">
                  Đóng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Access Restriction Warning Dialog */}
      {restrictedError && (
        <Dialog open={!!restrictedError} onOpenChange={(open) => {
          if (!open) {
            setRestrictedError(null);
            onClose();
          }
        }}>
          <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-md p-6 text-gray-100 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Yêu Cầu Nâng Cấp VIP</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {restrictedError}
              </p>
              <div className="flex gap-3 w-full pt-4 border-t border-white/5">
                <Button
                  onClick={() => {
                    setRestrictedError(null);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 h-10 text-xs"
                >
                  Bỏ qua
                </Button>
                <Button
                  onClick={() => {
                    setRestrictedError(null);
                    onClose();
                    if (!user) {
                      router.push("/login");
                    } else {
                      router.push("/upgrade");
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 h-10 text-xs shadow-lg shadow-orange-500/20"
                >
                  {!user ? "Đăng Nhập Ngay" : "Nâng Cấp Ngay"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox Component inside overlay */}
      {activePreviewIndex !== null && lightboxGallery?.images?.[activePreviewIndex] && (
        <HomeGalleryLightbox
          images={lightboxGallery.images}
          activeIndex={activePreviewIndex}
          galleryName={lightboxGallery.name}
          onClose={() => {
            setActivePreviewIndex(null);
            setLightboxGallery(null);
          }}
          onPrev={() =>
            setActivePreviewIndex(prev =>
              prev !== null
                ? (prev - 1 + lightboxGallery.images.length) % lightboxGallery.images.length
                : null
            )
          }
          onNext={() =>
            setActivePreviewIndex(prev =>
              prev !== null ? (prev + 1) % lightboxGallery.images.length : null
            )
          }
        />
      )}
    </>
  );
}
