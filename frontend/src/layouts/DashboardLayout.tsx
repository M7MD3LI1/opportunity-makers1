import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, ChevronLeft, ChevronRight, LogOut, Search,
  Bell, MessageSquare, User, Settings, LayoutDashboard,
  Sun, Moon, Command
} from "lucide-react";
import * as Icons from "lucide-react";
import { CommitteeConfig } from "../config/committeeConfig";
import NotificationCenter from "../components/widgets/NotificationCenter";
import api from "../lib/api";
import ChatRoom from "../components/widgets/ChatRoom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  committee?: CommitteeConfig;
  navItems: { id: string; label: string; icon: any }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children, committee, navItems, activeTab, onTabChange, title
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const themeClass = committee?.themeClass || "";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(Array.isArray(res.data.notifications) ? res.data.notifications : []);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const avatarUrl = user?.profilePicture
    ? `${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}${user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`
    : null;

  return (
    <div className={`flex h-screen bg-[#0a0f1e] font-sans selection:bg-primary/30 overflow-hidden relative ${themeClass} dashboard-theme`} dir="ltr">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 z-0 gradient-mesh pointer-events-none opacity-60" />
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: committee?.colors.primary || '#3b82f6' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ═══ Sidebar ═══ */}
      <aside className={`${collapsed ? "w-20" : "w-72"} bg-[#0d1321]/80 border-r border-white/[0.04] flex flex-col relative z-50 backdrop-blur-2xl transition-all duration-500`}>
        {/* Logo */}
        <div className={`p-6 ${collapsed ? "px-4" : ""} flex items-center justify-between`}>
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform"
              style={{ background: committee?.colors.gradient || 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              {committee ? <committee.icon className="text-white w-5 h-5" /> : <Rocket className="text-white w-5 h-5" />}
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
                <span className="text-white font-bold text-sm block leading-none truncate">
                  {committee?.name || "Opportunity Makers"}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 block truncate"
                  style={{ color: committee?.colors.primaryLight || '#60a5fa' }}>
                  {committee?.nameAr || "صناع الفرص"}
                </span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Profile Card */}
        {!collapsed && (
          <div className="px-4 mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0"
                  style={{ background: `${committee?.colors.primary || '#3b82f6'}20`, color: committee?.colors.primary || '#3b82f6' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.role === "ADMIN" ? "Administrator" : "Member"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId={`nav-${committee?.id || "main"}`}
                    className="absolute inset-0 rounded-xl border"
                    style={{
                      background: `${committee?.colors.primary || '#3b82f6'}12`,
                      borderColor: `${committee?.colors.primary || '#3b82f6'}25`,
                      boxShadow: `0 0 20px ${committee?.colors.primary || '#3b82f6'}10`,
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className={`w-[18px] h-[18px] relative z-10 shrink-0 ${
                  isActive ? "" : "group-hover:scale-110 transition-transform"
                }`} style={isActive ? { color: committee?.colors.primary || '#3b82f6' } : {}} />
                {!collapsed && (
                  <span className="text-[13px] font-medium relative z-10 truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/[0.04] space-y-1">
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary hover:text-white hover:bg-primary/20 transition-smooth border border-primary/20 bg-primary/5 mb-1 group"
            >
              <Icons.Shield className="w-[18px] h-[18px] group-hover:scale-110 transition-transform shrink-0" />
              {!collapsed && <span className="text-[13px] font-bold truncate">Admin Panel</span>}
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all mb-1"
          >
            <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium truncate">User Dashboard</span>}
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-all"
          >
            <Settings className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-[13px] font-medium">Settings</span>}
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/[0.04] flex items-center justify-between px-6 backdrop-blur-md relative z-40 bg-[#0a0f1e]/50">
          <div className="flex items-center gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Dashboard</span>
              <span className="text-slate-700">/</span>
              <span className="text-white font-medium capitalize">{title || activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 hover:bg-white/[0.05] transition-colors group"
            >
              <Search className="text-slate-500 w-4 h-4" />
              <span className="text-xs text-slate-500">Search...</span>
              <kbd className="hidden lg:flex items-center gap-0.5 text-[9px] text-slate-600 bg-white/[0.04] border border-white/[0.06] rounded-md px-1.5 py-0.5 font-mono">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Notification Center */}
            <NotificationCenter
              notifications={notifications}
              onRefresh={async () => {
                try {
                  const res = await api.get("/notifications");
                  setNotifications(Array.isArray(res.data.notifications) ? res.data.notifications : []);
                } catch {}
              }}
              onItemClick={(notif) => {
                if (notif.title.includes("مهمة") || notif.title.toLowerCase().includes("task")) {
                  onTabChange("tasks");
                }
              }}
            />

            {/* Chat Button */}
            <button
              onClick={() => onTabChange("chat")}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all relative ${
                activeTab === "chat" ? "text-white border-white/10" : "text-slate-400 hover:text-white"
              }`}
              style={activeTab === "chat" ? { borderColor: `${committee?.colors.primary || '#3b82f6'}40` } : {}}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-[#0a0f1e]"
                style={{ background: committee?.colors.primary || '#3b82f6' }} />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/[0.04]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white leading-none">{user?.name?.split(" ")[0]}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  style={{ color: committee?.colors.primary || '#3b82f6' }}>
                  {user?.level || "Member"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl p-[2px]"
                style={{ background: committee?.colors.gradient || 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <div className="w-full h-full rounded-[10px] bg-[#0a0f1e] flex items-center justify-center text-slate-400 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative z-30 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="p-6 lg:p-8"
            >
              {activeTab === "chat" ? (
                <ChatRoom isAdmin={user?.role === "ADMIN"} />
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ═══ Global Search Overlay ═══ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-start justify-center pt-[15vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl glass-panel p-2"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search members, tasks, documents..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />
                <kbd className="text-[10px] text-slate-500 bg-white/[0.05] border border-white/[0.08] rounded-md px-2 py-1 font-mono">ESC</kbd>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Quick Navigation</p>
                <div className="space-y-1">
                  {navItems.slice(0, 6).map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { onTabChange(item.id); setSearchOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
