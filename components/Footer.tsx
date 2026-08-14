"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getFooterData } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<{ id: number; name: string; slug?: string | null }[]>([]);
  const [topMovies, setTopMovies] = useState<{ id: number; name: string; slug?: string | null }[]>([]);

  useEffect(() => {
    getFooterData().then((res) => {
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
      if (res.topMovies && res.topMovies.length > 0) {
        setTopMovies(res.topMovies);
      }
    }).catch(err => console.error("Error fetching footer data:", err));
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#090a0f] border-t border-white/5 py-12 px-4 sm:px-8 mt-16 text-gray-400">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
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

        {/* Dynamic Categories Column (Divided into 2-3 columns) */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thể Loại Phim</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-xs">
            {categories.map((cat) => {
              const href = `/${cat.slug || slugify(cat.name) || encodeURIComponent(cat.name)}`;
              return (
                <li key={cat.id}>
                  <Link href={href} className="hover:text-orange-500 transition-colors flex items-center gap-1.5 line-clamp-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60 shrink-0" />
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Dynamic Featured Movies Column */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Phim Nổi Bật</h3>
          <ul className="space-y-2 text-xs">
            {topMovies.length > 0 ? (
              topMovies.map((m) => {
                const href = `/movie/${m.slug || m.id}`;
                return (
                  <li key={m.id}>
                    <Link href={href} className="hover:text-orange-500 transition-colors line-clamp-1 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400/60 shrink-0" />
                      {m.name}
                    </Link>
                  </li>
                );
              })
            ) : (
              <>
                <li><Link href="/phim-hot" className="hover:text-orange-500 transition-colors">Phim Hot Đang Chiếu</Link></li>
                <li><Link href="/nhan-vat" className="hover:text-orange-500 transition-colors">Kho Nhân Vật 3D</Link></li>
                <li><Link href="/gallery" className="hover:text-orange-500 transition-colors">Bộ Sưu Tập AI</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Info & Contact Column */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thông Tin &amp; Liên Hệ</h3>
          <ul className="space-y-2 text-xs mb-4">
            <li><Link href="/lich-chieu" className="hover:text-orange-500 transition-colors font-semibold text-orange-400">📅 Lịch Chiếu Phim 3D</Link></li>
            <li><Link href="/gioi-thieu" className="hover:text-orange-500 transition-colors">Giới thiệu</Link></li>
            <li><Link href="/dieu-khoan-su-dung" className="hover:text-orange-500 transition-colors">Điều khoản sử dụng</Link></li>
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-orange-500 transition-colors">Chính sách bảo mật</Link></li>
            <li><Link href="/khieu-nai-ban-quyen" className="hover:text-orange-500 transition-colors">Khiếu nại bản quyền</Link></li>
            <li><a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors text-amber-400/80">📡 RSS Feed (Google Index)</a></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">🗺️ XML Sitemap</a></li>
          </ul>
          <p className="text-[11px] text-gray-500 mb-1">Email hỗ trợ:</p>
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
