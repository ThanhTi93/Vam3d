"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Play, Heart, Star, Tv, MessageSquare, Clock, Info, Award, Camera } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useWatchlist } from "@/app/context/watchlistContext";
import { getBunnyImageUrl, formatRelativeTime, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { incrementEpisodeViews, incrementGalleryViews } from "@/app/admin/actions";
import { HomeGalleryCard, GalleryDetailModal } from "@/components/GalleryComponents";

interface LocalComment {
  id: string;
  name: string;
  avatar: string;
  content: string;
  time: string;
}

const defaultComments: Record<string, LocalComment[]> = {
  "dune-part-two": [
    { id: "1", name: "Nguyễn Minh", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", content: "Kỹ xảo điện ảnh đỉnh cao! Đoạn Paul cưỡi sâu cát xem mà nổi hết da gà.", time: "1 giờ trước" },
    { id: "2", name: "Trần Hằng", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", content: "Diễn xuất của Timothée quá tuyệt vời. Bản Vietsub dịch rất mượt!", time: "4 giờ trước" },
  ],
  "lat-mat-7": [
    { id: "1", name: "Quốc Đạt", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100", content: "Xem mà khóc hết nước mắt luôn á. Lý Hải làm phim gia đình ngày càng đỉnh.", time: "30 phút trước" },
  ],
  "stranger-things-s4": [
    { id: "1", name: "Hoàng Long", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", content: "Tập 4 'Dear Billy' thực sự là một kiệt tác truyền hình!", time: "5 giờ trước" },
  ],
};

interface MoviePageClientProps {
  movie: any;
  relatedEpisodes?: any[];
}

export default function MoviePageClient({ 
  movie, 
  relatedEpisodes = [] 
}: MoviePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isCurrentRoute = pathname === `/movie/${movie.id}`;
  const { user } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [showPlayer, setShowPlayer] = useState(false);
  const [activeServer, setActiveServer] = useState("VIP");
  const [activeEpisode, setActiveEpisode] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);

  const handleSelectGallery = (g: any) => {
    setSelectedGallery(g);
    if (g && g.id) {
      incrementGalleryViews(g.id);
    }
  };

  // Sync episode selection with URL query parameter '?ep=...' and perform VIP access check
  useEffect(() => {
    const epParam = searchParams.get("ep");
    if (epParam) {
      const epIndex = parseInt(epParam, 10) - 1;
      if (epIndex >= 0 && movie.episodes && epIndex < movie.episodes.length) {
        const targetEp = movie.episodes[epIndex];

        // 1. Check movie level requirement
        if (movie.plan && !checkAccess(movie.plan)) {
          setRestrictedError(
            `Bộ phim này yêu cầu gói cước từ ${movie.plan.name} trở lên và gói phải còn hạn dùng.`
          );
          setShowPlayer(false);
          const params = new URLSearchParams(window.location.search);
          params.delete("ep");
          router.replace(`${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
          return;
        }

        // 2. Check episode level requirement
        if (targetEp.plan && !checkAccess(targetEp.plan)) {
          setRestrictedError(
            `Tập phim này yêu cầu gói cước từ ${targetEp.plan.name} trở lên và gói phải còn hạn dùng.`
          );
          setShowPlayer(false);
          const params = new URLSearchParams(window.location.search);
          params.delete("ep");
          router.replace(`${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
          return;
        }

        setActiveEpisode(epIndex);
        setShowPlayer(true);
      }
    }
  }, [searchParams, movie.episodes]);

  // Increment view count when episode starts playing or changes
  useEffect(() => {
    if (showPlayer && movie.episodes && movie.episodes[activeEpisode]) {
      const currentEp = movie.episodes[activeEpisode];
      if (currentEp.id) {
        incrementEpisodeViews(currentEp.id);
      }
    }
  }, [showPlayer, activeEpisode, movie.episodes]);

  const handleEpisodeChange = (idx: number) => {
    setActiveEpisode(idx);
    const params = new URLSearchParams(window.location.search);
    params.set("ep", (idx + 1).toString());
    startTransition(() => {
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Comments
  const [commentsMap, setCommentsMap] = useState<Record<string, LocalComment[]>>(defaultComments);
  const [newComment, setNewComment] = useState("");
  const [commentName, setCommentName] = useState("");
  
  // Access checking states
  const [restrictedError, setRestrictedError] = useState<string | null>(null);

  // Lazy loading comments on scroll
  const [commentsVisible, setCommentsVisible] = useState(false);
  const commentsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setCommentsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCommentsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (commentsRef.current) {
      observer.observe(commentsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const checkAccess = (requiredPlan: any) => {
    if (!requiredPlan) return true;
    if (!user) return false;
    if (user.role === "admin") return true;
    const userLevel = user.level || 0;
    const requiredLevel = requiredPlan.level || 0;
    const isExpired = user.expiredAt ? new Date(user.expiredAt) < new Date() : true;
    if (userLevel < requiredLevel) return false;
    if (requiredLevel > 0 && isExpired) return false;
    return true;
  };

  const startPlaying = () => {
    if (movie.plan) {
      if (!checkAccess(movie.plan)) {
        setRestrictedError(
          `Nội dung này yêu cầu gói cước từ ${movie.plan.name} trở lên và gói phải còn hạn dùng.`
        );
        return;
      }
    }
    setShowPlayer(true);
    if (!searchParams.get("ep")) {
      const params = new URLSearchParams(window.location.search);
      params.set("ep", "1");
      startTransition(() => {
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const fresh: LocalComment = {
      id: Date.now().toString(),
      name: commentName.trim() || "Người dùng ẩn danh",
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100`,
      content: newComment,
      time: "Vừa xong",
    };
    setCommentsMap((prev) => ({
      ...prev,
      [movie.id]: [fresh, ...(prev[movie.id] || [])],
    }));
    setNewComment("");
    setCommentName("");
  };

  return (
    <div className="w-full bg-[#131520] border border-white/10 rounded-2xl shadow-2xl overflow-hidden mt-6 animate-in fade-in duration-300">
      {/* ── PLAYER VIEW ── */}
      {showPlayer ? (
        <div className="flex flex-col">
          <div className="relative bg-black aspect-video w-full flex items-center justify-center">
            {isCurrentRoute ? (() => {
              const currentEp = movie.episodes?.[activeEpisode];
              if (currentEp?.bunnyVideoId) {
                const libId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
                if (currentEp.bunnyStatus === "completed") {
                  return (
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/${libId}/${currentEp.bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                      loading="lazy"
                      className="w-full h-full border-0 aspect-video"
                      allow="autoplay; fullscreen; picture-in-picture;"
                      allowFullScreen
                    />
                  );
                } else if (currentEp.bunnyStatus === "failed") {
                  return (
                    <div className="w-full h-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-3 text-red-400">
                      <span className="text-3xl">⚠️</span>
                      <h3 className="text-md font-bold">Xử lý video thất bại</h3>
                      <p className="text-xs text-gray-500 max-w-sm">Quá trình xử lý video trên Bunny Stream gặp sự cố. Vui lòng báo Admin.</p>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-4">
                      <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <h3 className="text-sm font-bold text-gray-300">Tập phim đang được encode...</h3>
                      <p className="text-xs text-gray-500 max-w-xs">Bunny Stream đang xử lý chất lượng video. Vui lòng quay lại sau ít phút!</p>
                    </div>
                  );
                }
              }

              const videoSrc = movie.episodes && movie.episodes.length > 0 ? movie.episodes[activeEpisode].url : movie.videoUrl;
              if (!videoSrc) {
                return (
                  <div className="w-full h-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-3 text-orange-400">
                    <span className="text-3xl">🎬</span>
                    <h3 className="text-md font-bold">Video đang được cập nhật</h3>
                    <p className="text-xs text-gray-500 max-w-sm">Liên kết video đang được xử lý hoặc cập nhật. Vui lòng quay lại sau!</p>
                  </div>
                );
              }
              return (
                <video
                  key={videoSrc}
                  controls
                  autoPlay
                  src={videoSrc}
                  className="w-full h-full object-contain"
                />
              );
            })() : (
              <div className="w-full h-full aspect-video bg-[#090a0f] flex items-center justify-center text-gray-500">
                <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-2.5 py-1 rounded font-bold border border-white/10 flex items-center gap-1.5 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-glow-dot" />
              Đang xem: {movie.title} {movie.episodes && movie.episodes.length > 0 && `– ${movie.episodes[activeEpisode].name}`}
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h1 className="text-xl font-bold text-white">{movie.title}</h1>
                <p className="text-xs text-orange-400/90 font-medium">{movie.originalTitle} ({movie.year})</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Server:</span>
                {["VIP", "Dự phòng 1", "Dự phòng 2"].map((s) => (
                  <Button
                    key={s}
                    variant={activeServer === s ? "default" : "secondary"}
                    onClick={() => setActiveServer(s)}
                    className="px-3 py-1 text-xs font-bold transition-colors cursor-pointer h-7"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {relatedEpisodes && relatedEpisodes.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-orange-500 fill-orange-500/20" /> 
                  Tập phim liên quan (Cùng phim hoặc nhân vật):
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {relatedEpisodes.slice(0, 12).map((ep: any) => {
                    const epIndex = ep.movie?.episodes?.findIndex((x: any) => x.id === ep.id);
                    const epParamVal = epIndex !== undefined && epIndex !== -1 ? epIndex + 1 : 1;
                    const playUrl = `/movie/${ep.idMovie}?ep=${epParamVal}`;
                    const displayImage = ep.banner || ep.movie?.imgUrl || ep.movie?.bannerUrl || "";

                    return (
                      <Link
                        key={ep.id}
                        href={playUrl}
                        className="group bg-[#131520] border border-white/5 rounded-xl overflow-hidden relative aspect-video flex flex-col hover:border-orange-500/30 transition-all duration-300 shadow-md shadow-black/40"
                      >
                        <div className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden">
                          {displayImage ? (
                            <img
                              src={getBunnyImageUrl(displayImage, 'thumb')}
                              alt={`${ep.movie?.name} - ${ep.name}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                              <Play className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                        </div>

                        <div className="absolute top-2 left-2 z-20">
                          <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide border-0 shadow-md">
                            {ep.name || "Tập mới"}
                          </Badge>
                        </div>
                        {ep.plan && (
                          <div className="absolute top-2 right-2 z-20">
                            <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide border-0 shadow-md">
                              {ep.plan.name}
                            </Badge>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20 flex flex-col justify-end">
                          <h3 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                            {ep.movie?.name || "Phim"}
                          </h3>
                          <span className="text-[9px] text-gray-400 font-medium mt-0.5 line-clamp-1 flex items-center gap-1">
                            <span>{ep.name}</span>
                            {ep.duration > 0 ? (
                              <>
                                <span>•</span>
                                <Clock className="w-2.5 h-2.5 inline" />
                                <span>{formatDuration(ep.duration)}</span>
                              </>
                            ) : (
                              <>
                                <span>•</span>
                                <span>Mới cập nhật</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPlayer(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-2 h-9"
              >
                <Info className="w-4 h-4" /> Thông Tin Phim
              </Button>
              <Button
                variant={isInWatchlist(movie.id) ? "destructive" : "secondary"}
                onClick={() => toggleWatchlist(movie.id)}
                className="flex-1 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border h-9"
              >
                <Heart className={`w-4 h-4 ${isInWatchlist(movie.id) ? "fill-white" : ""}`} />
                {isInWatchlist(movie.id) ? "Đã lưu vào tủ" : "Lưu vào tủ phim"}
              </Button>
            </div>

            {/* AI Galleries Section inside Player View */}
            {movie.aiGalleries && movie.aiGalleries.length > 0 && (
              <div className="space-y-4 pt-5 border-t border-white/5 animate-in fade-in duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-orange-500 fill-orange-500/20" /> 
                  Bộ sưu tập AI của phim ({movie.aiGalleries.length} bộ):
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.aiGalleries.slice(0, 12).map((g: any) => (
                    <HomeGalleryCard key={g.id} g={g} onSelect={handleSelectGallery} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── DETAIL VIEW ── */
        <div className="flex flex-col">
          <div className="relative w-full h-[220px] sm:h-[340px]">
            <Image
              src={getBunnyImageUrl(movie.banner, 'display')}
              alt={movie.title}
              fill
              priority
              className="object-cover brightness-40"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131520] via-[#131520]/20 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex gap-4 items-end">
              <div className="relative w-28 h-16 sm:w-36 sm:h-20 rounded-xl overflow-hidden border-2 border-white/10 flex-shrink-0 shadow-xl bg-[#090a0f]">
                <Image src={getBunnyImageUrl(movie.thumbnail, 'thumb')} alt={movie.title} fill className="object-cover" sizes="144px" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold text-[10px] uppercase px-1.5 py-0.5 rounded border-0">{movie.quality}</Badge>
                  <Badge className="bg-[#1c1f2f] hover:bg-[#1c1f2f] text-gray-300 font-bold text-[10px] px-1.5 py-0.5 rounded border border-white/5">{movie.sub}</Badge>
                  <div className="flex items-center gap-1 font-bold text-xs text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {movie.rating}
                  </div>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white line-clamp-2">{movie.title}</h1>
                <p className="text-xs sm:text-sm text-orange-400 font-medium italic mt-0.5">{movie.originalTitle} ({movie.year})</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#131520]">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nội dung phim:</h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#090a0f]/40 p-4 rounded-xl border border-white/5">{movie.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#090a0f]/20 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block mb-0.5">Đạo diễn:</span>
                  <span className="font-bold text-gray-200">{movie.director}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Số tập hiện có:</span>
                  <span className="font-bold text-gray-200">{movie.episodes?.length || 0} tập</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block mb-0.5">Bộ sưu tập AI:</span>
                  <span className="font-bold text-gray-200">{movie.aiGalleries?.length || 0} bộ sưu tập</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                id={`modal-play-${movie.id}`}
                onClick={startPlaying}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/10 hover:scale-[1.02] transition-all cursor-pointer text-sm h-11 border-0"
              >
                <Play className="w-5 h-5 fill-white" /> XEM PHIM NGAY
              </Button>
              <Button
                variant={isInWatchlist(movie.id) ? "destructive" : "secondary"}
                onClick={() => toggleWatchlist(movie.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer h-10"
              >
                <Heart className={`w-4 h-4 ${isInWatchlist(movie.id) ? "fill-white" : ""}`} />
                {isInWatchlist(movie.id) ? "Bỏ lưu tủ phim" : "Lưu vào tủ phim"}
              </Button>
              <div className="bg-[#090a0f]/40 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Thể loại</span>
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map((g: string) => (
                    <Badge
                      key={g}
                      onClick={() => router.push(`/?genre=${g}`)}
                      className="bg-[#1c1f2f] hover:bg-orange-500 hover:text-white border border-white/5 px-2 py-1 rounded text-[10px] font-bold text-gray-300 cursor-pointer transition-colors"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chọn tập phim */}
          {movie.episodes && movie.episodes.length > 0 && (
            <div className="p-6 border-t border-white/5 bg-[#131520] space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Tv className="w-4 h-4 text-orange-500" /> Chọn tập phim ({movie.episodes.length} tập):
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movie.episodes.slice(0, 12).map((ep: any, idx: number) => {
                  const playUrl = `/movie/${movie.id}?ep=${idx + 1}`;
                  const displayImage = ep.banner || movie.thumbnail || movie.banner || "";

                  return (
                    <Link
                      key={ep.id ?? idx}
                      href={playUrl}
                      className="group bg-[#131520] border border-white/5 rounded-xl overflow-hidden relative aspect-video flex flex-col hover:border-orange-500/30 transition-all duration-300 shadow-md shadow-black/40"
                    >
                      <div className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden">
                        {displayImage ? (
                          <img
                            src={getBunnyImageUrl(displayImage, 'thumb')}
                            alt={`${movie.title} - ${ep.name}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <Play className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                      </div>

                      <div className="absolute top-2 left-2 z-20">
                        <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide border-0 shadow-md">
                          {ep.name || `Tập ${idx + 1}`}
                        </Badge>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20 flex flex-col justify-end">
                        <h3 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                          {movie.title}
                        </h3>
                        <span className="text-[9px] text-gray-400 font-medium mt-0.5 line-clamp-1 flex items-center gap-1">
                          <span>{ep.name || `Tập ${idx + 1}`}</span>
                          <span>•</span>
                          {ep.duration > 0 ? (
                            <span>{formatDuration(ep.duration)}</span>
                          ) : (
                            <span>Mới cập nhật</span>
                          )}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bộ sưu tập AI của phim */}
          {movie.aiGalleries && movie.aiGalleries.length > 0 && (
            <div className="p-6 border-t border-white/5 bg-[#131520] space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-orange-500 fill-orange-500/20" /> 
                  Bộ Sưu Tập AI Của Phim ({movie.aiGalleries.length} bộ):
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movie.aiGalleries.slice(0, 12).map((g: any) => (
                  <HomeGalleryCard key={g.id} g={g} onSelect={handleSelectGallery} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator className="bg-white/5" />

      <div ref={commentsRef}>
        {commentsVisible ? (
          /* ── Rating + Comments ── */
          <div className="p-6 bg-[#0d0e16]/80 space-y-6 animate-in fade-in duration-500">
            {/* Star Rating */}
            <div className="bg-[#131520] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" /> Đánh giá phim này
                </h4>
                <p className="text-xs text-gray-500">Chấm điểm để cải thiện đề xuất phim cho bạn.</p>
              </div>
              <div className="flex items-center gap-1">
                {ratingSubmitted ? (
                  <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded border border-green-500/20">
                    ✓ Cảm ơn! Bạn đã chấm {userRating} sao
                  </span>
                ) : (
                  [1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => { setUserRating(starVal); setRatingSubmitted(true); }}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${starVal <= (hoverRating || userRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Bình luận & thảo luận
              </h3>

              <form onSubmit={handleAddComment} className="space-y-3 bg-[#131520] p-4 rounded-xl border border-white/5">
                <Input
                  type="text"
                  placeholder="Tên của bạn (bỏ trống = Ẩn danh)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3.5 text-xs text-gray-200 placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500/50"
                />
                <div className="relative">
                  <Textarea
                    placeholder="Nhận xét của bạn về bộ phim..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-[#090a0f] border border-white/5 rounded-lg py-2 px-3.5 text-xs text-gray-200 placeholder-gray-500 resize-none min-h-16 focus-visible:ring-1 focus-visible:ring-orange-500/50"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs px-3.5 py-1.5 rounded-md transition-all cursor-pointer h-7 border-0"
                  >
                    Gửi
                  </Button>
                </div>
              </form>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(commentsMap[movie.id] || []).length > 0 ? (
                  (commentsMap[movie.id] || []).map((comment) => (
                    <div key={comment.id} className="flex gap-3 bg-[#131520]/45 p-3 rounded-lg border border-white/5">
                      <div className="relative w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden border border-white/5">
                        <Image src={comment.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={comment.name} fill className="object-cover" sizes="32px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-bold text-gray-300">{comment.name}</span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {comment.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-500 italic">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 bg-[#0d0e16]/40 flex items-center justify-center min-h-[150px] rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Access Restriction Modal for movie */}
      {restrictedError && (
        <Dialog open={!!restrictedError} onOpenChange={(open) => !open && setRestrictedError(null)}>
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
                  onClick={() => setRestrictedError(null)}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 h-10 text-xs"
                >
                  Bỏ qua
                </Button>
                <Button
                  onClick={() => {
                    setRestrictedError(null);
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

      {/* AI Gallery Detail Modal */}
      <GalleryDetailModal
        gallery={selectedGallery}
        onClose={() => setSelectedGallery(null)}
      />
    </div>
  );
}
