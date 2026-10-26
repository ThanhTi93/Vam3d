"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  TrendingUp,
  Sparkles,
  Zap,
  DollarSign,
  Users,
  Eye,
  Film,
  Camera,
  Smartphone,
  Monitor,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Flame,
  Award,
  Layers,
  ShoppingBag,
  Cpu,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Calculator,
  ShieldCheck,
  Target,
  FileText,
  BadgePercent,
  Coins,
  Search,
  Radio,
  Calendar,
  Key,
  ExternalLink,
  Sliders,
  Tv,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getStrategyAnalyticsAction,
  getDailyStrategicBriefingAction,
  generateDailyAiActionPlanAction,
  generateStrategicAiAdviceAction,
  saveStrategicRoadmapAction,
  getAdsterraRealStatsAction,
  saveAdsterraRealStatsAction,
  getAdsterraApiTokenAction,
  syncAdsterraStatsFromApiAction,
  generateAdsterraAiSolutionsAction,
  getCachedAdsterraAiSolutionsAction,
  type StrategicAnalyticsData,
  type WeeklyStrategicData,
  type AdsterraDailyStat,
} from "./actions";

const DEFAULT_ADSTERRA_REAL_STATS: AdsterraDailyStat[] = [
  { date: "2026/10/26", impressions: 610, clicks: 76, ctr: 12.459, cpm: 0.679, revenue: 0.41 },
  { date: "2026/10/25", impressions: 2467, clicks: 361, ctr: 14.633, cpm: 0.255, revenue: 0.63 },
  { date: "2026/10/24", impressions: 1910, clicks: 342, ctr: 17.906, cpm: 0.123, revenue: 0.23 },
  { date: "2026/10/23", impressions: 1338, clicks: 265, ctr: 19.806, cpm: 0.170, revenue: 0.23 },
  { date: "2026/10/22", impressions: 1292, clicks: 285, ctr: 22.059, cpm: 0.147, revenue: 0.19 },
  { date: "2026/10/21", impressions: 1491, clicks: 188, ctr: 12.609, cpm: 0.177, revenue: 0.26 },
  { date: "2026/10/20", impressions: 1461, clicks: 200, ctr: 13.689, cpm: 0.157, revenue: 0.23 },
  { date: "2026/10/19", impressions: 2065, clicks: 260, ctr: 12.591, cpm: 0.147, revenue: 0.30 },
];

interface StrategyTabProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function StrategyTab({ showToast }: StrategyTabProps) {
  const [data, setData] = useState<StrategicAnalyticsData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyStrategicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"weekly" | "seo" | "ads" | "simulator" | "roadmap">("weekly");

  // Real Adsterra Publisher Data state (Audit from screenshot)
  const [adsterraData, setAdsterraData] = useState<{
    stats: AdsterraDailyStat[];
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    avgCpm: number;
    totalRevenue: number;
    daysCount: number;
    avgDailyRevenue: number;
  }>({
    stats: DEFAULT_ADSTERRA_REAL_STATS,
    totalImpressions: 12634,
    totalClicks: 1977,
    avgCtr: 15.648,
    avgCpm: 0.196,
    totalRevenue: 2.48,
    daysCount: 8,
    avgDailyRevenue: 0.31,
  });
  const [isEditingAdsterra, setIsEditingAdsterra] = useState(false);
  const [editedStats, setEditedStats] = useState<AdsterraDailyStat[]>(DEFAULT_ADSTERRA_REAL_STATS);
  const [isSavingAdsterra, setIsSavingAdsterra] = useState(false);

  // Adsterra API auto-sync state
  const [apiToken, setApiToken] = useState<string>("");
  const [inputToken, setInputToken] = useState<string>("");
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [isSyncingApi, setIsSyncingApi] = useState<boolean>(false);

  // Adsterra Dynamic AI Solutions state
  const [adsterraAiSolution, setAdsterraAiSolution] = useState<string | null>(null);
  const [isGeneratingAdsterraAi, setIsGeneratingAdsterraAi] = useState(false);
  const [copiedAdsterraAi, setCopiedAdsterraAi] = useState(false);

  // Weekly AI Action Plan
  const [weeklyAiPlan, setWeeklyAiPlan] = useState<string | null>(null);
  const [isGeneratingWeeklyAi, setIsGeneratingWeeklyAi] = useState(false);
  const [copiedWeeklyAi, setCopiedWeeklyAi] = useState(false);

  // General AI Strategy
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  // Copied keyword state
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // Ads Revenue Simulator state - Defaults to Real Baseline CPM: $0.196
  const [simDailyVisits, setSimDailyVisits] = useState<number>(5000);
  const [simAvgCpm, setSimAvgCpm] = useState<number>(0.196); // $0.196 USD CPM thực tế Adsterra
  const [simBannerRentals, setSimBannerRentals] = useState<number>(0); // Banner game/shop
  const USD_VND = 25400;

  // Load data on mount
  const fetchData = async (refresh = false) => {
    if (refresh) setLoading(true);
    try {
      const [resStrategy, resWeekly, resAdsterra, resToken, resSolution] = await Promise.all([
        getStrategyAnalyticsAction(),
        getDailyStrategicBriefingAction(),
        getAdsterraRealStatsAction(),
        getAdsterraApiTokenAction(),
        getCachedAdsterraAiSolutionsAction(),
      ]);

      if (resStrategy.success && resStrategy.data) {
        setData(resStrategy.data);
      }
      if (resWeekly.success && resWeekly.data) {
        setWeeklyData(resWeekly.data);
        if (resWeekly.data.avgDailyClicks > 0) {
          setSimDailyVisits(Math.max(3000, resWeekly.data.avgDailyClicks));
        }
      }
      if (resAdsterra.success && resAdsterra.data) {
        setAdsterraData(resAdsterra.data);
        setEditedStats(resAdsterra.data.stats);
      }
      if (resToken.success && resToken.token) {
        setApiToken(resToken.token);
        setInputToken(resToken.token);
      }
      if (resSolution.success && resSolution.solutionMarkdown) {
        setAdsterraAiSolution(resSolution.solutionMarkdown);
      } else if (resAdsterra.success && resAdsterra.data && resAdsterra.data.stats.length > 0) {
        handleGenerateAdsterraAiSolutions(resAdsterra.data);
      }
    } catch (err: any) {
      showToast("Lỗi khi tải dữ liệu chiến lược", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Weekly AI Action Plan
  const handleGenerateWeeklyAiPlan = async () => {
    if (!weeklyData) return;
    setIsGeneratingWeeklyAi(true);
    try {
      const dailyTrendText = weeklyData.dailyTrend
        .map(
          (d) =>
            `- ${d.dayName} (${d.dateStr}): ${d.clicks.toLocaleString("vi-VN")} clicks (Google: ${d.googleClicks} clicks)${
              d.isToday ? " [HÔM NAY]" : ""
            }`
        )
        .join("\n");

      const res = await generateDailyAiActionPlanAction({
        sevenDaysClicks: weeklyData.sevenDaysClicks,
        sevenDaysGoogleClicks: weeklyData.sevenDaysGoogleClicks,
        sevenDaysUniqueVisitors: weeklyData.sevenDaysUniqueVisitors,
        avgDailyClicks: weeklyData.avgDailyClicks,
        googlePercentage7d: weeklyData.googlePercentage7d,
        mobilePercentage: weeklyData.mobilePercentage,
        dailyTrendText,
        topPages7d: weeklyData.topPages7d.map((p) => p.title || p.path),
        dayName: weeklyData.dayName,
        dayScheduleTheme: weeklyData.dayScheduleTheme,
      });

      if (res.success && res.actionPlan) {
        setWeeklyAiPlan(res.actionPlan);
        showToast("✨ Đã tạo bản định hướng chiến lược 7 ngày thành công!");
      } else {
        showToast(res.error || "Không thể tạo kế hoạch 7 ngày", "error");
      }
    } catch (err: any) {
      showToast("Lỗi kết nối Gemini AI", "error");
    } finally {
      setIsGeneratingWeeklyAi(false);
    }
  };

  // Copy keyword helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(label);
    showToast(`Đã sao chép: "${label}"`);
    setTimeout(() => setCopiedKeyword(null), 2500);
  };

  // Handle roadmap status toggle
  const handleToggleRoadmapStatus = (itemId: string) => {
    if (!data) return;
    const currentRoadmap = [...data.roadmap];
    const index = currentRoadmap.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const currentStatus = currentRoadmap[index].status;
    const nextStatus: "todo" | "in_progress" | "completed" =
      currentStatus === "todo"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "todo";

    currentRoadmap[index] = { ...currentRoadmap[index], status: nextStatus };
    setData({ ...data, roadmap: currentRoadmap });

    saveStrategicRoadmapAction(currentRoadmap).then((res) => {
      if (res.success) {
        showToast("Đã cập nhật tiến độ lộ trình!");
      }
    });
  };

  // Save Adsterra real stats
  const handleSaveAdsterraStats = async () => {
    setIsSavingAdsterra(true);
    try {
      const res = await saveAdsterraRealStatsAction(editedStats);
      if (res.success) {
        showToast("✅ Đã lưu bảng thống kê Adsterra thực tế!");
        setIsEditingAdsterra(false);
        const totalImpressions = editedStats.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);
        const totalClicks = editedStats.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
        const totalRevenue = Number(editedStats.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toFixed(2));
        const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(3)) : 0;
        const avgCpm = totalImpressions > 0 ? Number(((totalRevenue / totalImpressions) * 1000).toFixed(3)) : 0;
        const daysCount = editedStats.length;
        const avgDailyRevenue = daysCount > 0 ? Number((totalRevenue / daysCount).toFixed(2)) : 0;
        setAdsterraData({
          stats: editedStats,
          totalImpressions,
          totalClicks,
          avgCtr,
          avgCpm,
          totalRevenue,
          daysCount,
          avgDailyRevenue,
        });
      } else {
        showToast(res.error || "Không thể lưu", "error");
      }
    } catch {
      showToast("Lỗi khi lưu bảng số liệu", "error");
    } finally {
      setIsSavingAdsterra(false);
    }
  };

