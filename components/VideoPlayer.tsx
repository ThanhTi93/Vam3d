"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Settings, Play, RotateCcw, AlertCircle } from "lucide-react";
import { getBunnyImageUrl } from "@/lib/utils";

export interface VideoPlayerProps {
  src?: string | null;
  bunnyVideoId?: string | null;
  bunnyLibraryId?: string | null;
  bunnyStatus?: string | null;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  storageKey?: string;
  onEnded?: () => void;
  className?: string;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

export default function VideoPlayer({
  src,
  bunnyVideoId,
  bunnyLibraryId,
  bunnyStatus,
  poster,
  title,
  autoPlay = false,
  storageKey,
  onEnded,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [hasStarted, setHasStarted] = useState(() => Boolean(autoPlay));
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState(false);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const finalLibId = bunnyLibraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "689414";
  const progressKey = storageKey || (bunnyVideoId ? `progress_bunny_${bunnyVideoId}` : src ? `progress_src_${src}` : null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Check saved resume time
  useEffect(() => {
    if (!progressKey || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const parsedTime = parseFloat(saved);
        if (parsedTime > 10) {
          setResumeTime(parsedTime);
        }
      }
    } catch (e) {}
  }, [progressKey]);

  // Handle manual start play
  const handleStartPlay = useCallback(() => {
    setHasStarted(true);
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Handle Resume action
  const handleResume = useCallback(() => {
    if (videoRef.current && resumeTime) {
      setHasStarted(true);
      if (hlsRef.current) {
        hlsRef.current.startLoad();
      }
      videoRef.current.currentTime = resumeTime;
      videoRef.current.play().catch(() => {});
      setResumeTime(null);
    }
  }, [resumeTime]);

  const handleDismissResume = useCallback(() => {
    setResumeTime(null);
  }, []);

  // Save playback progress throttled
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !progressKey || typeof window === "undefined") return;
    const curTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    // Do not save if near end (> 95%) or just started (< 5s)
    if (duration && curTime / duration > 0.95) {
      localStorage.removeItem(progressKey);
    } else if (curTime > 5) {
      localStorage.setItem(progressKey, curTime.toString());
    }
  }, [progressKey]);

  const streamHost = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST || "vz-df52fbd4-040.b-cdn.net";
  
  // Prioritize custom domain Bunny HLS stream if bunnyVideoId is present
  let effectiveSrc = bunnyVideoId
    ? `https://${streamHost}/${bunnyVideoId}/playlist.m3u8`
    : src;

  // If effectiveSrc is an iframe URL (e.g. from DB), extract video ID to get the HLS stream
  if (effectiveSrc) {
    if (effectiveSrc.includes("mediadelivery.net/embed/")) {
      const match = effectiveSrc.match(/mediadelivery\.net\/embed\/\d+\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        effectiveSrc = `https://${streamHost}/${match[1]}/playlist.m3u8`;
      }
    } else if (effectiveSrc.includes("b-cdn.net")) {
      effectiveSrc = effectiveSrc.replace(/https?:\/\/[a-zA-Z0-9._-]*b-cdn\.net/gi, `https://${streamHost}`);
    }
    effectiveSrc = effectiveSrc.replace(/https?:\/\/stream\.vam3dhentai\.online/gi, `https://${streamHost}`);
  }

  // Sync hasStarted state with autoPlay or src changes
  useEffect(() => {
    setHasStarted(Boolean(autoPlay));
  }, [effectiveSrc, autoPlay]);

  // Setup HLS / Video source (for direct MP4 / Bunny HLS stream)
  useEffect(() => {
    setErrorMsg(null);
    setQualities([]);
    setCurrentQuality(-1);

    const video = videoRef.current;
    if (!video || !effectiveSrc) return;

    const isHlsStream = effectiveSrc.includes(".m3u8") || effectiveSrc.includes("/hls/");

    if (isHlsStream) {
      if (Hls.isSupported()) {
        const shouldLoadImmediately = autoPlay || hasStarted;
        const hls = new Hls({
          autoStartLoad: shouldLoadImmediately,
          maxBufferLength: 10,       // Cost-saving: Buffer at most 10 seconds ahead (was 30s)
          maxMaxBufferLength: 15,    // Cap maximum buffer length at 15 seconds (was 60s)
          maxBufferSize: 8 * 1024 * 1024, // Cost-saving: Cap buffer memory to 8MB (was 30MB)
          backBufferLength: 5,       // Aggressively free memory of watched parts
          enableWorker: true,
          lowLatencyMode: false,
          capLevelToPlayerSize: true, // Cost-saving: don't load 1080p if screen is small
          startLevel: -1,
        });

        hlsRef.current = hls;
        hls.loadSource(effectiveSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
            index,
            height: lvl.height,
            bitrate: lvl.bitrate,
            label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)} kbps`,
          }));
          levels.sort((a, b) => b.height - a.height);
          setQualities(levels);

          if (autoPlay || hasStarted) {
            video.play().catch(() => {});
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("HLS Network Error, attempting recovery...", data);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("HLS Media Error, attempting recovery...", data);
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal HLS Error, destroying instance:", data);
                setErrorMsg("Không thể phát luồng HLS. Vui lòng thử lại sau.");
                hls.destroy();
                break;
            }
          }
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = effectiveSrc;
        if (autoPlay || hasStarted) {
          video.play().catch(() => {});
        }
      } else {
        setErrorMsg("Trình duyệt không hỗ trợ phát luồng video HLS.");
      }
    } else {
      video.src = effectiveSrc;
      if (autoPlay || hasStarted) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [effectiveSrc, autoPlay]);

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    setCurrentQuality(levelIndex);
    hlsRef.current.currentLevel = levelIndex; // -1 for auto
    setShowSettings(false);
  };

  // 1. Status checks for Bunny processing
  if (bunnyVideoId) {
    if (bunnyStatus === "failed") {
      return (
        <div className={`w-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-3 text-red-400 ${className}`}>
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-md font-bold">Xử lý video thất bại</h3>
          <p className="text-xs text-gray-500 max-w-sm">Quá trình xử lý video trên máy chủ gặp sự cố. Vui lòng liên hệ Admin.</p>
        </div>
      );
    }

    if (bunnyStatus !== "completed" && bunnyStatus !== undefined) {
      return (
        <div className={`w-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-4 ${className}`}>
          <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <h3 className="text-sm font-bold text-gray-300">Tập phim đang được tối ưu HLS...</h3>
          <p className="text-xs text-gray-500 max-w-xs">Hệ thống đang chia phân đoạn và nén đa độ phân giải để tiết kiệm băng thông. Vui lòng quay lại sau ít phút!</p>
        </div>
      );
    }
  }

  // 2. No source available
  if (!effectiveSrc) {
    return (
      <div className={`w-full aspect-video flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-3 text-orange-400 ${className}`}>
        <span className="text-3xl">🎬</span>
        <h3 className="text-md font-bold">Video đang được cập nhật</h3>
        <p className="text-xs text-gray-500 max-w-sm">Liên kết video đang được xử lý hoặc cập nhật. Vui lòng quay lại sau!</p>
      </div>
    );
  }

  // 3. Custom HLS / Native Video Player with Cost-Saving Buffer Capping & Quality Switcher
  return (
    <div className={`group relative w-full aspect-video bg-black rounded-xl overflow-hidden ${className}`}>
      {errorMsg ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#090a0f] p-6 text-center space-y-3 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-md font-bold">{errorMsg}</h3>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            preload={autoPlay || hasStarted ? "metadata" : "none"}
            poster={poster ? getBunnyImageUrl(poster, 'display') : undefined}
            onPlay={() => {
              if (!hasStarted) {
                setHasStarted(true);
                if (hlsRef.current) {
                  hlsRef.current.startLoad();
                }
              }
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onEnded}
            className="w-full h-full object-contain"
            playsInline
          />

          {/* Big Play Button Overlay when video hasn't loaded/started yet */}
          {!hasStarted && (
            <div
              onClick={handleStartPlay}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 hover:bg-black/30 transition-all cursor-pointer backdrop-blur-[2px] group/overlay"
            >
              <button
                type="button"
                aria-label="Bấm để phát video"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-2xl shadow-orange-500/50 group-hover/overlay:scale-110 group-hover/overlay:shadow-orange-500/70 transition-all duration-300 cursor-pointer border border-white/20"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-white mt-3.5 drop-shadow px-4 py-1.5 bg-black/70 rounded-full border border-white/10 tracking-wide flex items-center gap-1.5 shadow-lg">
                <Play className="w-3.5 h-3.5 fill-orange-400 text-orange-400" /> Bấm để xem phim
              </span>
            </div>
          )}

          {/* Resume Prompt Toast */}
          {isClient && resumeTime !== null && (
            <div className="absolute top-4 right-4 z-30 bg-black/85 backdrop-blur-md border border-orange-500/40 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-xs text-gray-200">
                <span className="font-semibold text-orange-400">Xem tiếp?</span> Lúc {formatTime(resumeTime)}
              </div>
              <button
                onClick={handleResume}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" /> Tiếp tục
              </button>
              <button
                onClick={handleDismissResume}
                className="text-gray-400 hover:text-white text-xs p-1 cursor-pointer transition-colors"
                title="Bỏ qua"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* HLS Resolution Settings Switcher */}
          {qualities.length > 0 && (
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="bg-black/70 hover:bg-black/90 backdrop-blur text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                title="Chất lượng video"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>
                  {currentQuality === -1
                    ? "Tự động"
                    : qualities.find((q) => q.index === currentQuality)?.label || "Tự động"}
                </span>
              </button>

              {showSettings && (
                <div className="absolute right-0 top-9 bg-[#131520]/95 backdrop-blur-md border border-white/10 rounded-xl py-1.5 min-w-[130px] shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-white/5 tracking-wider">
                    Độ phân giải
                  </div>
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-orange-500/20 transition-colors cursor-pointer ${
                      currentQuality === -1 ? "text-orange-400 font-bold" : "text-gray-300"
                    }`}
                  >
                    <span>Tự động (Khuyên dùng)</span>
                    {currentQuality === -1 && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </button>
                  {qualities.map((q) => (
                    <button
                      key={q.index}
                      onClick={() => handleQualityChange(q.index)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-orange-500/20 transition-colors cursor-pointer ${
                        currentQuality === q.index ? "text-orange-400 font-bold" : "text-gray-300"
                      }`}
                    >
                      <span>{q.label}</span>
                      {currentQuality === q.index && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
