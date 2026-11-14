"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  Plus,
  Send,
  Download,
  Filter,
  Check,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getSeoIndexingDataAction,
  excludeSeoUrlAction,
  restoreSeoUrlAction,
  bulkExcludeSeoUrlsAction,
  submitIndexNowAction,
  type ActiveSeoUrlItem,
} from "./actions";
import type { SeoExcludedUrlItem } from "@/lib/db/settings";

interface SeoIndexingTabProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function SeoIndexingTab({ showToast }: SeoIndexingTabProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Data states
  const [siteUrl, setSiteUrl] = useState("https://www.vam3dhentai.online");
  const [activeUrls, setActiveUrls] = useState<ActiveSeoUrlItem[]>([]);
  const [excludedUrls, setExcludedUrls] = useState<SeoExcludedUrlItem[]>([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalExcluded: 0,
    gscIndexedSample: 277,
    gscNotIndexedSample: 502,
  });

  // UI Tab Filter states
  const [activeSubTab, setActiveSubTab] = useState<"active" | "excluded" | "bulk_import" | "guide">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Single URL Exclude Form
  const [customUrl, setCustomUrl] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [customStatus, setCustomStatus] = useState<"noindex" | "410">("noindex");

  // Bulk Import Form
  const [bulkText, setBulkText] = useState("");
  const [bulkReason, setBulkReason] = useState("Trang trùng non-www hoặc link cũ trên GSC");
  const [bulkStatus, setBulkStatus] = useState<"noindex" | "410">("noindex");

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSeoIndexingDataAction();
      if (res.success && res.activeUrls) {
        setActiveUrls(res.activeUrls);
        setExcludedUrls(res.excludedUrls || []);
        if (res.siteUrl) setSiteUrl(res.siteUrl);
        if (res.stats) setStats(res.stats);
      } else {
        showToast(res.error || "Không thể tải dữ liệu chỉ mục", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi tải chỉ mục SEO", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Exclude single URL
  const handleExcludeUrl = (urlToExclude: string, reasonText?: string) => {
    startTransition(async () => {
      const res = await excludeSeoUrlAction(
        urlToExclude,
        reasonText || customReason || "Chặn index theo yêu cầu quản trị viên",
        customStatus
      );
      if (res.success) {
        showToast("✅ Đã loại URL khỏi Sitemap & gắn lệnh Noindex thành công!");
        setCustomUrl("");
        setCustomReason("");
        loadData();
      } else {
        showToast(res.error || "Không thể loại URL", "error");
      }
    });
  };

  // Handle Restore URL
  const handleRestoreUrl = (idOrUrl: string) => {
    startTransition(async () => {
      const res = await restoreSeoUrlAction(idOrUrl);
      if (res.success) {
        showToast("✅ Đã khôi phục URL trở lại Sitemap & gỡ bỏ Noindex!");
        loadData();
      } else {
        showToast(res.error || "Không thể khôi phục URL", "error");
      }
    });
  };

  // Handle Bulk Import
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showToast("Vui lòng dán danh sách URL vào khung!", "error");
      return;
    }
    startTransition(async () => {
      const res = await bulkExcludeSeoUrlsAction(bulkText, bulkReason, bulkStatus);
      if (res.success) {
        showToast(`✅ Đã nhập thành công ${res.addedCount} URL vào danh sách loại trừ!`);
        setBulkText("");
        setActiveSubTab("excluded");
        loadData();
      } else {
        showToast(res.error || "Lỗi nhập URL hàng loạt", "error");
      }
    });
  };

  // Handle Ping IndexNow
  const handlePingIndexNow = () => {
    startTransition(async () => {
      const res = await submitIndexNowAction();
      if (res.success) {
        showToast(`🚀 ${res.message}`);
      } else {
        showToast(res.error || "Lỗi gửi IndexNow", "error");
      }
    });
  };

  // Copy Excluded URLs for Google Search Console Removals
  const handleCopyForRemovals = () => {
    if (excludedUrls.length === 0) {
      showToast("Chưa có URL nào trong danh sách loại trừ để sao chép!", "error");
      return;
    }
    const txt = excludedUrls.map((i) => i.url).join("\n");
    navigator.clipboard.writeText(txt);
    showToast(`📋 Đã sao chép ${excludedUrls.length} URL để dán vào Google Search Console Removals!`);
  };

  // Filtered Active URLs
  const filteredActiveUrls = activeUrls.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.url.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── HEADER BANNER ─── */}
      <div className="bg-gradient-to-r from-[#171926] via-[#1c1f33] to-[#121420] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Bộ Quản Trị Chỉ Mục SEO Google
              </span>
              <span className="text-gray-400 text-xs font-mono">Domain: {siteUrl}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Quản Lý Chỉ Mục & Xử Lý Lỗi Index (Google Search Console)
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
              Theo dõi và làm sạch danh sách URL website. Tự động loại bỏ các trang lỗi, trang trùng non-www, gắn thẻ <code className="text-purple-300">noindex / 410 Gone</code> và cập nhật <code className="text-purple-300">sitemap.xml</code> ngay lập tức.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handlePingIndexNow}
              disabled={isPending || loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs h-9 shadow-md"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Ping IndexNow (Bing/Yandex)
            </Button>
            <Button
              onClick={handleCopyForRemovals}
              disabled={excludedUrls.length === 0}
              variant="outline"
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs h-9"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy URL Gỡ (Removals)
            </Button>
            <Button
              onClick={loadData}
              disabled={isPending || loading}
              variant="outline"
              size="icon"
              className="border-white/10 text-gray-300 hover:text-white h-9 w-9"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── KPI METRIC CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141622] border border-emerald-500/20 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Đã Index (GSC)
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-mono">
              Chuẩn www
            </Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.gscIndexedSample}</p>
          <p className="text-[11px] text-gray-400 mt-1">Trang đã index thành công trên Google</p>
        </div>

        <div className="bg-[#141622] border border-amber-500/20 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Chưa Index (GSC)
            </span>
            <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-300 font-mono">
              Trùng non-www
            </Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{stats.gscNotIndexedSample}</p>
          <p className="text-[11px] text-gray-400 mt-1">Cần dọn dẹp / Redirect 301 tự động</p>
        </div>

        <div className="bg-[#141622] border border-blue-500/20 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              URL Hoạt Động
            </span>
            <span className="text-[10px] text-blue-300 font-mono">Sitemap.xml</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.totalActive}</p>
          <p className="text-[11px] text-gray-400 mt-1">Trang hợp lệ sẵn sàng phân phối</p>
        </div>

        <div className="bg-[#141622] border border-red-500/20 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-red-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-red-400" />
              Đã Chặn / Loại Bỏ
            </span>
            <Badge variant="outline" className="text-[10px] bg-red-500/10 border-red-500/30 text-red-300 font-mono">
              Noindex
            </Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-400 font-mono">{stats.totalExcluded}</p>
          <p className="text-[11px] text-gray-400 mt-1">Đã gỡ khỏi Sitemap & gắn cấm index</p>
        </div>
      </div>

      {/* ─── QUICK ADD SINGLE EXCLUDE FORM ─── */}
      <div className="bg-[#131520] border border-white/10 rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-orange-400" />
          Thêm Nhanh URL Cần Chặn Index / Xóa Khỏi Sitemap
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="VD: https://vam3dhentai.online/anh-sex hoặc /dieu-khoan-su-dung"
              className="bg-[#0e0f17] border-white/10 text-xs h-9 text-white font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <Input
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Lý do (VD: Link cũ 404, trùng non-www, trang hệ thống...)"
              className="bg-[#0e0f17] border-white/10 text-xs h-9 text-gray-300"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              onClick={() => handleExcludeUrl(customUrl)}
              disabled={isPending || !customUrl.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9"
            >
              <Ban className="w-3.5 h-3.5 mr-1" />
              Chặn Index
            </Button>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION SUB-TABS ─── */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveSubTab("active")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "active"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          URL Hợp Lệ Trong Sitemap ({activeUrls.filter((u) => !u.isExcluded).length})
        </button>
        <button
          onClick={() => setActiveSubTab("excluded")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "excluded"
              ? "border-red-500 text-red-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Ban className="w-4 h-4" />
          URL Đã Chặn / Loại Bỏ ({excludedUrls.length})
        </button>
        <button
          onClick={() => setActiveSubTab("bulk_import")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "bulk_import"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Download className="w-4 h-4" />
          Nhập Hàng Loạt Từ GSC (502 Link)
        </button>
        <button
          onClick={() => setActiveSubTab("guide")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "guide"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Info className="w-4 h-4" />
          Giải Thích Lỗi & Hướng Dẫn
        </button>
      </div>

      {/* ─── TAB 1: ACTIVE VALID SITEMAP URLS ─── */}
      {activeSubTab === "active" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm URL hoặc tên phim, thể loại..."
                className="pl-9 bg-[#131520] border-white/10 text-xs h-9 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Lọc:
              </span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#131520] border border-white/10 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">Tất cả ({activeUrls.length})</option>
                <option value="phim">Phim</option>
                <option value="the-loai">Thể loại</option>
                <option value="gallery">Bộ ảnh AI</option>
                <option value="nhan-vat">Nhân vật</option>
                <option value="tinh">Trang tĩnh</option>
              </select>
            </div>
          </div>

          <div className="bg-[#131520] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0e0f17] text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tên / Tiêu Đề</th>
                    <th className="py-3 px-4">URL Canonical</th>
                    <th className="py-3 px-4">Phân Loại</th>
                    <th className="py-3 px-4 text-center">Trạng Thái Sitemap</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredActiveUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Không tìm thấy URL nào khớp với điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredActiveUrls.slice(0, 100).map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-white max-w-[220px] truncate">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-gray-300 max-w-[350px] truncate">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-orange-400 inline-flex items-center gap-1 text-[11px]"
                          >
                            {item.url}
                            <ExternalLink className="w-3 h-3 text-gray-500 inline shrink-0" />
                          </a>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-[10px] font-mono capitalize border-white/10 text-gray-300">
                            {item.type}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {item.isExcluded ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                              Đã chặn Noindex
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                              ✓ Đang trong Sitemap
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {item.isExcluded ? (
                            <Button
                              onClick={() => handleRestoreUrl(item.url)}
                              disabled={isPending}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              Khôi phục
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleExcludeUrl(item.url, "Loại khỏi sitemap từ danh sách hoạt động")}
                              disabled={isPending}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Chặn Index
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredActiveUrls.length > 100 && (
              <div className="p-3 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0e0f17]">
                Đang hiển thị 100 / {filteredActiveUrls.length} URL đầu tiên. Dùng ô tìm kiếm để lọc nhanh.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: EXCLUDED / NOINDEX URLS ─── */}
      {activeSubTab === "excluded" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Các URL dưới đây sẽ **không bao giờ xuất hiện trong Sitemap** và tự động được trả về chỉ thị cấm Google bot lập chỉ mục.
            </p>
            <Button
              onClick={handleCopyForRemovals}
              disabled={excludedUrls.length === 0}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy toàn bộ để dán vào Search Console Removals
            </Button>
          </div>

          <div className="bg-[#131520] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0e0f17] text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">URL Bị Loại Bỏ</th>
                    <th className="py-3 px-4">Lý Do Loại Bỏ</th>
                    <th className="py-3 px-4 text-center">Chỉ Thị Bot</th>
                    <th className="py-3 px-4 text-center">Thời Gian Thêm</th>
                    <th className="py-3 px-4 text-right">Khôi Phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {excludedUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Chưa có URL nào bị loại bỏ. Bạn có thể thêm link ở ô phía trên hoặc nhập hàng loạt từ tab bên cạnh.
                      </td>
                    </tr>
                  ) : (
                    excludedUrls.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 font-mono text-gray-200 max-w-[380px] truncate">
                          {item.url}
                        </td>
                        <td className="py-2.5 px-4 text-gray-400 max-w-[250px] truncate">
                          {item.reason}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-mono">
                            {item.status === "410" ? "410 Gone" : "Noindex"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-center text-gray-500 font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Button
                            onClick={() => handleRestoreUrl(item.id)}
                            disabled={isPending}
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Bỏ Chặn
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: BULK IMPORT FROM GSC ─── */}
      {activeSubTab === "bulk_import" && (
        <div className="bg-[#131520] border border-white/10 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              Nhập Hàng Loạt URL Lỗi / Chưa Được Lập Chỉ Mục Từ Search Console
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Bạn có thể xuất danh sách 502 link lỗi từ Google Search Console (file CSV hoặc copy từ bảng), dán vào ô bên dưới. Hệ thống sẽ tự động lọc URL, thêm vào danh sách cấm index và gỡ khỏi Sitemap.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Danh sách URL (mỗi URL một dòng hoặc ngăn cách bởi dấu phẩy):
              </label>
              <Textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`https://vam3dhentai.online/anh-sex\nhttps://vam3dhentai.online/china-animation\nhttps://vam3dhentai.online/chinh-sach-bao-mat\nhttps://vam3dhentai.online/dien-vien\nhttps://vam3dhentai.online/dieu-khoan-su-dung`}
                className="bg-[#0e0f17] border-white/10 text-xs text-gray-200 font-mono focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Lý do ghi chú:
                </label>
                <Input
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Lý do loại bỏ"
                  className="bg-[#0e0f17] border-white/10 text-xs h-9 text-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Chỉ thị xử lý cho bot:
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as any)}
                  className="w-full bg-[#0e0f17] border border-white/10 text-xs text-gray-200 rounded-md px-3 h-9 focus:outline-none"
                >
                  <option value="noindex">Gắn thẻ Noindex & Loại khỏi Sitemap (Khuyên dùng)</option>
                  <option value="410">Trả mã 410 Gone (Xác nhận trang đã xóa vĩnh viễn)</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleBulkImport}
              disabled={isPending || !bulkText.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 px-6"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Thực Hiện Nhập & Loại Khỏi Sitemap Ngay
            </Button>
          </div>
        </div>
      )}

      {/* ─── TAB 4: COMPREHENSIVE GUIDE & EXPLANATION ─── */}
      {activeSubTab === "guide" && (
        <div className="bg-[#131520] border border-white/10 rounded-xl p-5 space-y-5 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Vì sao Search Console báo 277 trang ĐÃ index và 502 trang CHƯA index?
            </h3>
            <p className="text-gray-400 mt-1">
              Giải thích nguyên nhân kỹ thuật và các bước xử lý triệt để:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0e0f17] border border-white/5 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 1. Bản chất lỗi non-www vs www
              </h4>
              <p className="text-gray-400 text-xs">
                - Trong ảnh 1: Các trang index thành công đều có tiền tố <code className="text-emerald-300">www.vam3dhentai.online</code>.<br />
                - Trong ảnh 2: Các trang chưa index đều là dạng <code className="text-amber-300">vam3dhentai.online</code> (không có www).<br />
                Google xem đây là 2 trang web khác nhau. Hệ thống hiện đã được cấu hình **chuyển hướng 301 tự động** từ non-www sang www để hợp nhất toàn bộ sức mạnh SEO vào một tên miền duy nhất.
              </p>
            </div>

            <div className="bg-[#0e0f17] border border-white/5 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> 2. Cách xóa nhanh trên Google Search Console
              </h4>
              <p className="text-gray-400 text-xs">
                - Bước 1: Vào tab <strong>"URL Đã Chặn / Loại Bỏ"</strong> bấm nút <strong>"Copy toàn bộ để dán vào Search Console Removals"</strong>.<br />
                - Bước 2: Mở Search Console, vào menu <strong>Xóa URL (Removals)</strong> &gt; <strong>Yêu cầu mới (New Request)</strong> &gt; dán link cần gỡ.<br />
                - Google sẽ ẩn URL đó khỏi tìm kiếm ngay trong 24 giờ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
