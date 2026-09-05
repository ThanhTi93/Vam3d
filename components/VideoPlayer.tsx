"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Settings, Play, RotateCcw, AlertCircle } from "lucide-react";

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
  autoPlay = true,
  storageKey,
  onEnded,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState(false);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const finalLibId = bunnyLibraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "";
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

  // Handle Resume action
  const handleResume = useCallback(() => {
    if (videoRef.current && resumeTime) {
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

  // Setup HLS / Video source
  useEffect(() => {
    setErrorMsg(null);
    setQualities([]);
    setCurrentQuality(-1);

    const video = videoRef.current;
    if (!video || !src) return;

    const isHlsStream = src.includes(".m3u8") || src.includes("/hls/");

    if (isHlsStream) {
      if (Hls.isSupported()) {
        // Strict Buffer Capping config to prevent unnecessary bandwidth consumption
        const hls = new Hls({
          maxBufferLength: 30,           // Only buffer 30 seconds ahead (Saves huge bandwidth)
          maxMaxBufferLength: 60,        // Max 60 seconds
          maxBufferSize: 30 * 1024 * 1024, // 30 MB max buffer memory
          backBufferLength: 30,          // Free old chunks from memory
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,                // Auto bitrate adaptation
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
            index,
            height: lvl.height,
            bitrate: lvl.bitrate,
            label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)} kbps`,
          }));
          
          // Sort high to low
          levels.sort((a, b) => b.height - a.height);
          setQualities(levels);

          if (autoPlay) {
            video.play().catch(() => {});
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (hls.autoLevelEnabled) {
            // Auto mode active
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
        // Native HLS for Safari & iOS
        video.src = src;
        if (autoPlay) {
          video.play().catch(() => {});
        }
      } else {
        setErrorMsg("Trình duyệt không hỗ trợ phát luồng video HLS.");
      }
    } else {
      // Standard MP4 / WebM direct playback
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    setCurrentQuality(levelIndex);
    hlsRef.current.currentLevel = levelIndex; // -1 for auto
    setShowSettings(false);
  };

  // 1. Bunny Stream Iframe (When bunnyVideoId is available)
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

    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden ${className}`}>
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${finalLibId}/${bunnyVideoId}?autoplay=${autoPlay}&loop=false&muted=false&preload=true&responsive=true`}
          loading="lazy"
          className="w-full h-full border-0 aspect-video"
          allow="autoplay; fullscreen; picture-in-picture;"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. No source available
  if (!src) {
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
            preload="metadata"
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onEnded}
            className="w-full h-full object-contain"
            playsInline
          />

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
