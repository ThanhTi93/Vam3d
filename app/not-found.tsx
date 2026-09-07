import Link from "next/link";
import { Film, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="relative mb-6">
        <span className="text-8xl sm:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 select-none">
          404
        </span>
        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full -z-10" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
        Không Tìm Thấy Trang
      </h1>
      <p className="text-gray-400 text-sm max-w-md mb-8">
        Nội dung bạn đang tìm kiếm có thể đã bị gỡ bỏ, đổi tên hoặc tạm thời không khả dụng.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          Về Trang Chủ
        </Link>
        <Link
          href="/phim-hot"
          className="inline-flex items-center gap-2 bg-[#131520] hover:bg-[#1a1c2b] text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl border border-white/10 transition-all text-sm"
        >
          <Film className="w-4 h-4 text-orange-500" />
          Khám Phá Phim Hot
        </Link>
      </div>
    </div>
  );
}
