import React from "react";
import type { Metadata } from "next";
import { 
  ShieldCheck, 
  Database, 
  Eye, 
  Lock, 
  RefreshCw, 
  Cookie,
  Mail,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật | Vam3D – Bảo Vệ Quyền Riêng Tư",
  description: "Chính sách bảo mật chi tiết tại Vam3D. Tìm hiểu cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng.",
  keywords: ["chính sách bảo mật", "bảo mật vam3d", "quyền riêng tư"],
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Database className="w-5 h-5 text-orange-500" />,
      title: "1. Thu thập thông tin",
      description: "Chúng tôi thu thập các thông tin cần thiết để tối ưu hóa trải nghiệm của bạn bao gồm: thông tin đăng ký tài khoản (tên, địa chỉ email), lịch sử xem phim và danh sách phim yêu thích (Watchlist) để duy trì tính năng đồng bộ giữa các thiết bị."
    },
    {
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      title: "2. Cách thức sử dụng thông tin",
      description: "Thông tin của bạn được sử dụng nhằm mục đích: cung cấp và duy trì dịch vụ, gửi thông báo cập nhật các bộ phim mới/tập phim mới, cá nhân hóa các đề xuất phim phù hợp và cải tiến chất lượng kỹ thuật của hệ thống."
    },
    {
      icon: <Lock className="w-5 h-5 text-green-500" />,
      title: "3. Bảo mật dữ liệu cá nhân",
      description: "RoPhim áp dụng các công nghệ mã hóa tiên tiến và các chuẩn bảo mật cơ sở dữ liệu hiện đại để ngăn chặn truy cập trái phép, sửa đổi, tiết lộ hoặc phá hủy dữ liệu cá nhân. Mật khẩu tài khoản của bạn được băm (hash) bằng thuật toán bcrypt an toàn trước khi lưu vào PostgreSQL."
    },
    {
      icon: <Cookie className="w-5 h-5 text-yellow-500" />,
      title: "4. Cookie và Công nghệ theo dõi",
      description: "Chúng tôi sử dụng cookies để duy trì phiên đăng nhập của người dùng và lưu trữ các tùy chọn cá nhân (như mức âm lượng, chất lượng video mặc định). Ngoài ra, hệ thống sử dụng Google Analytics để thu thập số liệu phân tích ẩn danh về hành vi truy cập nhằm cải thiện dịch vụ."
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      title: "5. Tích hợp bên thứ ba & Thanh toán",
      description: "Hệ thống tích hợp cổng thanh toán an toàn PayOS phục vụ các gói nâng cấp VIP. Khi bạn tiến hành thanh toán, thông tin giao dịch được xử lý trực tiếp bởi cổng thanh toán của đối tác, RoPhim không lưu trữ thông tin thẻ hay tài khoản ngân hàng của bạn."
    }
  ];

  return (
    <div className="flex-1 w-full bg-[#090a0f] relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute bottom-1/3 left-1/10 w-[350px] h-[350px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs text-orange-500 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Bảo mật & An toàn
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Cập nhật lần cuối: Ngày 07 tháng 07 năm 2026. Chúng tôi luôn cam kết tôn trọng quyền riêng tư của bạn.
          </p>
        </div>

        {/* Commitment box */}
        <div className="glassmorphism rounded-3xl p-6 sm:p-8 border-orange-500/10 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 flex-shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-base font-bold text-white">Cam kết quyền riêng tư từ RoPhim</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Chúng tôi hiểu rằng dữ liệu cá nhân là vô giá. RoPhim cam kết không mua bán, trao đổi hoặc chia sẻ bất kỳ thông tin cá nhân nào của bạn cho bên thứ ba vì mục đích quảng cáo thương mại mà không có sự đồng ý rõ ràng từ phía bạn.
            </p>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec, idx) => (
            <div 
              key={idx} 
              className={`glassmorphism rounded-2xl p-6 hover:border-white/10 transition-all duration-300 space-y-4 ${
                idx === 4 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  {sec.icon}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">{sec.title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-1">
                {sec.description}
              </p>
            </div>
          ))}
        </div>

        {/* User Rights Section */}
        <div className="glassmorphism rounded-2xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-orange-500" /> Quyền của người dùng đối với dữ liệu
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình tại Vam3D. Cụ thể bao gồm:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-400 list-disc pl-5">
            <li>Yêu cầu truy xuất hoặc xuất bản sao dữ liệu cá nhân đang lưu trữ trên hệ thống.</li>
            <li>Thay đổi, cập nhật thông tin cá nhân của bạn thông qua trang cấu hình tài khoản (Hồ sơ).</li>
            <li>Yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu đi kèm ra khỏi hệ thống.</li>
          </ul>
          <p className="text-xs text-gray-500 leading-relaxed pt-2">
            Mọi yêu cầu liên quan đến quyền dữ liệu cá nhân xin vui lòng gửi email về ban hỗ trợ bảo mật tại: <a href="mailto:privacy@vam3dhentai.online" className="text-orange-500 hover:underline font-bold">privacy@vam3dhentai.online</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
