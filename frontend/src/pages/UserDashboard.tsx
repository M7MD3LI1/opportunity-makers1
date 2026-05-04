import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { generateCertificate } from "../lib/certificate";
import api from "../lib/api";
import { Task, Notification, AiInsight, Badge, ScoreBreakdown } from "../types";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
// @ts-ignore
import EmojiPicker, { Theme } from "emoji-picker-react";
import ChatRoom from "../components/widgets/ChatRoom";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#6B7280", Intermediate: "#3B82F6", Pro: "#F59E0B", Leader: "#8B5CF6",
};
const LEVEL_AR: Record<string, string> = {
  Beginner: "Beginner", Intermediate: "Intermediate", Pro: "Professional", Leader: "Leader",
};
const NEXT_POINTS: Record<string, number> = {
  Beginner: 100, Intermediate: 250, Pro: 400, Leader: 500,
};



const heroBanner = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80";

const UserDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.department) {
      const deptName = user.department.name.toLowerCase();
      let committeeId = "";
      if (deptName.includes("hr")) committeeId = "hr";
      else if (deptName.includes("pr")) committeeId = "pr";
      else if (deptName.includes("or")) committeeId = "or";
      else if (deptName.includes("train")) committeeId = "training";
      else if (deptName.includes("social")) committeeId = "social";
      
      if (committeeId) {
        navigate(`/committee/${committeeId}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const [tab, setTab] = useState<"home" | "tasks" | "score" | "vpi" | "evaluations" | "documents" | "gamification" | "ai" | "settings" | "chat" | "notifications">("home");
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [scoreLogs, setScoreLogs] = useState<any[]>([]);
  const [badges, setBadges] = useState<{ earned: Badge[]; available: Badge[] }>({ earned: [], available: [] });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitNotes, setSubmitNotes] = useState("");
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [vpiData, setVpiData] = useState<any>(null);
  const [myDocuments, setMyDocuments] = useState<any[]>([]);
  const [docForm, setDocForm] = useState({ type: "VOLUNTEER_CERT", purpose: "UNIVERSITY", title: "Volunteer Certificate", titleAr: "Volunteer Certificate" });
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture ? `${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}` : null);
  const [saving, setSaving] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Welcome! I am your AI assistant in Opportunity Makers. How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");
  const [customColor, setCustomColor] = useState(localStorage.getItem("primaryColor") || "#701b73");
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) return;

    if (theme === "bw") {
      el.classList.add("theme-bw");
      el.classList.remove("theme-professional");
    } else if (theme === "professional") {
      el.classList.add("theme-professional");
      el.classList.remove("theme-bw");
    } else {
      el.classList.remove("theme-bw", "theme-professional");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) return;

    if (theme === "default") {
      el.style.setProperty("--dash-primary", customColor);
      el.style.setProperty("--dash-primary-light", customColor + "cc");
      el.style.setProperty("--dash-primary-lighter", customColor + "99");
      localStorage.setItem("primaryColor", customColor);
    } else {
      el.style.removeProperty("--dash-primary");
      el.style.removeProperty("--dash-primary-light");
      el.style.removeProperty("--dash-primary-lighter");
    }
  }, [customColor, theme]);

  useEffect(() => {
    loadAll();
  }, [tab]);

  const loadAll = async () => {
    try {
      const [tasksRes, insightsRes, scoreRes, badgesRes, lbRes, vpiRes, evalsRes, notifsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/ai/insights"),
        api.get("/scoring/me"),
        api.get("/scoring/badges"),
        api.get(`/scoring/leaderboard?departmentId=${user?.departmentId || ""}`),
        api.get("/vpi/me"),
        api.get("/evaluations/me"),
        api.get("/notifications")
      ]);
      setTasks(tasksRes.data.tasks);
      setInsights(insightsRes.data.insights);
      setScoreBreakdown(scoreRes.data.breakdown);
      setScoreLogs(scoreRes.data.logs);
      setBadges(badgesRes.data);
      setLeaderboard(lbRes.data.leaderboard);
      setVpiData(vpiRes.data);
      setEvaluations(evalsRes.data.evaluations || []);
      setNotifications(notifsRes.data.notifications || []);
      try { const docsRes = await api.get("/documents/me"); setMyDocuments(docsRes.data.documents); } catch {}
    } catch {}
  };

  const handleRequestDocument = async () => {
    setDocSubmitting(true);
    try {
      await api.post("/documents/request", docForm);
      showToast("✅ Document request submitted successfully");
      const docsRes = await api.get("/documents/me");
      setMyDocuments(docsRes.data.documents);
      setDocForm({ type: "VOLUNTEER_CERT", purpose: "UNIVERSITY", title: "Volunteer Certificate", titleAr: "Volunteer Certificate" });
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Request failed"));
    } finally { setDocSubmitting(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async (taskId: number) => {
    if (!submitFile) return;
    setSubmitting(taskId);
    try {
      const fd = new FormData();
      fd.append("file", submitFile);
      fd.append("notes", submitNotes);
      await api.post(`/tasks/${taskId}/submit`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("✅ Task submitted successfully!");
      setSubmitFile(null);
      setSubmitNotes("");
      loadAll();
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Submission failed"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await api.delete(`/tasks/submissions/${submissionId}`);
      showToast("✅ Submission deleted successfully!");
      loadAll();
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Deletion failed"));
    }
  };

  const pendingTasks = tasks.filter(t => !t.submissions?.length);
  const completedTasks = tasks.filter(t => t.submissions?.length);
  const myRank = leaderboard.findIndex(e => e.id === user?.id) + 1;
  const level = user?.level || "Beginner";
  const pts = user?.points || 0;
  const nextPts = NEXT_POINTS[level] || 500;
  const progress = Math.min(100, Math.round((pts / nextPts) * 100));

  const radarData = scoreBreakdown ? [
    { subject: "Tasks", value: scoreBreakdown.tasks },
    { subject: "Deadlines", value: scoreBreakdown.deadlines },
    { subject: "Attendance", value: scoreBreakdown.attendance },
    { subject: "Engagement", value: scoreBreakdown.engagement },
  ] : [];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const res = await api.put("/users/profile-picture", fd, {
          headers: { "Content-Type": undefined }
        });
        // Add timestamp to force immediate refresh in UI
        const newPic = res.data.profilePicture + "?t=" + Date.now();
        if (user) {
          const updatedUser = { ...user, profilePicture: newPic };
          updateUser(updatedUser);
        }
        setAvatarPreview(`${api.defaults.baseURL?.replace("/api", "")}${res.data.profilePicture}?t=${Date.now()}`);
      }
      
      const res = await api.put("/users/profile", {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        currentPassword: profileForm.currentPassword
      });
      updateUser(res.data.user);

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          showToast("❌ Passwords do not match");
          return;
        }
        await api.put("/users/password", {
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        });
      }

      showToast("✅ Data updated successfully");
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = () => {
    if (!user) return;
    generateCertificate(user, { type: "COMPREHENSIVE_REPORT", titleAr: "Comprehensive Report" }, {
      completedHours: vpiData?.userMetrics?.totalVolunteerHours || 0,
      totalScore: scoreBreakdown?.total || 0,
      vpiScore: vpiData?.userMetrics?.cumulativeVpi?.toFixed(2) || "0.00",
      completedTasks: tasks.filter(t => t.submissions?.length).length,
      badgeCount: user.badges?.length || 0
    });
  };

  useEffect(() => {
    if (showAiChat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, showAiChat]);

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isChatLoading) return;

    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setIsChatLoading(true);

    try {
      const history = aiMessages.slice(-10).map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text
      }));
      const res = await api.post("/ai/chat", { message: userMsg, history });
      setAiMessages(prev => [...prev, { role: "bot", text: res.data.response }]);
    } catch {
      setAiMessages(prev => [...prev, { role: "bot", text: "Sorry, an error occurred connecting to the smart assistant." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const insightColors: Record<string, string> = {
    danger: "border-red-500/50 bg-red-500/10",
    warning: "border-yellow-500/50 bg-yellow-500/10",
    suggestion: "border-blue-500/50 bg-blue-500/10",
    info: "border-green-500/50 bg-green-500/10",
  };

  return (
    <div ref={dashboardRef} className="flex h-screen bg-background font-sans selection:bg-primary/30 overflow-hidden relative dashboard-theme" dir="ltr">
      {/* Global Background Image Overlay (Same as Hero) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      {/* AI Chat Modal */}
      {/* AI Chat Modal - UPGRADED */}
      <AnimatePresence>
        {showAiChat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f172a]/90 border border-white/10 w-full max-w-5xl h-[85vh] rounded-[48px] shadow-2xl flex overflow-hidden relative"
            >
              {/* Left Sidebar - AI Stats (ANN/CNN/Memory) */}
              <div className="w-72 bg-white/5 border-l border-white/5 p-8 hidden md:flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Icons.Cpu className="text-white w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-white tracking-tight">AI Engine v2.0</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Active Models</p>
                    <div className="space-y-2">
                      {["Llama 3.3 Versatile", "ANN Neural Layer", "CNN Image Engine"].map(m => (
                        <div key={m} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[11px] font-medium text-slate-300">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Metrics</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-slate-500 mb-1">Latency</p>
                        <p className="text-xs font-bold text-emerald-400">120ms</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-slate-500 mb-1">Memory</p>
                        <p className="text-xs font-bold text-blue-400">4.2 GB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl">
                    <p className="text-[10px] font-bold text-primary mb-1">PRO FEATURES</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Conversation is processed using advanced neural layers (ANN & CNN) to ensure the highest accuracy.</p>
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow">
                      <Icons.Bot className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Professional Smart Assistant</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Generative Engine Online</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAiChat(false)}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                  >
                    <Icons.X className="w-6 h-6" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                  {aiMessages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === "user" ? "bg-slate-800 border-white/10" : "bg-primary border-primary/20 shadow-glow"}`}>
                        {msg.role === "user" ? <Icons.User className="w-5 h-5 text-slate-400" /> : <Icons.Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-left" : "text-right"}`}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                          {msg.role === "user" ? "You" : "AI Assistant - Llama 3.3"}
                        </p>
                        <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-lg ${msg.role === "user" ? "bg-white/5 text-foreground border border-white/5 rounded-tl-none" : "bg-primary text-white rounded-tr-none"}`}>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary border border-primary/20 flex items-center justify-center">
                        <Icons.Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thinking...</p>
                        <div className="flex gap-1">
                          {[0,1,2].map(n => (
                            <motion.div 
                              key={n}
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1, delay: n * 0.2 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 bg-slate-900/50 border-t border-white/5">
                  <form onSubmit={handleAiChat} className="relative group">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      placeholder="Ask me anything... (Analysis, suggestions, or general info)"
                      className="w-full bg-white/5 border border-white/10 rounded-[28px] px-8 py-6 pr-20 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                    />
                    <div className="absolute right-3 top-3 bottom-3 flex items-center gap-2">
                      <button 
                        type="submit"
                        disabled={isChatLoading || !aiInput.trim()}
                        className="w-12 h-12 bg-primary hover:bg-primary-light text-white rounded-2xl flex items-center justify-center shadow-glow transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Icons.ArrowUp className="w-6 h-6" />
                      </button>
                    </div>
                  </form>
                  <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Icons.History className="w-3 h-3" />
                      <span>Memory Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Icons.Cpu className="w-3 h-3" />
                      <span>Generative AI Mode</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glassmorphism border-primary/30 text-white px-8 py-4 rounded-2xl shadow-glow text-sm font-bold flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Updated with Home Colors/Logo */}
      <aside className="w-72 bg-slate-900/80 border-l border-white/5 flex flex-col relative z-50 backdrop-blur-3xl shadow-2xl">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-smooth">
              <Icons.Rocket className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tighter block leading-none">Opportunity Makers</span>
              <span className="text-[10px] text-primary-lighter font-bold uppercase tracking-[0.2em]">ADMIN PANEL</span>
            </div>
          </div>
        </div>

        <div className="px-6 mb-10">
          <div className="relative group overflow-hidden rounded-[32px] border border-white/10 p-5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl transition-all hover:border-primary/30">

            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-white/10 shadow-inner">
                {user?.profilePicture ? (
                  <img src={`${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}${user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold mt-4 pt-4 border-t border-white/5">
              <span className="px-2 py-0.5 rounded-md" style={{ background: LEVEL_COLORS[level] + "20", color: LEVEL_COLORS[level] }}>
                {LEVEL_AR[level]}
              </span>
              <span className="text-slate-400">{user?.score || 0}/100</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {[
            { id: "home", label: "Home", icon: Icons.LayoutDashboard },
            { id: "tasks", label: "Tasks", icon: Icons.CheckSquare },
            { id: "vpi", label: "VPI Index", icon: Icons.Target },
            { id: "evaluations", label: "Evaluations", icon: Icons.Star },
            { id: "documents", label: "Documents", icon: Icons.FileText },
            { id: "score", label: "Score", icon: Icons.BarChart3 },
            { id: "gamification", label: "Achievements", icon: Icons.Trophy },
            { id: "ai", label: "AI Assistant", icon: Icons.Cpu },
            { id: "chat", label: "Chat", icon: Icons.MessageSquare },
            { id: "settings", label: "Settings", icon: Icons.Settings },
            { id: "notifications", label: "Notifications", icon: Icons.Bell },
          ].map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.id === "settings" ? navigate("/settings") : setTab(item.id as any)}
                className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-smooth relative ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavUser"
                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-2xl shadow-glow"
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                <span className="text-sm font-semibold relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {user?.role === "ADMIN" && (
            <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-primary hover:text-white hover:bg-primary/20 transition-smooth border border-primary/20 bg-primary/5 mb-2 group">
              <Icons.Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Admin Panel</span>
              <Icons.ArrowRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          )}

          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-smooth">
            <Icons.LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-md relative z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">
              {tab === "home" ? "Dashboard" : tab === "tasks" ? "Central Tasks" : tab === "score" ? "Performance Analysis" : tab === "vpi" ? "Volunteer Performance Index" : tab === "documents" ? "Official Documents" : tab === "gamification" ? "Achievements Center" : tab === "notifications" ? "Notification Center" : "Artificial Intelligence"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-4 py-2">
              <Icons.Search className="text-slate-500 w-4 h-4" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none text-xs text-foreground focus:ring-0 w-40" />
            </div>
            <button 
              onClick={() => setTab("chat")}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all relative ${tab === "chat" ? "text-primary border-primary/30" : "text-slate-400 hover:text-white"}`}
            >
              <Icons.MessageSquare className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-900" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-none mb-1">{user?.name?.split(" ")[0]}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{LEVEL_AR[level]}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 p-[2px]">
                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={`${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}${user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Icons.User className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 relative z-30 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Print Header */}
              <div className="print-only mb-10 border-b-2 border-primary pb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-primary">Member Performance Report</h1>
                    <p className="text-sm text-slate-500 mt-1">Opportunity Makers Platform - Smart Report</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{new Date().toLocaleDateString("en-US")}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Security Verified</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Member Name</p>
                    <p className="font-bold text-slate-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Department</p>
                    <p className="font-bold text-slate-900">{user?.department?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current Level</p>
                    <p className="font-bold text-primary">{LEVEL_AR[level]}</p>
                  </div>
                </div>
              </div>

              {/* HOME TAB */}
              {tab === "home" && (
                <div className="space-y-10">
                  <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary/20 to-indigo-600/10 border border-white/5 p-12">
                    <div className="relative z-10 max-w-2xl">
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">Welcome Back</p>
                      <h1 className="text-5xl font-bold text-white mb-6 leading-tight">Hello, {user?.name?.split(" ")[0]}! Ready to accomplish today's tasks?</h1>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                          <Icons.Trophy className="text-amber-400 w-5 h-5" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Current Rank</p>
                            <p className="text-lg font-bold text-white">Rank {myRank || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                          <Icons.Sparkles className="text-primary w-5 h-5" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Level</p>
                            <p className="text-lg font-bold text-white">{LEVEL_AR[level]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[140%] bg-primary/10 blur-[80px] rounded-full rotate-45 pointer-events-none" />
                    <Icons.Rocket className="absolute bottom-[-10%] left-10 w-64 h-64 text-white/5 -rotate-12 pointer-events-none" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Current Score", value: `${user?.score || 0}%`, icon: Icons.Star, color: "text-amber-400", bg: "bg-amber-400/10" },
                      { label: "Total Points", value: user?.points || 0, icon: Icons.Diamond, color: "text-blue-400", bg: "bg-blue-400/10" },
                      { label: "Completed Tasks", value: completedTasks.length, icon: Icons.CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { label: "Pending Tasks", value: pendingTasks.length, icon: Icons.Clock, color: "text-primary", bg: "bg-primary/10" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-bold text-white">{s.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Level & AI */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-bold text-white flex items-center gap-3">
                            <Icons.Zap className="text-primary w-5 h-5" />
                            Level Progress
                          </h3>
                          <span className="text-xs font-bold text-slate-500">{pts} / {nextPts} XP</span>
                        </div>
                        <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="absolute top-0 left-0 h-full bg-primary shadow-glow" />
                        </div>
                        <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">You need {nextPts - pts} points to reach {LEVEL_AR[level === "Beginner" ? "Intermediate" : level === "Intermediate" ? "Pro" : "Leader"] || "The Top"}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {insights.slice(0, 2).map((ins, i) => (
                          <div key={i} className={`p-8 rounded-[32px] border ${insightColors[ins.type]} relative overflow-hidden group`}>
                            <Icons.Lightbulb className="text-white/20 absolute top-[-10%] left-[-10%] w-32 h-32 -rotate-12 group-hover:scale-110 transition-transform" />
                            <p className="text-white font-bold text-sm mb-2 relative z-10">{ins.title}</p>
                            <p className="text-slate-400 text-xs leading-relaxed relative z-10">{ins.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                      <h3 className="text-lg font-bold text-white mb-6">Recent Badges</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {badges.earned.slice(0, 4).map(b => (
                          <div key={b.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-all">
                            <span className="text-3xl block mb-2">{b.icon}</span>
                            <p className="text-[10px] font-bold text-white truncate">{b.name || b.nameAr}</p>
                          </div>
                        ))}
                      </div>
                      {badges.earned.length === 0 && <p className="text-slate-500 text-xs text-center py-10 italic">No badges yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {tab === "tasks" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Work List</p>
                      <h1 className="text-4xl font-bold text-white">Available Tasks</h1>
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
                      <Icons.Inbox className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">No tasks currently</h3>
                      <p className="text-slate-500">All required tasks have been completed. Enjoy your time!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {tasks.map((task, i) => {
                        const submitted = task.submissions && task.submissions.length > 0;
                        const overdue = task.deadline && new Date(task.deadline) < new Date();
                        return (
                          <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            className={`bg-white/5 border rounded-[32px] p-8 hover:bg-white/10 transition-all flex flex-col gap-6 ${submitted ? "border-emerald-500/30" : overdue ? "border-rose-500/30" : "border-white/5"}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-white">{task.title}</h3>
                                  {submitted && <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">Submitted</span>}
                                  {!submitted && overdue && <span className="text-[10px] font-bold px-2 py-1 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">Overdue</span>}
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">{task.description}</p>
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                    <Icons.Calendar className="w-3.5 h-3.5 text-primary" />
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString("en-US") : "No Deadline"}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                    <Icons.Diamond className="w-3.5 h-3.5 text-primary" />
                                    {task.points} Points
                                  </div>
                                </div>
                              </div>
                            </div>

                            {!submitted ? (
                              <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex gap-4">
                                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-6 hover:border-primary/50 cursor-pointer transition-colors group">
                                    <Icons.UploadCloud className="w-8 h-8 text-slate-600 group-hover:text-primary mb-2 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase">{submitFile ? submitFile.name : "Choose solution file"}</span>
                                    <input type="file" onChange={e => setSubmitFile(e.target.files?.[0] || null)} className="hidden" />
                                  </label>
                                  <textarea value={submitNotes} onChange={e => setSubmitNotes(e.target.value)}
                                    placeholder="Submission notes..." className="flex-1 bg-white/5 border border-white/5 text-white text-xs p-4 rounded-2xl placeholder:text-slate-700 focus:outline-none focus:border-primary/50 resize-none" />
                                </div>
                                <button onClick={() => handleSubmit(task.id)} disabled={!submitFile || submitting === task.id}
                                  className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-bold transition-all shadow-glow disabled:opacity-30 disabled:shadow-none">
                                  {submitting === task.id ? "Sending solution..." : "Submit task now"}
                                </button>
                              </div>
                            ) : (
                              <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                  <div>
                                    <span>Submission Date: {new Date(task.submissions![0].createdAt).toLocaleDateString("en-US")}</span>
                                    {task.submissions![0].isOnTime !== false ? <span className="text-emerald-400 ml-4">✓ On time</span> : <span className="text-rose-400 ml-4">⚠ Late submission</span>}
                                  </div>
                                  {!task.submissions![0].letterGrade && (
                                    <button 
                                      onClick={() => handleDeleteSubmission(task.submissions![0].id)}
                                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                                    >
                                      <Icons.Trash2 className="w-3 h-3" />
                                      Delete Submission
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VPI TAB */}
              {tab === "vpi" && vpiData && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Official System</p>
                      <h1 className="text-4xl font-bold text-white">Volunteer Performance Index (VPI)</h1>
                    </div>
                  </div>

                  {/* VPI EDUCATIONAL SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all" />
                      <h3 className="text-2xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
                        <Icons.Info className="text-primary w-6 h-6" />
                        About VPI
                      </h3>
                      <div className="space-y-6 relative z-10">
                        <p className="text-slate-300 leading-relaxed">
                          <span className="text-primary font-bold">(VPI)</span> is the official system adopted within <span className="font-bold">Sona3 Elforas</span> to measure and document volunteer performance. 
                          It achieves this through a monthly evaluation that merges points with actual documentation of volunteering hours, linking them to accurate performance indicators that reflect commitment, productivity, and efficiency.
                        </p>
                        <p className="text-slate-400 text-sm italic border-r-4 border-primary pr-4 leading-relaxed">
                          This system acts as a tool that supports justice and transparency in voluntary work, providing an official performance record for each volunteer that can be used to enhance their academic and professional career, contributing to spreading the culture of volunteering as a national value supporting <span className="text-primary font-bold">Egypt's Vision 2030</span>.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-10">
                      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <Icons.Target className="text-amber-400 w-6 h-6" />
                        Strategic Goals
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { title: "Increase Productivity", desc: "Creating a positive, motivating competitive environment.", icon: Icons.TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                          { title: "Promote Volunteering", desc: "Highlighting its value as a tool for self-development.", icon: Icons.Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
                          { title: "Achieve Org. Justice", desc: "Establishing the principle of justice and transparency.", icon: Icons.Scale, color: "text-blue-400", bg: "bg-blue-400/10" },
                          { title: "Enhance Transparency", desc: "Documenting every task and hour according to clear standards.", icon: Icons.Search, color: "text-primary", bg: "bg-primary/10" },
                        ].map((goal, i) => (
                          <div key={i} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl ${goal.bg} flex items-center justify-center shrink-0`}>
                              <goal.icon className={`w-5 h-5 ${goal.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white mb-1">{goal.title}</p>
                              <p className="text-[10px] text-slate-500 leading-tight">{goal.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Monthly VPI Index", value: vpiData.currentMonth?.vpiScore?.toFixed(2) || "0.00", max: "/ 4.00", icon: Icons.Activity, color: "text-primary", bg: "bg-primary/10" },
                      { label: "Cumulative VPI Index", value: vpiData.userMetrics?.cumulativeVpi?.toFixed(2) || "0.00", max: "/ 4.00", icon: Icons.TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
                      { label: "Accredited Hours", value: vpiData.userMetrics?.totalVolunteerHours?.toFixed(1) || "0", max: "Hours", icon: Icons.Clock, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { label: "Task Performance", value: vpiData.currentMonth?.taskPerformance?.toFixed(2) || "0.00", max: "/ 4.00", icon: Icons.Target, color: "text-amber-400", bg: "bg-amber-400/10" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-white">{s.value}</p>
                          <p className="text-sm font-bold text-slate-500">{s.max}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                      <h3 className="text-xl font-bold text-white mb-6">Current Month VPI Calculation Details</h3>
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                          <div>
                            <p className="text-sm font-bold text-white">Task Evaluation (GPA)</p>
                            <p className="text-[10px] text-slate-400 mt-1">Accounts for 50% of VPI</p>
                          </div>
                          <span className="text-xl font-bold text-primary">{vpiData.currentMonth?.taskPerformance?.toFixed(2) || 0} / 4.0</span>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                          <div>
                            <p className="text-sm font-bold text-white">Comprehensive Monthly Evaluation</p>
                            <p className="text-[10px] text-slate-400 mt-1">Accounts for 30% of VPI</p>
                          </div>
                          <span className="text-xl font-bold text-primary">{vpiData.currentMonth?.monthlyPoints || 0} / 100</span>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                          <div>
                            <p className="text-sm font-bold text-white">Hours Completion Rate</p>
                            <p className="text-[10px] text-slate-400 mt-1">Accounts for 20% of VPI ({vpiData.currentMonth?.completedHours || 0} out of {vpiData.currentMonth?.requiredHours || 20} required hours)</p>
                          </div>
                          <span className="text-xl font-bold text-primary">{vpiData.currentMonth?.requiredHours ? Math.min((vpiData.currentMonth?.completedHours / vpiData.currentMonth?.requiredHours) * 100, 100).toFixed(0) : 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                      <h3 className="text-xl font-bold text-white mb-6">Recent Accredited Hours Log</h3>
                      <div className="space-y-4">
                        {vpiData.hoursHistory?.length > 0 ? vpiData.hoursHistory.map((h: any) => (
                          <div key={h.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                            <div>
                              <p className="text-sm font-bold text-white">{h.description || "Volunteer Hours"}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(h.createdAt).toLocaleDateString("en-US")}</p>
                            </div>
                            <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-lg">+{h.hours} hours</span>
                          </div>
                        )) : (
                          <div className="text-center py-10 text-slate-500 text-sm">No accredited hours this month.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EVALUATIONS TAB */}
              {tab === "evaluations" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">My Performance</p>
                      <h1 className="text-4xl font-bold text-white">Monthly Evaluations</h1>
                    </div>
                  </div>
                  
                  {evaluations.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
                      <Icons.Star className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">No Evaluations Yet</h3>
                      <p className="text-slate-500">Your evaluations will appear here once submitted by admins.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {evaluations.map((ev: any, i: number) => (
                        <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/10 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex flex-col items-center justify-center border border-white/10 text-primary">
                                <span className="text-xs font-bold uppercase tracking-widest">{new Date(ev.month).toLocaleString('en-US', { month: 'short' })}</span>
                                <span className="text-xl font-bold">{new Date(ev.month).getFullYear()}</span>
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">Month Evaluation</h3>
                                <p className="text-slate-400">Total Score: <span className="text-primary font-bold">{ev.totalScore}/100</span></p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-64">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-white">Performance Score</span>
                                <span className="text-primary">{ev.totalScore}%</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${ev.totalScore}%` }} />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                              { label: "Attendance", val: ev.attendance },
                              { label: "Task Comp.", val: ev.taskCompletion },
                              { label: "Time Com.", val: ev.timeCommitment },
                              { label: "Quality", val: ev.reportQuality },
                              { label: "Tech Skills", val: ev.technicalSkills },
                              { label: "Conduct", val: ev.professionalConduct },
                              { label: "Innovation", val: ev.innovation },
                              { label: "Policy", val: ev.policyCompliance },
                              { label: "Teamwork", val: ev.teamCollaboration },
                              { label: "Contribution", val: ev.positiveContribution }
                            ].map((c, j) => (
                              <div key={j} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{c.label}</span>
                                <div className="flex items-end justify-between">
                                  <span className="text-2xl font-bold text-white">{c.val}</span>
                                  <span className="text-xs text-slate-500">/ 10</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {tab === "documents" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Official File</p>
                      <h1 className="text-4xl font-bold text-white">Official Documents</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Request Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 sticky top-8">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                          <Icons.FilePlus className="text-primary w-6 h-6" />
                          Request New Document
                        </h3>
                        <div className="space-y-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Document Type</label>
                            <select
                              value={docForm.type}
                              onChange={e => {
                                const t = e.target.value;
                                const labels: Record<string, { title: string; titleAr: string }> = {
                                  VOLUNTEER_CERT: { title: "Volunteer Certificate", titleAr: "Volunteer Certificate" },
                                  RECOMMENDATION: { title: "Recommendation Letter", titleAr: "Recommendation Letter" },
                                  EXPERIENCE_CERT: { title: "Experience Certificate", titleAr: "Experience Certificate" },
                                  PERFORMANCE_REPORT: { title: "Performance Report", titleAr: "Performance Report" },
                                  COMPREHENSIVE_REPORT: { title: "Comprehensive Report", titleAr: "Comprehensive Report" },
                                };
                                setDocForm(p => ({ ...p, type: t, ...labels[t] }));
                              }}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                            >
                              <option value="VOLUNTEER_CERT" className="bg-slate-900">Volunteer Certificate</option>
                              <option value="RECOMMENDATION" className="bg-slate-900">Recommendation Letter</option>
                              <option value="EXPERIENCE_CERT" className="bg-slate-900">Experience Certificate</option>
                              <option value="PERFORMANCE_REPORT" className="bg-slate-900">Performance Report</option>
                              <option value="COMPREHENSIVE_REPORT" className="bg-slate-900">Comprehensive Report</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Purpose</label>
                            <select
                              value={docForm.purpose}
                              onChange={e => setDocForm(p => ({ ...p, purpose: e.target.value }))}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                            >
                              <option value="UNIVERSITY" className="bg-slate-900">University</option>
                              <option value="EMPLOYMENT" className="bg-slate-900">Employment</option>
                              <option value="MILITARY" className="bg-slate-900">Military</option>
                              <option value="SCHOLARSHIP" className="bg-slate-900">Scholarship</option>
                              <option value="COMMUNITY" className="bg-slate-900">Community</option>
                            </select>
                          </div>
                          <button
                            onClick={handleRequestDocument}
                            disabled={docSubmitting}
                            className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-bold transition-all shadow-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                          >
                            {docSubmitting ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Send className="w-5 h-5" />}
                            Submit Request
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Documents List */}
                    <div className="lg:col-span-2 space-y-6">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">My Documents ({myDocuments.length})</h3>
                      {myDocuments.length === 0 ? (
                        <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center">
                          <Icons.FileText className="w-16 h-16 text-slate-700 mb-6" />
                          <h3 className="text-xl font-bold text-white mb-2">No Documents</h3>
                          <p className="text-slate-500 text-sm">You can request an official document from the adjacent form.</p>
                        </div>
                      ) : (
                        myDocuments.map((doc: any, i: number) => {
                          const typeLabels: Record<string, string> = {
                            RECOMMENDATION: "Recommendation Letter", VOLUNTEER_CERT: "Volunteer Certificate",
                            EXPERIENCE_CERT: "Experience Certificate", PERFORMANCE_REPORT: "Performance Report"
                          };
                          const hasUrl = !!doc.documentUrl;
                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group bg-white/5 border border-white/5 rounded-[24px] p-6 hover:bg-white/10 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${hasUrl ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                                  {hasUrl ? <Icons.FileCheck className="text-emerald-400 w-6 h-6" /> : <Icons.Clock className="text-amber-400 w-6 h-6" />}
                                </div>
                                <div>
                                  <h4 className="text-base font-bold text-white">{doc.titleAr}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md">{typeLabels[doc.type] || doc.type}</span>
                                    <span className="text-[10px] text-slate-600">{new Date(doc.createdAt).toLocaleDateString("en-US")}</span>
                                    {doc.referenceNo && <span className="text-[10px] text-slate-600 font-mono">#{doc.referenceNo.slice(0,8)}</span>}
                                  </div>
                                </div>
                              </div>
                              <div>
                                {hasUrl ? (
                                  <button
                                    onClick={() => {
                                      if (!user) return;
                                      const clientTypes = ["VOLUNTEER_CERT", "EXPERIENCE_CERT", "RECOMMENDATION", "PERFORMANCE_REPORT", "COMPREHENSIVE_REPORT"];
                                      if (clientTypes.includes(doc.type)) {
                                        generateCertificate(user, doc, {
                                          completedHours: vpiData?.userMetrics?.totalVolunteerHours || 0,
                                          totalScore: scoreBreakdown?.total || 0,
                                          vpiScore: vpiData?.userMetrics?.cumulativeVpi?.toFixed(2) || "0.00",
                                          completedTasks: tasks.filter(t => t.submissions?.length).length,
                                          badgeCount: user.badges?.length || 0
                                        });
                                      } else if (doc.documentUrl) {
                                        window.open(doc.documentUrl, "_blank");
                                      }
                                    }}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                                  >
                                    <Icons.Download className="w-4 h-4" />
                                    Download
                                  </button>
                                ) : (
                                  <span className="px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl text-[10px] font-bold">Processing</span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SCORE TAB */}
              {tab === "score" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Analytics</p>
                      <h1 className="text-4xl font-bold text-white">Performance Analysis</h1>
                    </div>
                    <button 
                      onClick={handleDownloadReport}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3"
                    >
                      <Icons.Download className="w-4 h-4 text-primary" />
                      Download Performance Report
                    </button>
                  </div>

                  {scoreBreakdown && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 text-center relative overflow-hidden">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Overall Evaluation</p>
                          <div className="relative inline-flex items-center justify-center">
                            <svg className="w-48 h-48 -rotate-90">
                              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                              <motion.circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.9} initial={{ strokeDashoffset: 552.9 }} animate={{ strokeDashoffset: 552.9 - (552.9 * scoreBreakdown.total) / 100 }} className="text-primary" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-6xl font-black text-white tracking-tighter">{scoreBreakdown.total}</span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ 100</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Icons.Radar className="w-4 h-4 text-primary" />
                            Skills Footprint
                          </h3>
                          <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="#ffffff05" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} />
                                <Radar name="My Performance" dataKey="value" stroke="#701b73" fill="#701b73" fillOpacity={0.4} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10">
                          <h3 className="text-xl font-bold text-white mb-8">Evaluation Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {[
                              { label: "Task Completion", weight: "40%", value: scoreBreakdown.tasks, color: "bg-primary", icon: Icons.Briefcase },
                              { label: "Punctuality", weight: "30%", value: scoreBreakdown.deadlines, color: "bg-blue-500", icon: Icons.Clock },
                              { label: "Attendance & Activity", weight: "20%", value: scoreBreakdown.attendance, color: "bg-emerald-500", icon: Icons.Users },
                              { label: "Overall Engagement", weight: "10%", value: scoreBreakdown.engagement, color: "bg-amber-500", icon: Icons.MessageSquare },
                            ].map((item, i) => (
                              <div key={i} className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${item.color}/10 flex items-center justify-center`}>
                                      <item.icon className={`w-4 h-4 ${item.color.replace("bg-", "text-")}`} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-white">{item.label}</p>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Weight: {item.weight}</p>
                                    </div>
                                  </div>
                                  <span className="text-xl font-bold text-white">{item.value}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} className={`h-full ${item.color}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {scoreLogs.length > 0 && (
                          <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
                            <div className="px-10 py-6 border-b border-white/5 bg-white/5">
                              <h3 className="text-sm font-bold text-white flex items-center gap-3 uppercase tracking-widest">
                                <Icons.History className="w-4 h-4 text-primary" />
                                Recent Points Log
                              </h3>
                            </div>
                            <div className="divide-y divide-white/5">
                              {scoreLogs.slice(0, 5).map((log: any) => (
                                <div key={log.id} className="px-10 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                  <p className="text-sm font-medium text-slate-300">{log.reason}</p>
                                  <div className="flex items-center gap-4">
                                    <span className={`text-sm font-bold ${log.delta > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                      {log.delta > 0 ? "+" : ""}{log.delta}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-600">{new Date(log.createdAt).toLocaleDateString("en-US")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GAMIFICATION TAB */}
              {tab === "gamification" && (
                <div className="space-y-12">
                   <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Journey</p>
                      <h1 className="text-4xl font-bold text-white">Achievements Center</h1>
                    </div>
                  </div>

                  {/* Leaderboard Spotlight */}
                  <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                       <h3 className="text-xl font-bold text-white flex items-center gap-3">
                         <Icons.Crown className="text-amber-400 w-6 h-6" />
                         Leaderboard ({user?.department?.name} Department)
                       </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {leaderboard.slice(0, 5).map((entry: any, i: number) => (
                        <div key={entry.id} className={`flex items-center gap-8 px-10 py-6 transition-all ${entry.id === user?.id ? "bg-primary/10 border-r-4 border-primary" : "hover:bg-white/5"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${i === 0 ? "bg-amber-400 text-amber-950 shadow-glow" : i === 1 ? "bg-slate-300 text-slate-900" : i === 2 ? "bg-orange-400/20 text-orange-400" : "bg-white/5 text-slate-500"}`}>
                            {i === 0 ? "👑" : i + 1}
                          </div>
                          <div className="flex-1 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg">{entry.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-bold text-white">{entry.name} {entry.id === user?.id && <span className="text-[10px] bg-primary px-2 py-0.5 rounded-md mr-2">You</span>}</p>
                              <div className="flex gap-1 mt-1">
                                {entry.badges?.slice(0, 3).map((b: any, bi: number) => <span key={bi} className="text-base" title={b.nameAr}>{b.icon}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-primary tracking-tighter">{entry.score}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div className="space-y-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Icons.Award className="text-primary w-6 h-6" />
                      Badge Locker
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {badges.earned.map(b => (
                        <motion.div key={b.id} whileHover={{ y: -5 }} className="bg-white/5 border-2 border-primary/20 rounded-[32px] p-8 text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform relative z-10">{b.icon}</span>
                           <p className="text-xs font-bold text-white mb-1 relative z-10">{b.name || b.nameAr}</p>
                           <p className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">+{b.points} XP</p>
                        </motion.div>
                      ))}
                      {badges.available.map(b => (
                        <div key={b.id} className="bg-white/5 border border-white/5 rounded-[32px] p-8 text-center opacity-40 grayscale group cursor-help relative">
                           <Icons.Lock className="absolute top-4 left-4 w-4 h-4 text-slate-700" />
                           <span className="text-5xl block mb-4">{b.icon}</span>
                           <p className="text-xs font-bold text-slate-400 mb-1">{b.name || b.nameAr}</p>
                           <p className="text-[9px] text-slate-600 font-medium leading-tight">{b.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI TAB */}
              {tab === "ai" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Smart Responsibility</p>
                      <h1 className="text-4xl font-bold text-white">AI Assistant</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                       <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5 rounded-[40px] p-12 relative overflow-hidden">
                          <Icons.Cpu className="absolute top-[-10%] left-[-10%] w-64 h-64 text-primary/5 -rotate-12" />
                          <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-6">Performance Suggestions</h3>
                            {insights.length === 0 ? (
                              <div className="text-center py-20">
                                <Icons.CheckCircle className="w-16 h-16 text-emerald-500/30 mx-auto mb-6" />
                                <p className="text-slate-500 font-medium">Your performance is currently perfect, no urgent alerts! Keep up the creativity. ✨</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {insights.map((ins, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className={`p-6 rounded-3xl border ${insightColors[ins.type]} hover:scale-[1.01] transition-transform`}>
                                    <p className="text-white font-bold text-sm mb-2">{ins.title}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{ins.message}</p>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                       </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
                       <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
                         <Icons.MessageSquare className="text-primary w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-bold text-white mb-4">Direct Communication</h3>
                       <p className="text-slate-500 text-xs leading-relaxed mb-8">You can talk to the AI assistant to get personalized advice to develop your skills or inquire about entity regulations.</p>
                       <button 
                         onClick={() => setShowAiChat(true)}
                         className="px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-2xl font-bold text-sm shadow-glow hover:scale-105 transition-all"
                       >
                         Start Conversation Now
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Profile</p>
                      <h1 className="text-4xl font-bold text-white">Settings</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Avatar Upload */}
                    <div className="lg:col-span-1">
                      <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 text-center">
                        <div className="relative inline-block mb-8">
                          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-white/5 overflow-hidden">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Icons.User className="w-16 h-16" />
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center cursor-pointer shadow-glow hover:scale-110 transition-transform">
                            <Icons.Camera className="text-white w-5 h-5" />
                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                          </label>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{user?.name}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user?.role}</p>
                      </div>
                    </div>

                    {/* Profile Forms */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white/5 border border-white/5 rounded-[40px] p-10">
                        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                          <Icons.User className="text-primary w-5 h-5" />
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                            <input 
                              type="text" 
                              value={profileForm.name}
                              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                            <input 
                              type="email" 
                              value={profileForm.email}
                              onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>



                      <div className="bg-white/5 border border-white/5 rounded-[40px] p-10">
                        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                          <Icons.Lock className="text-rose-400 w-5 h-5" />
                          Change Password
                        </h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                            <input 
                              type="password" 
                              value={profileForm.currentPassword}
                              onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Password</label>
                              <input 
                                type="password" 
                                value={profileForm.newPassword}
                                onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
                              <input 
                                type="password" 
                                value={profileForm.confirmPassword}
                                onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="w-full bg-primary hover:bg-primary-light text-white py-5 rounded-[24px] font-bold transition-all shadow-glow hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {saving ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Save className="w-5 h-5" />}
                        Save All Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* NOTIFICATIONS TAB */}
              {tab === "notifications" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Alerts & Events</p>
                      <h1 className="text-4xl font-bold text-white">Notifications Center</h1>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 flex flex-col items-center">
                        <Icons.Bell className="w-16 h-16 text-slate-700 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">No Notifications Currently</h3>
                        <p className="text-slate-500 text-sm">You're all caught up. Notifications will be sent here when there are updates.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notif: any) => (
                          <div key={notif.id} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex gap-5 items-start hover:bg-white/5 transition-all">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${notif.type === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : notif.type === "WARNING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                              {notif.type === "SUCCESS" ? <Icons.CheckCircle className="w-5 h-5" /> : notif.type === "WARNING" ? <Icons.AlertTriangle className="w-5 h-5" /> : <Icons.Bell className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-white font-bold mb-1 text-sm">{notif.title}</h4>
                              <p className="text-slate-400 text-xs leading-relaxed mb-3">{notif.message}</p>
                              <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full">{new Date(notif.createdAt).toLocaleString("en-US")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CHAT TAB */}
              {tab === "chat" && (
                <ChatRoom />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
