"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Film, List, Users, User, Package, LayoutDashboard,
  Plus, Pencil, Trash2, Check, X, RefreshCw, Search,
  ChevronDown, Eye, Star, Flame, Save, Loader2, BookOpen,
  Shield, Settings, Camera, ChevronLeft, ChevronRight, FolderOpen,
  Tv, Play, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  getAdminMovies, createMovie, updateMovie, deleteMovie,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  getAdminEpisodes, createEpisode, updateEpisode, deleteEpisode,
  getAdminActors, createActor, updateActor, deleteActor,
  getAdminPlans, createPlan, updatePlan, deletePlan,
  getAdminAuthors, createAuthor, updateAuthor, deleteAuthor,
  getAdminAccounts, updateAccountRole, deleteAccount,
  getAdminCharacters, createCharacter, updateCharacter, deleteCharacter,
  getAdminFeatures, createFeature, updateFeature, deleteFeature,
  getAdminPackages, createPackage, updatePackage, deletePackage,
  revalidateAllCache,
  prepareBunnyUpload,
  getAdminGalleries, createGallery, updateGallery, deleteGallery,
  getAdminCollections, createCollection, updateCollection, deleteCollection,
  addImageToCollection, removeImageFromCollection, getAdminAiImages,
} from "./actions";
import { ImagePicker } from "@/components/ui/image-picker";
import { uploadFileToBunny } from "@/lib/uploadClient";
import { getBunnyImageUrl, cleanFolderName } from "@/lib/utils";
import * as tus from "tus-js-client";

// ─── Types ──────────────────────────────────────────────────────────────────
type AdminTab = "overview" | "movies" | "categories" | "episodes" | "actors" | "characters" | "plans" | "features" | "packages" | "authors" | "accounts" | "galleries" | "collections";

