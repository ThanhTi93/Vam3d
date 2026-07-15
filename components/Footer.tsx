"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-[#090a0f] border-t border-white/5 py-12 px-4 sm:px-8 mt-16 text-gray-400">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="vam3d Logo"
              width={140}
              height={40}
              className="object-contain h-10 w-auto"
              style={{ aspectRatio: "140 / 40" }}
            />
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            Mạng xã hội xem phim trực tuyến miễn phí lớn nhất Việt Nam. Phim HD Vietsub, Thuyết Minh đầy đủ.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Phim Mới</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/phim-le" className="hover:text-orange-500 transition-colors">Phim Lẻ Mới Nhất</Link></li>
            <li><Link href="/phim-bo" className="hover:text-orange-500 transition-colors">Phim Bộ Đang Hot</Link></li>
            <li><Link href="/chieu-rap" className="hover:text-orange-500 transition-colors">Phim Chiếu Rạp</Link></li>
            <li><Link href="/hoat-hinh" className="hover:text-orange-500 transition-colors">Anime Nhật Bản</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thông Tin</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/gioi-thieu" className="hover:text-orange-500 transition-colors">Giới thiệu</Link></li>
            <li><Link href="/dieu-khoan-su-dung" className="hover:text-orange-500 transition-colors">Điều khoản sử dụng</Link></li>
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-orange-500 transition-colors">Chính sách bảo mật</Link></li>
            <li><Link href="/khieu-nai-ban-quyen" className="hover:text-orange-500 transition-colors">Khiếu nại bản quyền</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Liên Hệ</h3>
          <p className="text-xs text-gray-500 mb-2">Mọi ý kiến vui lòng email:</p>
          <p className="text-xs font-bold text-orange-500">contact@vam3dhentai.online</p>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4">
        <p>© 2026 Vam3D. Built with Next.js · Neon PostgreSQL · Drizzle ORM · React Three Fiber</p>
        <p>Disclaimer: Nội dung phim mô phỏng phục vụ mục đích kiểm thử.</p>
      </div>
    </footer>
  );
}
