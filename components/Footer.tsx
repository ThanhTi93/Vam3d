"use client";

import React from "react";
import Link from "next/link";
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-black text-white text-md">R</div>
            <span className="text-xl font-black tracking-wider text-white">ROPHIM</span>
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
            <li><a href="#" className="hover:text-orange-500 transition-colors">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Khiếu nại bản quyền</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Liên Hệ</h3>
          <p className="text-xs text-gray-500 mb-2">Mọi ý kiến vui lòng email:</p>
          <p className="text-xs font-bold text-orange-500">contact@rophim.vn</p>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4">
        <p>© 2026 RoPhim. Built with Next.js · Neon PostgreSQL · Drizzle ORM · React Three Fiber</p>
        <p>Disclaimer: Nội dung phim mô phỏng phục vụ mục đích kiểm thử.</p>
      </div>
    </footer>
  );
}
