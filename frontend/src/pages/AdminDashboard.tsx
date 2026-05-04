import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
// @ts-ignore
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "../lib/utils";

const heroBanner = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80";

const COLORS = ["#701b73", "#9333ea", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const normalizeArabic = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .toString()
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّ]/g, "") // Remove diacritics
    .toLowerCase()
    .trim();
};

const AdminDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme, customColor, setCustomColor } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [rejectReason, setRejectReason] = useState<Record<number,string>>({});
  const [credentials, setCredentials] = useState<any>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", departmentId: "", deadline: "", points: "10" });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture ? `${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}` : null);
  const [saving, setSaving] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>("general");
  const [msgContent, setMsgContent] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedTaskSubmissions, setSelectedTaskSubmissions] = useState<any | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [evalModal, setEvalModal] = useState<any | null>(null);
  const [localEval, setLocalEval] = useState<any>({});
  const [vpiLeaderboard, setVpiLeaderboard] = useState<any[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);

  const [vpiMonth, setVpiMonth] = useState(new Date().toISOString().slice(0, 7));
  const [executiveStats, setExecutiveStats] = useState<any[]>([]);
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  // Member Profile Modal State
  const [memberProfile, setMemberProfile] = useState<any | null>(null);
  const [memberProfileLoading, setMemberProfileLoading] = useState(false);
  const [selectedMemberForView, setSelectedMemberForView] = useState<any>(null);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold">جاري تحميل بيانات المسؤول...</p>
        </div>
      </div>
    );
  }

  const getIcon = (name: string) => (Icons as any)[name] || Icons.HelpCircle || Icons.Circle || Icons.User || (() => null);

  const LayoutDashboard = getIcon("LayoutDashboard");
  const Users = getIcon("Users");
  const UserPlus = getIcon("UserPlus");
  const CheckSquare = getIcon("CheckSquare");
  const BarChart3 = getIcon("BarChart3");
  const Trophy = getIcon("Trophy");
  const ShieldAlert = getIcon("ShieldAlert");
  const LogOut = getIcon("LogOut");
  const ChevronLeft = getIcon("ChevronLeft");
  const ChevronRight = getIcon("ChevronRight");
  const Search = getIcon("Search");
  const Bell = getIcon("Bell");
  const Menu = getIcon("Menu");
  const Settings = getIcon("Settings");
  const Rocket = getIcon("Rocket");
  const User = getIcon("User");
  const Activity = getIcon("Activity");
  const Cpu = getIcon("Cpu");
  const Check = getIcon("Check");
  const CreditCard = getIcon("CreditCard");
  const MapPin = getIcon("MapPin");
  const Layers = getIcon("Layers");
  const Filter = getIcon("Filter");
  const Trash2 = getIcon("Trash2");
  const PlusSquare = getIcon("PlusSquare");
  const List = getIcon("List");
  const Grid = getIcon("Grid");
  const Users2 = getIcon("Users2");
  const X = getIcon("X");
  const Building = getIcon("Building");
  const CheckCircle = getIcon("CheckCircle");
  const ClipboardList = getIcon("ClipboardList");
  const Camera = getIcon("Camera");
  const Save = getIcon("Save");
  const Loader2 = getIcon("Loader2");
  const Star = getIcon("Star");
  const RefreshCw = getIcon("RefreshCw");
  const Edit3 = getIcon("Edit3");
  const Eye = getIcon("Eye");
  const MessageSquare = getIcon("MessageSquare");
  const Target = getIcon("Target");
  const Award = getIcon("Award");
  const TrendingUp = getIcon("TrendingUp");
  const Clock = getIcon("Clock");
  const UserX = getIcon("UserX");
  const Download = getIcon("Download");
  const UserCheck = getIcon("UserCheck");
  const Inbox = getIcon("Inbox");
  const FileCheck = getIcon("FileCheck");
  const Palette = getIcon("Palette");
  const Lock = getIcon("Lock");
  const Bot = getIcon("Bot");
  const ArrowUp = getIcon("ArrowUp");
  const History = getIcon("History");
  const Sparkles = getIcon("Sparkles");
  const Send = getIcon("Send");
  const Smile = getIcon("Smile");
  const Diamond = getIcon("Diamond");
  const CheckCircle2 = getIcon("CheckCircle2");
  const UserMinus = getIcon("UserMinus");
  const FileIcon = getIcon("FileText");
  const Calendar = getIcon("Calendar");
  const CalendarCheck = getIcon("CalendarCheck");

  useEffect(() => {
    if (tab === "evaluations") fetchEvaluations();
    if (tab === "vpi-dashboard") fetchVpiLeaderboard();
    if (tab === "documents") fetchPendingDocuments();
  }, [tab, selectedMonth, vpiMonth]);

  const loadAll = async () => {
    // Helper to fetch data safely and enforce arrays
    const fetchSafe = async (url: string, setter: (d: any) => void, isArray: boolean = true) => {
      try {
        const res = await api.get(url);
        const data = res.data.users || res.data.departments || res.data.leaderboard || res.data.tasks || res.data.evaluations || res.data.documents || res.data.applications || res.data;
        setter(isArray ? (Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : [])) : data);
      } catch (err) {
        console.error(`Failed to fetch ${url}:`, err);
        setter(isArray ? [] : null);
      }
    };

    await Promise.all([
      fetchSafe("/admin/users/pending", setPending),
      fetchSafe("/admin/users/approved", setApproved),
      fetchSafe("/admin/users/rejected", setRejected),
      fetchSafe("/admin/analytics", setAnalytics, false),
      fetchSafe("/ai/insights", setInsights),
      fetchSafe("/scoring/leaderboard", setLeaderboard),
      fetchSafe("/tasks", setTasks),
      fetchSafe("/departments", setDepartments),
      fetchSafe("/admin/executive-stats", setExecutiveStats)
    ]);
  };

  const showToast = (m: string) => { setToast(m); setTimeout(()=>setToast(""),3500); };

  const approve = async (id: number) => {
    try {
      const r = await api.put(`/admin/users/${id}/approve`);
      setCredentials(r.data);
      showToast("✅ Approved Successfully");
      loadAll();
    } catch(e:any){ showToast("❌ " + e.response?.data?.message); }
  };

  const reject = async (id: number) => {
    try {
      await api.put(`/admin/users/${id}/reject`, { reason: rejectReason[id] || "" });
      showToast("Rejected");
      loadAll();
    } catch(e:any){ showToast("❌ " + e.response?.data?.message); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try { await api.delete(`/admin/users/${id}/revoke`); showToast("Deleted"); loadAll(); } catch {}
  };

  const createTask = async () => {
    try {
      await api.post("/tasks", newTask);
      showToast("✅ Task Created");
      setNewTask({ title:"", description:"", departmentId:"", deadline:"", points:"10" });
      loadAll();
    } catch(e:any){ showToast("❌ " + e.response?.data?.message); }
  };

  const deleteTask = async (id: number) => {
    try { await api.delete(`/tasks/${id}`); showToast("Task Deleted"); loadAll(); } catch {}
  };

  const gradeTask = async (submissionId: number, grade: string) => {
    try {
      await api.post(`/tasks/submissions/${submissionId}/grade`, { letterGrade: grade });
      showToast("✅ Task Graded Successfully");
      loadAll();
      // Update the modal state locally to reflect the new grade without closing it
      if (selectedTaskSubmissions) {
        setSelectedTaskSubmissions((prev: any) => ({
          ...prev,
          submissions: prev.submissions.map((s: any) => s.id === submissionId ? { ...s, letterGrade: grade } : s)
        }));
      }
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Failed to grade task"));
    }
  };

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
        const res = await api.put("/users/profile-picture", fd);
        const newPic = res.data.profilePicture + "?t=" + Date.now();
        if (user) {
          const updatedUser = { ...user, profilePicture: newPic };
          updateUser(updatedUser);
        }
        setAvatarPreview(`${api.defaults.baseURL?.replace("/api", "")}${res.data.profilePicture}?t=${Date.now()}`);
      }
      
      const res = await api.put("/users/profile", {
        name: profileForm.name,
        email: profileForm.email
      });
      updateUser(res.data.user);

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          showToast("❌ كلمة المرور غير متطابقة");
          return;
        }
        await api.put("/users/password", {
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        });
      }

      showToast("✅ تم تحديث البيانات بنجاح");
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "فشل التحديث"));
    } finally {
      setSaving(false);
    }
  };

  const fetchVpiLeaderboard = async () => {
    try {
      const res = await api.get(`/vpi/leaderboard?month=${vpiMonth}`);
      setVpiLeaderboard(res.data.leaderboard);
    } catch {}
  };

  const fetchPendingDocuments = async () => {
    try {
      const res = await api.get("/documents/pending");
      setPendingDocuments(res.data.documents);
    } catch {}
  };



  const handleIssueDocument = async (docId: number, url: string) => {
    try {
      await api.put(`/documents/${docId}/generate`, { documentUrl: url, issuedBy: user?.name });
      showToast("✅ Document Issued");
      fetchPendingDocuments();
    } catch { showToast("❌ Issue Failed"); }
  };

  const fetchMemberProfile = async (userId: number) => {
    setMemberProfileLoading(true);
    try {
      const [profileRes, tasksRes] = await Promise.allSettled([
        api.get(`/admin/users/${userId}/full`),
        api.get(`/tasks`),
      ]);

      const profile = profileRes.status === 'fulfilled' ? profileRes.value?.data?.user : null;
      const allTasks = tasksRes.status === 'fulfilled' ? tasksRes.value?.data?.tasks : [];

      // Find tasks this user submitted
      const userTasks = (allTasks || []).filter((t: any) =>
        t.submissions?.some((s: any) => s.userId === userId)
      );

      // Find matching evaluation & VPI data
      const evalData = (evaluations || []).find((e: any) => e?.userId === userId);
      const vpiRecord = (vpiLeaderboard || []).find((r: any) => r?.userId === userId);

      // Get basic user data from approved list as fallback
      const basicUser = approved.find(u => u.id === userId);

      setMemberProfile({
        ...(profile || basicUser || {}),
        vpiData: vpiRecord || null,
        scoreData: null,
        badgesData: null,
        completedTasks: userTasks,
        evalData: evalData || null,
        badges: basicUser?.badges || [],
      });
    } catch (err) {
      console.error('Failed to fetch member profile:', err);
      const basicUser = approved.find(u => u.id === userId);
      if (basicUser) {
        setMemberProfile({
          ...basicUser,
          vpiData: null,
          scoreData: null,
          badgesData: null,
          completedTasks: [],
          evalData: null,
        });
      }
    } finally {
      setMemberProfileLoading(false);
    }
  };



  const navItems = [
    {id:"overview",label:"Overview",icon: LayoutDashboard},
    {id:"pending",label:`Pending (${pending.length})`,icon: UserPlus},
    {id:"members",label:"Members",icon: Users},
    {id:"rejected",label:`Rejected (${rejected.length})`,icon: UserX || UserMinus || Users},
    {id:"tasks",label:"Tasks",icon: CheckSquare},
    {id:"evaluations",label:"Evaluations",icon: Star},
    {id:"vpi-dashboard",label:"VPI Dashboard",icon: Target},
    {id:"documents",label:"Documents",icon: FileIcon},
    {id:"leaderboard",label:"Leaderboard",icon: Trophy},
    {id:"chat",label:"Chat",icon: MessageSquare},
    {id:"settings",label:"Settings",icon: Settings},
  ];

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${currentChannel}`);
      setChatMessages(res.data.messages);
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    try {
      const res = await api.post(`/chat/${currentChannel}`, { content: msgContent });
      setChatMessages(prev => [...prev, res.data.message]);
      setMsgContent("");
    } catch {}
  };

  useEffect(() => {
    loadAll();
  }, []);

  const fetchChatStatus = async () => {
    try {
      const res = await api.get("/chat/status");
      setChatEnabled(res.data.enabled);
    } catch (err) { console.error(err); }
  };

  const toggleChatStatus = async () => {
    try {
      const newStatus = !chatEnabled;
      await api.post("/chat/status", { enabled: newStatus });
      setChatEnabled(newStatus);
      showToast(newStatus ? "✅ تم تفعيل الشات لجميع المستخدمين" : "🚫 تم تعطيل الشات لجميع المستخدمين");
    } catch (err) {
      showToast("❌ فشل تغيير حالة الشات");
    }
  };

  useEffect(() => {
    fetchChatStatus();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await api.get(`/evaluations?month=${selectedMonth}`);
      setEvaluations(res.data.evaluations);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (tab === "chat") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [tab, currentChannel]);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, tab]);

  const handleDownloadReport = () => {
    window.print();
  };

  const insightColors: Record<string,string> = {
    danger:"border-red-500/50 bg-red-500/10",
    warning:"border-yellow-500/50 bg-yellow-500/10",
    suggestion:"border-blue-500/50 bg-blue-500/10",
    info:"border-green-500/50 bg-green-500/10",
  };

  return (
    <div ref={dashboardRef} className="flex h-screen bg-background font-sans selection:bg-primary/30 overflow-hidden relative dashboard-theme" dir="ltr">
      {/* Global Background Image Overlay (Same as Hero) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
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

      {/* Task Submissions Modal */}
      <AnimatePresence>
        {selectedTaskSubmissions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1e293b] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-glass"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Task Submissions</h3>
                  <p className="text-sm text-slate-400 font-medium">{selectedTaskSubmissions.title}</p>
                </div>
                <button onClick={() => setSelectedTaskSubmissions(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {selectedTaskSubmissions.submissions?.length === 0 ? (
                  <div className="text-center py-20">
                    <Inbox className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No submissions for this task yet.</p>
                  </div>
                ) : (() => {
                      const relevantUsers = approved.filter(u => 
                        !selectedTaskSubmissions.departmentId || u.departmentId === Number(selectedTaskSubmissions.departmentId)
                      );
                      const submitterIds = (selectedTaskSubmissions.submissions || []).map((s: any) => s.userId);
                      const nonSubmitters = relevantUsers.filter(u => !submitterIds.includes(u.id));

                      return (
                        <div className="space-y-10">
                          {/* Submitted Section */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Submitted ({selectedTaskSubmissions.submissions?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              {(selectedTaskSubmissions.submissions || []).map((sub: any) => (
                                <div key={sub.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
                                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                    {sub.user?.name?.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-bold mb-1">{sub.user?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mb-3">{sub.user?.email}</p>
                                    {sub.notes && (
                                      <p className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 italic">"{sub.notes}"</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${sub.isOnTime ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                      {sub.isOnTime ? "✓ On Time" : "⚠ Late"}
                                    </span>
                                    <p className="text-[10px] text-slate-600 font-bold">{new Date(sub.createdAt).toLocaleString("ar-EG")}</p>
                                  </div>
                                  <div className="flex flex-col gap-2 shrink-0">
                                    <a 
                                      href={`${api.defaults.baseURL?.replace("/api", "")}${sub.fileUrl}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="px-6 py-2 bg-white/5 hover:bg-primary text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                      <Download className="w-4 h-4" /> Download
                                    </a>
                                    <div className="flex gap-2">
                                      <select 
                                        defaultValue={sub.letterGrade || ""}
                                        onChange={(e) => {
                                          const newGrade = e.target.value;
                                          if(newGrade) gradeTask(sub.id, newGrade);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary"
                                      >
                                        <option value="" disabled className="bg-slate-900">Grade</option>
                                        <option value="A" className="bg-slate-900 text-emerald-400">A (Excellent)</option>
                                        <option value="B" className="bg-slate-900 text-blue-400">B (Very Good)</option>
                                        <option value="C" className="bg-slate-900 text-amber-400">C (Good)</option>
                                        <option value="D" className="bg-slate-900 text-orange-400">D (Acceptable)</option>
                                        <option value="F" className="bg-slate-900 text-rose-400">F (Fail)</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Not Submitted Section */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                              <UserX className="w-4 h-4" /> Not Submitted ({nonSubmitters.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {nonSubmitters.map((user: any) => (
                                <div key={user.id} className="bg-white/5 border border-rose-500/10 rounded-2xl p-4 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold shrink-0 text-sm">
                                    {user.name?.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{user.name}</p>
                                    <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                                  </div>
                                </div>
                              ))}
                              {nonSubmitters.length === 0 && (
                                <div className="col-span-full p-8 border border-dashed border-white/10 rounded-3xl text-center">
                                  <p className="text-xs text-slate-600 font-medium">All members have submitted this task! 🎉</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {credentials && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1e293b] border border-white/10 rounded-3xl p-10 max-w-md w-full shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserCheck className="text-primary w-8 h-8" />
                Member Accepted Successfully
              </h3>
              <div className="bg-white/5 rounded-2xl p-6 space-y-4 mb-8 border border-white/5">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Username</p>
                  <p className="text-lg text-white font-mono font-bold">{credentials.credentials?.username}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Temporary Password</p>
                  <p className="text-lg text-primary font-mono font-bold">{credentials.credentials?.tempPassword}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className={`text-xs font-bold ${credentials.emailSent ? "text-emerald-400" : "text-amber-400"}`}>
                    {credentials.emailSent ? "✓ Login details sent via email" : "⚠ Please deliver details manually"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCredentials(null)} 
                className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-bold transition-smooth shadow-glow"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {evalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-4xl p-10 shadow-2xl relative my-auto"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-glow">
                    <Star className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{evalModal.user?.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">
                        {evalModal.user?.department?.name || "No Department"}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                        {selectedMonth}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setEvalModal(null)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  userId: evalModal.userId,
                  month: selectedMonth,
                  taskScores: {
                    task1: Number(formData.get("t1s")), task2: Number(formData.get("t2s")),
                    task3: Number(formData.get("t3s")), task4: Number(formData.get("t4s")),
                    task5: Number(formData.get("t5s")),
                  },
                  taskHours: {
                    task1: Number(formData.get("t1h")), task2: Number(formData.get("t2h")),
                    task3: Number(formData.get("t3h")), task4: Number(formData.get("t4h")),
                    task5: Number(formData.get("t5h")),
                  },
                  monthlyPoints: Number(formData.get("monthlyPoints")),
                  completedHours: Number(formData.get("completedHours")),
                  requiredHours: Number(formData.get("requiredHours")),
                };
                try {
                  await api.post("/evaluations/update-vpi", data);
                  fetchEvaluations();
                  fetchVpiLeaderboard();
                  setEvalModal(null);
                  showToast("✅ Evaluation saved & VPI synced successfully");
                } catch (e: any) {
                  showToast("❌ " + (e.response?.data?.message || "Failed to save evaluation"));
                }
              }} className="space-y-10">
                
                {/* Real-time Calculation Logic - Based on Images */}
                {(() => {
                  const getGradePoints = (score: number) => {
                    if (score >= 13) return 4.0;
                    if (score >= 10) return 3.0;
                    if (score >= 7) return 2.0;
                    if (score >= 5) return 1.0;
                    return 0.0;
                  };

                  const getGradeLetter = (score: number) => {
                    if (score >= 13) return "A";
                    if (score >= 10) return "B";
                    if (score >= 7) return "C";
                    if (score >= 5) return "D";
                    return "F";
                  };

                  let totalTaskHours = 0;
                  let totalWeightedPoints = 0;

                  [1, 2, 3, 4, 5].forEach(i => {
                    const s = Number(localEval[`t${i}s`]) || 0;
                    const h = Number(localEval[`t${i}h`]) || 0;
                    if (h > 0) {
                      totalTaskHours += h;
                      totalWeightedPoints += (getGradePoints(s) * h);
                    }
                  });

                  const vT = totalTaskHours > 0 ? (totalWeightedPoints / totalTaskHours) : 0;
                  
                  const mPoints = Number(localEval.monthlyPoints) || 0;
                  const cHours = Number(localEval.completedHours) || 0;
                  const rHours = Number(localEval.requiredHours) || 20;

                  // Formula from Image 2: VPI = (VT * 0.5) + (mPoints/100 * 1.2) + (cHours/rHours * 0.8)
                  const finalVpi = (vT * 0.5) + ((mPoints / 100) * 1.2) + (Math.min(cHours / rHours, 1.2) * 0.8);

                  return (
                    <>
                      {/* Task Performance Table */}
                      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
                        <div className="grid grid-cols-12 bg-white/5 p-4 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          <div className="col-span-3 text-left pl-4">Volunteer Task</div>
                          <div className="col-span-2">Score (0-15)</div>
                          <div className="col-span-2">Grade</div>
                          <div className="col-span-2">Points</div>
                          <div className="col-span-3">Accredited Hours</div>
                        </div>
                        
                        <div className="divide-y divide-white/5">
                          {[1, 2, 3, 4, 5].map(i => {
                            const score = Number(localEval[`t${i}s`]) || 0;
                            return (
                              <div key={i} className="grid grid-cols-12 items-center p-4 hover:bg-white/5 transition-colors">
                                <div className="col-span-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                                    T{i}
                                  </div>
                                  <span className="text-xs font-bold text-slate-300">Volunteer Task {i}</span>
                                </div>
                                <div className="col-span-2 px-2">
                                  <input 
                                    name={`t${i}s`} 
                                    value={localEval[`t${i}s`] || 0}
                                    onChange={e => setLocalEval({...localEval, [`t${i}s`]: e.target.value})}
                                    type="number" step="0.1" max="15"
                                    readOnly
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-center text-sm text-primary font-bold focus:border-primary outline-none transition-all opacity-70 cursor-not-allowed" 
                                  />
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    getGradeLetter(score) === "A" ? "bg-emerald-500/10 text-emerald-400" :
                                    getGradeLetter(score) === "B" ? "bg-blue-500/10 text-blue-400" :
                                    getGradeLetter(score) === "C" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                  }`}>
                                    {getGradeLetter(score)}
                                  </span>
                                </div>
                                <div className="col-span-2 text-center text-sm font-mono font-bold text-white">
                                  {getGradePoints(score).toFixed(1)}
                                </div>
                                <div className="col-span-3 px-4">
                                  <input 
                                    name={`t${i}h`} 
                                    value={localEval[`t${i}h`] || 0}
                                    onChange={e => setLocalEval({...localEval, [`t${i}h`]: e.target.value})}
                                    type="number" step="0.1" 
                                    readOnly
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-center text-sm text-white focus:border-white/30 outline-none transition-all opacity-70 cursor-not-allowed" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Additional Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-[32px]">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 text-center">Monthly Points (0-100)</p>
                          <input 
                            name="monthlyPoints"
                            value={localEval.monthlyPoints || 0}
                            onChange={e => setLocalEval({...localEval, monthlyPoints: e.target.value})}
                            type="number"
                            readOnly
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-center text-xl text-white font-bold focus:border-primary outline-none opacity-70 cursor-not-allowed"
                          />
                          <p className="text-[10px] text-slate-500 mt-2 text-center">Weight: 30%</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-[32px]">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 text-center">Completed Vol. Hours</p>
                          <input 
                            name="completedHours"
                            value={localEval.completedHours || 0}
                            onChange={e => setLocalEval({...localEval, completedHours: e.target.value})}
                            type="number"
                            readOnly
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-center text-xl text-white font-bold focus:border-primary outline-none opacity-70 cursor-not-allowed"
                          />
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-[32px]">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 text-center">Required Hours</p>
                          <input 
                            name="requiredHours"
                            value={localEval.requiredHours || 20}
                            onChange={e => setLocalEval({...localEval, requiredHours: e.target.value})}
                            type="number"
                            readOnly
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-center text-xl text-slate-400 font-bold focus:border-primary outline-none opacity-70 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Summary Results */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-950/50 border border-white/5 p-6 rounded-[32px] text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">VPI_Tasks</p>
                          <p className="text-3xl font-mono font-bold text-white tracking-tighter">{vT.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase">Weight: 50%</p>
                        </div>
                        <div className="bg-slate-950/50 border border-white/5 p-6 rounded-[32px] text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Attendance & Points</p>
                          <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                            {((mPoints/100 * 1.2) + (Math.min(cHours/rHours, 1.2) * 0.8)).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase">Weight: 50% (30+20)</p>
                        </div>
                        <div className="gradient-primary p-6 rounded-[32px] text-center shadow-glow border border-white/10">
                          <p className="text-[10px] text-white/70 font-bold uppercase mb-2">Final VPI</p>
                          <p className="text-4xl font-mono font-bold text-white tracking-tighter">{finalVpi.toFixed(2)}</p>
                          <p className="text-[10px] text-white/70 mt-1 uppercase">Out of 4.00</p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="flex justify-end gap-6 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setEvalModal(null)} className="px-12 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Close</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MEMBER PROFILE MODAL */}
      <AnimatePresence>
        {memberProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-white/10 rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative my-8"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 p-8 flex items-center justify-between z-10 rounded-t-[40px]">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/30 to-indigo-500/20 flex items-center justify-center text-3xl font-bold text-white border border-white/10 shadow-glow overflow-hidden">
                    {memberProfile.profilePicture ? (
                      <img src={`${api.defaults.baseURL?.replace("/api", "")}${memberProfile.profilePicture}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      memberProfile.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{memberProfile.name}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-400 font-mono">{memberProfile.email}</span>
                      {memberProfile.username && <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded-md text-slate-400">@{memberProfile.username}</span>}
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">{memberProfile.department?.name || "No Dept"}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        memberProfile.level === 'Leader' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        memberProfile.level === 'Pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        memberProfile.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>{memberProfile.level}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setMemberProfile(null)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Score", value: `${memberProfile.score || 0}%`, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
                    { label: "Points", value: memberProfile.points || 0, icon: Diamond, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: "Tasks Done", value: memberProfile.completedTasks?.length || memberProfile.taskCount || 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "VPI", value: memberProfile.vpiData?.vpiScore?.toFixed(2) || memberProfile.vpiData?.currentMonth?.vpiScore?.toFixed(2) || "—", icon: Target, color: "text-primary", bg: "bg-primary/10" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/10 transition-all">
                      <s.icon className={`w-6 h-6 mx-auto mb-3 ${s.color}`} />
                      <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Personal Info */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <User className="w-4 h-4 text-primary" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Gender", value: memberProfile.gender === 'male' ? 'Male' : 'Female' },
                      { label: "Governorate", value: memberProfile.governorate || '—' },
                      { label: "Join Date", value: memberProfile.createdAt ? new Date(memberProfile.createdAt).toLocaleDateString('en-US') : '—' },
                      { label: "Status", value: memberProfile.status || 'APPROVED' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VPI Breakdown */}
                {(memberProfile.vpiData || memberProfile.evalData) && (
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Target className="w-4 h-4 text-primary" /> VPI Performance Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Task Performance</p>
                        <p className="text-3xl font-mono font-bold text-white">
                          {memberProfile.vpiData?.taskPerformance?.toFixed(2) || memberProfile.vpiData?.currentMonth?.taskPerformance?.toFixed(2) || memberProfile.evalData?.vpiT?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Weight: 50%</p>
                      </div>
                      <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Monthly Points</p>
                        <p className="text-3xl font-mono font-bold text-white">
                          {memberProfile.vpiData?.monthlyPoints?.toFixed(0) || memberProfile.vpiData?.currentMonth?.monthlyPoints || '0'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Weight: 30%</p>
                      </div>
                      <div className="gradient-primary p-5 rounded-2xl text-center shadow-glow border border-white/10">
                        <p className="text-[10px] text-white/70 font-bold uppercase mb-2">Final VPI</p>
                        <p className="text-3xl font-mono font-bold text-white">
                          {memberProfile.vpiData?.vpiScore?.toFixed(2) || memberProfile.vpiData?.currentMonth?.vpiScore?.toFixed(2) || memberProfile.evalData?.kpi?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-[10px] text-white/70 mt-1">Out of 4.00</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badges */}
                {memberProfile.badgesData?.earned?.length > 0 && (
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Award className="w-4 h-4 text-primary" /> Earned Badges ({memberProfile.badgesData.earned.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {memberProfile.badgesData.earned.map((b: any) => (
                        <div key={b.id} className="bg-white/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all">
                          <span className="text-2xl">{b.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{b.name || b.nameAr}</p>
                            <p className="text-[10px] text-primary font-bold">+{b.points} XP</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Badges (from approved list) */}
                {!memberProfile.badgesData?.earned?.length && memberProfile.badges?.length > 0 && (
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Award className="w-4 h-4 text-primary" /> Badges
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {memberProfile.badges.map((b: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                          <span className="text-2xl">{b.icon}</span>
                          <p className="text-xs font-bold text-white">{b.name || b.nameAr}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setMemberProfile(null);
                      setTab("evaluations");
                    }}
                    className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Evaluate Member
                  </button>
                  <button
                    onClick={() => {
                      setMemberProfile(null);
                      setTab("chat");
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </button>
                  <button
                    onClick={() => deleteUser(memberProfile.id)}
                    className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 mr-auto"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Member
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member View Modal (HR Style) */}
      <AnimatePresence>
        {selectedMemberForView && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedMemberForView(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-2xl glass-card border border-white/10 p-6 md:p-8 z-10 flex flex-col max-h-[90vh] overflow-hidden"
              dir="rtl"
            >
              <button 
                onClick={() => setSelectedMemberForView(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedMemberForView.name?.charAt(0)}
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white">{selectedMemberForView.name}</h3>
                  <p className="text-sm text-slate-400">{selectedMemberForView.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-md bg-white/5 text-xs text-slate-300">
                    {selectedMemberForView.department?.name || "بدون لجنة"} - {selectedMemberForView.level}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                {/* Attendance Section */}
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 justify-end">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    سجل الحضور والغياب
                  </h4>
                  {(() => {
                    const records = selectedMemberForView.attendanceRecords || [];
                    const present = records.filter((r: any) => r.status === "PRESENT" || r.status === "EXCUSED").length;
                    const total = records.length;
                    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
                    const absences = records.filter((r: any) => r.status === "ABSENT");

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl flex-row-reverse">
                          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-bold shrink-0" 
                               style={{ borderColor: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444', color: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {percentage}%
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">نسبة الحضور</p>
                            <p className="text-xs text-slate-400">حضر {present} من أصل {total} فعالية مسجلة</p>
                          </div>
                        </div>

                        {absences.length > 0 && (
                          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                            <h5 className="text-xs font-bold text-rose-400 mb-2">أيام الغياب ({absences.length}):</h5>
                            <ul className="list-disc list-inside text-xs text-rose-300/80 space-y-1">
                              {absences.slice(0, 5).map((a: any, i: number) => (
                                <li key={i}>{a.date} {a.excuse ? `(سبب: ${a.excuse})` : ''}</li>
                              ))}
                              {absences.length > 5 && <li>...و {absences.length - 5} أيام أخرى</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Evaluation Section */}
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 justify-end">
                    <Star className="w-4 h-4 text-amber-400" />
                    آخر تقييم شهري
                  </h4>
                  {(() => {
                    const latestEval = selectedMemberForView.evaluations?.[0];
                    if (!latestEval) {
                      return <p className="text-xs text-slate-500 bg-white/5 p-4 rounded-xl border border-white/5">لا توجد تقييمات مسجلة بعد لهذا العضو.</p>;
                    }
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-1">شهر التقييم</p>
                          <p className="text-sm font-bold text-white">{latestEval.month}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-1">نسبة الإنجاز (Achievement)</p>
                          <p className="text-sm font-bold text-white">{latestEval.achievementRate?.toFixed(1) || 0}%</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-1">تقييم المهام (VPI Tasks)</p>
                          <p className="text-sm font-bold text-white">{latestEval.vpiT?.toFixed(2) || 0} / 4.0</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-1">تقييم الاجتماعات (VPI Meetings)</p>
                          <p className="text-sm font-bold text-white">{latestEval.vpiM?.toFixed(2) || 0} / 4.0</p>
                        </div>
                        {latestEval.rating && (
                          <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">التقييم النوعي</p>
                            <p className="text-sm text-white/90 leading-relaxed">{latestEval.rating}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Updated with Home Colors/Logo */}
      <aside className={cn(
        "bg-slate-900/80 border-l border-white/5 flex flex-col relative z-50 backdrop-blur-3xl shadow-2xl transition-all duration-500",
        isSidebarCollapsed ? "w-24" : "w-72"
      )}>
        <div className="p-8 pb-12 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer overflow-hidden">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow shrink-0 group-hover:scale-110 transition-smooth">
              <Rocket className="text-white w-7 h-7" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-white font-black text-xl tracking-tighter block leading-none whitespace-nowrap">Opportunity Makers</span>
                <span className="text-[10px] text-primary-lighter font-bold uppercase tracking-[0.2em] whitespace-nowrap">ADMIN PANEL</span>
              </motion.div>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-smooth relative ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-2xl shadow-glow"
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                {!isSidebarCollapsed && <span className="text-sm font-semibold relative z-10">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {!isSidebarCollapsed && (
            <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-white/5">
                  {user?.profilePicture ? (
                    <img src={`${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}${user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Administrator</p>
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-smooth"
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-md relative z-40">
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 w-96">
            <Search className="text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search for members, tasks, or reports..."
              className="bg-transparent border-none text-sm text-foreground focus:ring-0 w-full placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
            </button>
            <button 
              onClick={() => setTab("chat")}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all relative ${tab === "chat" ? "text-primary border-primary/30" : "text-slate-400 hover:text-white"}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-900" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white leading-none mb-1">Control Center</p>
                <p className="text-[10px] text-emerald-400 font-mono">ONLINE</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={`${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}${user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-8 relative z-30 scrollbar-hide">
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
                    <h1 className="text-3xl font-bold text-primary">Comprehensive Admin Report</h1>
                    <p className="text-sm text-slate-500 mt-1">Opportunity Makers - Control & Analysis System</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{new Date().toLocaleDateString("ar-EG")}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Admin Certified Report</p>
                  </div>
                </div>
              </div>
              {/* OVERVIEW TAB */}
              {tab === "overview" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">System Statistics</p>
                      <h1 className="text-4xl font-bold text-white">Overview</h1>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleDownloadReport}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3"
                      >
                        <Download className="w-4 h-4 text-primary" />
                        Download Report
                      </button>
                      <button onClick={loadAll} className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-glow hover:scale-105 transition-all">
                        Refresh Data
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Members", value: analytics?.totalMembers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", trend: "+12%" },
                      { label: "Pending Requests", value: (pending || []).length, icon: UserPlus, color: "text-amber-400", bg: "bg-amber-400/10", trend: "0%" },
                      { label: "Active Tasks", value: (tasks || []).length, icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-400/10", trend: "+5%" },
                      { label: "Central Depts", value: (departments || []).length, icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10", trend: "0%" },
                    ].map((s, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-white">{s.value}</p>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${s.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                            {s.trend}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Executive Committee Snapshots */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <Layers className={`text-primary w-5 h-5`} />
                        Executive Committee Performance
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Data Integration</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {(executiveStats || []).map((dept, i) => (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all border-l-4"
                          style={{ borderLeftColor: i % 2 === 0 ? 'var(--dash-primary)' : '#a855f7' }}
                        >
                          <h4 className="text-xs font-bold text-white mb-4 text-right">{dept.name}</h4>
                          <div className="space-y-3">
                            {dept.metrics.map((m: any, mi: number) => (
                              <div key={mi} className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{m.label}</span>
                                <span className="text-xs font-bold text-white">
                                  {m.format === 'currency' ? `$${m.value.toLocaleString()}` : m.value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-bold">
                            <span className="text-emerald-400">STATUS: ON TRACK</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights & Charts Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts (2 cols) */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                          <BarChart3 className="text-primary w-5 h-5" />
                          Level Growth Analysis
                        </h3>
                        <div className="h-[300px] w-full">
                          {analytics && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analytics?.levelData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#701b73" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.5} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                <Tooltip 
                                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "white" }}
                                />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Gender Distribution</h3>
                          <div className="h-[200px]">
                            {analytics && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={analytics?.genderData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                    {(analytics?.genderData || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px" }} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col justify-center text-center">
                          <Activity className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                          <h3 className="text-2xl font-bold text-white mb-2">System Stable</h3>
                          <p className="text-slate-500 text-sm">All performance indicators are on track for this month.</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Sidebar (1 col) */}
                    <div className="space-y-6">
                      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                          <Cpu className="text-primary w-5 h-5" />
                          AI Insights
                        </h3>
                        <div className="space-y-4">
                          {(insights || []).slice(0, 4).map((ins, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={`p-4 rounded-2xl border ${insightColors[ins.type]} transition-smooth hover:scale-[1.02] cursor-default`}
                            >
                              <p className="text-white font-bold text-xs mb-1">{ins.title}</p>
                              <p className="text-slate-400 text-[10px] leading-relaxed">{ins.message}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING TAB */}
              {tab === "pending" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-2">Users</p>
                      <h1 className="text-4xl font-bold text-white">Join Requests</h1>
                    </div>
                    <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm text-slate-400">
                      Total Pending: <span className="text-white font-bold">{pending.length}</span>
                    </div>
                  </div>

                  {pending.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <Check className="text-emerald-400 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Requests</h3>
                      <p className="text-slate-500">All pending requests processed successfully.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {pending.filter(u => {
                        const q = normalizeArabic(searchQuery);
                        return normalizeArabic(u.name).includes(q) || normalizeArabic(u.email).includes(q);
                      }).map((u, i) => (
                        <motion.div 
                          key={u.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all flex flex-col md:flex-row gap-6 items-start"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                            {u.name?.charAt(0)}
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">{u.name}</h3>
                                <p className="text-slate-500 text-sm font-mono">{u.email}</p>
                              </div>
                              <span className="text-[10px] font-bold px-3 py-1 bg-white/5 rounded-full text-slate-400">
                                {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <CreditCard className="w-3 h-3 text-primary" />
                                {u.nationalIdMasked}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin className="w-3 h-3 text-primary" />
                                {u.governorate}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Layers className="w-3 h-3 text-primary" />
                                {u.department?.name || "No Dept"}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <User className="w-3 h-3 text-primary" />
                                {u.gender === "male" ? "Male" : "Female"}
                              </div>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4">
                              <input 
                                value={rejectReason[u.id] || ""} 
                                onChange={e => setRejectReason(p => ({ ...p, [u.id]: e.target.value }))}
                                placeholder="Add rejection notes..."
                                className="flex-1 bg-white/5 border border-white/5 text-white text-xs px-4 py-3 rounded-xl placeholder:text-slate-700 focus:outline-none focus:border-primary/50"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => approve(u.id)} 
                                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-smooth shadow-lg shadow-emerald-900/20"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => reject(u.id)} 
                                  className="px-6 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/20 rounded-xl text-xs font-bold transition-smooth"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MEMBERS TAB */}
              {tab === "members" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-2">Database</p>
                      <h1 className="text-4xl font-bold text-white">Approved Members</h1>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search member..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <button className="p-2 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white">
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          {["Name", "Dept", "Score", "Level", "Status", "Action"].map(h => (
                            <th key={h} className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {approved.filter(u => {
                          const q = normalizeArabic(searchQuery);
                          return normalizeArabic(u.name).includes(q) || (u.username && normalizeArabic(u.username).includes(q));
                        }).map((u, i) => (
                          <motion.tr 
                            key={u.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-white/10 transition-colors group"
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                  {u.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{u.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{u.username || "—"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-400 font-bold">{u.department?.name || "—"}</td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${u.score}%` }} />
                                </div>
                                <span className="text-xs font-bold text-white">{u.score}%</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                                {u.level}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={async () => {
                                    setMemberProfileLoading(true);
                                    try {
                                      const res = await api.get(`/admin/users/${u.id}/full`);
                                      setSelectedMemberForView(res.data.user);
                                    } catch (err) {
                                      showToast("❌ فشل تحميل البيانات");
                                    } finally {
                                      setMemberProfileLoading(false);
                                    }
                                  }}
                                  className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                                  title="Quick Stats"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => fetchMemberProfile(u.id)}
                                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
                                >
                                  <Activity className="w-3 h-3" />
                                  Full Profile
                                </button>
                                <button 
                                  onClick={() => deleteUser(u.id)}
                                  className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        {approved.length > 0 && approved.filter(u => {
                          const q = normalizeArabic(searchQuery || "");
                          return normalizeArabic(u.name).includes(q) || (u.username && normalizeArabic(u.username).includes(q));
                        }).length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-20 text-center text-slate-500 italic flex flex-col items-center">
                              <Search className="w-10 h-10 mb-4 opacity-20" />
                              No members matching "{searchQuery}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* REJECTED TAB */}
              {tab === "rejected" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-rose-500 font-bold uppercase tracking-[0.3em] text-xs mb-2">Archive</p>
                      <h1 className="text-4xl font-bold text-white">Rejected Requests</h1>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search member..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          {["Name", "Dept", "Reason", "Date", "Action"].map(h => (
                            <th key={h} className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rejected.filter(u => {
                          if (!u) return false;
                          const q = normalizeArabic(searchQuery);
                          return normalizeArabic(u.name).includes(q) || normalizeArabic(u.email).includes(q);
                        }).map((u, i) => {
                          if (!u) return null;
                          return (
                            <motion.tr 
                            key={u.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-white/10 transition-colors group"
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">
                                  {u.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{u.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-400 font-bold">{u.department?.name || "—"}</td>
                            <td className="px-8 py-5 text-sm text-rose-400/80">{u.rejectionReason || "No reason"}</td>
                            <td className="px-8 py-5 text-xs text-slate-500 font-bold">
                              {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                            </td>
                            <td className="px-8 py-5">
                              <button 
                                onClick={() => approve(u.id)}
                                className="px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 rounded-xl text-xs font-bold text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                Re-Approve
                              </button>
                            </td>
                          </motion.tr>
                          );
                        })}
                        {rejected.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-20 text-center text-slate-500 italic">No rejected members currently.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {tab === "tasks" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-2">Content Management</p>
                      <h1 className="text-4xl font-bold text-white">Central Tasks</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Create Task Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 sticky top-8">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                          <PlusSquare className="text-primary w-6 h-6" />
                          New Task
                        </h3>
                        <div className="space-y-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Task Title</label>
                            <input 
                              value={newTask.title} 
                              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                              placeholder="Enter task title..."
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Deadline</label>
                            <input 
                              type="datetime-local"
                              value={newTask.deadline} 
                              onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Task Details</label>
                            <textarea 
                              rows={4}
                              value={newTask.description} 
                              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                              placeholder="Write task details here..."
                              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Points</label>
                              <input 
                                type="number"
                                value={newTask.points} 
                                onChange={e => setNewTask(p => ({ ...p, points: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Department</label>
                              <select 
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                                onChange={e => setNewTask(p => ({ ...p, departmentId: e.target.value }))}
                              >
                                <option value="">All</option>
                                {(departments || []).map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <button 
                            onClick={createTask}
                            className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-bold transition-all shadow-glow hover:scale-[1.02] active:scale-95 mt-4"
                          >
                            Publish Task Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Task List */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Current Tasks ({(tasks || []).length})</h3>
                        <div className="flex gap-2">
                          <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><List className="w-5 h-5" /></button>
                          <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Grid className="w-5 h-5" /></button>
                        </div>
                      </div>
                      
                      {(tasks || []).map((t: any, i: number) => (
                        <motion.div 
                          key={t.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group bg-white/5 border border-white/5 rounded-[24px] p-6 hover:bg-white/10 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex flex-col items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PTS</span>
                              <span className="text-xl font-bold text-primary">{t.points || 10}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{t.title}</h4>
                              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {t.deadline ? new Date(t.deadline).toLocaleDateString("en-US") : "No Deadline"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Users2 className="w-3.5 h-3.5" />
                                  {t.submissions?.length || 0} Submissions
                                </span>
                                {t.department && (
                                  <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                                    {t.department.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setSelectedTaskSubmissions(t)}
                              className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              View Submissions
                            </button>
                            <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteTask(t.id)}
                              className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}



              {/* LEADERBOARD TAB */}
              {tab === "leaderboard" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-2">Competition</p>
                      <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                      <div className="grid grid-cols-12 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-4">Member</div>
                        <div className="col-span-3">Dept & Region</div>
                        <div className="col-span-2">Level</div>
                        <div className="col-span-2 text-left">Score</div>
                      </div>
                    </div>
                    <div className="divide-y divide-white/5">
                      {(leaderboard || []).map((e: any, i: number) => {
                        if (!e) return null;
                        return (
                          <motion.div 
                          key={e.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="grid grid-cols-12 items-center p-8 hover:bg-white/5 transition-all group"
                        >
                          <div className="col-span-1">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                               i === 0 ? "bg-amber-400 text-amber-950 shadow-glow" : 
                               i === 1 ? "bg-slate-300 text-slate-900" : 
                               i === 2 ? "bg-orange-400/20 text-orange-400" : "bg-white/5 text-slate-500"
                             }`}>
                               {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
                             </div>
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/5 overflow-hidden group-hover:border-primary/50 transition-colors">
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                                  {e.name?.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <p className="text-white font-bold group-hover:text-primary transition-colors">{e.name}</p>
                                <div className="flex gap-1 mt-1">
                                  {e.badges?.slice(0, 4).map((b: any, bi: number) => (
                                    <span key={bi} title={b.nameAr} className="text-sm cursor-default hover:scale-125 transition-transform">{b.icon}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <p className="text-xs text-white font-medium">{e.department?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">{e.governorate}</p>
                          </div>
                          <div className="col-span-2">
                             <span className="text-[10px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400">
                               {e.level}
                             </span>
                          </div>
                          <div className="col-span-2 text-left">
                            <p className="text-2xl font-bold text-primary tracking-tighter">{e.score}%</p>
                          </div>
                        </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}



              {/* EVALUATIONS TAB */}
              {tab === "evaluations" && (
                <div className="space-y-8 animate-fade-in no-print">
                  <div className="flex items-end justify-between bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-md">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Digital Equation System (VPI)</p>
                      <h1 className="text-4xl font-bold text-white">Monthly Evaluations</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                         <input 
                          type="month" 
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="bg-transparent border-none px-6 py-2 text-sm text-white focus:ring-0 outline-none"
                        />
                      </div>
                      <button onClick={fetchEvaluations} className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-glow">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* VPI QUICK GUIDE (ADMIN VERSION) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all" />
                      <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Icons.Info className="text-primary w-5 h-5" />
                            System Overview
                          </h3>
                          <p className="text-slate-300 text-xs leading-relaxed mb-4">
                            The <span className="text-primary font-bold">(VPI)</span> system is the backbone of organizational justice at <span className="font-bold">Sona3 Elforas</span>. 
                            It integrates quantitative metrics (Tasks, Hours) with qualitative evaluations to generate a 4.0 GPA-style index.
                          </p>
                          <div className="flex gap-4">
                             <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">VPI_T</p>
                                <p className="text-xs text-white">Task Completion Index</p>
                             </div>
                             <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">VPI_M</p>
                                <p className="text-xs text-white">Meeting Activity Index</p>
                             </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-black/20 p-6 rounded-[32px] border border-white/5">
                           <p className="text-xs font-bold text-white mb-4 uppercase tracking-widest">Strategic Impact</p>
                           <ul className="space-y-3">
                             <li className="flex items-center gap-3 text-[10px] text-slate-400">
                               <Icons.Target className="w-3 h-3 text-emerald-400" />
                               Supports Egypt Vision 2030 Goals
                             </li>
                             <li className="flex items-center gap-3 text-[10px] text-slate-400">
                               <Icons.Scale className="w-3 h-3 text-blue-400" />
                               Establishes Organizational Justice
                             </li>
                             <li className="flex items-center gap-3 text-[10px] text-slate-400">
                               <Icons.Zap className="w-3 h-3 text-amber-400" />
                               Maximizes Team Productivity
                             </li>
                           </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 flex flex-col justify-center">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Icons.Award className="text-primary w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">VPI Calculation</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Formula Guide</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500 font-bold uppercase tracking-widest">Tasks (VPI_T)</span>
                            <span className="text-white font-bold">50%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[50%]"></div>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500 font-bold uppercase tracking-widest">Commitment (VPI_M)</span>
                            <span className="text-white font-bold">30%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[30%]"></div>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500 font-bold uppercase tracking-widest">Hours Rate</span>
                            <span className="text-white font-bold">20%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[20%]"></div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-white/5">
                          <th className="p-8">Member</th>
                          <th className="p-8">VPI_T (Tasks)</th>
                          <th className="p-8">VPI_M (Meetings)</th>
                          <th className="p-8 text-center">Final KPI</th>
                          <th className="p-8 text-center">Completion %</th>
                          <th className="p-8 text-center">Qualitative Rating</th>
                          <th className="p-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(approved || []).map(user => {
                          if (!user) return null;
                          const evalData = (evaluations || []).find(e => e?.userId === user.id) || { userId: user.id, user };
                          return (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-glow border border-white/5">
                                    {user.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium italic">{user.department?.name || "No Dept"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-mono font-bold text-white">{(evalData.vpiT || 0).toFixed(2)}</span>
                                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Score/Hours</span>
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-mono font-bold text-white">{(evalData.vpiM || 0).toFixed(2)}</span>
                                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Meeting Index</span>
                                </div>
                              </td>
                              <td className="p-8 text-center">
                                <div className={`inline-flex px-5 py-2 rounded-2xl text-xs font-bold border shadow-glow-sm ${
                                  (evalData.kpi || 0) >= 8 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" : 
                                  (evalData.kpi || 0) >= 5 ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10" : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10"
                                }`}>
                                  {(evalData.kpi || 0).toFixed(2)}
                                </div>
                              </td>
                              <td className="p-8 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-24 bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
                                    <div className="bg-primary h-full shadow-glow transition-all duration-1000" style={{ width: `${evalData.achievementRate || 0}%` }}></div>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-black tracking-widest">{(evalData.achievementRate || 0).toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="p-8 text-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
                                  evalData.rating ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-slate-500 border-white/10"
                                }`}>
                                  {evalData.rating || "Pending Eval"}
                                </span>
                              </td>
                              <td className="p-8">
                                <button 
                                  onClick={async () => {
                                    setMemberProfileLoading(true);
                                    try {
                                      const res = await api.get(`/admin/users/${user.id}/full`);
                                      setSelectedMemberForView(res.data.user);
                                    } catch (err) {
                                      console.error("Failed to fetch member details:", err);
                                      showToast("❌ فشل تحميل بيانات العضو");
                                    } finally {
                                      setMemberProfileLoading(false);
                                    }
                                  }}
                                  className="w-12 h-12 bg-white/5 text-slate-400 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary/50 transition-all shadow-glow"
                                >
                                  {memberProfileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VPI DASHBOARD TAB */}
              {tab === "vpi-dashboard" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Official Volunteer Performance Index</p>
                      <h1 className="text-4xl font-bold text-white">Central VPI Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <input 
                          type="month" 
                          value={vpiMonth}
                          onChange={(e) => setVpiMonth(e.target.value)}
                          className="bg-transparent border-none px-6 py-2 text-sm text-white focus:ring-0 outline-none"
                        />
                      </div>
                      <button onClick={fetchVpiLeaderboard} className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-glow">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* VPI Methodology Summary Card - Based on Image 2 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border border-white/10 rounded-[32px] p-8"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="shrink-0">
                        <div className="w-20 h-20 rounded-[24px] bg-primary flex items-center justify-center shadow-glow">
                          <Target className="text-white w-10 h-10" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Approved VPI Calculation Formula</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">The monthly volunteer rate for each member is calculated based on a combination of three main axes according to the fixed formula of 4.00 points.</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-white">Task Performance (50%)</span>
                          </div>
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-white">Monthly Points (30%)</span>
                          </div>
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-bold text-white">Volunteer Hours (20%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* VPI Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Evaluated", value: vpiLeaderboard.length, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                      { label: "Highest VPI", value: vpiLeaderboard.length > 0 ? vpiLeaderboard[0]?.vpiScore?.toFixed(2) : "—", icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10" },
                      { label: "Average VPI", value: vpiLeaderboard.length > 0 ? (vpiLeaderboard.reduce((s: number, r: any) => s + r.vpiScore, 0) / vpiLeaderboard.length).toFixed(2) : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { label: "Month", value: vpiMonth, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* VPI Rankings Table */}
                  <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                      <div className="grid grid-cols-12 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-3">Volunteer</div>
                        <div className="col-span-2 text-center">Task Performance (50%)</div>
                        <div className="col-span-2 text-center">Points (30%)</div>
                        <div className="col-span-2 text-center">Hours (20%)</div>
                        <div className="col-span-1 text-center">Final VPI</div>
                        <div className="col-span-1"></div>
                      </div>
                    </div>
                    <div className="divide-y divide-white/5">
                      {(vpiLeaderboard || []).length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium">No VPI data available for this month yet.</div>
                      ) : (vpiLeaderboard || []).map((record: any, i: number) => (
                        <motion.div 
                          key={record.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="grid grid-cols-12 items-center p-6 hover:bg-white/5 transition-all group"
                        >
                          <div className="col-span-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              i === 0 ? "bg-amber-400 text-amber-950 shadow-glow" : 
                              i === 1 ? "bg-slate-300 text-slate-900" : 
                              i === 2 ? "bg-orange-400/20 text-orange-400" : "bg-white/5 text-slate-500"
                            }`}>
                              {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 font-bold group-hover:border-primary/50 transition-colors overflow-hidden">
                                {record.user?.profilePicture ? (
                                  <img src={`${api.defaults.baseURL?.replace("/api", "")}${record.user.profilePicture}`} className="w-full h-full object-cover" />
                                ) : record.user?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{record.user?.name}</p>
                                <p className="text-[10px] text-slate-500">{record.user?.department?.name || "—"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-mono font-bold text-white">{record.taskPerformance?.toFixed(2)}</span>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Points / 4.00</p>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-mono font-bold text-white">{record.monthlyPoints?.toFixed(0)}</span>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Score / 100</p>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-mono font-bold text-white">{(Math.min(record.completedHours / (record.requiredHours || 20), 1.2) * 100).toFixed(0)}%</span>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{record.completedHours?.toFixed(1)}h / {record.requiredHours}h</p>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-mono font-bold border ${
                              record.vpiScore >= 3.5 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow" : 
                              record.vpiScore >= 2.5 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                              record.vpiScore >= 1.5 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                              "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                              {record.vpiScore?.toFixed(2)}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={async () => {
                                setMemberProfileLoading(true);
                                try {
                                  const res = await api.get(`/admin/users/${record.userId}/full`);
                                  setSelectedMemberForView(res.data.user);
                                } catch (err) {
                                  showToast("❌ فشل تحميل البيانات");
                                } finally {
                                  setMemberProfileLoading(false);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-glow"
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS MANAGEMENT TAB */}
              {tab === "documents" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Issuing Official Documents</p>
                      <h1 className="text-4xl font-bold text-white">Document Management</h1>
                    </div>
                    <button onClick={fetchPendingDocuments} className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-glow">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {pendingDocuments.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <Check className="text-emerald-400 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">No pending requests</h3>
                      <p className="text-slate-500 text-sm">All document requests have been processed successfully.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {(pendingDocuments || []).map((doc: any, i: number) => {
                        const typeLabels: Record<string, string> = {
                          RECOMMENDATION: "Recommendation Letter",
                          VOLUNTEER_CERT: "Volunteer Certificate",
                          EXPERIENCE_CERT: "Experience Certificate",
                          PERFORMANCE_REPORT: "Performance Report"
                        };
                        const purposeLabels: Record<string, string> = {
                          UNIVERSITY: "University",
                          EMPLOYMENT: "Employment",
                          MILITARY: "Military",
                          SCHOLARSHIP: "Scholarship",
                          COMMUNITY: "Community"
                        };
                        return (
                          <motion.div 
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <FileIcon className="text-primary w-7 h-7" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white mb-1">{doc.titleAr}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md">{typeLabels[doc.type] || doc.type}</span>
                                  {doc.purpose && <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-slate-400 rounded-md">{purposeLabels[doc.purpose] || doc.purpose}</span>}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{new Date(doc.createdAt).toLocaleDateString("ar-EG")}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                              {doc.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{doc.user?.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{doc.user?.email}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleIssueDocument(doc.id, `/documents/generated_${doc.id}.pdf`)}
                              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-2xl text-xs font-bold transition-all shadow-glow flex items-center justify-center gap-2"
                            >
                              <FileCheck className="w-4 h-4" />
                              Issue Document
                            </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}



              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Admin Profile</p>
                      <h1 className="text-4xl font-bold text-white">Account Settings</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Avatar Upload */}
                    <div className="lg:col-span-1">
                      <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 text-center">
                        <div className="relative inline-block mb-8">
                          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-white/5 overflow-hidden">
                            {avatarPreview ? (
                              <img src={avatarPreview.includes("?") ? avatarPreview : avatarPreview + "?t=" + Date.now()} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <User className="w-16 h-16" />
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center cursor-pointer shadow-glow hover:scale-110 transition-transform">
                            <Camera className="text-white w-5 h-5" />
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
                          <User className="text-primary w-5 h-5" />
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
                          <Lock className="text-rose-400 w-5 h-5" />
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
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save All Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* CHAT TAB */}
              {tab === "chat" && (
                <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
                  <div className="flex items-end justify-between shrink-0">
                    <div>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Communication Management</p>
                      <h1 className="text-4xl font-bold text-white">Chat Rooms</h1>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <span className={`w-2 h-2 rounded-full ${chatEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Chat: {chatEnabled ? "Enabled" : "Muted"}</span>
                        <button 
                          onClick={toggleChatStatus}
                          className={`ml-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            chatEnabled ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {chatEnabled ? "Mute All" : "Unmute All"}
                        </button>
                      </div>
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 max-w-md overflow-x-auto">
                      <button 
                        onClick={() => setCurrentChannel("general")}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${currentChannel === "general" ? "bg-primary text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
                      >
                        General
                      </button>
                      {departments.map(dep => (
                        <button 
                          key={dep.id}
                          onClick={() => setCurrentChannel(String(dep.id))}
                          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${currentChannel === String(dep.id) ? "bg-primary text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
                        >
                          {dep.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 border border-white/5 rounded-[40px] flex flex-col overflow-hidden backdrop-blur-md">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                      {(chatMessages || []).map((msg, i) => {
                        const isMe = msg.userId === user?.id;
                        return (
                          <div key={msg.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 shrink-0 overflow-hidden">
                              {msg.user?.profilePicture ? (
                                <img src={`${api.defaults.baseURL?.replace("/api", "")}${msg.user.profilePicture}${msg.user.profilePicture.includes("?") ? "" : "?t=" + Date.now()}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">{msg.user?.name?.charAt(0)}</div>
                              )}
                            </div>
                            <div className={`max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                              <div className="flex items-center gap-2 px-1">
                                <span className="text-[10px] font-bold text-slate-400">{msg.user?.name} {msg.user?.role === "ADMIN" && "👑"}</span>
                                <span className="text-[10px] font-bold text-slate-600">{new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-white rounded-tr-none shadow-glow" : "bg-white/5 text-foreground rounded-tl-none border border-white/5"}`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="relative p-6 bg-slate-900/50 border-t border-white/5">
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-6 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                          <EmojiPicker 
                            onEmojiClick={(emojiData) => {
                              setMsgContent(prev => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                            theme={Theme.DARK}
                          />
                        </div>
                      )}
                      <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                        <button 
                          type="button" 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-14 h-14 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                        >
                          <Smile className="w-6 h-6" />
                        </button>
                        <input 
                          type="text" 
                          value={msgContent}
                          onChange={e => setMsgContent(e.target.value)}
                          placeholder="Write a message as admin..."
                          className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                        <button 
                          type="submit"
                          className="w-14 h-14 bg-primary hover:bg-primary-light text-white rounded-2xl flex items-center justify-center shadow-glow transition-all active:scale-90"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
