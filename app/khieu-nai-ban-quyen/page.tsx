import React from "react";
import type { Metadata } from "next";
import { 
  Copyright, 
  Mail, 
  Send, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Khiếu Nại Bản Quyền (DMCA) | RoPhim – Tôn Trọng Bản Quyền",
  description: "Quy định và hướng dẫn chi tiết về việc khiếu nại bản quyền sở hữu trí tuệ tại RoPhim. Quy trình báo cáo vi phạm nội dung (DMCA Compliance).",
  keywords: ["khiếu nại bản quyền", "dmca rophim", "bản quyền rophim", "báo cáo vi phạm"],
};

export default function CopyrightPage() {
  const steps = [
    {
      step: "01",
      title: "Xác định nội dung vi phạm",
      description: "Thu thập đường dẫn URL cụ thể của video, hình ảnh hoặc tài liệu trên hệ thống RoPhim mà bạn tin rằng đã xâm phạm quyền sở hữu trí tuệ của mình."
    },
    {
      step: "02",
      title: "Chuẩn bị hồ sơ chứng minh",
      description: "Tài liệu hoặc bằng chứng hợp pháp chứng minh bạn là chủ sở hữu hoặc là người đại diện hợp pháp được ủy quyền cho tác phẩm đang bị khiếu nại."
    },
    {
      step: "03",
      title: "Soạn thảo email khiếu nại",
      description: "Sử dụng Mẫu yêu cầu gỡ bỏ bản quyền bên dưới và điền đầy đủ các thông tin bắt buộc một cách trung thực."
    },
    {
      step: "04",
      title: "Gửi tới ban quản trị",
      description: "Gửi email trực tiếp đến bộ phận bản quyền của RoPhim. Hệ thống sẽ tiến hành xác minh và phản hồi nhanh chóng."
    }
  ];

  const templateText = `TIÊU ĐỀ EMAIL: [DMCA] Yêu cầu gỡ bỏ nội dung vi phạm bản quyền - [Tên Tác Phẩm]

NỘI DUNG EMAIL:
Kính gửi Ban quản trị RoPhim,

Tôi tên là: [Tên của bạn hoặc tổ chức đại diện]
Địa chỉ liên hệ: [Địa chỉ của bạn]
Số điện thoại: [Số điện thoại liên hệ]
Email liên hệ: [Địa chỉ email của bạn]

Tôi là chủ sở hữu hợp pháp (hoặc người đại diện được ủy quyền hợp pháp) đối với tác phẩm: [Tên tác phẩm/bộ phim/hình ảnh].

Tôi phát hiện tác phẩm trên đang được phát sóng/đăng tải trái phép trên website RoPhim tại các liên kết (URL) sau:
1. [Điền link URL vi phạm 1]
2. [Điền link URL vi phạm 2]

Tôi yêu cầu Ban quản trị RoPhim tiến hành gỡ bỏ hoặc khóa quyền truy cập vào các nội dung vi phạm nêu trên ngay lập tức theo quy định bản quyền quốc tế.

Tôi xin cam đoan các thông tin cung cấp ở trên là hoàn toàn chính xác và trung thực.

Trân trọng,
[Chữ ký / Tên của bạn]`;

  return (
    <div className="flex-1 w-full bg-[#090a0f] relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[450px] h-[450px] rounded-full bg-amber-500/5 blur-[125px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-12">
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs text-orange-500 font-bold uppercase tracking-wider">
            <Copyright className="w-4 h-4" /> Sở hữu trí tuệ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Khiếu Nại Bản Quyền (DMCA)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            RoPhim tôn trọng quyền sở hữu trí tuệ của các tác giả và nhà phát hành nghệ thuật.
          </p>
        </div>

        {/* Introduction Policy */}
        <div className="glassmorphism rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" /> Tuyên bố bản quyền thương hiệu
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            RoPhim hoạt động như một nền tảng mạng xã hội chia sẻ trải nghiệm điện ảnh và mô phỏng các tính năng kỹ thuật. Chúng tôi không chủ động lưu trữ hoặc tải lên các tệp tin đa phương tiện lên hệ thống máy chủ của mình. Dữ liệu phim được tham chiếu, liên kết hoặc nhúng từ các nguồn mở trên Internet. 
          </p>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Tuy nhiên, nếu bạn phát hiện bất kỳ liên kết nội dung nào hiển thị trên website xâm phạm quyền tác giả hợp pháp của bạn, vui lòng liên hệ với chúng tôi theo quy trình bên dưới. Chúng tôi cam kết hợp tác và xử lý gỡ bỏ ngay lập tức sau khi nhận được khiếu nại hợp lệ.
          </p>
        </div>

        {/* Step-by-Step Reporting */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white text-center">Quy trình 4 bước gửi khiếu nại</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div 
                key={idx}
                className="glassmorphism rounded-2xl p-6 border-white/5 flex flex-col justify-between hover:border-orange-500/20 transition-all duration-300"
              >
                <span className="block text-2xl font-black text-orange-500/20 mb-2">
                  {item.step}
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-normal">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template & Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glassmorphism rounded-2xl p-6 border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" /> Hòm thư Bản quyền
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Vui lòng gửi các văn bản, yêu cầu khiếu nại về địa chỉ email chính thức của bộ phận xử lý bản quyền:
              </p>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <span className="text-sm font-bold text-orange-500 block select-all">
                  copyright@rophim.vn
                </span>
              </div>
            </div>

            <div className="glassmorphism rounded-2xl p-6 border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Thời gian xử lý
              </h3>
              <ul className="space-y-2 text-xs text-gray-400 list-disc pl-4 leading-relaxed">
                <li>Bộ phận bản quyền tiếp nhận thư 24/7.</li>
                <li>Thời gian xác minh tài liệu và phản hồi/gỡ bỏ liên kết vi phạm kéo dài từ <strong>24 giờ đến tối đa 48 giờ làm việc</strong> kể từ khi nhận được yêu cầu hợp lệ.</li>
              </ul>
            </div>
          </div>

          {/* Template Card */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Mẫu yêu cầu gỡ bỏ bản quyền tiêu chuẩn
            </h3>
            <div className="relative">
              <pre className="w-full bg-[#131520]/80 border border-white/5 rounded-2xl p-5 text-[10px] sm:text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {templateText}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
