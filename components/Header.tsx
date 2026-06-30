"use client";

import React, { useState, useEffect, Suspense, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search, Heart, Settings, Camera, LogOut, ChevronDown, X, Menu
} from "lucide-react";
import { useWatchlist } from "@/app/context/watchlistContext";
import { useAuth } from "@/app/context/AuthContext";
import { updateUserAvatar } from "@/lib/auth/actions";
import { getBunnyImageUrl } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const AvatarUpload = React.lazy(() => import("@/app/components/AvatarUpload"));
import { getAdminCategories } from "@/app/admin/actions";

const formatCategoryLabel = (name: string) => {
  if (name === "phim-le") return "Phim Lẻ";
  if (name === "phim-bo") return "Phim Bộ";
  if (name === "chieu-rap") return "Chiếu Rạp";
  if (name === "hoat-hinh") return "Hoạt Hình";
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync state with URL parameter 'q'
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val.trim()) {
      params.set("q", val);
    } else {
      params.delete("q");
    }

    // Determine target page for search
    const isSearchablePage = ["/", "/phim-le", "/phim-bo", "/chieu-rap", "/hoat-hinh", "/watchlist"].includes(pathname);
    const targetPath = isSearchablePage ? pathname : "/";
    startTransition(() => {
      router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative flex-1 md:w-64">
      <input
        type="text"
        id="movie-search"
        placeholder="Tìm phim, đạo diễn, diễn viên..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full bg-[#161925] border border-white/5 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
        suppressHydrationWarning
      />
      <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-500" />
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const { watchlist } = useWatchlist();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileUploader, setShowProfileUploader] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const closeMenu = () => setShowProfileMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    getAdminCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      } else {
        setCategories([
          { id: 1, name: "phim-le" },
          { id: 2, name: "phim-bo" },
          { id: 3, name: "chieu-rap" },
          { id: 4, name: "hoat-hinh" },
        ]);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? "bg-[#090a0f]/80 backdrop-blur-lg border-b border-white/10 shadow-lg" 
        : "bg-transparent border-b border-transparent"
    } py-4 px-4 sm:px-8`}>
      <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo + Desktop Nav */}
        <div className="flex items-center justify-between md:justify-start gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              ROPHIM
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative group ${
                pathname === "/" ? "text-orange-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Trang Chủ
              {pathname === "/" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>

            <Link
              href="/phim-hot"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative flex items-center gap-1 group ${
                pathname.startsWith("/phim-hot") ? "text-orange-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Phim Hot
              <span className="bg-red-600 text-white text-[8px] px-1 py-0.5 rounded-sm font-black tracking-wider uppercase leading-none scale-90 origin-left">New</span>
              {pathname.startsWith("/phim-hot") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>

            {/* Thể loại Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                suppressHydrationWarning
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 flex items-center gap-1 cursor-pointer h-full py-2 ${
                  categories.some(cat => pathname.startsWith(`/${cat.name}`))
                    ? "text-orange-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Thể loại <ChevronDown className="w-4 h-4" />
              </button>

               {isCategoryOpen && (
                <div className="absolute top-full left-0 pt-2 w-44 z-50">
                  <div className="rounded-xl bg-[#090a0f]/95 border border-white/10 backdrop-blur-xl py-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/${cat.name}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className={`block px-4 py-2 text-xs font-bold hover:bg-orange-500/10 hover:text-orange-500 transition-colors ${
                          pathname === `/${cat.name}` ? "text-orange-500 bg-orange-500/5" : "text-gray-300"
                        }`}
                      >
                        {formatCategoryLabel(cat.name)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/nhan-vat"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative group ${
                pathname.startsWith("/nhan-vat") ? "text-orange-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Nhân Vật
              {pathname.startsWith("/nhan-vat") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>

            <Link
              href="/dien-vien"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative group ${
                pathname.startsWith("/dien-vien") ? "text-orange-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Diễn Viên
              {pathname.startsWith("/dien-vien") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>

            <Link
              href="/gallery"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative group ${
                pathname.startsWith("/gallery") ? "text-orange-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Bộ Sưu Tập AI
              {pathname.startsWith("/gallery") && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>

            <Link
              href="/upgrade"
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border border-yellow-500/50 overflow-hidden group flex items-center justify-center gap-1 ${
                pathname === "/upgrade"
                  ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 border-transparent text-white shadow-lg shadow-orange-500/40"
                  : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:text-white shadow-sm hover:shadow-yellow-500/20"
              }`}
            >
              {/* Pulse effect border */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur opacity-30 group-hover:opacity-80 transition-all duration-300 -z-10 animate-pulse" />
              ⚡ Nâng cấp VIP
            </Link>
          </nav>

          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Search + Watchlist + Profile */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Suspense fallback={<div className="h-9 w-40 bg-[#161925] animate-pulse rounded-full" />}>
            <SearchInput />
          </Suspense>

          <Link
            href="/watchlist"
            className={`relative p-2.5 rounded-full bg-[#161925] hover:bg-orange-500/10 border border-white/5 transition-colors group ${
              pathname === "/watchlist" ? "text-orange-500 border-orange-500/30" : "text-gray-400"
            }`}
            title="Tủ phim yêu thích"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#090a0f]">
                {watchlist.length}
              </span>
            )}
          </Link>

          {/* User Profile / Login Action Section */}
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : !user ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-xs font-bold text-gray-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/5 bg-[#161925] hover:bg-[#1f2334] transition-all">
                Đăng Nhập
              </Link>
              <Link href="/register" className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-3.5 py-2 rounded-xl shadow-lg shadow-orange-500/15 transition-all">
                Đăng Ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Admin Link (Only for admins) */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="p-2.5 rounded-full bg-[#161925] hover:bg-orange-500/10 border border-white/5 transition-colors group text-gray-400 hover:text-orange-500 hover:border-orange-500/30"
                  title="Quản trị viên"
                >
                  <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
              )}

              {/* Profile menu dropdown button */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-[#161925] hover:bg-[#1c1f2f] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden relative border border-orange-500/30">
                    <Image src={getBunnyImageUrl(user.imgUrl, 'thumb') || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={user.username} fill className="object-cover" sizes="28px" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 max-w-[100px] truncate hidden sm:inline">{user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 z-50 bg-[#131520] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/80 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-orange-500/20 shrink-0">
                        <Image src={getBunnyImageUrl(user.imgUrl, 'thumb') || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={user.username} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.username}</p>
                        <p className="text-[9px] text-gray-400 truncate">{user.email}</p>
                        <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1 ${
                          user.role === "admin" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {user.role === "admin" ? "Admin" : "Thành viên"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={() => { setShowProfileUploader(true); setShowProfileMenu(false); }}
                        className="w-full text-left text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-gray-400" />
                        Đổi ảnh đại diện
                      </button>
                      
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5 text-gray-400" />
                          Trang quản trị
                        </Link>
                      )}
                      
                      <button
                        onClick={async () => {
                          await logout();
                          setShowProfileMenu(false);
                          window.location.reload();
                        }}
                        className="w-full text-left text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile avatar uploader modal */}
              {showProfileUploader && (
                <Dialog open={showProfileUploader} onOpenChange={setShowProfileUploader}>
                  <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                      <h3 className="text-sm font-bold text-white">Đổi ảnh đại diện</h3>
                      <button onClick={() => setShowProfileUploader(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Suspense fallback={<div className="w-24 h-24 rounded-full bg-[#1c1f2f] animate-pulse mx-auto" />}>
                      <AvatarUpload
                        currentImageUrl={user?.imgUrl}
                        onUploadSuccess={async (url) => {
                          try {
                            await updateUserAvatar(url);
                            await refreshUser();
                            setShowProfileUploader(false);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        folder="avatar"
                      />
                    </Suspense>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-3.5 animate-in fade-in duration-200">
          <Link
            href="/"
            onClick={() => setShowMobileMenu(false)}
            className={`text-sm font-bold py-1 ${
              pathname === "/" ? "text-orange-500" : "text-gray-400"
            }`}
          >
            Trang Chủ
          </Link>
          <Link
            href="/phim-hot"
            onClick={() => setShowMobileMenu(false)}
            className={`text-sm font-bold py-1 flex items-center gap-1.5 ${
              pathname === "/phim-hot" ? "text-orange-500" : "text-gray-400"
            }`}
          >
            Phim Hot <span className="bg-red-600 text-white text-[9px] px-1 py-0.5 rounded font-black tracking-wide uppercase leading-none">New</span>
          </Link>
          
          {/* Thể loại mobile */}
          <div className="flex flex-col gap-1.5 pl-2 border-l border-white/5">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Thể loại</span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${cat.name}`}
                onClick={() => setShowMobileMenu(false)}
                className={`text-xs font-bold py-0.5 ${
                  pathname === `/${cat.name}` ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {formatCategoryLabel(cat.name)}
              </Link>
            ))}
          </div>

          <Link
            href="/nhan-vat"
            onClick={() => setShowMobileMenu(false)}
            className={`text-sm font-bold py-1 ${
              pathname === "/nhan-vat" ? "text-orange-500" : "text-gray-400"
            }`}
          >
            Nhân Vật
          </Link>
          <Link
            href="/dien-vien"
            onClick={() => setShowMobileMenu(false)}
            className={`text-sm font-bold py-1 ${
              pathname === "/dien-vien" ? "text-orange-500" : "text-gray-400"
            }`}
          >
            Diễn Viên
          </Link>
          <Link
            href="/gallery"
            onClick={() => setShowMobileMenu(false)}
            className={`text-sm font-bold py-1 ${
              pathname === "/gallery" ? "text-orange-500" : "text-gray-400"
            }`}
          >
            Bộ Sưu Tập AI
          </Link>
          <Link
            href="/upgrade"
            onClick={() => setShowMobileMenu(false)}
            className="w-full text-center mt-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 text-white font-extrabold text-xs py-2 rounded-xl hover:from-yellow-400 hover:via-orange-400 hover:to-red-500 transition-all shadow-lg active:scale-[0.98]"
          >
            ⚡ NÂNG CẤP VIP
          </Link>
        </div>
      )}
    </header>
  );
}
