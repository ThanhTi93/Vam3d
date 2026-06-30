import { encryptSession } from "../lib/auth/session";

async function run() {
  // Generate a valid session token for user ID 2 (tiprokid1)
  const token = await encryptSession({
    userId: "2",
    username: "tiprokid1",
    email: "tiprokid1@gmail.com",
    role: "member",
    level: 1,
    expiredAt: new Date("2026-09-30T07:03:57.205Z").toISOString()
  });

  console.log("Generated Token:", token);

  // Send request to localhost:3000/profile
  const res = await fetch("http://localhost:3000/profile", {
    headers: {
      Cookie: `session=${token}`
    }
  });

  console.log("Response Status:", res.status);
  const text = await res.text();
  
  // Search for membership display text in HTML
  const keywordMatches = {
    hasThanhVienThuong: text.includes("Thành viên Thường") || text.includes("THÀNH VIÊN THƯỜNG"),
    hasVipCap1: text.includes("VIP Cấp 1") || text.includes("VAM VIP"),
    hasDaHetHan: text.includes("Đã hết hạn") || text.includes("ĐÃ HẾT HẠN"),
    hasDangHoatDong: text.includes("Đang hoạt động") || text.includes("ĐANG HOẠT ĐỘNG"),
    hasNgayHetHan: text.includes("30/9/2026") || text.includes("30/09/2026") || text.includes("30/12/2026"),
  };
  
  console.log("Keyword Matches in SSR HTML:", keywordMatches);
}

run();
