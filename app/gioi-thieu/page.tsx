import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  Film, 
  Zap, 
  Shield, 
  Sparkles, 
  Users, 
  Activity, 
  Play,
  Heart,
  Globe
} from "lucide-react";

export const metadata: Metadata = {
  title: "Giới Thiệu Về Vam3D – Nền Tảng Xem Phim Trực Tuyến Miễn Phí",
  description: "Khám phá sứ mệnh, tầm nhìn và các tính năng nổi bật của Vam3D. Nền tảng mạng xã hội xem phim trực tuyến miễn phí lớn nhất Việt Nam với chất lượng HD/4K siêu mượt.",
  keywords: ["giới thiệu vam3d", "về vam3d", "xem phim miễn phí", "phim chất lượng cao", "vam3d hd"],
};

export default function AboutPage() {
  const stats = [
    { value: "10,000+", label: "Phim Tuyển Chọn", description: "Từ bom tấn chiếu rạp đến hoạt hình hấp dẫn" },
    { value: "2M+", label: "Lượt Xem Hằng Tháng", description: "Cộng đồng mọt phim hoạt động sôi nổi" },
    { value: "100%", label: "Cập Nhật Liên Tục", description: "Phim mới và tập mới mỗi ngày" },
    { value: "0đ", label: "Hoàn Toàn Miễn Phí", description: "Trải nghiệm không giới hạn mọi nội dung" }
  ];

  const features = [
    {
      icon: <Film className="w-6 h-6 text-orange-500" />,
      title: "Kho Phim Đa Dạng",
      description: "Đầy đủ các thể loại từ phim lẻ, phim bộ, phim chiếu rạp cho đến anime Nhật Bản mới nhất được cập nhật nhanh nhất."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Tốc Độ Vượt Trội",
      description: "Hạ tầng CDN phân phối chất lượng cao giúp tối ưu hóa băng thông truyền tải, hạn chế tối đa tình trạng giật lag."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "An Toàn & Bảo Mật",
      description: "Hệ thống bảo vệ dữ liệu cá nhân của người dùng tối ưu, bảo vệ tài khoản khỏi các rủi ro bên ngoài."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "Bộ Sưu Tập Ảnh AI",
      description: "Thư viện hình ảnh nhân vật 3D, cosplay độc quyền được tạo bởi trí tuệ nhân tạo, mang lại trải nghiệm mãn nhãn."
    }
  ];

  return (
    <div className="flex-1 w-full bg-[#090a0f] relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Về chúng tôi
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-2">
            Mạng Xã Hội Xem Phim <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Trực Tuyến Hàng Đầu
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed">
            Chào mừng bạn đến với <strong className="text-white">Vam3D</strong> – nền tảng mô phỏng xem phim và mạng xã hội chia sẻ trải nghiệm điện ảnh hiện đại bậc nhất. Chúng tôi mang đến cho bạn không gian giải trí đỉnh cao hoàn toàn miễn phí.
          </p>
        </div>

        {/* Vision & Mission Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glassmorphism rounded-2xl p-8 hover:border-orange-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Tầm Nhìn của Vam3D</h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Trở thành điểm đến giải trí trực tuyến phổ biến và đáng tin cậy nhất dành cho cộng đồng yêu điện ảnh tại Việt Nam. Không ngừng áp dụng và nâng cấp các công nghệ hiển thị hình ảnh, truyền tải dữ liệu và tương tác cộng đồng để đưa trải nghiệm người dùng đạt chuẩn quốc tế.
            </p>
          </div>

          <div className="glassmorphism rounded-2xl p-8 hover:border-amber-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Sứ Mệnh Kết Nối</h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Xây dựng một sân chơi lành mạnh, nơi mỗi thành viên không chỉ là người xem phim thụ động mà còn có thể chia sẻ, bàn luận, tạo lập các danh sách theo dõi cá nhân và chia sẻ đam mê với những người có cùng sở thích. Mọi tài nguyên phim được phân bổ khoa học, tối ưu nhất.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="glassmorphism rounded-3xl p-8 sm:p-10 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[80px] pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center pt-6 md:pt-0 md:px-4 first:pt-0">
                <span className="block text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </span>
                <span className="block text-sm font-bold text-white mb-1">
                  {stat.label}
                </span>
                <span className="block text-[11px] text-gray-500 leading-tight">
                  {stat.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Vì sao lựa chọn Vam3D?</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Những ưu điểm làm nên thương hiệu của mạng xã hội giải trí Vam3D</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 rounded-2xl bg-[#131520]/60 border border-white/5 hover:border-white/10 hover:bg-[#131520]/80 transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-6">
          <div className="glassmorphism inline-flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto border-orange-500/10">
            <div className="text-left space-y-1">
              <h3 className="text-lg font-bold text-white">Bắt đầu trải nghiệm ngay hôm nay!</h3>
              <p className="text-xs text-gray-400">Xem hàng ngàn bộ phim đỉnh cao hoàn toàn miễn phí cùng Vam3D</p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" /> Xem Phim Ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