// ─── Notification toast ─────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ─── ConfirmDialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open, title, onConfirm, onCancel
}: { open: boolean; title: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2">Xác nhận xoá</h3>
        <p className="text-sm text-gray-400 mb-6">{title}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 border-white/10 text-gray-300">Huỷ</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0">Xoá</Button>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardClientProps {
  initialData: {
    movies: any[];
    categories: any[];
    authors: any[];
  };
}

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loadedTabs, setLoadedTabs] = useState<Set<AdminTab>>(
    new Set(["overview", "categories"])
  );
  const [isCrewOpen, setIsCrewOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast, show } = useToast();

  // Data states
  const [movies, setMovies] = useState<any[]>(initialData.movies);
  const [categories, setCategories] = useState<any[]>(initialData.categories);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>(initialData.authors);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [aiImages, setAiImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; label: string; onConfirm: () => void }>({ open: false, label: "", onConfirm: () => {} });

  const loadData = async (t = tab, force = false) => {
    if (loadedTabs.has(t) && !force) return;

    setLoading(true);
    try {
      if (t === "overview" || t === "movies") {
        const [m, a] = await Promise.all([getAdminMovies(), getAdminAuthors()]);
        setMovies(m);
        setAuthors(a);
      }
      if (t === "overview" || t === "categories") setCategories(await getAdminCategories());
      if (t === "episodes") {
        const [ep, m, act, char, pl] = await Promise.all([
          getAdminEpisodes(),
          getAdminMovies(),
          getAdminActors(),
          getAdminCharacters(),
          getAdminPlans(),
        ]);
        setEpisodes(ep);
        setMovies(m);
        setActors(act);
        setCharacters(char);
        setPlans(pl);
      }
      if (t === "actors") setActors(await getAdminActors());
      if (t === "plans") setPlans(await getAdminPlans());
      if (t === "features") setFeatures(await getAdminFeatures());
      if (t === "packages") setPackages(await getAdminPackages());
      if (t === "authors") setAuthors(await getAdminAuthors());
      if (t === "accounts") setAccounts(await getAdminAccounts());
      if (t === "characters") setCharacters(await getAdminCharacters());
      if (t === "galleries") {
        const [g, m, p, c, cols] = await Promise.all([
          getAdminGalleries(), getAdminMovies(), getAdminPlans(),
          getAdminCharacters(), getAdminCollections()
        ]);
        setGalleries(g); setMovies(m); setPlans(p); setCharacters(c); setCollections(cols);
      }
      if (t === "collections") {
        const [cols, ai] = await Promise.all([getAdminCollections(), getAdminAiImages()]);
        setCollections(cols);
        setAiImages(ai);
      }

      setLoadedTabs(prev => {
        const next = new Set(prev);
        next.add(t);
        if (t === "overview") {
          next.add("categories");
        }
        return next;
      });
    } catch (e) {
      show("Lỗi khi tải dữ liệu", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial data is loaded on server
  }, []);

  const handleTab = async (t: AdminTab) => {
    if (t === tab) return;

    if (loadedTabs.has(t)) {
      setTab(t);
      setSearch("");
      setIsSidebarOpen(false);
      return;
    }

    try {
      await loadData(t);
      setTab(t);
      setSearch("");
      setIsSidebarOpen(false);
    } catch {
      // handled inside loadData
    }
  };

  const confirmThenDelete = (label: string, fn: () => Promise<void>) => {
    setConfirmDelete({
      open: true, label,
      onConfirm: () => {
        setConfirmDelete(prev => ({ ...prev, open: false }));
        startTransition(async () => {
          try { await fn(); await loadData(tab, true); show("Đã xoá thành công!"); }
          catch { show("Lỗi khi xoá", "error"); }
        });
      }
    });
  };

  type NavItem = {
    id?: AdminTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
    subItems?: { id: AdminTab; label: string; count?: number }[];
  };

  const navItems: NavItem[] = [
    { id: "overview", label: "Tổng Quan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "movies", label: "Phim", icon: <Film className="w-4 h-4" />, count: movies.length },
    { id: "categories", label: "Thể Loại", icon: <List className="w-4 h-4" />, count: categories.length },
    { id: "episodes", label: "Tập Phim", icon: <Eye className="w-4 h-4" />, count: episodes.length },
    {
      label: "Đoàn Phim",
      icon: <Users className="w-4 h-4" />,
      subItems: [
        { id: "authors", label: "Tác Giả", count: authors.length },
        { id: "actors", label: "Diễn Viên", count: actors.length },
        { id: "characters", label: "Nhân Vật", count: characters.length },
      ],
    },
    { id: "galleries", label: "Bộ Sưu Tập AI", icon: <Camera className="w-4 h-4" />, count: galleries.length },
    { id: "collections", label: "Thư Mục Ảnh", icon: <FolderOpen className="w-4 h-4" />, count: collections.length },
    {
      label: "Gói Cước",
      icon: <Package className="w-4 h-4" />,
      subItems: [
        { id: "plans", label: "Cấu hình Gói", count: plans.length },
        { id: "features", label: "Tính năng", count: features.length },
        { id: "packages", label: "Thời hạn & Giảm giá", count: packages.length },
      ],
    },
    { id: "accounts", label: "Tài Khoản", icon: <Shield className="w-4 h-4" />, count: accounts.length },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex">
      {/* ── Mobile overlay backdrop ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`bg-[#0e1018] border-r border-white/5 flex flex-col fixed h-full z-50 transition-all duration-300 ${
        isSidebarCollapsed ? "w-64 lg:w-[72px]" : "w-64"
      } ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Toggle Collapse Button (Desktop only) */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute top-6 -right-3 z-50 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white items-center justify-center border border-white/10 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg cursor-pointer"
          title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-black text-white text-sm shrink-0">R</div>
              <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                <span className="text-sm font-extrabold text-white whitespace-nowrap">RoPhim</span>
                <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest whitespace-nowrap">Admin Panel</span>
              </div>
            </div>
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.subItems) {
              const isActive = item.subItems.some(sub => tab === sub.id);
              const isOpen = item.label === "Đoàn Phim" ? isCrewOpen : (item.label === "Gói Cước" ? isPlansOpen : false);
              const toggleOpen = () => {
                if (item.label === "Đoàn Phim") setIsCrewOpen(!isCrewOpen);
                if (item.label === "Gói Cước") setIsPlansOpen(!isPlansOpen);
              };
              const handleGroupClick = () => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (item.label === "Đoàn Phim") setIsCrewOpen(true);
                  if (item.label === "Gói Cước") setIsPlansOpen(true);
                } else {
                  toggleOpen();
                }
              };
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={handleGroupClick}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSidebarCollapsed ? "lg:justify-center" : ""
                    } ${
                      isActive ? "text-orange-400 bg-orange-500/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      <span className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                        {item.label}
                      </span>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isSidebarCollapsed ? "lg:hidden" : ""
                     } ${isOpen || isActive ? "rotate-180" : ""}`} />
                  </button>
                  {(isOpen || isActive) && !isSidebarCollapsed && (
                    <div className="pl-9 space-y-1 animate-in fade-in duration-300">
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleTab(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            tab === sub.id
                              ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/20"
                              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          {sub.label}
                          {sub.count !== undefined && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === sub.id ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-500"}`}>
                              {sub.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTab(item.id!)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isSidebarCollapsed ? "lg:justify-center" : ""
                } ${
                  tab === item.id
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  <span className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                    {item.label}
                  </span>
                </span>
                {item.count !== undefined && !isSidebarCollapsed && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === item.id ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-500"}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <a
            href="/"
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
              isSidebarCollapsed ? "lg:justify-center" : ""
            }`}
            title={isSidebarCollapsed ? "Về Trang Chủ" : undefined}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
              ← Về Trang Chủ
            </span>
          </a>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${
        isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      }`}>
        {/* Header bar */}
        <div className="sticky top-0 z-20 bg-[#090a0f]/95 backdrop-blur border-b border-white/5 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger – mobile only */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-white truncate">
                {navItems.find(n => n.id === tab)?.label || navItems.flatMap(n => n.subItems || []).find(s => s.id === tab)?.label}
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">Quản lý dữ liệu RoPhim · Neon PostgreSQL</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loading && <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => startTransition(async () => { await revalidateAllCache(); await loadData(tab, true); show("Đã cập nhật cache!"); })}
              className="border-white/10 text-gray-300 hover:text-white text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm mới cache</span>
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          {/* Toast */}
          {toast && (
            <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border animate-in slide-in-from-right-4 ${
              toast.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {toast.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {toast.msg}
            </div>
          )}

          <ConfirmDialog
            open={confirmDelete.open}
            title={confirmDelete.label}
            onConfirm={confirmDelete.onConfirm}
            onCancel={() => setConfirmDelete(prev => ({ ...prev, open: false }))}
          />

          {/* ═══ OVERVIEW ═══════════════════════════════════════════════════ */}
          {tab === "overview" && (
            <OverviewTab movies={movies} categories={categories} />
          )}

          {/* ═══ MOVIES ══════════════════════════════════════════════════════ */}
          {tab === "movies" && (
            <MoviesTab
              movies={movies} categories={categories} actors={actors} characters={characters} authors={authors} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("movies", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ CATEGORIES ══════════════════════════════════════════════════ */}
          {tab === "categories" && (
            <CategoriesTab
              categories={categories} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("categories", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ EPISODES ════════════════════════════════════════════════════ */}
          {tab === "episodes" && (
            <EpisodesTab
              episodes={episodes} movies={movies} actors={actors} characters={characters} plans={plans} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("episodes", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ ACTORS ═════════════════════════════════════════════════════ */}
          {tab === "actors" && (
            <ActorsTab
              actors={actors} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("actors", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ CHARACTERS ══════════════════════════════════════════════════ */}
          {tab === "characters" && (
            <CharactersTab
              characters={characters} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("characters", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ GALLERIES ══════════════════════════════════════════════════ */}
          {tab === "galleries" && (
            <GalleriesTab
              galleries={galleries} movies={movies} characters={characters} plans={plans}
              collections={collections}
              search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("galleries", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}


          {/* ═══ COLLECTIONS ═════════════════════════════════════════════════ */}
          {tab === "collections" && (
            <CollectionsTab
              collections={collections} aiImages={aiImages} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("collections", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ PLANS ═══════════════════════════════════════════════════════ */}
          {tab === "plans" && (
            <PlansTab
              plans={plans} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("plans", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ FEATURES ════════════════════════════════════════════════════ */}
          {tab === "features" && (
            <FeaturesTab
              features={features} plans={plans} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("features", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ PACKAGES ════════════════════════════════════════════════════ */}
          {tab === "packages" && (
            <PackagesTab
              packages={packages} plans={plans} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("packages", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ AUTHORS ═════════════════════════════════════════════════════ */}
          {tab === "authors" && (
            <AuthorsTab
              authors={authors} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("authors", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}

          {/* ═══ ACCOUNTS ════════════════════════════════════════════════════ */}
          {tab === "accounts" && (
            <AccountsTab
              accounts={accounts} search={search} setSearch={setSearch}
              isPending={isPending} startTransition={startTransition}
              onRefresh={() => loadData("accounts", true)} show={show}
              confirmThenDelete={confirmThenDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════
function OverviewTab({ movies, categories }: { movies: any[]; categories: any[] }) {
  const stats = [
    { label: "Tổng phim", value: movies.length, icon: <Film className="w-5 h-5" />, color: "text-orange-400 bg-orange-500/10" },
    { label: "Thể loại", value: categories.length, icon: <List className="w-5 h-5" />, color: "text-green-400 bg-green-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#131520] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phim Gần Đây */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Phim Gần Đây</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.slice(0, 12).map((m: any) => (
            <div key={m.id} className="bg-[#131520] border border-white/5 rounded-xl overflow-hidden group">
              <div className="relative aspect-video bg-[#090a0f]">
                {m.imgUrl && <Image src={getBunnyImageUrl(m.imgUrl, 'original')} alt={m.name} fill className="object-cover" sizes="180px" />}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-bold text-gray-200 line-clamp-1">{m.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOVIES TAB
// ═══════════════════════════════════════════════════════════════════════
function MoviesTab({ movies, categories, actors, characters, authors, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const emptyForm = { name: "", description: "", imgUrl: "" as string | File | null, categoryIds: [] as number[], idAuthor: 0 };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [previewMovie, setPreviewMovie] = useState<any | null>(null);
  const [previewEpisodeIndex, setPreviewEpisodeIndex] = useState<number>(0);
 
  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
 
  const filtered = movies.filter((m: any) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
 
  React.useEffect(() => { setPage(1); }, [search]);

  React.useEffect(() => {
    if (!previewMovie) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const currentIdx = filtered.findIndex((m: any) => m.id === previewMovie.id);
        if (currentIdx !== -1) {
          if (e.key === "ArrowLeft" && currentIdx > 0) {
            setPreviewMovie(filtered[currentIdx - 1]);
          } else if (e.key === "ArrowRight" && currentIdx < filtered.length - 1) {
            setPreviewMovie(filtered[currentIdx + 1]);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMovie, filtered]);
 
  const startEdit = (m: any) => {
    setForm({
      name: m.name,
      description: m.description ?? "",
      imgUrl: m.imgUrl ?? "",
      categoryIds: m.movieCategories?.map((mc: any) => mc.idCategory) ?? [],
      idAuthor: m.idAuthor ?? 0,
    });
    setEditing(m.id);
    setShowForm(true);
  };
 
  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editing;
    startTransition(async () => {
      try {
        let finalImgUrl = form.imgUrl;
 
        const safeName = cleanFolderName(form.name);

        if (form.imgUrl instanceof File) {
          const uniqueId = Math.random().toString(36).substring(2, 8);
          const extension = form.imgUrl.name.substring(form.imgUrl.name.lastIndexOf(".") + 1) || "webp";
          finalImgUrl = await uploadFileToBunny(form.imgUrl, "movies", `movies/${safeName}_${uniqueId}.${extension}`);
        }
 
        const submitData = {
          name: form.name,
          description: form.description,
          imgUrl: (finalImgUrl as string) || "",
          categoryIds: form.categoryIds,
          idAuthor: form.idAuthor || null,
        };
 
        if (isEdit) {
          await updateMovie(editing!, submitData);
        } else {
          await createMovie(submitData);
        }
        await onRefresh();
        resetForm();
        show(isEdit ? "Đã cập nhật phim!" : "Đã thêm phim mới!");
      } catch (err: any) {
        show(err?.message ?? "Lỗi khi lưu phim", "error");
      }
    });
  };

 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm phim…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs gap-1.5 h-9">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Thêm phim</span>
        </Button>
      </div>
 
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-orange-500/20 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-orange-400">{editing ? "✍️ Sửa phim" : "➕ Thêm phim mới"}</h3>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Tên tiếng Việt <span className="text-red-400">*</span></label>
                <Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="Dune: Hành Tinh Cát" required className="bg-[#090a0f] border-white/5 text-sm h-9" />
              </div>
 
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Mô tả</label>
                <Textarea value={form.description} onChange={e => f("description", e.target.value)} placeholder="Nội dung phim…" className="bg-[#090a0f] border-white/5 text-sm min-h-16" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-2 block">Thể loại (chọn nhiều)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c: any) => (
                    <button type="button" key={c.id}
                      onClick={() => f("categoryIds", form.categoryIds.includes(c.id)
                        ? form.categoryIds.filter((id: number) => id !== c.id)
                        : [...form.categoryIds, c.id]
                      )}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${form.categoryIds.includes(c.id) ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-gray-400 hover:border-white/30"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Tác Giả (Author)</label>
                <select value={form.idAuthor} onChange={e => f("idAuthor", parseInt(e.target.value))} className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
                  <option value={0}>-- Không có (Chưa chọn) --</option>
                  {authors?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
 
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ảnh ngang (Landscape) <span className="text-red-400">*</span></label>
                <ImagePicker value={form.imgUrl} onChange={val => f("imgUrl", val)} aspectRatio="video" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white border-0 gap-2 h-9">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editing ? "Lưu thay đổi" : "Thêm phim"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 text-gray-400 h-9">Huỷ</Button>
          </div>
        </form>
      )}
 
      {/* Grid of movies */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginated.map((m: any) => {
            return (
              <div
                key={m.id}
                onClick={() => {
                  setPreviewMovie(m);
                  setPreviewEpisodeIndex(0);
                }}
                className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden group flex flex-col relative aspect-video shadow-xl cursor-pointer"
              >
                <div className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden">
                  {m.imgUrl ? (
                    <Image src={getBunnyImageUrl(m.imgUrl, 'original')} alt={m.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-8 h-8 text-gray-700" />
                    </div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                {/* Bottom text info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex flex-col justify-end">
                  <h4 className="text-xs font-bold text-gray-100 line-clamp-1">{m.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400 line-clamp-1">
                      {m.author ? `Tác giả: ${m.author.name}` : "Chưa có tác giả"}
                    </span>
                    {/* Category badges */}
                    <div className="flex gap-1 max-w-[100px] overflow-hidden">
                      {m.movieCategories?.slice(0, 1).map((mc: any) => (
                        <Badge key={mc.idCategory} className="bg-white/10 text-gray-300 border-0 text-[8px] px-1.5 py-0.5">{mc.category?.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions on hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMovie(m);
                      setPreviewEpisodeIndex(0);
                    }}
                    className="p-1 text-blue-400 hover:text-blue-300 rounded-md transition-colors cursor-pointer"
                    title="Xem preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(m);
                    }}
                    className="p-1 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Sửa phim"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmThenDelete(`Xoá phim "${m.name}"?`, () => deleteMovie(m.id));
                    }}
                    className="p-1 text-red-400 hover:text-red-300 rounded-md transition-colors cursor-pointer"
                    title="Xoá phim"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500 bg-[#131520] border border-white/5 rounded-2xl">
            Không tìm thấy phim nào
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border border-white/5 bg-[#0e1018] rounded-2xl">
            <p className="text-xs text-gray-500">{filtered.length} phim · trang {safePage}/{totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={safePage === 1} className="h-7 w-7 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-7 w-7 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                const pg = start + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center ${pg === safePage ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>{pg}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-7 w-7 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">›</button>
              <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="h-7 w-7 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Movie Preview Dialog */}
      <Dialog open={previewMovie !== null} onOpenChange={(open) => { if (!open) setPreviewMovie(null); }}>
        <DialogContent className="w-screen h-screen max-w-none sm:max-w-none p-0 bg-black rounded-none border-0 shadow-none ring-0 gap-0 flex items-center justify-center" showCloseButton={false}>
          {previewMovie && (() => {
            const currentIdx = filtered.findIndex((m: any) => m.id === previewMovie.id);
            const hasPrev = currentIdx > 0;
            const hasNext = currentIdx !== -1 && currentIdx < filtered.length - 1;

            return (
              <div className="w-full h-full relative flex items-center justify-center bg-black group/lightbox">
                {previewMovie.imgUrl ? (
                  <Image
                    src={getBunnyImageUrl(previewMovie.imgUrl, 'original')}
                    alt={previewMovie.name}
                    fill
                    className="object-contain select-none"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-600">
                    <Film className="w-16 h-16" />
                  </div>
                )}

                {/* Left Chevron overlay */}
                {hasPrev && (
                  <button
                    onClick={() => setPreviewMovie(filtered[currentIdx - 1])}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-orange-500 hover:scale-110 text-white rounded-full p-3 border border-white/10 transition-all cursor-pointer shadow-lg opacity-0 group-hover/lightbox:opacity-100 duration-200"
                    title="Phim trước (ArrowLeft)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Chevron overlay */}
                {hasNext && (
                  <button
                    onClick={() => setPreviewMovie(filtered[currentIdx + 1])}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-orange-500 hover:scale-110 text-white rounded-full p-3 border border-white/10 transition-all cursor-pointer shadow-lg opacity-0 group-hover/lightbox:opacity-100 duration-200"
                    title="Phim tiếp theo (ArrowRight)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Close Button overlay */}
                <button
                  onClick={() => setPreviewMovie(null)}
                  className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 transition-all cursor-pointer shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Bottom title & index overlay */}
                {currentIdx !== -1 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-40 text-white flex flex-col justify-end pt-12 opacity-0 group-hover/lightbox:opacity-100 transition-opacity duration-200">
                    <div className="flex justify-between items-center max-w-4xl mx-auto w-full px-4">
                      <span className="text-sm md:text-base font-bold truncate pr-4 text-shadow-md">{previewMovie.name}</span>
                      <span className="text-xs md:text-sm font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 whitespace-nowrap">
                        {currentIdx + 1} / {filtered.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CATEGORIES TAB
// ═══════════════════════════════════════════════════════════════════════
function CategoriesTab({ categories, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = categories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCategory(editing!, form);
        } else {
          await createCategory(form);
        }
        await onRefresh();
        setForm({ name: "", description: "" });
        setEditing(null);
        show(isEdit ? "Đã cập nhật thể loại!" : "Đã thêm thể loại!");
      } catch { show("Lỗi khi lưu thể loại", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa thể loại" : "➕ Thêm thể loại"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên thể loại <span className="text-red-400">*</span></label>
            <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mô tả</label>
            <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="bg-[#090a0f] border-white/5 text-sm min-h-[80px]" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && (
              <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ name: "", description: "" }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm thể loại…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-[#0e1018]">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Tên</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Mô tả</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 group">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">#{c.id}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-200">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 line-clamp-1">{c.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(c.id); setForm({ name: c.name, description: c.description ?? "" }); }} className="h-7 border-white/10 text-gray-300 px-2 gap-1">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => confirmThenDelete(`Xoá thể loại "${c.name}"?`, () => deleteCategory(c.id))} className="h-7 border-red-500/20 text-red-400 hover:bg-red-500/10 px-2">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EPISODES TAB
// ═══════════════════════════════════════════════════════════════════════
function EpisodesTab({ episodes, movies, actors, characters, plans = [], search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", banner: "" as string | File | null, url: "", idMovie: 0, idPlan: 0, duration: 0, bunnyVideoId: "", bunnyStatus: "", actorIds: [] as number[], characterIds: [] as number[] });
  const durationHours = Math.floor((form.duration || 0) / 3600);
  const durationMinutes = Math.floor(((form.duration || 0) % 3600) / 60);
  const durationSeconds = (form.duration || 0) % 60;

  const handleDurationChange = (type: "h" | "m" | "s", val: number) => {
    let h = durationHours;
    let m = durationMinutes;
    let s = durationSeconds;

    if (type === "h") h = val;
    if (type === "m") m = val;
    if (type === "s") s = val;

    const total = (h * 3600) + (m * 60) + s;
    setForm(prev => ({ ...prev, duration: total }));
  };

  const [editing, setEditing] = useState<number | null>(null);
  const [filterMovie, setFilterMovie] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);

  // Upload States
  const [uploadMode, setUploadMode] = useState<"url" | "bunny">("url");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [tusUpload, setTusUpload] = useState<any>(null);

  const filtered = episodes.filter((ep: any) => {
    const matchSearch = (ep.url?.toLowerCase() || "").includes(search.toLowerCase()) || 
                        (ep.bunnyVideoId?.toLowerCase() || "").includes(search.toLowerCase()) || 
                        ep.movie?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterMovie === 0 || ep.idMovie === filterMovie;
    return matchSearch && matchFilter;
  });

  const cancelUpload = () => {
    if (tusUpload) {
      tusUpload.abort();
      setTusUpload(null);
    }
    setUploading(false);
    setUploadProgress(null);
    setUploadStatusMsg("Đã hủy tải lên.");
    setUploadFile(null);
  };

  const handleUploadToBunny = async () => {
    if (!uploadFile) {
      show("Vui lòng chọn file video trước", "error");
      return;
    }
    if (form.idMovie === 0) {
      show("Vui lòng chọn phim trước khi upload", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatusMsg("Đang chuẩn bị video...");

    try {
      const selectedMovie = movies.find((m: any) => m.id === form.idMovie);
      const movieName = selectedMovie ? selectedMovie.name : "Movie";
      const videoTitle = `${movieName} - ${form.name || "Tập mới"} (${uploadFile.name})`;

      // 1. Server action: create video and get upload signature
      const uploadParams = await prepareBunnyUpload(videoTitle);
      const { libraryId, videoId, signature, expirationTime } = uploadParams;

      setUploadStatusMsg("Đang kết nối Bunny TUS...");

      // 2. Start TUS upload
      const upload = new tus.Upload(uploadFile, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expirationTime.toString(),
          VideoId: videoId,
          LibraryId: libraryId,
        },
        metadata: {
          filetype: uploadFile.type,
          title: videoTitle,
        },
        onError: function (error) {
          console.error("TUS upload error:", error);
          setUploading(false);
          setUploadProgress(null);
          setUploadStatusMsg("Lỗi tải lên: " + error.message);
          show("Lỗi khi tải video lên Bunny", "error");
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percent = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploadProgress(percent);
          setUploadStatusMsg(`Đang tải lên: ${percent}%`);
        },
        onSuccess: function () {
          setUploading(false);
          setUploadProgress(100);
          setUploadStatusMsg("Tải lên hoàn tất! Video đang được encode...");
          setForm(prev => ({
            ...prev,
            bunnyVideoId: videoId,
            bunnyStatus: "processing",
            url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
          }));
          show("Tải video lên Bunny thành công!");
        },
      });

      setTusUpload(upload);
      upload.start();
    } catch (err: any) {
      console.error(err);
      setUploading(false);
      setUploadProgress(null);
      setUploadStatusMsg("Lỗi: " + err.message);
      show(err.message || "Lỗi khi khởi tạo upload", "error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    if (uploadMode === "bunny" && !form.bunnyVideoId) {
      show("Vui lòng chọn và upload video lên Bunny trước", "error");
      return;
    }

    startTransition(async () => {
      try {
        let finalBanner = form.banner;
        if (form.banner instanceof File) {
          const safeName = cleanFolderName(form.name || "tap");
          const uniqueId = Math.random().toString(36).substring(2, 8);
          const extension = form.banner.name.substring(form.banner.name.lastIndexOf(".") + 1) || "webp";
          finalBanner = await uploadFileToBunny(form.banner, "episodes", `episodes/${safeName}_${uniqueId}.${extension}`);
        }

        if (isEdit) {
          await updateEpisode(editing, { 
            name: form.name || "",
            banner: (finalBanner as string) || undefined,
            url: form.url || undefined, 
            idPlan: form.idPlan || null,
            duration: form.duration || 0,
            bunnyVideoId: form.bunnyVideoId || undefined,
            bunnyStatus: form.bunnyStatus || undefined,
            actorIds: form.actorIds,
            characterIds: form.characterIds
          });
        } else {
          await createEpisode({
            name: form.name || "",
            banner: (finalBanner as string) || undefined,
            url: form.url || undefined,
            idMovie: form.idMovie,
            idPlan: form.idPlan || null,
            duration: form.duration || 0,
            bunnyVideoId: form.bunnyVideoId || undefined,
            bunnyStatus: form.bunnyStatus || undefined,
            actorIds: form.actorIds,
            characterIds: form.characterIds
          });
        }
        await onRefresh();
        setForm({ name: "", banner: "", url: "", idMovie: 0, idPlan: 0, duration: 0, bunnyVideoId: "", bunnyStatus: "", actorIds: [], characterIds: [] });
        setUploadFile(null);
        setUploadProgress(null);
        setUploadStatusMsg("");
        setEditing(null);
        setShowForm(false);
        show(editing !== null ? "Đã cập nhật tập phim!" : "Đã thêm tập phim!");
      } catch (err: any) { 
        show(err?.message || "Lỗi khi lưu tập phim", "error"); 
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {showForm && (
        <div className="lg:col-span-1 animate-in slide-in-from-left duration-200">
          <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa tập phim" : "➕ Thêm tập phim"}</h3>
          {!editing && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Chọn phim <span className="text-red-400">*</span></label>
              <select value={form.idMovie} onChange={e => setForm(p => ({ ...p, idMovie: parseInt(e.target.value) }))} required className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
                <option value={0}>-- Chọn phim --</option>
                {movies.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên tập phim <span className="text-red-400">*</span></label>
            <Input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ví dụ: Tập 1, Tập đặc biệt..." className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Banner tập phim (Landscape)</label>
            <ImagePicker value={form.banner} onChange={val => setForm(p => ({ ...p, banner: val }))} aspectRatio="video" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Yêu cầu Gói xem (Plan)</label>
            <select value={form.idPlan} onChange={e => setForm(p => ({ ...p, idPlan: parseInt(e.target.value) }))} className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
              <option value={0}>-- Miễn phí --</option>
              {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Cấp {p.level})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Thời lượng tập phim</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={durationHours || ""}
                  onChange={e => handleDurationChange("h", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-[#090a0f] border-white/5 text-sm h-9 pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-500 font-bold uppercase">h</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMinutes || ""}
                  onChange={e => handleDurationChange("m", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-[#090a0f] border-white/5 text-sm h-9 pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-500 font-bold uppercase">m</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={durationSeconds || ""}
                  onChange={e => handleDurationChange("s", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-[#090a0f] border-white/5 text-sm h-9 pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-500 font-bold uppercase">s</span>
              </div>
            </div>
            {form.duration > 0 && (
              <p className="text-[10px] text-orange-400/80 mt-1.5 flex items-center gap-1 font-medium">
                ⏱️ Tổng cộng: {durationHours > 0 ? `${durationHours} giờ ` : ""}{durationMinutes > 0 ? `${durationMinutes} phút ` : ""}{durationSeconds > 0 ? `${durationSeconds} giây` : ""} ({form.duration} giây)
              </p>
            )}
          </div>

          <div className="flex bg-[#090a0f] rounded-lg p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`flex-1 text-center text-xs font-bold py-1.5 rounded transition-all cursor-pointer ${
                uploadMode === "url" ? "bg-orange-500 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Nhập URL
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("bunny")}
              className={`flex-1 text-center text-xs font-bold py-1.5 rounded transition-all cursor-pointer ${
                uploadMode === "bunny" ? "bg-orange-500 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Bunny Stream (TUS)
            </button>
          </div>

          {uploadMode === "url" ? (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">URL Video <span className="text-red-400">*</span></label>
              <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…mp4" required={uploadMode === "url"} className="bg-[#090a0f] border-white/5 text-sm h-9" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Chọn video file <span className="text-red-400">*</span></label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setUploadFile(file);
                    if (file) {
                      setForm(p => ({ ...p, bunnyVideoId: "", bunnyStatus: "uploading", url: "" }));
                    }
                  }}
                  disabled={uploading}
                  className="w-full text-xs text-gray-455 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 file:cursor-pointer"
                />
              </div>

              {uploadFile && !form.bunnyVideoId && (
                <Button
                  type="button"
                  onClick={handleUploadToBunny}
                  disabled={uploading || form.idMovie === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                >
                  {uploading ? "Đang upload..." : "Bắt đầu tải lên Bunny"}
                </Button>
              )}

              {uploadStatusMsg && (
                <div className="text-xs text-gray-400 bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <p className="font-semibold text-gray-300">{uploadStatusMsg}</p>
                  {uploadProgress !== null && (
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {uploading && (
                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="text-[10px] text-red-400 hover:underline mt-2 block"
                    >
                      Hủy upload
                    </button>
                  )}
                </div>
              )}

              {form.bunnyVideoId && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 text-xs text-green-400 space-y-1">
                  <p className="font-bold">✓ Đã liên kết Bunny Video</p>
                  <p className="font-mono text-[10px] text-gray-400 truncate">ID: {form.bunnyVideoId}</p>
                  <p className="text-[10px] text-gray-500 capitalize">Trạng thái transcode: {form.bunnyStatus}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Diễn viên (chọn nhiều)</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#090a0f] border border-white/5 rounded-lg">
              {actors.map((a: any) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setForm(p => ({
                    ...p,
                    actorIds: p.actorIds.includes(a.id)
                      ? p.actorIds.filter(id => id !== a.id)
                      : [...p.actorIds, a.id]
                  }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    form.actorIds.includes(a.id)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {a.name}
                </button>
              ))}
              {actors.length === 0 && <span className="text-xs text-gray-500 p-1">Không có diễn viên nào</span>}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Nhân vật (chọn nhiều)</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#090a0f] border border-white/5 rounded-lg">
              {characters.map((c: any) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setForm(p => ({
                    ...p,
                    characterIds: p.characterIds.includes(c.id)
                      ? p.characterIds.filter(id => id !== c.id)
                      : [...p.characterIds, c.id]
                  }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    form.characterIds.includes(c.id)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {c.name}
                </button>
              ))}
              {characters.length === 0 && <span className="text-xs text-gray-500 p-1">Không có nhân vật nào</span>}
            </div>
          </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending || uploading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {editing !== null ? "Lưu" : "Thêm"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { 
                setEditing(null); 
                setForm({ name: "", banner: "", url: "", idMovie: 0, idPlan: 0, duration: 0, bunnyVideoId: "", bunnyStatus: "", actorIds: [], characterIds: [] }); 
                setUploadProgress(null); 
                setUploadStatusMsg(""); 
                setUploadFile(null); 
                setShowForm(false); 
              }} className="border-white/10 text-gray-400 h-9 text-xs">
                {editing !== null ? "Huỷ" : "Đóng"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input placeholder="Tìm tập phim…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
          </div>
          <select value={filterMovie} onChange={e => setFilterMovie(parseInt(e.target.value))} className="bg-[#131520] border border-white/5 rounded-lg h-9 px-3 text-xs text-gray-300">
            <option value={0}>Tất cả phim</option>
            {movies.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {!showForm && (
            <Button 
              type="button" 
              onClick={() => setShowForm(true)} 
              className="bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1.5 shrink-0 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm tập phim
            </Button>
          )}
        </div>
        <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-[#0e1018]">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Phim</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Tập</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Nguồn / Trạng thái</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ep: any) => (
                <tr key={ep.id} className="border-b border-white/5 hover:bg-white/2 group">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">#{ep.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-300 font-medium">{ep.movie?.name ?? ep.idMovie}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ep.banner ? (
                        <div className="relative w-16 h-9 rounded overflow-hidden border border-white/10 bg-black flex-shrink-0">
                          <img
                            src={getBunnyImageUrl(ep.banner, 'thumb')}
                            alt={ep.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-9 rounded bg-[#090a0f] border border-white/5 flex items-center justify-center text-gray-600 text-[10px] flex-shrink-0 font-medium">
                          Không ảnh
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-orange-500/10 text-orange-400 border-0 text-xs w-fit">{ep.name || `Tập #${ep.id}`}</Badge>
                        {ep.plan && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[9px] px-1.5 py-0 h-4 w-fit">
                            {ep.plan.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-mono">
                    {ep.bunnyVideoId ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[9px] px-1.5 py-0 h-4">Bunny Stream</Badge>
                          {ep.bunnyStatus === "completed" && (
                            <Badge className="bg-green-500/10 text-green-400 border-0 text-[9px] px-1.5 py-0 h-4">Hoàn thành ✅</Badge>
                          )}
                          {ep.bunnyStatus === "processing" && (
                            <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[9px] px-1.5 py-0 h-4 animate-pulse">Đang encode ⏳</Badge>
                          )}
                          {ep.bunnyStatus === "uploading" && (
                            <Badge className="bg-gray-500/10 text-gray-400 border-0 text-[9px] px-1.5 py-0 h-4 animate-pulse">Đang upload ⏳</Badge>
                          )}
                          {ep.bunnyStatus === "failed" && (
                            <Badge className="bg-red-500/10 text-red-400 border-0 text-[9px] px-1.5 py-0 h-4">Lỗi ❌</Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-600 truncate max-w-[200px] block mt-0.5">ID: {ep.bunnyVideoId}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-purple-500/10 text-purple-400 border-0 text-[9px] px-1.5 py-0 h-4 w-fit">URL Trực tiếp</Badge>
                        <span className="text-[10px] text-gray-500 truncate max-w-[200px] block mt-0.5">{ep.url}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" onClick={() => { 
                        setEditing(ep.id); 
                        setForm({
                          name: ep.name || "",
                          banner: ep.banner || "",
                          url: ep.url || "",
                          idMovie: ep.idMovie,
                          idPlan: ep.idPlan || 0,
                          duration: ep.duration || 0,
                          bunnyVideoId: ep.bunnyVideoId || "",
                          bunnyStatus: ep.bunnyStatus || "",
                          actorIds: ep.episodesActors?.map((ea: any) => ea.idActor) || [],
                          characterIds: ep.episodesCharacters?.map((ec: any) => ec.idCharacter) || []
                        }); 
                        setUploadMode(ep.bunnyVideoId ? "bunny" : "url");
                        setUploadFile(null);
                        setUploadProgress(null);
                        setUploadStatusMsg("");
                        setShowForm(true);
                      }} className="h-7 border-white/10 text-gray-300 px-2">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => confirmThenDelete(`Xoá tập ${ep.name || ep.id}?`, () => deleteEpisode(ep.id))} className="h-7 border-red-500/20 text-red-400 hover:bg-red-500/10 px-2">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500">Không có tập phim nào</div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ACTORS TAB
// ═══════════════════════════════════════════════════════════════════════
function ActorsTab({ actors, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", imgUrl: "" as string | File | null, description: "" });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = actors.filter((a: any) => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        let finalImgUrl = form.imgUrl;
        if (form.imgUrl instanceof File) {
          const safeName = cleanFolderName(form.name);
          const uniqueId = Math.random().toString(36).substring(2, 8);
          const extension = form.imgUrl.name.substring(form.imgUrl.name.lastIndexOf(".") + 1) || "webp";
          finalImgUrl = await uploadFileToBunny(form.imgUrl, "actors", `actors/${safeName}_${uniqueId}.${extension}`);
        }
        const submitData = { ...form, imgUrl: (finalImgUrl as string) || "" };

        if (isEdit) { await updateActor(editing!, submitData); }
        else { await createActor(submitData); }
        await onRefresh();
        setForm({ name: "", imgUrl: "", description: "" }); setEditing(null);
        show(isEdit ? "Đã cập nhật diễn viên!" : "Đã thêm diễn viên!");
      } catch { show("Lỗi khi lưu diễn viên", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa diễn viên" : "➕ Thêm diễn viên"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Họ tên <span className="text-red-400">*</span></label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ảnh đại diện</label>
            <ImagePicker value={form.imgUrl} onChange={val => setForm(p => ({ ...p, imgUrl: val }))} aspectRatio="square" className="w-24 h-24 rounded-full mx-auto" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Giới thiệu</label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-[#090a0f] border-white/5 text-sm min-h-[80px]" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ name: "", imgUrl: "", description: "" }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm diễn viên…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((a: any) => (
            <div key={a.id} className="bg-[#131520] border border-white/5 rounded-xl p-4 flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full bg-[#090a0f] border border-white/10 flex-shrink-0 overflow-hidden">
                {a.imgUrl ? <Image src={getBunnyImageUrl(a.imgUrl, 'thumb')} alt={a.name} fill className="object-cover" sizes="40px" /> : <User className="w-5 h-5 text-gray-600 absolute inset-0 m-auto" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-200 line-clamp-1">{a.name}</p>
                <p className="text-[10px] text-gray-500 line-clamp-1">{a.description || "—"}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(a.id); setForm({ name: a.name, imgUrl: a.imgUrl ?? "", description: a.description ?? "" }); }} className="text-gray-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => confirmThenDelete(`Xoá diễn viên "${a.name}"?`, () => deleteActor(a.id))} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500 bg-[#131520] border border-white/5 rounded-2xl">Không tìm thấy diễn viên nào</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CHARACTER LIGHTBOX — Zoom slider + Pan/Drag
// ═══════════════════════════════════════════════════════════════════════
function CharacterLightbox({ characters, activeIndex, onClose, onPrev, onNext }: {
  characters: any[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [zoom, setZoom] = React.useState(1);
  const [panX, setPanX] = React.useState(0);
  const [panY, setPanY] = React.useState(0);
  const [dragOffsetX, setDragOffsetX] = React.useState(0);
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const character = characters[activeIndex];

  // Reset zoom/pan when image changes
  React.useEffect(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setDragOffsetX(0);
  }, [activeIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { onNext(); }
      else if (e.key === "ArrowLeft") { onPrev(); }
      else if (e.key === "Escape") { onClose(); }
      else if (e.key === "+" || e.key === "=") { setZoom(z => Math.min(5, +(z + 0.25).toFixed(2))); }
      else if (e.key === "-") { setZoom(z => { const nz = Math.max(1, +(z - 0.25).toFixed(2)); if (nz === 1) { setPanX(0); setPanY(0); } return nz; }); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  const clampPan = (z: number, nx: number, ny: number) => {
    if (!containerRef.current) return { nx, ny };
    const el = containerRef.current;
    const maxX = (el.clientWidth * (z - 1)) / 2;
    const maxY = (el.clientHeight * (z - 1)) / 2;
    return {
      nx: Math.max(-maxX, Math.min(maxX, nx)),
      ny: Math.max(-maxY, Math.min(maxY, ny)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 100) {
        onPrev();
      } else if (dragOffsetX < -100) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    isDragging.current = true;
    dragStart.current = { x: t.clientX, y: t.clientY, panX, panY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 80) {
        onPrev();
      } else if (dragOffsetX < -80) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom === 1) { setPanX(0); setPanY(0); }
    else {
      const { nx, ny } = clampPan(newZoom, panX, panY);
      setPanX(nx);
      setPanY(ny);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const STEP = 0.15;
    setZoom(prev => {
      const next = e.deltaY < 0
        ? Math.min(5, +(prev + STEP).toFixed(2))
        : Math.max(1, +(prev - STEP).toFixed(2));
      if (next === 1) { setPanX(0); setPanY(0); }
      else {
        const { nx, ny } = clampPan(next, panX, panY);
        setPanX(nx);
        setPanY(ny);
      }
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm select-none animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 shadow-2xl"
        title="Đóng (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Left nav */}
      {characters.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Nhân vật trước (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right nav */}
      {characters.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Nhân vật sau (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Controls bar - fixed at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 lg:px-6 py-3 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-2xl lg:max-w-4xl mx-auto flex items-center gap-4 bg-[#131520]/95 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3 shadow-2xl">
          {/* Zoom controls */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => handleZoomChange(Math.max(1, +(zoom - 0.25).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0"
              title="Thu nhỏ (-)"
            >−</button>
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="range"
                min={1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full accent-orange-500 cursor-pointer"
                style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) 100%)` }}
              />
              <div className="text-center text-[10px] text-orange-400 font-bold tabular-nums">{zoom.toFixed(2)}×</div>
            </div>
            <button
              onClick={() => handleZoomChange(Math.min(5, +(zoom + 0.25).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0"
              title="Phóng to (+)"
            >+</button>
            <button
              onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
              className="text-[10px] text-gray-500 hover:text-white transition-colors flex-shrink-0 border border-white/10 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
              title="Reset zoom"
            >Reset</button>
          </div>

          <div className="w-px h-10 bg-white/10 flex-shrink-0" />

          {/* Character info */}
          <div className="text-right min-w-0">
            <p className="text-xs font-bold text-white truncate">{character.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{activeIndex + 1} / {characters.length}</p>
          </div>
        </div>
      </div>

      {/* Image viewport - fills screen above controls bar */}
      <div
        className="absolute inset-0 bottom-[88px] px-4 lg:px-6 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full h-full ${
            characters.length >= 3
              ? "grid grid-cols-1 md:grid-cols-3 gap-4"
              : "flex items-center justify-center"
          }`}
        >
          {/* Left Character (Previous) - only on desktop if >= 3 characters */}
          {characters.length >= 3 && (
            <div
              onClick={onPrev}
              className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-80 transition-all duration-300 group/side overflow-hidden"
            >
              <img
                src={getBunnyImageUrl(characters[(activeIndex - 1 + characters.length) % characters.length].imgUrl, 'original')}
                alt={characters[(activeIndex - 1 + characters.length) % characters.length].name}
                className="absolute inset-0 w-full h-full object-contain p-3"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center">
                <ChevronLeft className="w-8 h-8 text-white/40" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-2 bg-black/50 backdrop-blur-sm border border-white/5 rounded-xl text-center">
                <p className="text-[11px] font-bold text-gray-300 truncate">
                  {characters[(activeIndex - 1 + characters.length) % characters.length].name}
                </p>
              </div>
            </div>
          )}

          {/* Active Character (Center) */}
          <div
            ref={containerRef}
            className="relative rounded-xl bg-[#090a0f]/60 border border-white/10 overflow-hidden"
            style={{
              cursor: isDragging.current ? "grabbing" : "grab",
              ...(characters.length < 3 ? { flex: "1", maxWidth: "42rem" } : {}),
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              key={activeIndex}
              className="absolute inset-0 flex items-center justify-center animate-char-spin"
            >
              <img
                src={getBunnyImageUrl(character.imgUrl, 'original')}
                alt={character.name}
                draggable={false}
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                  userSelect: "none",
                  display: "block",
                  transform: zoom > 1
                    ? `translate(${panX}px, ${panY}px) scale(${zoom})`
                    : `translate(${dragOffsetX}px, 0px) scale(1)`,
                  transformOrigin: "center center",
                  transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
            {zoom === 1 && (
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded-full border border-white/5 pointer-events-none">
                Kéo ảnh để chuyển tiếp · Lăn chuột để zoom
              </div>
            )}
            {zoom > 1 && (
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-black/60 px-2 py-1 rounded-full border border-white/10 pointer-events-none backdrop-blur-md">
                ✋ Giữ &amp; kéo để di chuyển
              </div>
            )}
          </div>

          {/* Right Character (Next) - only on desktop if >= 3 characters */}
          {characters.length >= 3 && (
            <div
              onClick={onNext}
              className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-80 transition-all duration-300 group/side overflow-hidden"
            >
              <img
                src={getBunnyImageUrl(characters[(activeIndex + 1) % characters.length].imgUrl, 'original')}
                alt={characters[(activeIndex + 1) % characters.length].name}
                className="absolute inset-0 w-full h-full object-contain p-3"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center">
                <ChevronRight className="w-8 h-8 text-white/40" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-2 bg-black/50 backdrop-blur-sm border border-white/5 rounded-xl text-center">
                <p className="text-[11px] font-bold text-gray-300 truncate">
                  {characters[(activeIndex + 1) % characters.length].name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// CHARACTERS TAB
// ═══════════════════════════════════════════════════════════════════════
function CharactersTab({ characters, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", imgUrl: "" as string | File | null, description: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = characters.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
  const charactersWithImages = filtered.filter((c: any) => !!c.imgUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        let finalImgUrl = form.imgUrl;
        if (form.imgUrl instanceof File) {
          const safeName = cleanFolderName(form.name);
          const uniqueId = Math.random().toString(36).substring(2, 8);
          const extension = form.imgUrl.name.substring(form.imgUrl.name.lastIndexOf(".") + 1) || "webp";
          const customPath = `characters/${safeName}_${uniqueId}.${extension}`;
          finalImgUrl = await uploadFileToBunny(form.imgUrl, "characters", customPath);
        }
        const submitData = { ...form, imgUrl: (finalImgUrl as string) || "" };

        if (isEdit) { await updateCharacter(editing!, submitData); }
        else { await createCharacter(submitData); }
        await onRefresh();
        setForm({ name: "", imgUrl: "", description: "" });
        setEditing(null);
        setIsFormOpen(false);
        show(isEdit ? "Đã cập nhật nhân vật!" : "Đã thêm nhân vật!");
      } catch { show("Lỗi khi lưu nhân vật", "error"); }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar: Search and Add button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131520] border border-white/5 rounded-2xl p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm nhân vật…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#090a0f] border-white/5 text-sm h-9 w-full" />
        </div>
        <Button
          onClick={() => { setEditing(null); setForm({ name: "", imgUrl: "", description: "" }); setIsFormOpen(true); }}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-9 text-xs px-4 rounded-xl shadow-lg border-0 gap-1.5 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân vật
        </Button>
      </div>

      {/* Grid of characters */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden group flex flex-col relative aspect-[2/3] shadow-xl">
              <div
                onClick={() => {
                  if (c.imgUrl) {
                    const imgIndex = charactersWithImages.findIndex((char: any) => char.id === c.id);
                    if (imgIndex !== -1) setActivePreviewIndex(imgIndex);
                  }
                }}
                className={`absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden ${c.imgUrl ? "cursor-pointer" : ""}`}
              >
                {c.imgUrl ? (
                  <Image src={getBunnyImageUrl(c.imgUrl, 'original')} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-w-768px) 50vw, 25vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-700" />
                  </div>
                )}
                {c.imgUrl && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg">Phóng to 🔍</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/25 backdrop-blur-[3px] border-t border-white/5 z-10 flex flex-col justify-between min-h-[70px]">
                <div>
                  <h4 className="text-xs font-bold text-gray-100 line-clamp-1">{c.name}</h4>
                  <p className="text-[10px] text-gray-300 line-clamp-2 mt-1">{c.description || "Chưa có giới thiệu."}</p>
                </div>
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg z-20">
                <button
                  onClick={() => { setEditing(c.id); setForm({ name: c.name, imgUrl: c.imgUrl ?? "", description: c.description ?? "" }); setIsFormOpen(true); }}
                  className="p-1 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Sửa nhân vật"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => confirmThenDelete(`Xoá nhân vật "${c.name}"?`, () => deleteCharacter(c.id))}
                  className="p-1 text-red-400 hover:text-red-300 rounded-md transition-colors cursor-pointer"
                  title="Xoá nhân vật"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500 bg-[#131520] border border-white/5 rounded-2xl">
            Không tìm thấy nhân vật nào
          </div>
        )}
      </div>

      {/* Add / Edit Character Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditing(null); setForm({ name: "", imgUrl: "", description: "" }); } }}>
        <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-md p-6 text-gray-100 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-white mb-2">{editing !== null ? "✏️ Sửa nhân vật" : "➕ Thêm nhân vật"}</h3>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tên nhân vật <span className="text-red-400">*</span></label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Ảnh đại diện (Đứng)</label>
              <ImagePicker value={form.imgUrl} onChange={val => setForm(p => ({ ...p, imgUrl: val }))} aspectRatio="portrait" className="w-32 h-48 rounded-xl mx-auto" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Giới thiệu</label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-[#090a0f] border-white/5 text-sm min-h-[80px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1 cursor-pointer font-bold">
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {editing !== null ? "Lưu thay đổi" : "Thêm nhân vật"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditing(null); setForm({ name: "", imgUrl: "", description: "" }); }} className="border-white/10 text-gray-400 h-9 text-xs cursor-pointer">Huỷ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {activePreviewIndex !== null && charactersWithImages[activePreviewIndex] && (
        <CharacterLightbox
          characters={charactersWithImages}
          activeIndex={activePreviewIndex}
          onClose={() => setActivePreviewIndex(null)}
          onPrev={() => setActivePreviewIndex(prev => prev !== null ? (prev - 1 + charactersWithImages.length) % charactersWithImages.length : null)}
          onNext={() => setActivePreviewIndex(prev => prev !== null ? (prev + 1) % charactersWithImages.length : null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PLANS TAB
// ═══════════════════════════════════════════════════════════════════════
function PlansTab({ plans, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ level: 0, name: "", priceMonth: 0 });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = plans.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.level.toString().includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        if (isEdit) { await updatePlan(editing!, form); }
        else { await createPlan(form); }
        await onRefresh();
        setForm({ level: 0, name: "", priceMonth: 0 }); setEditing(null);
        show(isEdit ? "Đã cập nhật gói cước!" : "Đã thêm gói cước!");
      } catch { show("Lỗi khi lưu gói cước", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa gói cước" : "➕ Thêm gói cước"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cấp độ (level) <span className="text-red-400">*</span></label>
            <Input type="number" min="0" value={form.level} onChange={e => setForm(p => ({ ...p, level: parseInt(e.target.value) || 0 }))} placeholder="vd: 0 (Miễn phí), 1 (VIP)..." required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên gói <span className="text-red-400">*</span></label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Giá / tháng (VNĐ)</label>
            <Input type="number" min="0" value={form.priceMonth} onChange={e => setForm(p => ({ ...p, priceMonth: parseFloat(e.target.value) }))} className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ level: 0, name: "", priceMonth: 0 }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm gói cước…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p: any) => (
            <div key={p.id} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-3 group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest">Cấp độ {p.level}</span>
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(p.id); setForm({ level: p.level, name: p.name, priceMonth: parseFloat(p.priceMonth ?? 0) }); }} className="text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => confirmThenDelete(`Xoá gói "${p.name}"?`, () => deletePlan(p.id))} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{parseFloat(p.priceMonth || 0).toLocaleString("vi-VN")} <span className="text-sm text-gray-400 font-normal">₫/tháng</span></p>
              {p.features && p.features.length > 0 && (
                <div className="space-y-1">
                  {p.features.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-2 text-xs">
                      {f.available ? <Check className="w-3.5 h-3.5 text-green-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                      <span className={f.available ? "text-gray-300" : "text-gray-600 line-through"}>{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FEATURES TAB
// ═══════════════════════════════════════════════════════════════════════
function FeaturesTab({ features, plans, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ idPlan: 0, name: "", available: true });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = features.filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        if (isEdit) { await updateFeature(editing!, form); }
        else { await createFeature(form); }
        await onRefresh();
        setForm({ idPlan: 0, name: "", available: true }); setEditing(null);
        show(isEdit ? "Đã cập nhật tính năng!" : "Đã thêm tính năng!");
      } catch { show("Lỗi khi lưu tính năng", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa tính năng" : "➕ Thêm tính năng"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Chọn Gói Cước <span className="text-red-400">*</span></label>
            <select value={form.idPlan} onChange={e => setForm(p => ({ ...p, idPlan: parseInt(e.target.value) }))} required className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
              <option value={0}>-- Chọn gói cước --</option>
              {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên tính năng <span className="text-red-400">*</span></label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="available" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} className="rounded border-white/10 bg-[#090a0f]" />
            <label htmlFor="available" className="text-sm text-gray-300">Khả dụng (Có dấu tick xanh)</label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending || form.idPlan === 0} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ idPlan: 0, name: "", available: true }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm tính năng…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Gói Cước</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Tên Tính Năng</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Trạng Thái</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f: any) => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/2 group">
                  <td className="px-4 py-3 text-xs text-orange-400 font-bold">{f.plan?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{f.name}</td>
                  <td className="px-4 py-3">
                    {f.available ? <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full font-bold">Khả dụng</span> : <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full font-bold">Không khả dụng</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(f.id); setForm({ idPlan: f.idPlan, name: f.name, available: f.available }); }} className="text-gray-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => confirmThenDelete(`Xoá tính năng "${f.name}"?`, () => deleteFeature(f.id))} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500">Không tìm thấy tính năng nào</div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PACKAGES TAB
// ═══════════════════════════════════════════════════════════════════════
function PackagesTab({ packages, plans, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ idPlan: 0, time: 1, discount: 0 });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = packages.filter((p: any) => p.plan?.name?.toLowerCase().includes(search.toLowerCase()) || p.time.toString().includes(search));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        if (isEdit) { await updatePackage(editing!, form); }
        else { await createPackage(form); }
        await onRefresh();
        setForm({ idPlan: 0, time: 1, discount: 0 }); setEditing(null);
        show(isEdit ? "Đã cập nhật tùy chọn gói!" : "Đã thêm tùy chọn gói!");
      } catch { show("Lỗi khi lưu tùy chọn gói", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa thời hạn gói" : "➕ Thêm thời hạn gói"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Chọn Gói Cước <span className="text-red-400">*</span></label>
            <select value={form.idPlan} onChange={e => setForm(p => ({ ...p, idPlan: parseInt(e.target.value) }))} required className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
              <option value={0}>-- Chọn gói cước --</option>
              {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Thời hạn (Tháng) <span className="text-red-400">*</span></label>
            <Input type="number" min="1" value={form.time} onChange={e => setForm(p => ({ ...p, time: parseInt(e.target.value) }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">% Giảm giá (nếu có)</label>
            <Input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: parseFloat(e.target.value) }))} className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending || form.idPlan === 0} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ idPlan: 0, time: 1, discount: 0 }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm theo gói cước hoặc số tháng…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p: any) => (
            <div key={p.id} className="bg-[#131520] border border-white/5 rounded-2xl p-4 flex justify-between items-center group">
              <div>
                <p className="text-xs font-bold text-orange-400 mb-1">{p.plan?.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-white">{p.time} <span className="text-sm font-medium text-gray-500">tháng</span></span>
                  {p.discount && parseFloat(p.discount) > 0 ? (
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md mb-1">-{parseFloat(p.discount)}%</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(p.id); setForm({ idPlan: p.idPlan, time: p.time, discount: parseFloat(p.discount || 0) }); }} className="text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => confirmThenDelete(`Xoá tuỳ chọn ${p.time} tháng của gói ${p.plan?.name}?`, () => deletePackage(p.id))} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500">Không tìm thấy tuỳ chọn nào</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AUTHORS TAB
// ═══════════════════════════════════════════════════════════════════════
function AuthorsTab({ authors, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState<number | null>(null);

  const filtered = authors.filter((a: any) => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;
    startTransition(async () => {
      try {
        if (isEdit) { await updateAuthor(editing!, form); }
        else { await createAuthor(form); }
        await onRefresh();
        setForm({ name: "", description: "" }); setEditing(null);
        show(isEdit ? "Đã cập nhật tác giả!" : "Đã thêm tác giả!");
      } catch { show("Lỗi khi lưu tác giả", "error"); }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing !== null ? "✏️ Sửa tác giả" : "➕ Thêm tác giả"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên tác giả <span className="text-red-400">*</span></label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Giới thiệu</label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-[#090a0f] border-white/5 text-sm min-h-[80px]" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing !== null ? "Lưu" : "Thêm"}
            </Button>
            {editing !== null && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ name: "", description: "" }); }} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm tác giả…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-[#0e1018]">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Tên</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Mô tả</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 group">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">#{a.id}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-200">{a.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 line-clamp-1">{a.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(a.id); setForm({ name: a.name, description: a.description ?? "" }); }} className="h-7 border-white/10 text-gray-300 px-2"><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => confirmThenDelete(`Xoá tác giả "${a.name}"?`, () => deleteAuthor(a.id))} className="h-7 border-red-500/20 text-red-400 hover:bg-red-500/10 px-2"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ACCOUNTS TAB
// ═══════════════════════════════════════════════════════════════════════
function AccountsTab({ accounts, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const filtered = accounts.filter((a: any) =>
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <Input placeholder="Tìm tài khoản…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
      </div>
      <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-[#0e1018]">
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Username</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Role</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 group">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">#{a.id}</td>
                <td className="px-4 py-3 text-xs font-bold text-gray-200">{a.username}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{a.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={a.role}
                    onChange={e => startTransition(async () => { await updateAccountRole(a.id, e.target.value); await onRefresh(); show("Đã cập nhật role!"); })}
                    className="bg-[#090a0f] border border-white/5 rounded-lg h-7 px-2 text-xs text-gray-200"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="outline" onClick={() => confirmThenDelete(`Xoá tài khoản "${a.username}"?`, () => deleteAccount(a.id))} className="h-7 border-red-500/20 text-red-400 hover:bg-red-500/10 px-2 gap-1">
                      <Trash2 className="w-3 h-3" /> Xoá
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500">Chưa có tài khoản nào</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AI GALLERIES TAB
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// GALLERY LIGHTBOX — Zoom slider + Mouse Wheel + Pan/Drag
// ═══════════════════════════════════════════════════════════════════════
function GalleryLightbox({ images, activeIndex, galleryName, onClose, onPrev, onNext, collections = [], onAddToCollection, onRemoveFromCollection, onRemoveFromCurrent }: {
  images: any[];
  activeIndex: number;
  galleryName?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  collections?: any[];
  onAddToCollection?: (idCollection: number, idAiImage: number) => void;
  onRemoveFromCollection?: (idCollection: number, idAiImage: number) => void;
  onRemoveFromCurrent?: () => void;
}) {
  const [zoom, setZoom] = React.useState(1);
  const [panX, setPanX] = React.useState(0);
  const [panY, setPanY] = React.useState(0);
  const [dragOffsetX, setDragOffsetX] = React.useState(0);
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const image = images[activeIndex];
  const [showCollectionPanel, setShowCollectionPanel] = React.useState(false);

  // Reset zoom/pan when image changes
  React.useEffect(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setDragOffsetX(0);
  }, [activeIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { onNext(); }
      else if (e.key === "ArrowLeft") { onPrev(); }
      else if (e.key === "Escape") { onClose(); }
      else if (e.key === "+" || e.key === "=") { setZoom(z => Math.min(5, +(z + 0.25).toFixed(2))); }
      else if (e.key === "-") {
        setZoom(z => {
          const nz = Math.max(1, +(z - 0.25).toFixed(2));
          if (nz === 1) { setPanX(0); setPanY(0); }
          return nz;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  const clampPan = (z: number, nx: number, ny: number) => {
    if (!containerRef.current) return { nx, ny };
    const el = containerRef.current;
    const maxX = (el.clientWidth * (z - 1)) / 2;
    const maxY = (el.clientHeight * (z - 1)) / 2;
    return {
      nx: Math.max(-maxX, Math.min(maxX, nx)),
      ny: Math.max(-maxY, Math.min(maxY, ny)),
    };
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom === 1) { setPanX(0); setPanY(0); }
    else {
      const { nx, ny } = clampPan(newZoom, panX, panY);
      setPanX(nx);
      setPanY(ny);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const STEP = 0.15;
    setZoom(prev => {
      const next = e.deltaY < 0
        ? Math.min(5, +(prev + STEP).toFixed(2))
        : Math.max(1, +(prev - STEP).toFixed(2));
      if (next === 1) { setPanX(0); setPanY(0); }
      else {
        const { nx, ny } = clampPan(next, panX, panY);
        setPanX(nx);
        setPanY(ny);
      }
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 100) {
        onPrev();
      } else if (dragOffsetX < -100) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    isDragging.current = true;
    dragStart.current = { x: t.clientX, y: t.clientY, panX, panY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    if (zoom > 1) {
      const { nx, ny } = clampPan(zoom, dragStart.current.panX + dx, dragStart.current.panY + dy);
      setPanX(nx);
      setPanY(ny);
    } else {
      setDragOffsetX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (zoom === 1) {
      if (dragOffsetX > 80) {
        onPrev();
      } else if (dragOffsetX < -80) {
        onNext();
      }
      setDragOffsetX(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm select-none animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 shadow-2xl"
        title="Dong (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Left nav */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Anh truoc"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right nav */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-40 shadow-2xl"
          title="Anh sau"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Controls bar - fixed at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 lg:px-6 py-3 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-4xl mx-auto flex items-center gap-4 bg-[#131520]/95 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3 shadow-2xl">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => handleZoomChange(Math.max(1, +(zoom - 0.25).toFixed(2)))} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0">-</button>
            <div className="flex-1 flex flex-col gap-1">
              <input type="range" min={1} max={5} step={0.05} value={zoom} onChange={(e) => handleZoomChange(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full accent-orange-500 cursor-pointer" style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) ${((zoom - 1) / 4) * 100}%, rgba(255,255,255,0.1) 100%)` }} />
              <div className="text-center text-[10px] text-orange-400 font-bold tabular-nums">{zoom.toFixed(2)}x</div>
            </div>
            <button onClick={() => handleZoomChange(Math.min(5, +(zoom + 0.25).toFixed(2)))} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center flex-shrink-0">+</button>
            <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} className="text-[10px] text-gray-500 hover:text-white transition-colors flex-shrink-0 border border-white/10 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10">Reset</button>
          </div>
          <div className="w-px h-10 bg-white/10 flex-shrink-0" />
          {collections.length > 0 && (
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowCollectionPanel(p => !p)} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-orange-500/40 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-all">
                <FolderOpen className="w-3.5 h-3.5" />
                Thu muc
              </button>
              {showCollectionPanel && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#1a1d2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50" onClick={e => e.stopPropagation()}>
                  <div className="px-3 py-2 border-b border-white/5"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Them vao thu muc</p></div>
                  <div className="max-h-48 overflow-y-auto">
                    {collections.map((col: any) => {
                      const isIn = image.collectionImages?.some((ci: any) => ci.idCollection === col.id || ci.collection?.id === col.id);
                      return (
                        <button key={col.id} onClick={() => { if (isIn) { onRemoveFromCollection?.(col.id, image.id); } else { onAddToCollection?.(col.id, image.id); } }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-white/5 ${isIn ? "text-orange-400" : "text-gray-300"}`}>
                          <span className="truncate">{col.name}</span>
                          {isIn ? <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {onRemoveFromCurrent && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFromCurrent(); }}
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-150"
                title="Xoá khỏi thư mục"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xoá khỏi thư mục
              </button>
            </div>
          )}
          <div className="w-px h-10 bg-white/10 flex-shrink-0" />
          <div className="text-right min-w-0">
            {galleryName && <p className="text-xs font-bold text-white truncate">{galleryName}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">Anh {activeIndex + 1} / {images.length}</p>
          </div>
        </div>
      </div>

      {/* Image viewport */}
      <div className="absolute inset-0 bottom-[88px] px-4 lg:px-6 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className={`w-full h-full ${images.length >= 3 ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "flex items-center justify-center"}`}>
          {images.length >= 3 && (
            <div onClick={onPrev} className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 group/side overflow-hidden">
              <img src={getBunnyImageUrl(images[(activeIndex - 1 + images.length) % images.length].imgUrl, 'display')} alt="Prev" className="absolute inset-0 w-full h-full object-contain p-3" draggable={false} />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center"><ChevronLeft className="w-8 h-8 text-white/40" /></div>
            </div>
          )}
          <div
            ref={containerRef}
            className="relative rounded-xl bg-[#090a0f]/60 border border-white/10 overflow-hidden h-full"
            style={{ cursor: isDragging.current ? "grabbing" : "grab", ...(images.length < 3 ? { flex: "1", maxWidth: "56rem" } : {}) }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <div
              key={activeIndex}
              className="absolute inset-0 flex items-center justify-center animate-char-spin"
            >
              <img
                src={getBunnyImageUrl(image.imgUrl, 'display')}
                alt={`Anh ${activeIndex + 1}`}
                draggable={false}
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                  userSelect: "none",
                  display: "block",
                  transform: zoom > 1 ? `translate(${panX}px, ${panY}px) scale(${zoom})` : `translate(${dragOffsetX}px, 0px) scale(1)`,
                  transformOrigin: "center center",
                  transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              />
            </div>
            {zoom === 1 && <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded-full border border-white/5 pointer-events-none">Kéo ảnh để chuyển tiếp · Lăn chuột để zoom</div>}
            {zoom > 1 && <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-black/60 px-2 py-1 rounded-full border border-white/10 pointer-events-none backdrop-blur-md">Giữ và kéo để di chuyển</div>}
          </div>
          {images.length >= 3 && (
            <div onClick={onNext} className="hidden md:block relative rounded-xl bg-[#090a0f]/40 border border-white/5 cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 group/side overflow-hidden">
              <img src={getBunnyImageUrl(images[(activeIndex + 1) % images.length].imgUrl, 'display')} alt="Next" className="absolute inset-0 w-full h-full object-contain p-3" draggable={false} />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover/side:opacity-0 transition-opacity flex items-center justify-center"><ChevronRight className="w-8 h-8 text-white/40" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// GALLERY CARD (Slideshow automatic loop)
// ═══════════════════════════════════════════════════════════════════════
function GalleryCard({ g, onSelect, onEdit, onDelete }: any) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!g.images || g.images.length <= 1) return;
    const maxSlides = Math.min(g.images.length, 5); // Limit slideshow to top 5 images to save bandwidth
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % maxSlides);
    }, 4800);
    return () => clearInterval(interval);
  }, [g.images]);

  const activeImage = g.images && g.images.length > 0 ? g.images[currentIdx] : null;
  const [displaySrc, setDisplaySrc] = useState(activeImage?.imgUrl || "");

  // Instantly update displaySrc when the gallery ID changes
  useEffect(() => {
    if (activeImage) {
      setDisplaySrc(activeImage.imgUrl);
      setCurrentIdx(0);
    }
  }, [g.id]);

  return (
    <div className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden group flex flex-col relative aspect-[2/3] shadow-xl">
      <div
        onClick={() => onSelect(g)}
        className="absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden cursor-pointer"
      >
        {activeImage && activeImage.imgUrl !== displaySrc && (
          <img
            src={getBunnyImageUrl(activeImage.imgUrl, 'thumb')}
            alt="preloader"
            style={{ display: "none" }}
            onLoad={() => setDisplaySrc(activeImage.imgUrl)}
            onError={() => setDisplaySrc(activeImage.imgUrl)}
          />
        )}

        {displaySrc ? (
          <Image
            key={displaySrc}
            src={getBunnyImageUrl(displaySrc, 'thumb')}
            alt={g.name}
            fill
            className="object-cover group-hover:scale-105 transition-opacity duration-500 absolute inset-0 animate-in fade-in"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={currentIdx === 0}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-700" />
          </div>
        )}

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {g.plan ? (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide shadow-md border-0">
              {g.plan.name}
            </Badge>
          ) : (
            <Badge className="bg-green-600 hover:bg-green-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded border-0 shadow-md">
              MIỄN PHÍ
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10">
          <span className="text-[9px] font-bold text-gray-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            {g.images?.length || 0} ảnh
          </span>
        </div>

        {activeImage && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
            <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
              Xem ảnh 🔍 
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/25 backdrop-blur-[3px] border-t border-white/5 z-10 flex flex-col justify-between min-h-[85px]">
        <div>
          <h4 className="text-xs font-bold text-gray-100 line-clamp-1">{g.name}</h4>
          {g.movie?.name && (
            <p className="text-[9px] text-orange-400 font-medium line-clamp-1 mt-0.5">
              🎬 {g.movie.name}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {g.galleryCharacters && g.galleryCharacters.length > 0 ? (
              g.galleryCharacters.slice(0, 2).map((gc: any) => (
                <span key={gc.character.id} className="text-[8px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded-full">
                  {gc.character.name}
                </span>
              ))
            ) : (
              <span className="text-[8px] text-gray-600">—</span>
            )}
            {g.galleryCharacters && g.galleryCharacters.length > 2 && (
              <span className="text-[8px] bg-white/5 text-gray-400 px-1 py-0.5 rounded-full">
                +{g.galleryCharacters.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(g); }}
          className="p-1 text-blue-400 hover:text-blue-300 rounded-md transition-colors cursor-pointer"
          title="Sửa bộ sưu tập"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(g); }}
          className="p-1 text-red-400 hover:text-red-300 rounded-md transition-colors cursor-pointer"
          title="Xoá bộ sưu tập"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function GalleriesTab({ galleries, movies, characters, plans, collections = [], search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [form, setForm] = useState({ name: "", idMovie: 0, idPlan: 0, characterIds: [] as number[] });
  const [editing, setEditing] = useState<number | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [selectedGalleryForView, setSelectedGalleryForView] = useState<any | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  // Separate state for lightbox: stores gallery data even after Dialog is closed
  const [lightboxGallery, setLightboxGallery] = useState<any | null>(null);
  const [searchChar, setSearchChar] = useState("");
  const [characterSearch, setCharacterSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    if (selectedGalleryForView) {
      setVisibleCount(24);
    }
  }, [selectedGalleryForView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePreviewIndex === null || !lightboxGallery?.images) return;
      const length = lightboxGallery.images.length;
      if (e.key === "ArrowRight") {
        setActivePreviewIndex(prev => prev !== null ? (prev + 1) % length : null);
      } else if (e.key === "ArrowLeft") {
        setActivePreviewIndex(prev => prev !== null ? (prev - 1 + length) % length : null);
      } else if (e.key === "Escape") {
        setActivePreviewIndex(null);
        setLightboxGallery(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePreviewIndex, lightboxGallery]);

  const filtered = galleries.filter((g: any) => {
    const matchesName = !search || 
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.movie?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesChar = !searchChar ||
      g.galleryCharacters?.some((gc: any) =>
        gc.character?.name === searchChar
      );

    return matchesName && matchesChar;
  });

  const filteredCharacters = characters.filter((c: any) =>
    c.name?.toLowerCase().includes(characterSearch.toLowerCase())
  );

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;
    const imagesList = Array.from(filesList).filter(file => file.type.startsWith("image/"));
    
    // Quick check to warn about large files
    const largeFilesCount = imagesList.filter(file => file.size > 10 * 1024 * 1024).length;
    if (largeFilesCount > 0) {
      show(`Phát hiện ${largeFilesCount} ảnh có dung lượng gốc lớn hơn 10MB. Hệ thống sẽ tự động nén khi tải lên.`, "success");
    }

    setUploadFiles(imagesList);
  };

  const handleEdit = (g: any) => {
    setEditing(g.id);
    setForm({
      name: g.name || "",
      idMovie: g.idMovie || 0,
      idPlan: g.idPlan || 0,
      characterIds: g.galleryCharacters?.map((gc: any) => gc.character?.id || gc.idCharacter).filter(Boolean) || []
    });
    setUploadFiles([]);
    setCharacterSearch("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editing !== null;

    if (!isEdit && uploadFiles.length === 0) {
      show("Vui lòng chọn thư mục chứa ảnh trước", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatusMsg(uploadFiles.length > 0 ? "Chuẩn bị tải ảnh lên Bunny..." : "Đang lưu thông tin...");

    const processedFiles: File[] = [];
    const urls: string[] = [];

    try {
      if (uploadFiles.length > 0) {
        for (let i = 0; i < uploadFiles.length; i++) {
          const file = uploadFiles[i];
          processedFiles.push(file);
        }

        // Build folder name with character names appended
        const selectedChars = characters.filter((c: any) => form.characterIds.includes(c.id));
        const charSuffix = selectedChars.length > 0
          ? "_" + selectedChars.map((c: any) => cleanFolderName(c.name)).join("_")
          : "";
        const folderPath = `ai_galleries/${cleanFolderName(form.name)}${charSuffix}`;

        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];
          setUploadStatusMsg(`Tải lên ${i + 1}/${processedFiles.length}: ${file.name}...`);
          await new Promise((resolve) => setTimeout(resolve, 0));
          
          const imageUniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const extension = file.name.substring(file.name.lastIndexOf(".") + 1) || "webp";
          const cleanFileBase = cleanFolderName(file.name.substring(0, file.name.lastIndexOf(".")));
          const specificPath = `${folderPath}/${imageUniqueId}_${cleanFileBase}.${extension}`;
          
          const url = await uploadFileToBunny(file, "ai_galleries", specificPath);
          urls.push(url);
          setUploadProgress(Math.round(((i + 1) / processedFiles.length) * 100));
        }
      }

      setUploadStatusMsg("Đang lưu thông tin bộ sưu tập...");

      startTransition(async () => {
        try {
          if (isEdit) {
            await updateGallery(editing!, {
              name: form.name,
              idMovie: form.idMovie > 0 ? form.idMovie : undefined,
              idPlan: form.idPlan > 0 ? form.idPlan : undefined,
              characterIds: form.characterIds,
              imageUrls: urls
            });
          } else {
            await createGallery({
              name: form.name,
              idMovie: form.idMovie > 0 ? form.idMovie : undefined,
              idPlan: form.idPlan > 0 ? form.idPlan : undefined,
              characterIds: form.characterIds,
              imageUrls: urls
            });
          }
          await onRefresh();
          setForm({ name: "", idMovie: 0, idPlan: 0, characterIds: [] });
          setCharacterSearch("");
          setUploadFiles([]);
          setUploadProgress(null);
          setUploadStatusMsg("");
          setUploading(false);
          setIsFormOpen(false);
          setEditing(null);
          show(isEdit ? "Cập nhật bộ sưu tập AI thành công!" : "Tạo bộ sưu tập AI thành công!");
        } catch (err: any) {
          setUploading(false);
          show(err.message || "Lỗi khi lưu bộ sưu tập", "error");
        }
      });
    } catch (err: any) {
      console.error(err);
      setUploading(false);
      setUploadProgress(null);
      setUploadStatusMsg("Lỗi: " + err.message);
      show("Lỗi trong quá trình upload ảnh lên Bunny Storage", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar: Search inputs and Add button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131520] border border-white/5 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input placeholder="Tìm theo tên BST / Phim…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#090a0f] border-white/5 text-sm h-9 w-full" />
          </div>
          <div>
            <select
              value={searchChar}
              onChange={(e) => setSearchChar(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-400 cursor-pointer focus:outline-none focus:border-orange-500/50"
            >
              <option value="">-- Chọn nhân vật --</option>
              {characters.map((c: any) => (
                <option key={c.id} value={c.name} className="text-gray-200 bg-[#131520]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={() => { setEditing(null); setForm({ name: "", idMovie: 0, idPlan: 0, characterIds: [] }); setCharacterSearch(""); setUploadFiles([]); setIsFormOpen(true); }}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-9 text-xs px-4 rounded-xl shadow-lg border-0 gap-1.5 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm bộ sưu tập
        </Button>
      </div>

      {/* Grid of gallery cards */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((g: any) => (
            <GalleryCard
              key={g.id}
              g={g}
              onSelect={setSelectedGalleryForView}
              onEdit={handleEdit}
              onDelete={(targetG: any) => confirmThenDelete(`Xoá bộ sưu tập "${targetG.name}"?`, () => deleteGallery(targetG.id))}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500 bg-[#131520] border border-white/5 rounded-2xl">
            Chưa có bộ sưu tập nào
          </div>
        )}
      </div>

      {/* Add AI Gallery Modal */}
      <Dialog 
        open={isFormOpen} 
        onOpenChange={(open) => { 
          if (!open && !uploading) { 
            setIsFormOpen(false); 
            setForm({ name: "", idMovie: 0, idPlan: 0, characterIds: [] }); 
            setCharacterSearch("");
            setUploadFiles([]);
            setUploadProgress(null);
            setUploadStatusMsg("");
          } 
        }}
      >
        <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-md p-6 text-gray-100 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              {editing !== null ? "📝 Sửa bộ sưu tập AI" : "➕ Thêm bộ sưu tập AI"}
            </h3>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tên bộ sưu tập <span className="text-red-400">*</span></label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-[#090a0f] border-white/5 text-sm h-9" placeholder="Bộ sưu tập Cosplay Dune" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Liên kết Phim</label>
              <select value={form.idMovie} onChange={e => setForm(p => ({ ...p, idMovie: parseInt(e.target.value) }))} className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
                <option value={0}>-- Không liên kết --</option>
                {movies.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Yêu cầu Gói xem (Plan)</label>
              <select value={form.idPlan} onChange={e => setForm(p => ({ ...p, idPlan: parseInt(e.target.value) }))} className="w-full bg-[#090a0f] border border-white/5 rounded-lg h-9 px-3 text-sm text-gray-200">
                <option value={0}>-- Miễn phí --</option>
                {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Cấp {p.level})</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Nhân vật trong ảnh (chọn nhiều)</label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tìm nhân vật..."
                  value={characterSearch}
                  onChange={(e) => setCharacterSearch(e.target.value)}
                  className="pl-8 bg-[#090a0f] border-white/5 text-[11px] h-8 w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-white/5 rounded-lg bg-[#090a0f]">
                {filteredCharacters.map((c: any) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => {
                      const current = form.characterIds;
                      const next = current.includes(c.id) ? current.filter(id => id !== c.id) : [...current, c.id];
                      setForm(p => ({ ...p, characterIds: next }));
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      form.characterIds.includes(c.id)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
                {filteredCharacters.length === 0 && (
                  <span className="text-xs text-gray-500 p-1">Không tìm thấy nhân vật nào</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Chọn thư mục ảnh tải lên {editing === null && <span className="text-red-400">*</span>}
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFolderSelect}
                disabled={uploading}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 file:cursor-pointer"
                required={editing === null}
                {...{ webkitdirectory: "", directory: "" }}
              />
              {uploadFiles.length > 0 && (
                <p className="text-[10px] text-green-400 mt-1">Đã tìm thấy {uploadFiles.length} ảnh hợp lệ trong thư mục.</p>
              )}
            </div>

            {uploadStatusMsg && (
              <div className="text-xs text-gray-400 bg-black/30 p-2.5 rounded-lg border border-white/5">
                <p className="font-semibold text-gray-300">{uploadStatusMsg}</p>
                {uploadProgress !== null && (
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending || uploading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1 cursor-pointer font-bold">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {uploading ? "Đang upload..." : editing !== null ? "Cập nhật" : "Tạo bộ sưu tập"}
              </Button>
              <Button type="button" disabled={uploading} onClick={() => { if (!uploading) { setIsFormOpen(false); setEditing(null); setForm({ name: "", idMovie: 0, idPlan: 0, characterIds: [] }); setUploadFiles([]); } }} className="border-white/10 text-gray-400 h-9 text-xs cursor-pointer">Huỷ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing gallery images */}
      {selectedGalleryForView && (
        <Dialog open={!!selectedGalleryForView} onOpenChange={(open) => !open && setSelectedGalleryForView(null)}>
          <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto p-6 text-gray-100 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Ảnh trong bộ sưu tập: {selectedGalleryForView.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedGalleryForView.movie?.name ? `Phim: ${selectedGalleryForView.movie.name}` : "Không liên kết phim"} 
                  {selectedGalleryForView.plan?.name ? ` · Gói xem: ${selectedGalleryForView.plan.name}` : " · Gói xem: Miễn phí"}
                  {` · ${selectedGalleryForView.images?.length || 0} ảnh`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedGalleryForView.images?.slice(0, visibleCount).map((img: any, idx: number) => (
                <div 
                  key={img.id} 
                  onClick={() => {
                    // Save gallery data to lightboxGallery, then close Dialog, then open lightbox
                    setLightboxGallery(selectedGalleryForView);
                    setSelectedGalleryForView(null); // close Dialog first
                    setTimeout(() => setActivePreviewIndex(idx), 50); // open lightbox after Dialog closes
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 group/img cursor-pointer"
                >
                  <Image
                    src={getBunnyImageUrl(img.imgUrl, 'thumb')}
                    alt="Gallery image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                    sizes="(max-w-768px) 50vw, 25vw"
                  />
                  {/* View large preview option on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" variant="outline" className="border-white/20 text-white text-xs h-8 pointer-events-none">Phóng to</Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedGalleryForView.images && selectedGalleryForView.images.length > visibleCount && (
              <div className="flex justify-center mt-6 pt-4 border-t border-white/5">
                <Button 
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 px-6 rounded-lg cursor-pointer"
                >
                  Xem thêm ({selectedGalleryForView.images.length - visibleCount} ảnh)
                </Button>
              </div>
            )}

            {(!selectedGalleryForView.images || selectedGalleryForView.images.length === 0) && (
              <p className="text-center py-12 text-sm text-gray-500">Bộ sưu tập này chưa có ảnh nào.</p>
            )}
            
            <div className="flex justify-end pt-4 mt-6 border-t border-white/5">
              <Button onClick={() => setSelectedGalleryForView(null)} className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs h-9">
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full-screen Lightbox for image preview */}
      {activePreviewIndex !== null && lightboxGallery?.images?.[activePreviewIndex] && (
        <GalleryLightbox
          images={lightboxGallery.images}
          activeIndex={activePreviewIndex}
          galleryName={lightboxGallery.name}
          onClose={() => { setActivePreviewIndex(null); setLightboxGallery(null); }}
          onPrev={() => setActivePreviewIndex(prev => prev !== null ? (prev - 1 + lightboxGallery.images.length) % lightboxGallery.images.length : null)}
          onNext={() => setActivePreviewIndex(prev => prev !== null ? (prev + 1) % lightboxGallery.images.length : null)}
          collections={collections}
          onAddToCollection={(idCol, idImg) => {
            startTransition(async () => {
              try {
                await addImageToCollection(idCol, idImg);
                show("Đã thêm ảnh vào thư mục!");
                setLightboxGallery((prev: any) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    images: prev.images.map((img: any) => {
                      if (img.id !== idImg) return img;
                      const currentCollectionImages = img.collectionImages || [];
                      return {
                        ...img,
                        collectionImages: [...currentCollectionImages, { idCollection: idCol }]
                      };
                    })
                  };
                });
                await onRefresh();
              }
              catch { show("Lỗi khi thêm ảnh vào thư mục", "error"); }
            });
          }}
          onRemoveFromCollection={(idCol, idImg) => {
            startTransition(async () => {
              try {
                await removeImageFromCollection(idCol, idImg);
                show("Đã xoá ảnh khỏi thư mục!");
                setLightboxGallery((prev: any) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    images: prev.images.map((img: any) => {
                      if (img.id !== idImg) return img;
                      const currentCollectionImages = img.collectionImages || [];
                      return {
                        ...img,
                        collectionImages: currentCollectionImages.filter((ci: any) => ci.idCollection !== idCol)
                      };
                    })
                  };
                });
                await onRefresh();
              }
              catch { show("Lỗi khi xoá ảnh khỏi thư mục", "error"); }
            });
          }}
        />
      )}
    </div>
  );
}

function CollectionsTab({ collections, aiImages, search, setSearch, isPending, startTransition, onRefresh, show, confirmThenDelete }: any) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [viewCollection, setViewCollection] = useState<any | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [lightboxCollection, setLightboxCollection] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    if (viewCollection) {
      setVisibleCount(24);
    }
  }, [viewCollection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePreviewIndex === null || !lightboxCollection) return;
      const imgs = lightboxCollection.collectionImages?.map((ci: any) => ci.aiImage).filter(Boolean) ?? [];
      const length = imgs.length;
      if (length === 0) return;
      if (e.key === "ArrowRight") {
        setActivePreviewIndex(prev => prev !== null ? (prev + 1) % length : null);
      } else if (e.key === "ArrowLeft") {
        setActivePreviewIndex(prev => prev !== null ? (prev - 1 + length) % length : null);
      } else if (e.key === "Escape") {
        setActivePreviewIndex(null);
        setLightboxCollection(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePreviewIndex, lightboxCollection]);

  const filtered = collections.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createCollection(name.trim());
        await onRefresh();
        setName("");
        show("Đã tạo thư mục!");
      } catch { show("Lỗi khi tạo thư mục", "error"); }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      try {
        await updateCollection(editing.id, editing.name.trim());
        await onRefresh();
        setEditing(null);
        show("Đã cập nhật thư mục!");
      } catch { show("Lỗi khi cập nhật", "error"); }
    });
  };

  const viewImages = viewCollection?.collectionImages?.map((ci: any) => ci.aiImage).filter(Boolean) ?? [];
  const lightboxImages = lightboxCollection?.collectionImages?.map((ci: any) => ci.aiImage).filter(Boolean) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <form onSubmit={editing ? handleUpdate : handleCreate} className="bg-[#131520] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing ? "✏️ Sửa thư mục" : "➕ Tạo thư mục mới"}</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tên thư mục <span className="text-red-400">*</span></label>
            <Input
              value={editing ? editing.name : name}
              onChange={(e) => editing ? setEditing({ ...editing, name: e.target.value }) : setName(e.target.value)}
              placeholder="ví dụ: Favorite, Wallpaper..."
              required
              className="bg-[#090a0f] border-white/5 text-sm h-9"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-9 text-xs gap-1">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing ? "Lưu" : "Tạo"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={() => setEditing(null)} className="border-white/10 text-gray-400 h-9 text-xs">Huỷ</Button>
            )}
          </div>
        </form>
        <div className="bg-[#131520] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-gray-400">Tổng thư mục</p>
          <p className="text-2xl font-black text-white mt-1">{collections.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Tổng ảnh AI: <span className="text-orange-400 font-bold">{aiImages.length}</span></p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Tìm thư mục..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#131520] border-white/5 text-sm h-9" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((col: any) => {
            const imgCount = col.collectionImages?.length ?? 0;
            const thumbs = col.collectionImages?.map((ci: any) => ci.aiImage).filter(Boolean) ?? [];
            const coverUrl = thumbs[0]?.imgUrl;

            return (
              <div key={col.id} className="bg-[#131520] border border-white/5 rounded-2xl overflow-hidden group flex flex-col relative aspect-[2/3] shadow-xl">
                <div
                  onClick={() => {
                    if (imgCount > 0) {
                      setViewCollection(col);
                    } else {
                      show("Thư mục này chưa có ảnh nào", "error");
                    }
                  }}
                  className={`absolute inset-0 w-full h-full bg-[#090a0f] overflow-hidden ${imgCount > 0 ? "cursor-pointer" : ""}`}
                >
                  {coverUrl ? (
                    <Image src={getBunnyImageUrl(coverUrl, 'thumb')} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-w-768px) 50vw, 25vw" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-[#090a0f] p-4 text-center">
                      <FolderOpen className="w-10 h-10 mb-2 text-gray-700" />
                      <span className="text-[10px] text-gray-500">Chưa có ảnh</span>
                    </div>
                  )}
                  {imgCount > 0 && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg">Xem ảnh 🔍 </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/25 backdrop-blur-[3px] border-t border-white/5 z-10 flex flex-col justify-between min-h-[70px]">
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 line-clamp-1">{col.name}</h4>
                    <span className="inline-block text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mt-1">
                      {imgCount} ảnh
                    </span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing({ id: col.id, name: col.name }); }}
                    className="p-1 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Sửa thư mục"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmThenDelete(`Xoá thư mục "${col.name}"?`, () => deleteCollection(col.id)); }}
                    className="p-1 text-red-400 hover:text-red-300 rounded-md transition-colors cursor-pointer"
                    title="Xoá thư mục"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500 bg-[#131520] border border-white/5 rounded-2xl">
            Chưa có thư mục nào
          </div>
        )}
      </div>

      {/* Dialog for viewing collection images */}
      {viewCollection && (
        <Dialog open={!!viewCollection} onOpenChange={(open) => !open && setViewCollection(null)}>
          <DialogContent className="bg-[#131520] border border-white/10 rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto p-6 text-gray-100 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Ảnh trong thư mục: {viewCollection.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {`${viewCollection.collectionImages?.length || 0} ảnh`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {viewImages.slice(0, visibleCount).map((img: any, idx: number) => (
                <div 
                  key={img.id} 
                  onClick={() => {
                    // Save collection data to lightboxCollection, then close Dialog, then open lightbox
                    setLightboxCollection(viewCollection);
                    setViewCollection(null); // close Dialog first
                    setTimeout(() => setActivePreviewIndex(idx), 50); // open lightbox after Dialog closes
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 group/img cursor-pointer"
                >
                  <Image
                    src={getBunnyImageUrl(img.imgUrl, 'thumb')}
                    alt="Collection image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                    sizes="(max-w-768px) 50vw, 25vw"
                  />
                  {/* View large preview option on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" variant="outline" className="border-white/20 text-white text-xs h-8 pointer-events-none">Phóng to</Button>
                  </div>
                </div>
              ))}
            </div>

            {viewImages.length > visibleCount && (
              <div className="flex justify-center mt-6 pt-4 border-t border-white/5">
                <Button 
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 px-6 rounded-lg cursor-pointer"
                >
                  Xem thêm ({viewImages.length - visibleCount} ảnh)
                </Button>
              </div>
            )}

            {viewImages.length === 0 && (
              <p className="text-center py-12 text-sm text-gray-500">Thư mục này chưa có ảnh nào.</p>
            )}
            
            <div className="flex justify-end pt-4 mt-6 border-t border-white/5">
              <Button onClick={() => setViewCollection(null)} className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs h-9">
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {activePreviewIndex !== null && lightboxImages[activePreviewIndex] && (
        <GalleryLightbox
          images={lightboxImages}
          activeIndex={activePreviewIndex}
          galleryName={lightboxCollection?.name}
          onClose={() => { setActivePreviewIndex(null); setLightboxCollection(null); }}
          onPrev={() => setActivePreviewIndex((prev) => prev !== null ? (prev - 1 + lightboxImages.length) % lightboxImages.length : null)}
          onNext={() => setActivePreviewIndex((prev) => prev !== null ? (prev + 1) % lightboxImages.length : null)}
          onRemoveFromCurrent={() => {
            const idCol = lightboxCollection.id;
            const idImg = lightboxImages[activePreviewIndex].id;
            startTransition(async () => {
              try {
                await removeImageFromCollection(idCol, idImg);
                await onRefresh();
                show("Đã xoá ảnh khỏi thư mục!");
                
                // If there are no images left, close preview
                const updatedImages = lightboxImages.filter((img: any) => img.id !== idImg);
                if (updatedImages.length === 0) {
                  setActivePreviewIndex(null);
                  setLightboxCollection(null);
                } else {
                  // Adjust active index
                  setActivePreviewIndex(prev => {
                    if (prev === null) return null;
                    return prev >= updatedImages.length ? updatedImages.length - 1 : prev;
                  });
                  setLightboxCollection((prevCol: any) => {
                    if (!prevCol) return null;
                    return {
                      ...prevCol,
                      collectionImages: prevCol.collectionImages.filter((ci: any) => ci.aiImage?.id !== idImg)
                    };
                  });
                }
              } catch {
                show("Lỗi khi xoá ảnh khỏi thư mục", "error");
              }
            });
          }}
        />
      )}
    </div>
  );
}
