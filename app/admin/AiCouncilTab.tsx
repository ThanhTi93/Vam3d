"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  Globe,
  Database,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Send,
  Brain,
  TrendingUp,
  DollarSign,
  Film,
  ShieldCheck,
  Search,
  ExternalLink,
  Trash2,
  Check,
  Clock,
  Zap,
  Award,
  Layers,
  ChevronRight,
  Radio,
  BookOpen,
  ListChecks,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AI_COUNCIL_AGENTS,
  type AiAgentId,
  type AiCouncilSession,
  type AiKnowledgeItem,
  type InternalWebsiteSnapshot,
} from "@/lib/aiCouncil";
import {
  getAiCouncilDashboardDataAction,
  runAiCouncilSessionAction,
  toggleAiCouncilTaskCompletedAction,
  updateAiKnowledgeStatusAction,
  deleteAiKnowledgeItemAction,
  setAiCouncilAutoDailyAction,
} from "./actions";

interface AiCouncilTabProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

const PRESET_TOPICS = [
  "Cách đẩy CPM Adsterra tăng cao mà không làm khách thoát trang?",
  "Chiến lược SEO từ khóa Nhân vật 3D & Gallery 4K lên Top 1 Google?",
  "Làm sao tăng tỷ lệ chuyển đổi người xem miễn phí mua gói VAM PREMIUM?",
  "Phân tích các bộ hoạt hình 3D Trung Quốc đang hot trên mạng để ưu tiên ra tập?",
];

