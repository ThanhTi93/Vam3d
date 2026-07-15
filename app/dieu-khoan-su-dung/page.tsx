import React from "react";
import type { Metadata } from "next";
import { 
  FileText, 
  Scale, 
  UserCheck, 
  ShieldAlert, 
  HelpCircle, 
  AlertTriangle,
  FileWarning
} from "lucide-react";

export const metadata: Metadata = {
  title: "Điều Khoản Sử Dụng | Vam3D – Trách Nhiệm & Quyền Lợi",
  description: "Bản quy định chi tiết các điều khoản sử dụng dịch vụ xem phim trực tuyến tại Vam3D. Vui lòng đọc kỹ trước khi đăng ký tài khoản hoặc sử dụng dịch vụ.",
  keywords: ["điều khoản sử dụng", "quy định vam3d", "chính sách vam3d"],
};

export default function TermsOfUsePage() {
  const sections = [
    {
      id: "chap-nhan",
      icon: <Scale className="w-5 h-5 text-orange-500" />,
      title: "1. Chấp nhận các điều khoản",
      content: "Bằng cách truy cập, đăng ký tài khoản, hoặc sử dụng bất kỳ tính năng nào của Vam3D, bạn mặc nhiên đồng ý tuân thủ toàn bộ các điều khoản sử dụng được quy định tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng dịch vụ ngay lập tức."
    },
    {
      id: "tai-khoan",
      icon: <UserCheck className="w-5 h-5 text-amber-500" />,
      title: "2. Tài khoản & Bảo mật",
      content: "Khi tạo tài khoản trên RoPhim, bạn có trách nhiệm tự bảo mật thông tin đăng nhập cá nhân (email, mật khẩu). Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ thuộc trách nhiệm pháp lý của riêng bạn. RoPhim có quyền đình chỉ hoặc chấm dứt vĩnh viễn các tài khoản có hành vi gian lận, spam hoặc vi phạm chuẩn mực cộng đồng."
    },
    {
      id: "so-huu-tri-tue",
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      title: "3. Sở hữu trí tuệ & Bản quyền",
      content: "Mọi nội dung phim, hình ảnh, văn bản, giao diện và mã nguồn tại RoPhim đều được cung cấp trên cơ sở chia sẻ cộng đồng hoặc mô phỏng kỹ thuật. Bạn cam kết không sao chép, tải về để bán lại, phân phối thương mại trái phép các sản phẩm từ hệ thống khi chưa được sự cho phép bằng văn bản từ chủ sở hữu hợp pháp."
    },
    {
      id: "hanh-vi-nguoi-dung",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      title: "4. Quy định hành vi người dùng",
      content: "Bạn đồng ý không sử dụng dịch vụ của RoPhim để thực hiện các hành vi: phát tán thông tin kích động bạo lực, khiêu dâm, đồi trụy; spam các bình luận hoặc đánh giá phim; tấn công từ chối dịch vụ (DDoS) hoặc can thiệp trái phép vào cơ sở dữ liệu hệ thống."
    },
    {
      id: "gioi-han",
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      title: "5. Giới hạn trách nhiệm pháp lý",
      content: "RoPhim vận hành như một nền tảng xã hội tổng hợp thông tin và mô phỏng trải nghiệm. Chúng tôi không đảm bảo tính chính xác tuyệt đối của mọi nội dung và không chịu trách nhiệm cho bất kỳ tổn thất trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng hệ thống."
    }
  ];

  return (
    <div className="flex-1 w-full bg-[#090a0f] relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/3 right-1/10 w-[350px] h-[350px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs text-orange-500 font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Pháp lý & Quy định
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Cập nhật lần cuối: Ngày 07 tháng 07 năm 2026. Vui lòng đọc kỹ trước khi sử dụng.
          </p>
        </div>

        {/* Evaluation Warning Block */}
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <FileWarning className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Lưu ý quan trọng cho người dùng (Disclaimer)</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              RoPhim là nền tảng mô phỏng phục vụ mục đích kiểm thử và phát triển kỹ thuật. Toàn bộ thông tin phim, dữ liệu thành viên VIP và các dịch vụ đi kèm được thiết kế nhằm mục đích trình diễn tính năng của sản phẩm.
            </p>
          </div>
        </div>

        {/* Two-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sticky Navigation Sidebar (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">
                Mục lục điều khoản
              </span>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/30" />
                  <span className="truncate">{sec.title.substring(3)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Detailed Content Column */}
          <div className="lg:col-span-3 space-y-6">
            {sections.map((section) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="scroll-mt-24 glassmorphism rounded-2xl p-6 sm:p-8 space-y-4 hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-1">
                  {section.content}
                </p>
              </section>
            ))}

            {/* Additional note */}
            <div className="p-6 rounded-2xl bg-[#131520]/40 border border-white/5 space-y-3">
              <h3 className="text-sm font-bold text-white">Liên hệ và Thắc mắc</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào liên quan đến các quy định và điều khoản sử dụng trên, vui lòng liên hệ với ban quản trị Vam3D qua hòm thư điện tử chính thức: <a href="mailto:contact@vam3dhentai.online" className="text-orange-500 hover:underline font-bold">contact@vam3dhentai.online</a>.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
