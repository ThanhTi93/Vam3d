"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/types";
import { getBunnyImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
interface HeroCarouselProps {
  hotMovies: Movie[];
}

// CSS-only animated particles — stable, no WebGL required
function ParticleEffect() {
  const particles = Array.from({ length: 22 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main glowing orb */}
      <div
        style={{
          position: "absolute",
          right: "15%",
          top: "20%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(234,88,12,0.15) 50%, transparent 70%)",
          filter: "blur(30px)",
          animation: "heroOrb 6s ease-in-out infinite",
        }}
      />
      {/* Secondary orb */}
      <div
        style={{
          position: "absolute",
          right: "35%",
          top: "55%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.1) 50%, transparent 70%)",
          filter: "blur(25px)",
          animation: "heroOrb 8s ease-in-out infinite reverse",
        }}
      />
      {/* Torus-like ring decoration */}
      <div
        style={{
          position: "absolute",
          right: "12%",
          top: "15%",
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "2px solid rgba(249,115,22,0.3)",
          boxShadow: "0 0 30px rgba(249,115,22,0.2), inset 0 0 30px rgba(249,115,22,0.05)",
          animation: "heroRing 10s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "14%",
          top: "17%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "1px solid rgba(249,115,22,0.2)",
          animation: "heroRing 7s linear infinite reverse",
        }}
      />

      {/* Floating particles */}
      {particles.map((i) => {
        const size = 2 + (i % 4);
        const right = 5 + ((i * 37) % 45);
        const top = 5 + ((i * 53) % 85);
        const duration = 3 + (i % 5);
        const delay = (i * 0.4) % 4;
        const isOrange = i % 3 !== 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: `${right}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: isOrange
                ? "rgba(249,115,22,0.7)"
                : "rgba(59,130,246,0.6)",
              boxShadow: isOrange
                ? `0 0 ${size * 3}px rgba(249,115,22,0.5)`
                : `0 0 ${size * 3}px rgba(59,130,246,0.4)`,
              animation: `heroParticle ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* Scanning line effect */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "100%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(249,115,22,0.4), transparent)",
          animation: "heroScan 4s ease-in-out infinite",
        }}
      />

      {/* Keyframe injection */}
      <style>{`
        @keyframes heroOrb {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.8; }
          50% { transform: scale(1.15) translateY(-12px); opacity: 1; }
        }
        @keyframes heroRing {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes heroParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          33% { transform: translateY(-8px) scale(1.2); opacity: 1; }
          66% { transform: translateY(4px) scale(0.85); opacity: 0.4; }
        }
        @keyframes heroScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function HeroCarousel({ hotMovies }: HeroCarouselProps) {
  const [heroIndex, setHeroIndex] = useState(0);

  // Hero auto-advance
  useEffect(() => {
    if (!hotMovies.length) return;
    const id = setInterval(() => setHeroIndex((p) => (p + 1) % hotMovies.length), 6000);
    return () => clearInterval(id);
  }, [hotMovies.length]);

  if (!hotMovies || hotMovies.length === 0) return null;

  return (
    <section className="relative w-full h-[420px] sm:h-[500px] lg:h-[600px] bg-black overflow-hidden group">
      {/* Movie backdrop slides */}
      {hotMovies.map((movie, idx) => (
        <div
          key={movie.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: idx === heroIndex ? 1 : 0,
            zIndex: idx === heroIndex ? 10 : 0,
            pointerEvents: idx === heroIndex ? "auto" : "none",
          }}
        >
          <Image
            src={getBunnyImageUrl(movie.banner, "display")}
            alt={movie.title}
            fill
            priority={idx === 0}
            className="object-cover object-center scale-105 brightness-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f]/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── CSS Particle Decoration (right side) ── */}
      <div className="absolute right-0 top-0 w-1/2 h-full z-20 pointer-events-none opacity-90">
        <ParticleEffect />
      </div>

      {/* Slide Content */}
      {hotMovies.map((movie, idx) => (
        <div
          key={`content-${movie.id}`}
          className="absolute bottom-12 sm:bottom-20 left-4 sm:left-12 lg:left-24 max-w-xl transition-all duration-700"
          style={{
            opacity: idx === heroIndex ? 1 : 0,
            transform: idx === heroIndex ? "translateY(0)" : "translateY(16px)",
            zIndex: idx === heroIndex ? 30 : 0,
            pointerEvents: idx === heroIndex ? "auto" : "none",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded">
              <Flame className="w-3.5 h-3.5" /> Đề Cử Hot
            </span>
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-yellow-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-yellow-400" /> {movie.rating}
            </div>
            <span className="text-gray-300 text-sm font-semibold">{movie.year}</span>
            <span className="text-gray-300 text-sm font-semibold">{movie.duration}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-1 text-white drop-shadow-2xl">
            {movie.title}
          </h2>
          <p className="text-sm sm:text-base text-orange-400/90 font-medium mb-3 italic">
            {movie.originalTitle}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((g) => (
              <span key={g} className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-gray-200">
                {g}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-6 bg-black/30 p-3 rounded-lg backdrop-blur-sm border border-white/5 max-w-lg">
            {movie.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href={`/movie/${movie.id}?play=true`}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" /> Xem Ngay
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Info className="w-5 h-5" /> Thông Tin
            </Link>
          </div>
        </div>
      ))}

      {/* Carousel Controls */}
      <Button
          variant="ghost"
          size="icon"
          onClick={() => setHeroIndex((p) => (p - 1 + hotMovies.length) % hotMovies.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-orange-500 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      <Button
          variant="ghost"
          size="icon"
          onClick={() => setHeroIndex((p) => (p + 1) % hotMovies.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-orange-500 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
        {hotMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setHeroIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === heroIndex ? "bg-orange-500 w-6" : "bg-gray-500 w-2"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
