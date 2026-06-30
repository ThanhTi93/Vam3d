"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, X, Eye } from "lucide-react";

interface ImagePickerProps {
  value: string | File | null;
  onChange: (fileOrUrl: File | string | null) => void;
  aspectRatio?: "square" | "video" | "portrait";
  className?: string;
  defaultLogo?: string;
}

export function ImagePicker({
  value,
  onChange,
  aspectRatio = "square",
  className = "",
  defaultLogo = "",
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[2/3]",
  };

  return (
    <div className={`relative group ${aspectClasses[aspectRatio]} ${className} border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-xl overflow-hidden bg-[#090a0f] transition-all`}>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      <div
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-4 text-center z-10 hover:bg-black/20 transition-colors"
      >
        {!preview && (
          <div className="flex flex-col items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <UploadCloud className="w-8 h-8 text-orange-500 mb-2" />
            <span className="text-xs text-gray-400">Nhấn để chọn ảnh</span>
          </div>
        )}
      </div>

      <img
        src={preview || (defaultLogo ? defaultLogo : "/placeholder-image.png")}
        alt="Preview"
        className={`absolute inset-0 w-full h-full object-cover z-0 ${!preview ? "opacity-30 grayscale" : ""}`}
      />

      {preview && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullPreview(true);
            }}
            className="p-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full transition-all hover:scale-110 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all hover:scale-110 shadow-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showFullPreview && preview && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPreview(false);
          }}
        >
          <img 
            src={preview} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
          />
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullPreview(false);
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