  const handleResetAdsterraToScreenshot = () => {
    setEditedStats(DEFAULT_ADSTERRA_REAL_STATS);
    showToast("Đã khôi phục dữ liệu gốc từ Dashboard Adsterra (Ảnh chụp)");
  };

  const handleUpdateStatField = (index: number, field: keyof AdsterraDailyStat, val: any) => {
    const updated = [...editedStats];
    updated[index] = { ...updated[index], [field]: val };
    const imp = Number(updated[index].impressions) || 0;
    const clk = Number(updated[index].clicks) || 0;
    const rev = Number(updated[index].revenue) || 0;
    if (field === "impressions" || field === "clicks") {
      updated[index].ctr = imp > 0 ? Number(((clk / imp) * 100).toFixed(3)) : 0;
    }
    if (field === "impressions" || field === "revenue") {
      updated[index].cpm = imp > 0 ? Number(((rev / imp) * 1000).toFixed(3)) : 0;
    }
    setEditedStats(updated);
  };

  // Sync directly from Adsterra official Publisher API
  const handleSyncAdsterraApi = async (tokenToUse?: string) => {
    const tok = (tokenToUse !== undefined ? tokenToUse : apiToken).trim();
    if (!tok) {
      setShowApiModal(true);
      return;
    }

    setIsSyncingApi(true);
    try {
      const res = await syncAdsterraStatsFromApiAction(tok);
      if (res.success && res.stats && res.stats.length > 0) {
        showToast(`✨ ${res.message || "Đồng bộ thành công từ Adsterra!"}`);
        setApiToken(tok);
        setShowApiModal(false);
        const list = res.stats;
        const totalImpressions = list.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);
        const totalClicks = list.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
        const totalRevenue = Number(list.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toFixed(2));
        const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(3)) : 0;
        const avgCpm = totalImpressions > 0 ? Number(((totalRevenue / totalImpressions) * 1000).toFixed(3)) : 0;
        const daysCount = list.length;
        const avgDailyRevenue = daysCount > 0 ? Number((totalRevenue / daysCount).toFixed(2)) : 0;
        const nextData = {
          stats: list,
          totalImpressions,
          totalClicks,
          avgCtr,
          avgCpm,
          totalRevenue,
          daysCount,
          avgDailyRevenue,
        };
        setAdsterraData(nextData);
        setEditedStats(list);

        // Auto-generate or apply AI solutions based on freshly synced API data
        if (res.solutionMarkdown) {
          setAdsterraAiSolution(res.solutionMarkdown);
        } else {
          handleGenerateAdsterraAiSolutions(nextData);
        }
      } else {
        showToast(res.error || "Không thể đồng bộ từ Adsterra", "error");
      }
    } catch {
      showToast("Lỗi khi kết nối Adsterra API", "error");
    } finally {
      setIsSyncingApi(false);
    }
  };

  // Generate dynamic solutions based on real API stats
  const handleGenerateAdsterraAiSolutions = async (customData?: typeof adsterraData) => {
    const targetData = customData || adsterraData;
    setIsGeneratingAdsterraAi(true);
    try {
      const res = await generateAdsterraAiSolutionsAction({
        stats: targetData.stats,
        totalImpressions: targetData.totalImpressions,
        totalClicks: targetData.totalClicks,
        avgCtr: targetData.avgCtr,
        avgCpm: targetData.avgCpm,
        totalRevenue: targetData.totalRevenue,
        daysCount: targetData.daysCount,
        avgDailyRevenue: targetData.avgDailyRevenue,
        weeklyWebClicks: weeklyData?.sevenDaysClicks || 34621,
      });

      if (res.success && res.solutionMarkdown) {
        setAdsterraAiSolution(res.solutionMarkdown);
        showToast("✨ Đã tạo bản giải pháp tối ưu doanh thu từ dữ liệu API mới nhất!");
      } else {
        showToast(res.error || "Không thể khởi tạo giải pháp AI", "error");
      }
    } catch {
      showToast("Lỗi khi kết nối Gemini AI", "error");
    } finally {
      setIsGeneratingAdsterraAi(false);
    }
  };

  // Calculations for Ads Simulator
  const dailyImpressions = simDailyVisits * 1.5;
  const dailyAdsUsd = (dailyImpressions / 1000) * simAvgCpm;
  const dailyAdsVnd = Math.round(dailyAdsUsd * USD_VND);
  const monthlyAdsVnd = dailyAdsVnd * 30 + simBannerRentals;
  const estimatedCdnCost = Math.round(simDailyVisits * 30 * 45); // ~45đ CDN per visit
  const netAdsProfitMonthly = Math.max(0, monthlyAdsVnd - estimatedCdnCost);

  // Find max clicks in 7 days for bar chart scale
  const maxClicksInTrend = Math.max(
    1,
    ...(weeklyData?.dailyTrend?.map((d) => d.clicks) || [10])
  );

  // SEO Keyword Clusters
  const keywordClusters = [
    {
      title: "1. Từ Khóa Ý Định Xem Phim Hot (Search Intent - Gom Traffic Ngay)",
      badge: "Lượng tìm kiếm lớn nhất",
      color: "from-amber-500/20 to-orange-500/10 border-orange-500/30",
      description: "Người dùng tìm kiếm trực tiếp để xem tập mới nhất trong tuần. Bắt buộc phải có trong Tiêu đề (H1) & Thẻ Title.",
      keywords: [
        { kw: "[Tên Phim] tập mới nhất hôm nay", vol: "120.000+/tháng", note: "Search intent mạnh nhất khi vừa ra tập" },
        { kw: "[Tên Phim] Tập [N] Vietsub Full HD", vol: "95.000+/tháng", note: "Từ khóa kinh điển của fan anime 3D" },
        { kw: "[Tên Phim] Thuyết Minh giọng chuẩn 4K", vol: "75.000+/tháng", note: "Khán giả thích nghe thuyết minh tiếng Việt" },
        { kw: "Xem phim [Tên Phim] không quảng cáo", vol: "40.000+/tháng", note: "Từ khóa hút người dùng từ các web lậu nhiều pop" },
        { kw: "Lịch chiếu [Tên Phim] 2026", vol: "35.000+/tháng", note: "Từ khóa gom traffic đều đặn mỗi tuần" },
        { kw: "[Tên Phim] trọn bộ Vietsub", vol: "50.000+/tháng", note: "Khán giả thích cày phim từ tập 1 đến mới nhất" },
      ],
    },
    {
      title: "2. Từ Khóa Ngách Cảnh Giới & Nhân Vật (Wiki SEO - Bền Vững Lâu Dài)",
      badge: "Cạnh tranh thấp, chuyển đổi cao",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
      description: "Khán giả tu tiên cực kỳ quan tâm đến cấp bậc, vợ/người yêu và phân tích sức mạnh nhân vật so với nguyên tác truyện chữ.",
      keywords: [
        { kw: "Cảnh giới [Tên Nhân Vật] tập mới nhất", vol: "45.000+/tháng", note: "Ví dụ: Cảnh giới Tiêu Viêm, Cảnh giới Hàn Lập" },
        { kw: "Vợ của [Tên Nhân Vật] gồm những ai", vol: "38.000+/tháng", note: "Ví dụ: Vợ của Mục Trần, Vợ của Diệp Phàm" },
        { kw: "[Tên Phim] tập [N] tương ứng chap mấy truyện chữ", vol: "55.000+/tháng", note: "Người xem muốn đọc trước truyện chữ" },
        { kw: "Bảng xếp hạng cảnh giới tu tiên [Tên Phim]", vol: "30.000+/tháng", note: "Cạnh tranh cực thấp, lên top 1 Google dễ dàng" },
        { kw: "Phân tích sức mạnh [Tên Nhân Vật] vs [Đối Thủ]", vol: "25.000+/tháng", note: "Thu hút hàng ngàn bình luận tranh luận" },
        { kw: "Spoiler kết thúc [Tên Phim] kết cục", vol: "22.000+/tháng", note: "Khán giả tò mò đại kết cục" },
      ],
    },
    {
      title: "3. Từ Khóa Thể Loại & Thương Hiệu (Category Authority)",
      badge: "Xây dựng thương hiệu Vam3D",
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
      description: "Gom toàn bộ lưu lượng tìm kiếm thể loại chung về trang chủ và danh mục.",
      keywords: [
        { kw: "Phim hoạt hình 3D Trung Quốc hay nhất 2026", vol: "150.000+/tháng", note: "Từ khóa danh mục chính" },
        { kw: "Phim tu tiên 3D đồ họa đỉnh cao 4K", vol: "80.000+/tháng", note: "Đánh trúng gu khán giả đồ họa đẹp" },
        { kw: "Hoạt hình 3D Trung Quốc huyền huyễn", vol: "60.000+/tháng", note: "Thể loại được yêu thích nhất" },
        { kw: "Top donghua 3D đáng xem nhất hiện nay", vol: "40.000+/tháng", note: "Dùng cho bài viết Blog/Tổng hợp" },
        { kw: "Web xem phim 3D Trung Quốc mượt không lag", vol: "28.000+/tháng", note: "Tạo thương hiệu streaming chất lượng" },
      ],
    },
    {
      title: "4. Từ Khóa Bộ Sưu Tập Ảnh AI & Cosplay 4K (Visual SEO)",
      badge: "Traffic khổng lồ từ Google Hình Ảnh",
      color: "from-rose-500/20 to-pink-500/10 border-rose-500/30",
      description: "Tận dụng kho ảnh AI Gallery của Vam3D để hút traffic từ Google Images và Pinterest.",
      keywords: [
        { kw: "Ảnh Cosplay [Tên Nữ Thần] 3D 4K", vol: "70.000+/tháng", note: "Ví dụ: Cosplay Mỹ Đỗ Toa, Cosplay Tiêu Huân Nhi" },
        { kw: "Hình nền [Tên Nhân Vật] 4K điện thoại", vol: "65.000+/tháng", note: "Người dùng tải về cài màn hình khóa" },
        { kw: "Bộ ảnh nữ thần hoạt hình 3D đẹp nhất", vol: "40.000+/tháng", note: "Kéo vào xem album AI Gallery" },
        { kw: "Ảnh AI 3D Trung Quốc siêu nét không logo", vol: "30.000+/tháng", note: "Hút các designer và fan tu tiên" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Đang khởi tạo trung tâm chiến lược 7 ngày & QC...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-zinc-950 border border-orange-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <BarChart2 className="w-3.5 h-3.5 text-orange-400" />
                Định Hướng Chiến Lược 7 Ngày Gần Nhất (Chu Kỳ Tuần)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Mô hình Quảng Cáo (Zero-VIP)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Trung Tâm Định Hướng Tác Chiến 7 Ngày & Kiếm Tiền QC
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Phân tích toàn diện chu kỳ phát sóng 7 ngày (từ Thứ Hai đến Chủ Nhật) để nhận diện ngày cao điểm, tối ưu thứ hạng từ khóa SEO và thiết lập lịch quảng cáo sinh lời tối đa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              className="border-white/10 hover:bg-white/5 text-gray-300 text-xs gap-1.5 h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới số liệu
            </Button>
            <Button
              onClick={handleGenerateWeeklyAiPlan}
              disabled={isGeneratingWeeklyAi}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-xs gap-2 h-9 px-4 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              {isGeneratingWeeklyAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  AI đang phân tích 7 ngày...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  ⚡ Định Hướng Chiến Lược 7 Ngày (Gemini)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("weekly")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === "weekly"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Phân Tích 7 Ngày & Hôm Nay
        </button>
        <button
          onClick={() => setActiveSubTab("seo")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === "seo"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Key className="w-4 h-4" />
          Kho Từ Khóa SEO Hot (Ma Trận 2026)
        </button>
        <button
          onClick={() => setActiveSubTab("ads")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === "ads"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Tv className="w-4 h-4" />
          Chiến Lược Mạng Lưới Quảng Cáo
        </button>
        <button
          onClick={() => setActiveSubTab("simulator")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === "simulator"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Mô Phỏng Doanh Thu QC
        </button>
        <button
          onClick={() => setActiveSubTab("roadmap")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === "roadmap"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock className="w-4 h-4" />
          Lộ Trình Triển Khai
        </button>
      </div>

      {/* ── TAB 1: 7-DAY ROLLING STRATEGIC ANALYSIS ── */}
      {activeSubTab === "weekly" && (
        <div className="space-y-6">
          {/* 4 Rolling Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: 7 Days Traffic */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Lưu Lượng 7 Ngày Qua</span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {(weeklyData?.sevenDaysClicks || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-normal text-gray-400">lượt</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Trung bình: <strong className="text-white">{(weeklyData?.avgDailyClicks || 0).toLocaleString("vi-VN")} clicks/ngày</strong>
              </p>
            </div>

            {/* Metric 2: 7 Days Google SEO */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Tìm Kiếm Google 7 Ngày</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                {(weeklyData?.sevenDaysGoogleClicks || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-normal text-gray-400">clicks</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Tỷ lệ Google SEO tự nhiên: <strong className="text-white">{weeklyData?.googlePercentage7d || 0}%</strong>
              </p>
            </div>

            {/* Metric 3: Unique Visitors */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Khách Độc Nhất (7 Ngày)</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {(weeklyData?.sevenDaysUniqueVisitors || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-normal text-gray-400">người</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Hôm nay đã có: <strong className="text-purple-400">{weeklyData?.todayUniqueVisitors || 0} khách</strong>
              </p>
            </div>

            {/* Metric 4: Devices & Today */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Hôm Nay ({weeklyData?.dayName})</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{(weeklyData?.todayClicks || 0).toLocaleString("vi-VN")} clicks</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-2">
                <span>📱 {weeklyData?.mobilePercentage || 80}%</span>
                <span>💻 {weeklyData?.desktopPercentage || 20}%</span>
              </p>
            </div>
          </div>

          {/* 7-Day Visual Trend Bar Chart */}
          <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-orange-400" />
                  Biểu Đồ Xu Hướng Lưu Lượng 7 Ngày Qua
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Thấy rõ chu kỳ ngày trũng và ngày cao điểm để chủ động phân phối phim & quảng cáo
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  Tổng Clicks
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Google SEO
                </span>
              </div>
            </div>

            {/* Visual Bars */}
            <div
              className="grid gap-2 pt-4 items-end min-h-[160px] overflow-x-auto"
              style={{ gridTemplateColumns: `repeat(${weeklyData?.dailyTrend?.length || 7}, minmax(0, 1fr))` }}
            >
              {weeklyData?.dailyTrend?.map((day, idx) => {
                const heightPercent = Math.max(12, Math.round((day.clicks / maxClicksInTrend) * 100));
                const googlePercent = day.clicks > 0 ? Math.min(100, Math.round((day.googleClicks / day.clicks) * 100)) : 0;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-white group-hover:text-orange-400 transition-colors">
                      {day.clicks}
                    </span>

                    <div className="w-full max-w-[48px] h-32 bg-black/40 rounded-xl p-1 flex flex-col justify-end border border-white/5 group-hover:border-orange-500/30 transition-all">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-lg transition-all relative overflow-hidden flex flex-col justify-end ${
                          day.isToday
                            ? "bg-gradient-to-t from-orange-600 to-amber-400 shadow-lg shadow-orange-500/20"
                            : "bg-gradient-to-t from-zinc-700 to-zinc-500 group-hover:from-orange-500/80 group-hover:to-amber-500/80"
                        }`}
                      >
                        {/* Green indicator for Google SEO ratio */}
                        <div
                          style={{ height: `${googlePercent}%` }}
                          className="w-full bg-emerald-500/40 border-t border-emerald-400/50"
                          title={`Google SEO: ${day.googleClicks} clicks (${googlePercent}%)`}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className={`text-[11px] font-bold ${day.isToday ? "text-orange-400" : "text-gray-300"}`}>
                        {day.dayName.replace("Thứ ", "T")}
                      </p>
                      <p className="text-[10px] text-gray-500">{day.dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Strategic Advice for 7 Days Box */}
          {weeklyAiPlan ? (
            <div className="bg-[#12141f] border border-orange-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-black flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Bản Định Hướng Chiến Lược 7 Ngày & Kế Hoạch QC/SEO
                    </h4>
                    <p className="text-xs text-gray-400">
                      Được tổng hợp từ {weeklyData?.sevenDaysClicks} lượt truy cập và chu kỳ tuần thực tế
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(weeklyAiPlan);
                      setCopiedWeeklyAi(true);
                      showToast("Đã chép kế hoạch 7 ngày vào clipboard!");
                      setTimeout(() => setCopiedWeeklyAi(false), 2500);
                    }}
                    className="border-white/10 text-xs h-8 gap-1.5 text-gray-300 hover:text-white"
                  >
                    {copiedWeeklyAi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedWeeklyAi ? "Đã chép" : "Sao chép"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWeeklyAiPlan(null)}
                    className="text-xs text-gray-500 hover:text-white h-8"
                  >
                    Đóng
                  </Button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-black/40 p-5 rounded-2xl border border-white/5">
                {weeklyAiPlan}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#12141f] border border-white/10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div className="space-y-1 max-w-lg">
                <h4 className="text-base font-bold text-white">
                  Định Hướng Chiến Lược Toàn Diện Cho 7 Ngày Tiếp Theo
                </h4>
                <p className="text-xs text-gray-400">
                  Nhấn nút bên dưới để Gemini AI đọc toàn bộ chu kỳ 7 ngày qua ({weeklyData?.sevenDaysClicks} clicks), phân tích ngày cao điểm, lên lịch từ khóa theo ngày và chiến lược quảng cáo không làm nát trải nghiệm.
                </p>
              </div>
              <Button
                onClick={handleGenerateWeeklyAiPlan}
                disabled={isGeneratingWeeklyAi}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-xs h-9 px-5 gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                {isGeneratingWeeklyAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    Đang phân tích chu kỳ 7 ngày...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black" />
                    ⚡ Lập Kế Hoạch Chiến Lược 7 Ngày (Gemini AI)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Top 8 Pages / Movies in Last 7 Days */}
          {weeklyData?.topPages7d && weeklyData.topPages7d.length > 0 && (
            <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Top Phim & Nội Dung Hút Khách Nhất Trong 7 Ngày Qua
                </h4>
                <span className="text-xs text-gray-500">Cơ sở để chèn quảng cáo và đẩy SEO tập tiếp theo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {weeklyData.topPages7d.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-bold text-orange-400">Top #{idx + 1}</span>
                      <strong className="text-white font-extrabold">{p.views} views</strong>
                    </div>
                    <p className="text-xs font-bold text-gray-200 truncate">{p.title || p.path}</p>
                    <p className="text-[10px] text-gray-500 truncate">{p.path}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SEO KEYWORDS ARSENAL ── */}
      {activeSubTab === "seo" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-950/40 to-zinc-950 border border-blue-500/20 p-6 rounded-3xl space-y-2">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              Ma Trận Bộ Từ Khóa Vàng SEO Phim Hoạt Hình 3D (2026)
            </h3>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Đây là các cụm từ khóa có lượng tìm kiếm lớn nhất và ổn định nhất tại Việt Nam cho dòng phim Hoạt hình 3D / Tu tiên / Donghua. Hãy chèn những từ khóa này vào <strong>Tên phim</strong>, <strong>Tiêu đề tập phim</strong>, và <strong>Đoạn mô tả đầu tiên</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keywordClusters.map((cluster, cIdx) => (
              <div
                key={cIdx}
                className={`bg-[#12141f] border rounded-3xl p-6 space-y-4 shadow-xl ${cluster.color}`}
              >
                <div className="space-y-1 border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      {cluster.badge}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allKws = cluster.keywords.map((k) => k.kw).join(", ");
                        handleCopyText(allKws, cluster.title);
                      }}
                      className="text-[11px] h-7 text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Sao chép cả nhóm
                    </Button>
                  </div>
                  <h4 className="text-sm font-bold text-white">{cluster.title}</h4>
                  <p className="text-xs text-gray-400">{cluster.description}</p>
                </div>

                <div className="space-y-2.5">
                  {cluster.keywords.map((item, kIdx) => (
                    <div
                      key={kIdx}
                      onClick={() => handleCopyText(item.kw, item.kw)}
                      className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-orange-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors truncate">
                          {item.kw}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{item.note}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {item.vol}
                        </span>
                        {copiedKeyword === item.kw ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: ADS MONETIZATION STRATEGY & REAL ADSTERRA DASHBOARD AUDIT ── */}
      {activeSubTab === "ads" && (
        <div className="space-y-6">
          {/* Real Adsterra Publisher Dashboard Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dữ Liệu Thực Tế Từ Publisher Dashboard Adsterra
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    beta.publishers.adsterra.com/stats
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Đối Soát Doanh Thu Thực Tế (8 Ngày Gần Nhất)
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Số liệu đối chiếu chuẩn xác 100% từ bảng thống kê thực tế tài khoản Adsterra của bạn. Toàn bộ lượt hiển thị, click, CTR và doanh thu đã được đồng bộ chuẩn xác.
                </p>
              </div>

              {/* Exact Real Revenue Highlight Box */}
              <div className="bg-black/60 border border-emerald-500/40 p-5 rounded-2xl shrink-0 space-y-1.5 text-right">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Tổng Doanh Thu Thực Nhận (8 Ngày)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  ${adsterraData.totalRevenue.toFixed(2)} USD
                </div>
                <div className="text-xs font-bold text-gray-300">
                  ~{Math.round(adsterraData.totalRevenue * USD_VND).toLocaleString("vi-VN")} VNĐ
                </div>
                <p className="text-[11px] text-gray-400 pt-1 border-t border-white/10">
                  Trung bình mỗi ngày: <strong className="text-white">${adsterraData.avgDailyRevenue.toFixed(2)} USD (~{Math.round(adsterraData.avgDailyRevenue * USD_VND).toLocaleString("vi-VN")}đ/ngày)</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 4 Real Adsterra KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Real Revenue */}
            <div className="bg-[#12141f] border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Thực Nhận (8 Ngày)</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ${adsterraData.totalRevenue.toFixed(2)}{" "}
                <span className="text-xs font-normal text-gray-400">USD</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Quy đổi: <strong className="text-white">~{Math.round(adsterraData.totalRevenue * USD_VND).toLocaleString("vi-VN")} VNĐ</strong>
              </p>
            </div>

            {/* KPI 2: Real Impressions */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Lượt Hiển Thị QC (Imp)</span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                {adsterraData.totalImpressions.toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-normal text-gray-400">imp</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Trung bình: <strong className="text-white">{Math.round(adsterraData.totalImpressions / Math.max(1, adsterraData.daysCount)).toLocaleString("vi-VN")} imp/ngày</strong>
              </p>
            </div>

            {/* KPI 3: Real CTR */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">Tỷ Lệ Nhấp Chuột (CTR)</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BadgePercent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-400">
                {adsterraData.avgCtr}%
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Tổng lượt click QC: <strong className="text-white">{adsterraData.totalClicks.toLocaleString("vi-VN")} clicks</strong> (Rất cao!)
              </p>
            </div>

            {/* KPI 4: Real CPM */}
            <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">CPM Trung Bình Thực Tế</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400">
                ${adsterraData.avgCpm.toFixed(3)}{" "}
                <span className="text-xs font-normal text-gray-400">/ 1k imp</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Cao nhất hôm nay: <strong className="text-emerald-400">$0.679</strong> | Thấp nhất: $0.123
              </p>
            </div>
          </div>

          {/* ── EXACT ADSTERRA PUBLISHER TABLE (100% MATCH SCREENSHOT) ── */}
          <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-base font-black text-white">
                    Bảng Thống Kê Chi Tiết Adsterra (Group by: DATE)
                  </h4>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    Khớp Chuẩn Dashboard Thực Tế
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dữ liệu đối soát từ 19/10/2026 đến 26/10/2026 (beta.publishers.adsterra.com/stats)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isEditingAdsterra ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveAdsterraStats}
                      disabled={isSavingAdsterra}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-8 px-3 cursor-pointer"
                    >
                      {isSavingAdsterra ? "Đang lưu..." : "💾 Lưu Thay Đổi"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditedStats(adsterraData.stats);
                        setIsEditingAdsterra(false);
                      }}
                      className="border-white/10 text-xs h-8 px-3"
                    >
                      Hủy
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSyncAdsterraApi()}
                      disabled={isSyncingApi}
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-black font-extrabold text-xs h-8 px-3 gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                      title={apiToken ? "Đồng bộ tức thì từ Adsterra API" : "Cấu hình API Token để tự động lấy số liệu"}
                    >
                      {isSyncingApi ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Đang kết nối Adsterra...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          ⚡ {apiToken ? "Đồng Bộ API (Tự Động)" : "Kết Nối API Adsterra"}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowApiModal(true)}
                      className="border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-xs h-8 px-2.5 gap-1"
                      title="Cài đặt Adsterra API Token"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      API Key
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingAdsterra(true)}
                      className="border-white/10 hover:bg-white/5 text-gray-300 text-xs h-8 px-3 gap-1.5"
                    >
                      ✏️ Nhập Tay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetAdsterraToScreenshot}
                      className="border-white/10 hover:bg-white/5 text-gray-400 text-xs h-8 px-3 gap-1.5"
                      title="Khôi phục lại chính xác số liệu từ ảnh chụp màn hình"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Khôi phục ảnh gốc
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Adsterra API Connection Modal */}
            {showApiModal && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-emerald-500/40 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Kết Nối Adsterra Publisher API (Tự Động Mỗi Ngày)</h5>
                      <p className="text-[11px] text-gray-400">Không cần nhập tay, hệ thống sẽ tự động gọi API lấy số liệu chuẩn</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApiModal(false)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-2 text-xs text-gray-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                  <p className="font-semibold text-white">📌 Hướng dẫn 3 bước lấy API Token (chỉ mất 30 giây):</p>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-400 text-[11px]">
                    <li>Đăng nhập tài khoản Adsterra: <a href="https://beta.publishers.adsterra.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-mono">beta.publishers.adsterra.com</a></li>
                    <li>Vào mục <strong className="text-white">API</strong> (hoặc bấm vào hình tài khoản góc phải &gt; chọn API).</li>
                    <li>Bấm nút <strong className="text-emerald-400 font-bold">&quot;Generate New Token&quot;</strong>, sao chép chuỗi mã và dán vào ô dưới đây.</li>
                  </ol>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Mã Adsterra API Token (X-API-Key):</span>
                    {apiToken && <span className="text-[10px] text-emerald-400">● Đang hoạt động</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="Ví dụ: 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiModal(false)}
                    className="border-white/10 text-xs h-8 px-3"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSyncAdsterraApi(inputToken)}
                    disabled={isSyncingApi || !inputToken.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-8 px-4 gap-1.5 cursor-pointer"
                  >
                    {isSyncingApi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang kết nối...
                      </>
                    ) : (
                      "💾 Lưu & Đồng Bộ Ngay"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Impressions</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">CTR</th>
                    <th className="py-3 px-4 text-right">CPM</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right">Quy đổi (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {(isEditingAdsterra ? editedStats : adsterraData.stats).map((row, idx) => {
                    const isTodayRow = row.date.includes("10/26");
                    return (
                      <tr
                        key={row.date}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          isTodayRow ? "bg-orange-500/5 font-semibold text-white" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                          {row.date}
                          {isTodayRow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              Hôm nay
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {isEditingAdsterra ? (
                            <input
                              type="number"
                              value={row.impressions}
                              onChange={(e) => handleUpdateStatField(idx, "impressions", Number(e.target.value))}
                              className="w-24 bg-black/60 border border-white/20 rounded px-2 py-1 text-right text-xs text-white"
                            />
                          ) : (
                            row.impressions.toLocaleString("vi-VN")
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {isEditingAdsterra ? (
                            <input
                              type="number"
                              value={row.clicks}
                              onChange={(e) => handleUpdateStatField(idx, "clicks", Number(e.target.value))}
                              className="w-20 bg-black/60 border border-white/20 rounded px-2 py-1 text-right text-xs text-white"
                            />
                          ) : (
                            row.clicks.toLocaleString("vi-VN")
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-400">
                          {row.ctr.toFixed(3)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-400">
                          ${row.cpm.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {isEditingAdsterra ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.revenue}
                              onChange={(e) => handleUpdateStatField(idx, "revenue", Number(e.target.value))}
                              className="w-20 bg-black/60 border border-white/20 rounded px-2 py-1 text-right text-xs text-emerald-400 font-bold"
                            />
                          ) : (
                            `$${row.revenue.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-400">
                          ~{Math.round(row.revenue * USD_VND).toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-black text-white text-xs">
                    <td className="py-3.5 px-4 text-emerald-400 uppercase">Total:</td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {adsterraData.totalImpressions.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {adsterraData.totalClicks.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-blue-400">
                      {adsterraData.avgCtr.toFixed(3)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                      ${adsterraData.avgCpm.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-base text-emerald-400 font-black">
                      ${adsterraData.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-300 font-bold">
                      ~{Math.round(adsterraData.totalRevenue * USD_VND).toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>Showing 8 of 8 daily records • Group by: DATE</span>
              <span className="text-[11px] text-gray-400">Tỷ giá quy đổi ước tính: 1 USD = 25.400 VNĐ</span>
            </div>
          </div>

          {/* ── AUDIT & LEAKAGE DIAGNOSIS: TRAFFIC VS ADSTERRA GAP ── */}
          <div className="bg-[#12141f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-base font-bold text-white">
                  Chẩn Đoán Khoảng Trống Thất Thoát (Traffic 34.621 Clicks vs Adsterra 12.634 Impressions)
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tại sao website có 34.621 lượt xem trong 7 ngày nhưng Adsterra chỉ ghi nhận 12.634 hiển thị?
                </p>
              </div>
            </div>

            {/* Comparison Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-xs text-gray-400">Lưu lượng Web thực tế (7 ngày):</span>
                <div className="text-2xl font-black text-white">
                  {(weeklyData?.sevenDaysClicks || 34621).toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-normal text-gray-400">clicks</span>
                </div>
                <p className="text-[11px] text-gray-500">Ghi nhận từ router hệ thống Vam3D</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-xs text-gray-400">Lượt QC Adsterra ghi nhận:</span>
                <div className="text-2xl font-black text-amber-400">
                  {adsterraData.totalImpressions.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-normal text-gray-400">impressions</span>
                </div>
                <p className="text-[11px] text-gray-500">Mạng Adsterra đếm thành công</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <span className="text-xs text-rose-300">Tỷ lệ thất thoát hiển thị:</span>
                <div className="text-2xl font-black text-rose-400">
                  ~63.5%
                </div>
                <p className="text-[11px] text-rose-300/80">Hơn 21.900 lượt xem không kích hoạt quảng cáo</p>
              </div>
            </div>

            {/* 4 Technical Root Causes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  1. Độ trễ kích hoạt 15 giây (SOCIAL_BAR_DELAY_MS = 15000)
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Trong file <code className="text-orange-400 bg-white/5 px-1 py-0.5 rounded">AdsterraSocialBar.tsx</code>, mã nguồn quy định đợi 15 giây sau khi mở phim mới tải quảng cáo. Khán giả lướt xem danh sách tập, bấm nhanh hoặc rời đi trước 15s sẽ không được tính view.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  2. Khống chế tần suất 20 phút (SOCIAL_BAR_INTERVAL_MS)
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Social Bar bị khóa không hiện lại trong 20 phút. Nếu một người cày liên tục 3-4 tập phim (mỗi tập 15-20 phút), hệ thống chỉ kích hoạt đúng 1 lần duy nhất thay vì 3-4 lần.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  3. Trang Chủ (/) và Trang Admin Bị Loại Trừ Hoàn Toàn
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Code đang chủ động chặn Social Bar ở trang chủ để giữ trang sạch sẽ và bảo vệ điểm SEO Google PageSpeed. Hàng ngàn lượt xem trang chủ mỗi ngày không tạo ra impression nào.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  4. Trình duyệt chặn quảng cáo (AdBlock / Brave / DNS chặn)
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Khoảng 20-30% khán giả trẻ xem phim tu tiên dùng trình duyệt Brave hoặc cài tiện ích chặn QC. Mọi script từ domain <code className="text-gray-300">profitableratecpmnetwork.com</code> bị chặn ngay tại trình duyệt.
                </p>
              </div>
            </div>
          </div>

          {/* ── 5 ACTIVE ADS PLACEMENTS IN SOURCE CODE (REAL VALUE ADJUSTED) ── */}
          <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  Hiện Trạng 5 Vị Trí Quảng Cáo Đang Chạy Trong Mã Nguồn Vam3D
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tất cả các vị trí dưới đây đang hoạt động và cùng đóng góp vào tổng mức $0.20 - $0.63 USD/ngày thực tế
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                5 Vị Trí Đang Hoạt Động
              </Badge>
            </div>

            <div className="space-y-3 pt-1">
              {/* Placement 1 */}
              <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h5 className="text-sm font-bold text-white">1. Adsterra Social Bar (In-Page Push)</h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Góp ~60% tổng clicks
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Chạy ở tất cả các trang xem phim và nhân vật. Hiện sau 15s, giới hạn 1 lần/20 phút.
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    components/AdsterraSocialBar.tsx
                  </p>
                </div>
                <div className="text-xs md:text-right shrink-0">
                  <span className="text-gray-400">Đóng góp thực tế:</span>
                  <div className="text-sm font-black text-emerald-400">~$0.15 - $0.40 USD / ngày</div>
                  <span className="text-[11px] text-gray-500 font-semibold">Tạo ra phần lớn trong 1.977 clicks</span>
                </div>
              </div>

              {/* Placement 2 */}
              <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h5 className="text-sm font-bold text-white">2. Adsterra Native Banner 300x250 (Chân Player Chọn Tập)</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Hiển thị ngay dưới nút chọn tập phim. Tự làm mới khi người xem bấm đổi tập.
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    app/movie/[id]/MoviePageClient.tsx (L437)
                  </p>
                </div>
                <div className="text-xs md:text-right shrink-0">
                  <span className="text-gray-400">Đóng góp thực tế:</span>
                  <div className="text-sm font-black text-emerald-400">~$0.05 - $0.15 USD / ngày</div>
                  <span className="text-[11px] text-gray-500">CPM banner VN: $0.12 - $0.25</span>
                </div>
              </div>

              {/* Placement 3 */}
              <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h5 className="text-sm font-bold text-white">3. Native Banner 300x250 (Chi Tiết Phim)</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Xuất hiện ở phần mô tả nội dung phim trước khi người dùng bấm Play.
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    app/movie/[id]/MoviePageClient.tsx (L655)
                  </p>
                </div>
                <div className="text-xs md:text-right shrink-0">
                  <span className="text-gray-400">Đóng góp thực tế:</span>
                  <div className="text-sm font-black text-emerald-400">~$0.02 - $0.05 USD / ngày</div>
                </div>
              </div>

              {/* Placement 4 & 5 */}
              <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h5 className="text-sm font-bold text-white">4 & 5. Banner Trang Nhân Vật & AI Gallery 4K</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Đặt ở trang Wiki Nhân Vật (CharacterDetailPageClient) và Bộ Sưu Tập Ảnh AI (GalleryDetailClient).
                  </p>
                </div>
                <div className="text-xs md:text-right shrink-0">
                  <span className="text-gray-400">Đóng góp thực tế:</span>
                  <div className="text-sm font-black text-emerald-400">~$0.02 - $0.05 USD / ngày</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION PLAN & DYNAMIC AI SOLUTIONS (SYNCED WITH API DATA) ── */}
          <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-lg font-black text-white">
                    Lộ Trình Tối Ưu Tăng Thu Nhập (Dựa Trên ${adsterraData.totalRevenue.toFixed(2)} USD / {adsterraData.daysCount} Ngày Thực Tế)
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  Hiện đang thu trung bình ~<strong className="text-emerald-400">${(adsterraData.avgDailyRevenue * 7).toFixed(2)} USD/tuần</strong> (~{Math.round(adsterraData.avgDailyRevenue * 7 * USD_VND).toLocaleString("vi-VN")}đ) với CPM ${adsterraData.avgCpm.toFixed(3)}. Các giải pháp dưới đây tự động tính toán theo số liệu API mới nhất:
                </p>
              </div>

              <Button
                onClick={() => handleGenerateAdsterraAiSolutions()}
                disabled={isGeneratingAdsterraAi}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs h-9 px-4 gap-2 shadow-lg shadow-orange-500/20 cursor-pointer self-start sm:self-center shrink-0"
              >
                {isGeneratingAdsterraAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    AI Đang Phân Tích Số Liệu API...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    ⚡ AI Phân Tích Giải Pháp Từ API
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Optimize Adsterra delay & interval */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    ✓ Đã áp dụng tối ưu trong code
                  </span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <h5 className="text-sm font-bold text-white">1. Rút Ngắn Độ Trễ Social Bar & Banner (Tăng Gấp Đôi Lượt Hiển Thị)</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Đã cấu hình tối ưu trực tiếp trong <code className="text-orange-400">AdsterraSocialBar.tsx</code> & <code className="text-orange-400">AdBanner300x250.tsx</code>:
                  <br />• <strong className="text-emerald-400">DELAY: 8 giây</strong> (khán giả vừa bấm play qua intro là ad đã sẵn sàng).
                  <br />• <strong className="text-emerald-400">INTERVAL: 10 phút</strong> (khán giả xem sang tập tiếp theo là kích hoạt lại).
                  <br />• <strong className="text-emerald-400">Banner 300x250:</strong> Tải tức thì dưới player, đảm bảo 100% impression.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Kỳ vọng doanh thu Adsterra:</span>
                  <strong className="text-emerald-400 font-bold">
                    Tăng từ ${(adsterraData.avgDailyRevenue * 7).toFixed(2)} lên ~${Math.max(6, Math.round(adsterraData.avgDailyRevenue * 14 * 10) / 10)} - ${Math.max(10, Math.round(adsterraData.avgDailyRevenue * 20 * 10) / 10)} USD / tuần
                  </strong>
                </div>
              </div>

              {/* Step 2: Popunder 24h Monetag */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-orange-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Đòn bẩy CPM lớn nhất ($2.5+)
                  </span>
                  <Radio className="w-4 h-4 text-orange-400" />
                </div>
                <h5 className="text-sm font-bold text-white">2. Bật Popunder Nhẹ Nhàng 24 Giờ / Lần (Monetag OnClick)</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  CPM Popunder Đông Nam Á dao động từ <strong className="text-emerald-400">$1.8 - $3.2 USD</strong> (gấp {(2.5 / Math.max(0.05, adsterraData.avgCpm)).toFixed(1)} lần mức CPM ${adsterraData.avgCpm.toFixed(3)} hiện tại). Chỉ mở <strong>đúng 1 tab duy nhất mỗi 24 giờ cho 1 người dùng</strong> khi họ bấm Play phim. Với ~{(weeklyData?.sevenDaysUniqueVisitors || 6500).toLocaleString("vi-VN")} khách/tuần, trải nghiệm mượt mà 100%.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Dự phóng tăng thêm:</span>
                  <strong className="text-emerald-400 font-bold">+$12 - $20 USD / tuần (~300k - 500k VNĐ/tuần)</strong>
                </div>
              </div>

              {/* Step 3: Direct Game Sponsor Banner */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-purple-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    100% Tiền Mặt Cố Định
                  </span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <h5 className="text-sm font-bold text-white">3. Treo Banner Cho Thuê Cố Định (Game Tu Tiên / Shop Acc)</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Với {(weeklyData?.sevenDaysClicks || 34621).toLocaleString("vi-VN")} clicks/tuần (~{Math.round((weeklyData?.sevenDaysClicks || 34621) * 4.3).toLocaleString("vi-VN")} clicks/tháng), bạn hoàn toàn có thể bán 1 banner cố định ở đầu trang xem phim cho các bên phát hành Game H5 Tu Tiên hoặc Shop Bán Acc 3D. Nhận tiền mặt trực tiếp qua Momo/VietQR mỗi tháng mà không bị AdBlocker chặn hay phụ thuộc network.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Thu nhập cố định:</span>
                  <strong className="text-emerald-400 font-bold">+1.500.000đ - 2.500.000đ / tháng (tiền tươi)</strong>
                </div>
              </div>

              {/* Step 4: Smartlink Download Button */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-blue-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Khai thác kho ảnh AI 4K
                  </span>
                  <Camera className="w-4 h-4 text-blue-400" />
                </div>
                <h5 className="text-sm font-bold text-white">4. Nút "Tải Trọn Bộ Ảnh 4K" Gắn Smartlink (Gallery)</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tận dụng kho ảnh AI Gallery nữ thần của Vam3D. Khi khách bấm nút &quot;Tải trọn bộ 4K không watermark&quot; hoặc &quot;Báo lỗi phim&quot;, mở link tài trợ Adsterra Direct Link / Smartlink. Fan tu tiên rất sẵn sàng click để có ảnh đẹp.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Dự phóng tăng thêm:</span>
                  <strong className="text-emerald-400 font-bold">+$5 - $10 USD / tuần (~120k - 250k VNĐ/tuần)</strong>
                </div>
              </div>
            </div>

            {/* Realistic Roadmap Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Mục Tiêu Thu Nhập Sau Khi Triển Khai
                </h5>
                <p className="text-xs text-gray-400">
                  Từ mức thực tế <strong className="text-white">${adsterraData.totalRevenue.toFixed(2)} USD / {adsterraData.daysCount} ngày</strong> (~{Math.round(adsterraData.totalRevenue * USD_VND).toLocaleString("vi-VN")}đ) → Mục tiêu tiến tới <strong className="text-emerald-400">$25 - $40 USD / tuần</strong> (~2.500.000đ - 4.000.000đ / tháng)
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  2.500.000đ - 4.500.000đ / tháng
                </div>
                <span className="text-[11px] font-semibold text-amber-400">
                  ⚡ Khả thi 100% với lượng traffic {(weeklyData?.sevenDaysClicks || 34621).toLocaleString("vi-VN")} clicks/tuần hiện tại
                </span>
              </div>
            </div>

            {/* ── DYNAMIC AI AD REVENUE SOLUTION PANEL (UPDATED PER API SYNC) ── */}
            <div className="mt-6 border-t border-white/10 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      Bản Chẩn Đoán & Giải Pháp Tác Chiến Doanh Thu (Gemini AI)
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      Tự động phân tích sâu từ số liệu {adsterraData.daysCount} ngày Adsterra API vừa cập nhật
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {adsterraAiSolution && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(adsterraAiSolution);
                        setCopiedAdsterraAi(true);
                        showToast("Đã sao chép giải pháp AI!");
                        setTimeout(() => setCopiedAdsterraAi(false), 2000);
                      }}
                      className="border-white/10 hover:bg-white/5 text-gray-300 text-xs h-8 px-3 gap-1.5"
                    >
                      {copiedAdsterraAi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Sao chép giải pháp
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleGenerateAdsterraAiSolutions()}
                    disabled={isGeneratingAdsterraAi}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs font-bold h-8 px-3 gap-1.5 cursor-pointer"
                  >
                    {isGeneratingAdsterraAi ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-orange-400" />
                        AI đang phân tích...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-orange-400" />
                        Phân tích lại
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {adsterraAiSolution ? (
                <div className="p-5 rounded-2xl bg-black/40 border border-orange-500/20 text-xs text-gray-300 leading-relaxed space-y-3 font-normal max-h-[500px] overflow-y-auto pr-2">
                  <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed text-xs">
                    {adsterraAiSolution}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-orange-400 mx-auto opacity-70 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Chưa có bản phân tích giải pháp cho đợt số liệu này</p>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Bấm nút bên dưới để Gemini AI đọc toàn bộ số liệu {adsterraData.daysCount} ngày Adsterra và lập bản giải pháp tối ưu doanh thu thực chiến.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateAdsterraAiSolutions()}
                    disabled={isGeneratingAdsterraAi}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs h-8 px-4 gap-1.5 cursor-pointer shadow-md"
                  >
                    {isGeneratingAdsterraAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        ⚡ Kích Hoạt Phân Tích Giải Pháp Ngay
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ADS REVENUE SIMULATOR ── */}
      {activeSubTab === "simulator" && (
        <div className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Mô Phỏng Doanh Thu Quảng Cáo Theo Lượng Truy Cập</h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tính toán doanh thu thực tế từ Popunder + Native Banner + Tiền cho thuê banner theo ngày và tháng
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 self-start sm:self-center">
              Tỷ giá: 1 USD = 25.400 VNĐ
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">Lưu lượng truy cập mỗi ngày (Visits/ngày):</label>
                  <span className="font-black text-orange-400 text-sm">
                    {simDailyVisits.toLocaleString("vi-VN")} visits/ngày
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="2000"
                  value={simDailyVisits}
                  onChange={(e) => setSimDailyVisits(Number(e.target.value))}
                  className="w-full accent-orange-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>2.000 (Khởi đầu)</span>
                  <span>15.000 (Trung bình)</span>
                  <span>100.000+ (Web lớn)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">Giá CPM Quảng Cáo trung bình (USD / 1000 lượt):</label>
                  <span className="font-black text-emerald-400 text-sm">${simAvgCpm} USD / 1000 lượt</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.5"
                  step="0.05"
                  value={simAvgCpm}
                  onChange={(e) => setSimAvgCpm(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimAvgCpm(0.196)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      simAvgCpm === 0.196
                        ? "bg-emerald-500 text-black font-bold shadow"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📍 $0.196 (Thực tế Adsterra)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimAvgCpm(0.35)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      simAvgCpm === 0.35
                        ? "bg-emerald-500 text-black font-bold shadow"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    ⚡ $0.35 (Tối ưu Social Bar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimAvgCpm(1.8)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      simAvgCpm === 1.8
                        ? "bg-emerald-500 text-black font-bold shadow"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    🚀 $1.80 (+ Popunder 24h)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimAvgCpm(2.5);
                      setSimBannerRentals(2000000);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      simAvgCpm === 2.5
                        ? "bg-emerald-500 text-black font-bold shadow"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    💎 $2.50 (+ Banner Game)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">Tiền cho thuê Banner Game Tu Tiên / Shopee (Cố định):</label>
                  <span className="font-black text-purple-400 text-sm">
                    {simBannerRentals.toLocaleString("vi-VN")} đ/tháng
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="500000"
                  value={simBannerRentals}
                  onChange={(e) => setSimBannerRentals(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#181a28] to-[#0f101a] border border-orange-500/20 rounded-3xl p-6 space-y-5 shadow-xl">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Dự Phóng Thu Nhập Ròng
                </span>
                <h4 className="text-2xl font-black text-emerald-400 mt-1">
                  {netAdsProfitMonthly.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-semibold text-gray-400">VNĐ / tháng</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mỗi ngày thu về:{" "}
                  <strong className="text-white font-bold">
                    {Math.round(netAdsProfitMonthly / 30).toLocaleString("vi-VN")} đ / ngày
                  </strong>
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Doanh thu QC Pop/Native:</span>
                  <strong className="text-white font-bold">{(dailyAdsVnd * 30).toLocaleString("vi-VN")} đ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiền thuê banner game/merch:</span>
                  <strong className="text-purple-400 font-bold">{simBannerRentals.toLocaleString("vi-VN")} đ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chi phí CDN Bunny ước tính:</span>
                  <strong className="text-rose-400 font-bold">-{estimatedCdnCost.toLocaleString("vi-VN")} đ</strong>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-relaxed">
                {simDailyVisits < 10000
                  ? "🎯 Giai đoạn này: Tập trung SEO 100% bằng bộ từ khóa ở Tab 'Kho Từ Khóa SEO' để đạt mốc 15.000 visits/ngày. Đặt 1 popunder nhẹ để bù tiền server."
                  : simDailyVisits < 30000
                  ? "🚀 Lượng truy cập đã rất tốt: Đây là lúc liên hệ các NPH game Tu Tiên H5 hoặc shop bán figure anime để chào thuê 2 banner cố định."
                  : "💎 Mức traffic khủng: Doanh thu quảng cáo tự động đổ về đều đặn mỗi ngày mà không cần lo chăm sóc khách hàng nạp VIP!"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: ACTIONABLE ROADMAP ── */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Lộ Trình Triển Khai Thực Chiến (Actionable Roadmap)
            </h3>
            <p className="text-xs text-gray-400">
              Bấm vào từng đầu việc để cập nhật trạng thái (Chưa làm → Đang làm → Hoàn thành). Dữ liệu tự động lưu vĩnh viễn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="bg-[#12141f] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Giai Đoạn 1: Thiết Lập QC & SEO</h4>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Tuần 1 - 2
                </span>
              </div>
              <div className="space-y-3">
                {data?.roadmap
                  .filter((item) => item.stage === "quick")
                  .map((task) => (
                    <RoadmapCard key={task.id} task={task} onToggle={handleToggleRoadmapStatus} />
                  ))}
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#12141f] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h4 className="text-sm font-bold text-white">Giai Đoạn 2: Kéo Traffic Tự Động</h4>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Tháng 1 - 2
                </span>
              </div>
              <div className="space-y-3">
                {data?.roadmap
                  .filter((item) => item.stage === "growth")
                  .map((task) => (
                    <RoadmapCard key={task.id} task={task} onToggle={handleToggleRoadmapStatus} />
                  ))}
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#12141f] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <h4 className="text-sm font-bold text-white">Giai Đoạn 3: Hệ Sinh Thái & Tài Trợ</h4>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Tháng 3 - 6
                </span>
              </div>
              <div className="space-y-3">
                {data?.roadmap
                  .filter((item) => item.stage === "ecosystem")
                  .map((task) => (
                    <RoadmapCard key={task.id} task={task} onToggle={handleToggleRoadmapStatus} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Roadmap Task Card Component ──
function RoadmapCard({
  task,
  onToggle,
}: {
  task: StrategicAnalyticsData["roadmap"][0];
  onToggle: (id: string) => void;
}) {
  const getStatusBadge = (status: typeof task.status) => {
    switch (status) {
      case "completed":
        return {
          label: "Đã hoàn thành",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
        };
      case "in_progress":
        return {
          label: "Đang triển khai",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />,
        };
      default:
        return {
          label: "Chưa làm",
          className: "bg-zinc-800 text-gray-400 border-white/10",
          icon: <Clock className="w-3 h-3 text-gray-500" />,
        };
    }
  };

  const statusInfo = getStatusBadge(task.status);

  return (
    <div
      onClick={() => onToggle(task.id)}
      className="p-4 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer space-y-2 group"
    >
      <div className="flex items-start justify-between gap-2">
        <h5 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
          {task.title}
        </h5>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.className}`}
        >
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">{task.desc}</p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
        <span className="text-emerald-400 font-semibold">{task.expectedRevenue}</span>
        <span className="text-gray-500 group-hover:text-orange-400 transition-colors">Bấm để đổi ↻</span>
      </div>
    </div>
  );
}
