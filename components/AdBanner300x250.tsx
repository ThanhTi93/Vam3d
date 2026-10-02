"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface AdBanner300x250Props {
  className?: string;
  adKey?: string; // Thay đổi adKey khi đổi tập để tải mới quảng cáo
}

const BANNER_KEY = "a1c807f9e14c4acd0b1f92582a15c657";

const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: transparent; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      width: 300px; 
      height: 250px; 
      overflow: hidden; 
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${BANNER_KEY}',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${BANNER_KEY}/invoke.js"></script>
</body>
</html>`;

export default function AdBanner300x250({ className = "", adKey }: AdBanner300x250Props) {
  const { user } = useAuth();
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // 1. Chặn bot Google / Crawlers để bảo vệ SEO 100%
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|google-inspectiontool/i.test(
        navigator.userAgent || ""
      );
    if (isBot) return;

    // 2. Không hiện cho tài khoản VIP hoặc Admin
    const isVipOrAdmin = !!user && ((user.level && user.level > 0) || user.role === "admin");
    if (isVipOrAdmin) return;

    setCanShow(true);
  }, [user]);

  if (!canShow) return null;

  return (
    <div className={`my-6 flex flex-col items-center justify-center w-full ${className}`}>
      <span className="text-[10px] tracking-wider uppercase text-gray-500 mb-1 select-none">
        Quảng cáo
      </span>
      <div className="w-[300px] h-[250px] overflow-hidden rounded-md bg-[#13161f] shadow-lg flex items-center justify-center border border-gray-800/40">
        <iframe
          key={adKey}
          title="Advertisement"
          srcDoc={srcDoc}
          width={300}
          height={250}
          loading="lazy"
          scrolling="no"
          style={{ border: 0, width: "300px", height: "250px", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}
