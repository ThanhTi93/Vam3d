"use client";

import React, { useState, useRef } from "react";
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { uploadFileToBunny } from "@/lib/uploadClient";
import { getBunnyImageUrl } from "@/lib/utils";

interface AvatarUploadProps {
  currentImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function AvatarUpload({
  currentImageUrl,
  onUploadSuccess,
  folder = "avatar",
  className = "",
}: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const secureUrl = await uploadFileToBunny(file, folder);
      onUploadSuccess(secureUrl);
      setSuccess(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Tải ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div 
        onClick={!loading ? triggerInputClick : undefined}
        className={`relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-orange-500/30 hover:border-orange-500 bg-[#161925] flex items-center justify-center cursor-pointer transition-all group ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {currentImageUrl ? (
          <>
            <Image
              src={getBunnyImageUrl(currentImageUrl, 'thumb')}
              alt="Avatar uploader"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </>
        ) : (
          <Upload className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-colors" />
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="text-center">
        <button
          type="button"
          onClick={triggerInputClick}
          disabled={loading}
          className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded-full"
        >
          {loading ? "Đang tải lên..." : "Đổi ảnh đại diện"}
        </button>

        {success && (
          <p className="text-[10px] text-green-500 flex items-center justify-center gap-1 mt-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tải lên thành công!
          </p>
        )}

        {error && (
          <p className="text-[10px] text-red-500 flex items-center justify-center gap-1 mt-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}