export default function AiCouncilTab({ showToast }: AiCouncilTabProps) {
  const [loading, setLoading] = useState(true);
  const [isMeetingRunning, setIsMeetingRunning] = useState(false);
  const [meetingStep, setMeetingStep] = useState(0);
  const [sessions, setSessions] = useState<AiCouncilSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [knowledgeBase, setKnowledgeBase] = useState<AiKnowledgeItem[]>([]);
  const [snapshot, setSnapshot] = useState<InternalWebsiteSnapshot | null>(null);
  const [autoDailyEnabled, setAutoDailyEnabled] = useState(true);
  const [customTopic, setCustomTopic] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"debate" | "tasks" | "knowledge">("debate");
  const [knowledgeFilter, setKnowledgeFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const loadCouncilData = async (autoTriggerIfNotRunToday = true) => {
    setLoading(true);
    try {
      const res = await getAiCouncilDashboardDataAction();
      if (res.success) {
        setSessions(res.sessions || []);
        setKnowledgeBase(res.knowledgeBase || []);
        setAutoDailyEnabled(res.autoDailyEnabled);
        if (res.internalSnapshot) setSnapshot(res.internalSnapshot);

        if (res.sessions && res.sessions.length > 0) {
          setSelectedSessionId(res.sessions[0].id);
        }

        // If auto-daily is enabled and today hasn't had a daily meeting yet, trigger automatically
        if (autoTriggerIfNotRunToday && res.autoDailyEnabled && !res.hasRunToday) {
          triggerCouncilMeeting("");
        }
      }
    } catch (err) {
      console.error("Failed to load AI Council:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCouncilData(true);
  }, []);

  const triggerCouncilMeeting = async (topicOverride?: string) => {
    if (isMeetingRunning) return;
    setIsMeetingRunning(true);
    setMeetingStep(1);

    const stepTimer1 = setTimeout(() => setMeetingStep(2), 2200);
    const stepTimer2 = setTimeout(() => setMeetingStep(3), 4800);
    const stepTimer3 = setTimeout(() => setMeetingStep(4), 7500);

    try {
      const topicToUse = topicOverride !== undefined ? topicOverride : customTopic;
      const res: any = await runAiCouncilSessionAction(topicToUse);
      if (res.success && res.session) {
        setSessions(res.sessions || [res.session]);
        setSelectedSessionId(res.session.id);
        if (res.knowledgeBase) setKnowledgeBase(res.knowledgeBase);
        if (res.internalSnapshot) setSnapshot(res.internalSnapshot);
        if (topicToUse) setCustomTopic("");
        setActiveSubTab("debate");
        showToast("✨ Đội ngũ AI đã hoàn tất quét Internet, tranh biện & cập nhật Kho Tự Học!");
      } else {
        showToast(res.error || "Không thể hoàn tất phiên họp AI", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi kết nối khi họp Hội đồng AI", "error");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsMeetingRunning(false);
      setMeetingStep(0);
    }
  };

  const handleToggleAutoDaily = async () => {
    const nextVal = !autoDailyEnabled;
    setAutoDailyEnabled(nextVal);
    const res = await setAiCouncilAutoDailyAction(nextVal);
    if (res.success) {
      showToast(
        nextVal
          ? "Đã bật chế độ Đội ngũ AI tự động họp & học kiến thức mới mỗi ngày!"
          : "Đã tắt chế độ họp tự động hàng ngày."
      );
    }
  };

  const handleToggleTask = async (sessionId: string, taskId: string) => {
    startTransition(async () => {
      const res = await toggleAiCouncilTaskCompletedAction(sessionId, taskId);
      if (res.success && res.sessions) {
        setSessions(res.sessions);
        showToast("Đã cập nhật tiến độ công việc!");
      }
    });
  };

  const handleUpdateKnowledgeStatus = async (
    id: string,
    status: "learning" | "applied" | "verified_effective"
  ) => {
    startTransition(async () => {
      const res = await updateAiKnowledgeStatusAction(id, status);
      if (res.success && res.knowledgeBase) {
        setKnowledgeBase(res.knowledgeBase);
        showToast("Đã cập nhật trạng thái bài học trong Kho Trí Nhớ AI!");
      }
    });
  };

  const handleDeleteKnowledge = async (id: string) => {
    startTransition(async () => {
      const res = await deleteAiKnowledgeItemAction(id);
      if (res.success && res.knowledgeBase) {
        setKnowledgeBase(res.knowledgeBase);
        showToast("Đã xóa mục kiến thức khỏi bộ nhớ.");
      }
    });
  };

  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const filteredKnowledge =
    knowledgeFilter === "ALL"
      ? knowledgeBase
      : knowledgeBase.filter((k) => k.category === knowledgeFilter);

  const getAgentColorClasses = (agentId: AiAgentId) => {
    switch (agentId) {
      case "seo":
        return {
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: <Globe className="w-4 h-4 text-emerald-400" />,
        };
      case "ads":
        return {
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: <DollarSign className="w-4 h-4 text-amber-400" />,
        };
      case "content":
        return {
          border: "border-pink-500/30",
          bg: "bg-pink-500/10",
          text: "text-pink-400",
          badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
          icon: <Film className="w-4 h-4 text-pink-400" />,
        };
      case "chairman":
      default:
        return {
          border: "border-violet-500/30",
          bg: "bg-violet-500/10",
          text: "text-violet-400",
          badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
          icon: <Award className="w-4 h-4 text-violet-400" />,
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ═══ HEADER: AI STRATEGIC WAR ROOM ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#131524] via-[#0f111c] to-[#171226] p-5 sm:p-6 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                4 NHÂN VIÊN AI TRỰC TUYẾN
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Live Google Search & Trends VN
              </Badge>
              <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[11px] flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Kho Tự Học: {knowledgeBase.length} bài học tích lũy
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-violet-400 shrink-0" />
              ĐỘI NGŨ NHÂN VIÊN AI TỰ HỌC & ĐỐI CHIẾU DỮ LIỆU HÀNG NGÀY
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Đội ngũ 4 chuyên gia AI tự động lướt mạng đọc kiến thức mới mỗi ngày (Google Core Updates, xu hướng tìm kiếm 3D, Benchmark CPM Adsterra quốc tế), sau đó{" "}
              <span className="text-emerald-400 font-semibold">đối chiếu trực tiếp với Database của Vam3D</span>, tranh biện đa chiều và đề xuất giải pháp thực chiến.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <Button
              onClick={() => triggerCouncilMeeting("")}
              disabled={isMeetingRunning}
              className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-lg shadow-violet-600/25 gap-2 cursor-pointer"
            >
              {isMeetingRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang quét mạng & họp hội đồng...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Họp Chiến Lược & Quét Kiến Thức Mạng Ngay</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={handleToggleAutoDaily}
              className="flex items-center justify-center gap-2 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  autoDailyEnabled ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-gray-500"
                }`}
              />
              <span>
                Tự động học & họp mỗi ngày:{" "}
                <strong className={autoDailyEnabled ? "text-emerald-400" : "text-gray-400"}>
                  {autoDailyEnabled ? "ĐANG BẬT" : "ĐANG TẮT"}
                </strong>
              </span>
            </button>
          </div>
        </div>

        {/* Live Progress Stepper when Meeting is Running */}
        {isMeetingRunning && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              {
                step: 1,
                label: "1. Quét Internet & Google Trends",
                desc: "Đọc từ khóa đang lên & kiến thức SEO/Ads mới",
              },
              {
                step: 2,
                label: "2. Đối chiếu Database Vam3D",
                desc: "So khớp Traffic, Phim, CPM Adsterra & Hội viên VIP",
              },
              {
                step: 3,
                label: "3. Tranh biện Đa tác tử AI",
                desc: "4 Giám đốc thảo luận, phản biện & chốt phương án",
              },
              {
                step: 4,
                label: "4. Ghi nhớ vào Kho Tự Học",
                desc: "Lưu đúc kết mới vào bộ nhớ dài hạn PostgreSQL",
              },
            ].map((item) => {
              const active = meetingStep === item.step;
              const done = meetingStep > item.step;
              return (
                <div
                  key={item.step}
                  className={`p-3 rounded-xl border transition-all ${
                    active
                      ? "bg-violet-500/15 border-violet-400/50 text-white animate-pulse"
                      : done
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-white/5 border-white/5 text-gray-500"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : active ? (
                      <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ROSTER: 4 SPECIALIST AI AGENTS ═══════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.keys(AI_COUNCIL_AGENTS) as AiAgentId[]).map((agentKey) => {
          const agent = AI_COUNCIL_AGENTS[agentKey];
          const colors = getAgentColorClasses(agentKey);
          const learnedCount = knowledgeBase.filter((k) => k.agentId === agentKey).length;

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border ${colors.border} bg-[#10121d] p-4 flex flex-col justify-between gap-3 hover:bg-[#141726] transition-colors`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}
                    >
                      {colors.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{agent.name}</h3>
                      <p className={`text-[11px] font-semibold ${colors.text}`}>
                        {agent.roleTitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                    {agent.handle}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Chuyên môn:</span>
                <span className={`font-bold ${colors.text}`}>
                  Đã tích lũy {learnedCount} bài học
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ AD-HOC CONSULTATION: ASK THE AI TEAM ANY TOPIC ═══════════════ */}
      <div className="rounded-2xl border border-white/10 bg-[#10121d] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Giao Chủ Đề Nghiên Cứu Mới / Họp Khẩn Cấp Với Đội Ngũ AI
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">
            Cả 4 chuyên gia sẽ lập tức tìm kiếm trên mạng, đối chiếu DB và tranh luận chủ đề bạn yêu cầu
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customTopic.trim() && !isMeetingRunning) {
                triggerCouncilMeeting(customTopic);
              }
            }}
            placeholder="Nhập vấn đề cần đội ngũ AI nghiên cứu trên mạng & đối chiếu web (VD: Làm sao đẩy từ khóa Vân Vận lên top 1, cách tăng CPM Adsterra...)"
            className="flex-1 bg-[#090a0f] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <Button
            onClick={() => triggerCouncilMeeting(customTopic)}
            disabled={isMeetingRunning || !customTopic.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm h-10 sm:h-auto px-5 rounded-xl gap-2 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Giao Việc & Họp Ngay</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-gray-500">Gợi ý chủ đề nóng:</span>
          {PRESET_TOPICS.map((topic, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCustomTopic(topic);
                triggerCouncilMeeting(topic);
              }}
              disabled={isMeetingRunning}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-violet-500/20 text-gray-300 hover:text-violet-200 border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer text-left"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ SUB-NAVIGATION TABS ══════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("debate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === "debate"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Biên Bản Tranh Biện & Đối Chiếu ({activeSession?.debateMessages?.length || 4})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === "tasks"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>
              Kế Hoạch Hành Động (
              {activeSession?.actionTasks?.filter((t) => !t.completed).length || 0} việc cần làm)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("knowledge")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === "knowledge"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho Trí Nhớ Tự Học ({knowledgeBase.length} bài học)</span>
          </button>
        </div>

        {/* Session History Selector */}
        {sessions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Lịch sử phiên họp:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-[#10121d] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            >
              {sessions.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx === 0 ? "🟢 Mới nhất: " : ""}
                  {s.createdAt} — {s.topic.slice(0, 48)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ═══ TAB 1: MULTI-AGENT DEBATE & INTERNET VS INTERNAL BENCHMARK ═══ */}
      {activeSubTab === "debate" && activeSession && (
        <div className="space-y-6">
          {/* Side-by-Side: Internet Signals vs Internal Database Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Live Internet Signals */}
            <div className="rounded-2xl border border-emerald-500/25 bg-[#10131e] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-400 uppercase">
                    🌐 Dữ Liệu Mới Nhân Viên AI Quét Trên Mạng
                  </h4>
                </div>
                <span className="text-[10px] text-gray-400">
                  Cập nhật: {activeSession.createdAt}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1.5">
                    🔥 Từ khóa 3D đang tìm kiếm nhiều trên Google Việt Nam:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeSession.internetSignals?.googleRisingKeywords || [])
                      .slice(0, 12)
                      .map((kw, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1.5">
                    💎 Xu hướng tìm kiếm Nhân vật 3D trên mạng:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeSession.internetSignals?.characterSearchTrends || [])
                      .slice(0, 10)
                      .map((kw, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                  </div>
                </div>

                {activeSession.internetSignals?.webSources &&
                  activeSession.internetSignals.webSources.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 mb-1">
                        Nguồn tri thức mạng đã tham chiếu:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeSession.internetSignals.webSources.slice(0, 4).map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Right: Internal Website Snapshot */}
            <div className="rounded-2xl border border-violet-500/25 bg-[#10131e] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-400" />
                  <h4 className="text-xs sm:text-sm font-extrabold text-violet-400 uppercase">
                    📊 Số Liệu Thực Tế Website Vam3D (Đối Chiếu)
                  </h4>
                </div>
                <Badge className="bg-violet-500/15 text-violet-300 border-0 text-[10px]">
                  Cloudflare R2 ($0 Egress)
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-400">Clicks (7 ngày)</p>
                  <p className="text-sm font-black text-white">
                    {activeSession.internalSnapshot?.sevenDaysClicks?.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    Organic SEO: {activeSession.internalSnapshot?.organicSharePct}%
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-400">Adsterra CPM</p>
                  <p className="text-sm font-black text-amber-400">
                    ${activeSession.internalSnapshot?.adsterraCpm?.toFixed(3)}
                  </p>
                  <p className="text-[10px] text-gray-300">
                    CTR: {activeSession.internalSnapshot?.adsterraCtr?.toFixed(2)}%
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-400">Kho Nội Dung</p>
                  <p className="text-sm font-black text-white">
                    {activeSession.internalSnapshot?.totalMovies} phim /{" "}
                    {activeSession.internalSnapshot?.totalEpisodes} tập
                  </p>
                  <p className="text-[10px] text-pink-400">
                    {activeSession.internalSnapshot?.totalGalleries} bộ ảnh AI 4K
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-400">Hội Viên VIP</p>
                  <p className="text-sm font-black text-violet-300">
                    {activeSession.internalSnapshot?.vipUsersCount} /{" "}
                    {activeSession.internalSnapshot?.totalAccounts}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Mobile: {activeSession.internalSnapshot?.mobileSharePct}%
                  </p>
                </div>
              </div>

              {activeSession.internalSnapshot?.topMovies &&
                activeSession.internalSnapshot.topMovies.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] text-gray-400 mb-1">
                      Top phim chủ lực trên Vam3D:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSession.internalSnapshot.topMovies.map((m, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-200 border border-white/10"
                        >
                          {m.name} ({m.views} views)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Executive Resolution Summary */}
          <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-950/40 via-[#131524] to-orange-950/30 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase">
                Nghị Quyết Chung Của Hội Đồng AI — {activeSession.topic}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {activeSession.executiveSummary}
            </p>
          </div>

          {/* Multi-Agent Debate Messages */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Chi Tiết Phiên Họp Trao Đổi & Phản Biện Giữa Các Nhân Viên AI
            </h3>

            <div className="space-y-4">
              {(activeSession.debateMessages || []).map((msg, idx) => {
                const colors = getAgentColorClasses(msg.agentId);
                return (
                  <div
                    key={msg.id || idx}
                    className={`rounded-2xl border ${colors.border} bg-[#10121d] p-4 sm:p-5 space-y-4 shadow-lg`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
                        >
                          {colors.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {msg.agentName}
                            </span>
                            <Badge className={`${colors.badge} text-[10px] px-2 py-0`}>
                              {msg.roleTitle}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-gray-500">
                            Phát biểu lượt #{idx + 1} · {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(msg.referencedSources || []).map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10"
                          >
                            📚 {src}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                      {/* 1. Internet Insight */}
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                        <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>1. Kiến thức & Xu hướng mới đọc trên mạng:</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                          {msg.internetInsight}
                        </p>
                      </div>

                      {/* 2. Internal Benchmark */}
                      <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                        <div className="text-xs font-extrabold text-blue-400 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>2. Đối chiếu thực tế dữ liệu Vam3D:</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                          {msg.internalBenchmark}
                        </p>
                      </div>

                      {/* 3. Debate & Cross-department challenge */}
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                        <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>3. Trao đổi & Phản biện với các bộ phận khác:</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                          {msg.debateArgument}
                        </p>
                      </div>

                      {/* 4. Proposed Actionable Solution */}
                      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1.5">
                        <div className="text-xs font-extrabold text-violet-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-orange-400" />
                          <span>4. Giải pháp đề xuất cho Website:</span>
                        </div>
                        <p className="text-white font-medium leading-relaxed whitespace-pre-line">
                          {msg.proposedSolution}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: ACTIONABLE TASKS CHECKLIST FOR ADMIN ══════════════════ */}
      {activeSubTab === "tasks" && activeSession && (
        <div className="rounded-2xl border border-white/10 bg-[#10121d] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-orange-400" />
                Bảng Đầu Việc Đề Xuất Từ Phiên Họp ({activeSession.dateKey})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Đánh dấu hoàn thành các đầu việc bạn đã triển khai để Đội ngũ AI ghi nhận vào bộ nhớ cho phiên họp ngày mai.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(activeSession.actionTasks || []).map((task) => {
              const prioColor =
                task.priority === "CRITICAL"
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : task.priority === "HIGH"
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30";

              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(activeSession.id, task.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    task.completed
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                      : "bg-[#151828] border-white/10 hover:border-orange-500/40"
                  }`}
                >
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-400 text-black"
                        : "border-gray-500 hover:border-orange-400"
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${prioColor} text-[10px] font-bold`}>
                        {task.priority}
                      </Badge>
                      <Badge className="bg-white/10 text-gray-200 border-0 text-[10px]">
                        Bộ phận: {task.department}
                      </Badge>
                      <h4
                        className={`text-sm font-bold ${
                          task.completed ? "line-through text-gray-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <p className="text-xs text-emerald-400 font-medium">
                      🎯 Tác động dự kiến: {task.expectedImpact}
                    </p>
                    <p className="text-xs text-gray-300 bg-black/30 p-2.5 rounded-lg border border-white/5">
                      🛠️ <strong>Cách thực hiện:</strong> {task.executionSteps}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ TAB 3: PERSISTENT SELF-LEARNING KNOWLEDGE BASE ═══════════════ */}
      {activeSubTab === "knowledge" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#10121d] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                Kho Trí Nhớ Tự Học Của Đội Ngũ AI ({knowledgeBase.length} đúc kết)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Mọi kiến thức mới học từ Internet và đối chiếu hiệu quả trên Vam3D đều được lưu tại đây. Bạn có thể đánh dấu &ldquo;Đã kiểm chứng hiệu quả&rdquo; để AI ưu tiên phát huy.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "Tất cả" },
                { id: "SEO & Google", label: "SEO & Google" },
                { id: "Adsterra & CPM", label: "Adsterra & CPM" },
                { id: "Nội dung & Nhân vật 3D", label: "Nội dung 3D" },
                { id: "Chuyển đổi VIP & UX", label: "VIP & UX" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setKnowledgeFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    knowledgeFilter === cat.id
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKnowledge.map((item) => {
              const agent = AI_COUNCIL_AGENTS[item.agentId] || AI_COUNCIL_AGENTS.seo;
              const colors = getAgentColorClasses(item.agentId);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border ${colors.border} bg-[#10121d] p-4 sm:p-5 flex flex-col justify-between gap-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={`${colors.badge} text-[10px]`}>
                          {item.category}
                        </Badge>
                        <span className="text-[11px] text-gray-400">
                          bởi <strong className="text-gray-200">{agent.name}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-white/5 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          Độ tin cậy: {item.confidenceScore}%
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleDeleteKnowledge(item.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Xóa bài học này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-white">{item.title}</h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-emerald-400 font-bold block mb-0.5">
                          🌐 Kiến thức phát hiện trên mạng:
                        </span>
                        <p className="text-gray-300">{item.internetFinding}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-blue-400 font-bold block mb-0.5">
                          📊 Đối chiếu dữ liệu Vam3D:
                        </span>
                        <p className="text-gray-300">{item.internalComparison}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <span className="text-violet-300 font-bold block mb-0.5">
                          💡 Giải pháp đúc kết:
                        </span>
                        <p className="text-white">{item.solutionProposed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500">
                      Học lúc: {item.createdAt}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateKnowledgeStatus(item.id, "learning")}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                          item.status === "learning"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-white/5 text-gray-400 border-transparent hover:text-white"
                        }`}
                      >
                        📖 Đang nghiên cứu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateKnowledgeStatus(item.id, "applied")}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                          item.status === "applied"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-white/5 text-gray-400 border-transparent hover:text-white"
                        }`}
                      >
                        ⚙️ Đã áp dụng
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateKnowledgeStatus(item.id, "verified_effective")
                        }
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                          item.status === "verified_effective"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-white/5 text-gray-400 border-transparent hover:text-white"
                        }`}
                      >
                        ✅ Rất hiệu quả
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !activeSession && !isMeetingRunning && (
        <div className="rounded-2xl border border-white/10 bg-[#10121d] p-10 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">
            Sẵn sàng kích hoạt Phiên Họp Đầu Tiên của Đội Ngũ AI
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Bấm nút bên dưới để 4 chuyên gia AI bắt đầu quét Google Trends, cập nhật kiến thức SEO & Adsterra mới nhất trên mạng và đối chiếu với dữ liệu của Vam3D.
          </p>
          <Button
            onClick={() => triggerCouncilMeeting("")}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            🚀 Bắt Đầu Phiên Họp Ngay
          </Button>
        </div>
      )}
    </div>
  );
}

