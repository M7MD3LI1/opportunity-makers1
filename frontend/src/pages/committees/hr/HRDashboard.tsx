import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { COMMITTEE_CONFIGS } from "../../../config/committeeConfig";
import DashboardLayout from "../../../layouts/DashboardLayout";
import StatCard from "../../../components/widgets/StatCard";
import ChartCard from "../../../components/widgets/ChartCard";
import ActivityFeed from "../../../components/widgets/ActivityFeed";
import TeamLeaderboard from "../../../components/widgets/TeamLeaderboard";
import AIInsightsPanel from "../../../components/widgets/AIInsightsPanel";
import QuickActions from "../../../components/widgets/QuickActions";
import KPIGauge from "../../../components/widgets/KPIGauge";
import api from "../../../lib/api";
import { generateCertificate } from "../../../lib/certificate";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, UserCheck, UserX, CalendarCheck, Clock, Award, TrendingUp,
  Search, Filter, Download, ChevronRight, Star, FileCheck, CheckCircle, X, Eye,
  Save, AlertCircle, HelpCircle, XCircle, RefreshCw, ClipboardList, MessageSquare,
  Trash2, Plus, ExternalLink, Shield, Settings as SettingsIcon, Bell as BellIcon,
  User as UserIcon, Mail, Phone, Lock, Hash, CheckSquare
} from "lucide-react";
import CommitteeTasks from "../../../components/widgets/CommitteeTasks";

const config = COMMITTEE_CONFIGS.hr;

// ─── Attendance Manager Sub-component ──────────────────────────────────────────
const AttendanceManager: React.FC<{ config: any; onUpdate?: () => void }> = ({ config, onUpdate }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, { status: string; excuse: string; weight: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/attendance?date=${date}`);
      setUsers(res.data.users);

      const initialAttendance: any = {};
      res.data.users.forEach((u: any) => {
        const record = res.data.records.find((r: any) => r.userId === u.id);
        initialAttendance[u.id] = {
          status: record?.status || "ABSENT",
          excuse: record?.excuse || "",
          weight: record?.weight || 1.0
        };
      });
      setAttendance(initialAttendance);

      // Fetch depts if not loaded
      if (depts.length === 0) {
        const dRes = await api.get("/departments");
        setDepts(dRes.data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId: number, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], status }
    }));
  };

  const handleExcuseChange = (userId: number, excuse: string) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], excuse }
    }));
  };

  const handleWeightChange = (userId: number, weight: number) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: { ...prev[userId], weight }
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([userId, data]) => ({
        userId: Number(userId),
        ...data
      }));
      await api.post("/hr/attendance", { date, records });
      alert("✅ تم حفظ الحضور بنجاح");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ الحضور");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || String(u.department?.id || u.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة الحضور والغياب</h2>
          <p className="text-sm text-slate-500 mt-1">تسجيل حضور أعضاء المنصة ليوم {date}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="glass px-4 py-2 rounded-xl text-white outline-none border-none text-sm"
          />
          <button
            onClick={saveAttendance}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="بحث عن عضو..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="glass px-4 py-2.5 rounded-xl text-sm text-white outline-none border-none bg-transparent"
        >
          <option value="" className="bg-[#0a0f1e]">كل اللجان</option>
          {depts.map(d => (
            <option key={d.id} value={d.id} className="bg-[#0a0f1e]">{d.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-slate-500">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" dir="rtl">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">العضو</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">اللجنة</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">الحالة</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">العذر / ملاحظات</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">الوزن (Weight)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-400">
                        {u.department?.name || "بدون لجنة"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(u.id, "PRESENT")}
                          className={`p-2 rounded-lg transition-all ${attendance[u.id]?.status === "PRESENT" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-600 hover:bg-white/10"}`}
                          title="حاضر"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(u.id, "ABSENT")}
                          className={`p-2 rounded-lg transition-all ${attendance[u.id]?.status === "ABSENT" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white/5 text-slate-600 hover:bg-white/10"}`}
                          title="غائب"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(u.id, "EXCUSED")}
                          className={`p-2 rounded-lg transition-all ${attendance[u.id]?.status === "EXCUSED" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white/5 text-slate-600 hover:bg-white/10"}`}
                          title="بعذر"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="أضف عذراً..."
                        value={attendance[u.id]?.excuse || ""}
                        onChange={e => handleExcuseChange(u.id, e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-primary/50 transition-all"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={attendance[u.id]?.weight ?? 1.0}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            handleWeightChange(u.id, isNaN(val) ? 1.0 : val);
                          }}
                          className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-center text-xs text-white outline-none"
                        />
                        <span title="وزن الحضور يؤثر على النقاط المكتسبة">
                          <HelpCircle className="w-3 h-3 text-slate-600 cursor-help" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Certificates Manager Sub-component ───────────────────────────────────────
const CertificatesManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [docType, setDocType] = useState("VOLUNTEER_CERT");
  const [extraData, setExtraData] = useState({ completedHours: 0, totalScore: 0, vpiScore: 0, badgeCount: 0, completedTasks: 0 });

  useEffect(() => {
    if (selectedUser) {
      setExtraData({
        completedHours: Math.floor((selectedUser.score || 0) * 0.8),
        totalScore: selectedUser.score || 0,
        vpiScore: Number(((selectedUser.score || 0) / 25).toFixed(1)),
        badgeCount: Math.floor((selectedUser.points || 0) / 100),
        completedTasks: selectedUser._count?.tasks || 0
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/hr/members");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!selectedUser) {
      alert("يرجى اختيار عضو أولاً");
      return;
    }
    const doc = {
      type: docType,
      createdAt: new Date().toISOString(),
      referenceNo: 'SF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    };
    generateCertificate(selectedUser, doc, extraData);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const certTypes = [
    { id: "VOLUNTEER_CERT", label: "شهادة تطوع" },
    { id: "EXPERIENCE_CERT", label: "شهادة خبرة" },
    { id: "RECOMMENDATION", label: "خطاب توصية" },
    { id: "PERFORMANCE_REPORT", label: "تقرير أداء" },
    { id: "COMPREHENSIVE_REPORT", label: "تقرير شامل" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">إصدار الشهادات والتقارير</h2>
          <p className="text-sm text-slate-500 mt-1">قم بإصدار شهادات رسمية للأعضاء باللوجو المعتمد</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection List */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col h-[600px]">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث عن عضو..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full glass pr-10 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {loading ? (
              <div className="py-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.id === u.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary font-bold">{u.name?.charAt(0)}</div>
                <div className="text-right overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.department?.name || "بدون لجنة"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Certificate Options */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUser ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">{selectedUser.name?.charAt(0)}</div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-right">نوع الشهادة</label>
                  <div className="grid grid-cols-1 gap-2">
                    {certTypes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setDocType(t.id)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-bold ${docType === t.id ? 'bg-primary border-primary text-white shadow-glow' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {t.label}
                        <Award className="w-4 h-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-right">بيانات إضافية (تظهر في الشهادة)</label>
                  <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-right">
                        <span className="text-[10px] text-slate-500 font-bold">الساعات المعتمدة</span>
                        <input type="number" value={extraData.completedHours} onChange={e => setExtraData(p => ({ ...p, completedHours: Number(e.target.value) }))} className="w-full glass px-4 py-2 rounded-lg text-sm text-white outline-none" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <span className="text-[10px] text-slate-500 font-bold">التقييم العام (%)</span>
                        <input type="number" value={extraData.totalScore} onChange={e => setExtraData(p => ({ ...p, totalScore: Number(e.target.value) }))} className="w-full glass px-4 py-2 rounded-lg text-sm text-white outline-none" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <span className="text-[10px] text-slate-500 font-bold">مؤشر VPI</span>
                        <input type="number" step="0.1" value={extraData.vpiScore} onChange={e => setExtraData(p => ({ ...p, vpiScore: Number(e.target.value) }))} className="w-full glass px-4 py-2 rounded-lg text-sm text-white outline-none" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <span className="text-[10px] text-slate-500 font-bold">عدد المهام</span>
                        <input type="number" value={extraData.completedTasks} onChange={e => setExtraData(p => ({ ...p, completedTasks: Number(e.target.value) }))} className="w-full glass px-4 py-2 rounded-lg text-sm text-white outline-none" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <FileCheck className="w-5 h-5" />
                    توليد الشهادة والطباعة
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
              <Award className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">قم باختيار عضو</h3>
              <p className="text-sm text-slate-500 max-w-xs">اختر العضو من القائمة الجانبية للبدء في توليد الشهادة أو التقرير الخاص به</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Onboarding Manager Sub-component ─────────────────────────────────────────
const OnboardingManager: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("VIDEO");

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/hr/onboarding");
      setMaterials(res.data.materials || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newTitle || !newUrl) return alert("أكمل البيانات");
    try {
      await api.post("/hr/onboarding", { title: newTitle, url: newUrl, type: newType, order: materials.length });
      setNewTitle(""); setNewUrl("");
      fetchMaterials();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد؟")) return;
    try {
      await api.delete(`/hr/onboarding/${id}`);
      fetchMaterials();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">رحلة الانضمام (Onboarding)</h2>
          <p className="text-sm text-slate-500 mt-1">إدارة المحتوى التعليمي والتعريفي للأعضاء الجدد</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-4">إضافة محتوى جديد</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold">العنوان</span>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full glass px-4 py-2 rounded-xl text-sm text-white outline-none" placeholder="مثال: ميثاق اللجنة" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold">الرابط</span>
              <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full glass px-4 py-2 rounded-xl text-sm text-white outline-none" placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold">النوع</span>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full glass px-4 py-2 rounded-xl text-sm text-white outline-none border-none bg-transparent">
                <option value="VIDEO" className="bg-slate-900">فيديو</option>
                <option value="PDF" className="bg-slate-900">ملف PDF</option>
                <option value="LINK" className="bg-slate-900">رابط خارجي</option>
              </select>
            </div>
            <button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
              <Plus className="w-4 h-4" /> إضافة للمسار
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6">المحتوى الحالي</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="py-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : materials.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">لا يوجد محتوى مضاف حالياً</div>
            ) : materials.map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{idx + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{m.title}</p>
                    <p className="text-[10px] text-slate-500">{m.type} • {m.url.substring(0, 30)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={m.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-white/5 text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Manager Sub-component ───────────────────────────────────────────
const SettingsManager: React.FC = () => {
  const { user: authUser } = useAuth();
  const [personalData, setPersonalData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    password: ""
  });
  const [settings, setSettings] = useState<any>({
    recruitment_open: "false",
    kpi_weight_attendance: "20",
    kpi_weight_tasks: "40",
    kpi_weight_deadlines: "30",
    kpi_weight_engagement: "10"
  });
  // Local state for weights to allow smooth typing
  const [localWeights, setLocalWeights] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingRecruitment, setTogglingRecruitment] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/hr/settings");
      const s: any = {};
      res.data.settings.forEach((item: any) => s[item.key] = item.value);
      const newSettings = { ...settings, ...s };
      setSettings(newSettings);
      // Initialize local weights from fetched settings
      setLocalWeights({
        kpi_weight_attendance: newSettings.kpi_weight_attendance,
        kpi_weight_tasks: newSettings.kpi_weight_tasks,
        kpi_weight_deadlines: newSettings.kpi_weight_deadlines,
        kpi_weight_engagement: newSettings.kpi_weight_engagement
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.post("/hr/settings", { key, value });
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch (err) { console.error(err); }
  };

  const handleToggleRecruitment = async () => {
    const isCurrentlyOpen = String(settings.recruitment_open) === "true";
    const newValue = isCurrentlyOpen ? "false" : "true";
    
    setTogglingRecruitment(true);
    try {
      await api.post("/hr/settings", { key: "recruitment_open", value: newValue });
      setSettings((prev: any) => ({ ...prev, recruitment_open: newValue }));
    } catch (err) { 
      console.error(err);
      alert("❌ فشل تغيير حالة التوظيف");
    } finally {
      setTogglingRecruitment(false);
    }
  };

  const handleSaveWeights = async () => {
    setSavingSettings(true);
    try {
      await Promise.all(
        Object.entries(localWeights).map(([key, val]) => 
          api.post("/hr/settings", { key, value: String(val) })
        )
      );
      setSettings((prev: any) => ({ ...prev, ...(localWeights || {}) }));
      alert("✅ تم حفظ أوزان الأداء وتحديث السيستم بنجاح");
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ الإعدادات");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/users/profile", {
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone
      });
      if (personalData.password) {
        await api.put("/users/password", { newPassword: personalData.password });
      }
      alert("✅ تم تحديث البيانات الشخصية بنجاح");
    } catch (err) {
      console.error(err);
      alert("❌ فشل تحديث البيانات");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-10 pb-10" dir="rtl">
      {/* Section 1: Personal Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">المعلومات الشخصية</h2>
            <p className="text-xs text-slate-500">إدارة بيانات حسابك الشخصي وكلمة المرور</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <UserIcon className="w-3 h-3" /> الاسم بالكامل
              </label>
              <input 
                type="text" 
                value={personalData.name}
                onChange={e => setPersonalData(p => ({...p, name: e.target.value}))}
                className="w-full glass px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Mail className="w-3 h-3" /> البريد الإلكتروني
              </label>
              <input 
                type="email" 
                value={personalData.email}
                onChange={e => setPersonalData(p => ({...p, email: e.target.value}))}
                className="w-full glass px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Phone className="w-3 h-3" /> رقم الهاتف
              </label>
              <input 
                type="text" 
                value={personalData.phone}
                onChange={e => setPersonalData(p => ({...p, phone: e.target.value}))}
                className="w-full glass px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Lock className="w-3 h-3" /> كلمة المرور الجديدة (اختياري)
              </label>
              <input 
                type="password" 
                placeholder="اتركها فارغة إذا كنت لا تريد تغييرها"
                value={personalData.password}
                onChange={e => setPersonalData(p => ({...p, password: e.target.value}))}
                className="w-full glass px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 ring-primary/50 transition-all"
              />
            </div>
            <div className="md:col-span-2 pt-4 border-t border-white/5">
              <button 
                type="submit"
                disabled={savingProfile}
                className="bg-primary hover:bg-primary/80 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ التغييرات الشخصية
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* Section 2: Committee Settings */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">إعدادات اللجنة والسيستم</h2>
            <p className="text-xs text-slate-500">التحكم في معايير التقييم وحالة التوظيف للمنصة بالكامل</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-white">حالة التوظيف</h3>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">فتح باب التقديم</p>
                <p className="text-[10px] text-slate-500">يتحكم في ظهور استمارة الـ Signup</p>
              </div>
              <button 
                onClick={handleToggleRecruitment}
                disabled={togglingRecruitment}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.recruitment_open === "true" ? "bg-emerald-500" : "bg-slate-700"}`}
              >
                {togglingRecruitment ? (
                  <RefreshCw className="w-3 h-3 animate-spin mx-auto text-white" />
                ) : (
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.recruitment_open === "true" ? "right-1" : "right-7"}`} />
                )}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary-light leading-relaxed">
                تنبيه: تغيير حالة التوظيف سيؤثر فوراً على قدرة الزوار الجدد على إنشاء حسابات في المنصة.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">توزيع أوزان الأداء (System-wide KPIs)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "kpi_weight_tasks", label: "المهام (Tasks)", icon: ClipboardList, color: "text-blue-400" },
                { key: "kpi_weight_deadlines", label: "الالتزام بالمواعيد (Deadlines)", icon: Clock, color: "text-purple-400" },
                { key: "kpi_weight_attendance", label: "الحضور والغياب (Attendance)", icon: CalendarCheck, color: "text-emerald-400" },
                { key: "kpi_weight_engagement", label: "التفاعل (Engagement)", icon: TrendingUp, color: "text-pink-400" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={localWeights?.[item.key] ?? ""} 
                      onChange={e => setLocalWeights((prev: any) => ({ ...prev, [item.key]: e.target.value }))}
                      className="w-16 glass px-2 py-1.5 rounded-lg text-xs text-center text-white outline-none focus:ring-1 ring-primary/30"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 mt-2 flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-white">إجمالي الأوزان</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${Number(localWeights?.kpi_weight_tasks || 0) + Number(localWeights?.kpi_weight_deadlines || 0) + Number(localWeights?.kpi_weight_attendance || 0) + Number(localWeights?.kpi_weight_engagement || 0) === 100 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, Number(localWeights?.kpi_weight_tasks || 0) + Number(localWeights?.kpi_weight_deadlines || 0) + Number(localWeights?.kpi_weight_attendance || 0) + Number(localWeights?.kpi_weight_engagement || 0))}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${Number(localWeights?.kpi_weight_tasks || 0) + Number(localWeights?.kpi_weight_deadlines || 0) + Number(localWeights?.kpi_weight_attendance || 0) + Number(localWeights?.kpi_weight_engagement || 0) === 100 ? "text-emerald-400" : "text-rose-400"}`}>
                  {Number(localWeights?.kpi_weight_tasks || 0) + Number(localWeights?.kpi_weight_deadlines || 0) + Number(localWeights?.kpi_weight_attendance || 0) + Number(localWeights?.kpi_weight_engagement || 0)}%
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={handleSaveWeights}
                disabled={savingSettings || (Number(localWeights?.kpi_weight_tasks || 0) + Number(localWeights?.kpi_weight_deadlines || 0) + Number(localWeights?.kpi_weight_attendance || 0) + Number(localWeights?.kpi_weight_engagement || 0) !== 100)}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white text-xs font-bold px-6 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {savingSettings ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                حفظ توزيع الأوزان
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── Evaluations Manager Sub-component ────────────────────────────────────────
const EvaluationsManager: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [taskScores, setTaskScores] = useState([0, 0, 0, 0, 0]);
  const [taskHours, setTaskHours] = useState([0, 0, 0, 0, 0]);
  const [meetingScore, setMeetingScore] = useState(0);
  const [meetingHours, setMeetingHours] = useState(0);
  const [rating, setRating] = useState("جيد");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/hr/members");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return alert("اختر عضواً أولاً");
    setSaving(true);
    try {
      await api.post("/hr/evaluations", {
        userId: selectedUser.id,
        month,
        taskScores,
        taskHours,
        meetingScore,
        meetingHours,
        rating
      });
      alert("✅ تم حفظ التقييم بنجاح");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ التقييم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">تقييمات الأداء الشهرية</h2>
          <p className="text-sm text-slate-500 mt-1">تسجيل مؤشرات الأداء والـ VPI للأعضاء</p>
        </div>
        <input 
          type="month" 
          value={month} 
          onChange={e => setMonth(e.target.value)}
          className="glass px-4 py-2 rounded-xl text-white outline-none border-none text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 glass-card p-6 h-[600px] overflow-y-auto space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">الأعضاء</label>
          {users.map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.id === u.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary font-bold text-xs">{u.name?.charAt(0)}</div>
              <div className="text-right overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{u.name}</p>
                <p className="text-[9px] text-slate-500 truncate">{u.department?.name}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedUser ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">{selectedUser.name?.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">تقييم شهر {month}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  تقييم المهام (Task Evaluation)
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-500 font-bold w-12">مهمة {i+1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-600 font-bold">الدرجة (0-4)</span>
                          <input type="number" min="0" max="4" step="0.1" value={taskScores[i]} onChange={e => {
                            const newScores = [...taskScores]; newScores[i] = Number(e.target.value); setTaskScores(newScores);
                          }} className="w-full glass px-3 py-1.5 rounded-lg text-xs text-white outline-none" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-600 font-bold">الساعات</span>
                          <input type="number" value={taskHours[i]} onChange={e => {
                            const newHours = [...taskHours]; newHours[i] = Number(e.target.value); setTaskHours(newHours);
                          }} className="w-full glass px-3 py-1.5 rounded-lg text-xs text-white outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    تقييم الاجتماعات
                  </h4>
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">درجة الاجتماعات (0-4)</span>
                      <input type="number" min="0" max="4" step="0.1" value={meetingScore} onChange={e => setMeetingScore(Number(e.target.value))} className="w-full glass px-4 py-2 rounded-xl text-sm text-white outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">ساعات الاجتماعات</span>
                      <input type="number" value={meetingHours} onChange={e => setMeetingHours(Number(e.target.value))} className="w-full glass px-4 py-2 rounded-xl text-sm text-white outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    التقييم النوعي
                  </h4>
                  <textarea 
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    placeholder="اكتب تعليقاً على أداء العضو..."
                    className="w-full h-32 glass p-4 rounded-2xl text-sm text-white outline-none resize-none border border-white/5"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                حفظ التقييم الشهري
              </button>
            </motion.div>
          ) : (
            <div className="glass-card h-[600px] flex flex-col items-center justify-center text-center p-12 opacity-50">
              <ClipboardList className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">اختر عضواً للبدء</h3>
              <p className="text-sm text-slate-500 max-w-xs">يرجى اختيار العضو من القائمة الجانبية لتسجيل تقييمه لشهر {month}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [members, setMembers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [recruitmentApps, setRecruitmentApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMemberForView, setSelectedMemberForView] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const safe = async (url: string) => {
      try { const r = await api.get(url); return r.data; } catch { return null; }
    };
    const [pend, appr, rej, lb, ins, log, depts, apps, stats] = await Promise.all([
      safe("/hr/members/pending"), safe("/hr/members"), safe("/hr/members/rejected"),
      safe("/scoring/leaderboard"), safe("/ai/insights"), safe("/admin/logs"),
      safe("/departments"), safe("/recruitment/all"), safe("/hr/analytics")
    ]);
    setPending(Array.isArray(pend?.users) ? pend.users : []);
    setMembers(Array.isArray(appr?.users) ? appr.users : []);
    setRejected(Array.isArray(rej?.users) ? rej.users : []);
    setLeaderboard(Array.isArray(lb?.leaderboard) ? lb.leaderboard : []);
    setInsights(Array.isArray(ins?.insights) ? ins.insights : []);
    setLogs(Array.isArray(log?.logs || log) ? (log?.logs || log) : []);
    setDepartments(Array.isArray(depts?.departments) ? depts.departments : []);
    setRecruitmentApps(Array.isArray(apps?.applications) ? apps.applications : []);
    setAnalyticsData(stats);
  };

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const approve = async (id: number) => {
    try { await api.put(`/admin/users/${id}/approve`); showToast("✅ Member approved"); loadData(); } catch { }
  };
  const reject = async (id: number) => {
    try { await api.put(`/admin/users/${id}/reject`, { reason: "Not qualified" }); showToast("Rejected"); loadData(); } catch { }
  };

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    const matchDept = !filterDept || String(m.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  const monthlyData = analyticsData?.recruitmentTrends || [];
  const deptDistribution = analyticsData?.deptStats || [];
  const attendanceData = analyticsData?.attendanceData || [];

  const retentionRate = members.length > 0 ? Math.round(((members.length - rejected.length) / (members.length + rejected.length)) * 100) : 0;

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-white/[0.06]"
              style={{ background: config.colors.gradient + ", rgba(0,0,0,0.4)" }}>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.colors.primaryLight }}>
                  HR Committee Dashboard
                </p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                  Welcome back, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-sm text-white/60 max-w-lg">
                  Manage recruitment pipelines, track member performance, and oversee team productivity across all departments.
                </p>
              </div>
              <Users className="absolute bottom-[-10%] right-10 w-48 h-48 text-white/5" />
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Members" value={members.length} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" delay={0} trend={{ value: 12, label: "vs last month" }} />
              <StatCard label="Pending Applications" value={pending.length} icon={UserPlus} color="text-amber-400" bgColor="bg-amber-400/10" delay={1} />
              <StatCard label="Retention Rate" value={`${retentionRate}%`} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-400/10" delay={2} trend={{ value: 3 }} />
              <StatCard label="Avg Performance" value="87%" icon={Star} color="text-violet-400" bgColor="bg-violet-400/10" delay={3} />
            </div>

            {/* Charts & Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="Recruitment Trends" type="area" data={monthlyData} dataKey="recruited" xKey="month" colors={[config.colors.primary]} icon={TrendingUp} />
              </div>
              <QuickActions actions={config.quickActions} onAction={a => {
                if (a === "view-reports") setTab("analytics");
                else if (a === "issue-certificate") setTab("certificates");
                else if (a === "schedule-interview") {
                  const myInterviews = recruitmentApps.filter((app: any) => app.interviewerId === user?.id && app.currentStage === "STAGE_2");
                  if (myInterviews.length > 0) {
                    setTab("recruitment");
                    showToast(`لديك ${myInterviews.length} مقابلات مجدولة`);
                  } else {
                    showToast("ليس لديك أي مقابلات مجدولة حالياً");
                  }
                }
              }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed activities={logs.slice(0, 10)} title="Recent HR Activity" />
              </div>
              <AIInsightsPanel insights={insights} title="HR Insights" />
            </div>

            {/* KPI Gauges */}
            <div className="glass-card p-8">
              <h3 className="text-sm font-bold text-white mb-6">Key Performance Indicators</h3>
              <div className="flex flex-wrap justify-center gap-10">
                <KPIGauge value={retentionRate} label="Retention" color={config.colors.primary} format="percent" />
                <KPIGauge value={87} label="Satisfaction" color={config.colors.secondary} format="percent" />
                <KPIGauge value={pending.length} max={50} label="Pipeline" color="#f59e0b" />
                <KPIGauge value={92} label="Attendance" color="#10b981" format="percent" />
              </div>
            </div>
          </div>
        );

      case "recruitment":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Recruitment Pipeline</h2>
                <p className="text-sm text-slate-500 mt-1">{recruitmentApps.length} applications, {pending.length} pending approval</p>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { stage: "Applied", count: pending.length, color: "#3b82f6", icon: UserPlus },
                { stage: "Stage 1", count: recruitmentApps.filter((a: any) => a.currentStage === "STAGE_1").length, color: "#f59e0b", icon: FileCheck },
                { stage: "Interview", count: recruitmentApps.filter((a: any) => a.currentStage === "STAGE_2").length, color: "#8b5cf6", icon: Users },
                { stage: "Simulation", count: recruitmentApps.filter((a: any) => a.currentStage === "STAGE_3").length, color: "#06b6d4", icon: Star },
                { stage: "Accepted", count: recruitmentApps.filter((a: any) => a.finalDecision === "ACCEPTED").length, color: "#10b981", icon: CheckCircle },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: s.color }} />
                    <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: s.color }} />
                    <p className="text-2xl font-bold text-white font-mono">{s.count}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.stage}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pending Applications */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" style={{ color: config.colors.primary }} />
                Pending Applications ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map((u: any, i: number) => (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border border-white/10"
                      style={{ background: `${config.colors.primary}20`, color: config.colors.primary }}>{u.name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => approve(u.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 press-effect"
                        style={{ background: config.colors.primary }}>Approve</button>
                      <button onClick={() => reject(u.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all press-effect">
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
                {pending.length === 0 && (
                  <div className="text-center py-12"><UserCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-xs text-slate-500">No pending applications</p></div>
                )}
              </div>
            </div>
          </div>
        );

      case "members":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-white">Member Database</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none w-40" />
                </div>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                  className="glass px-3 py-2 rounded-xl text-xs text-white bg-transparent outline-none border-none">
                  <option value="" className="bg-slate-900">All Departments</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/[0.04] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-4">Member</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Level</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Actions</div>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {filteredMembers.slice(0, 20).map((m: any, i: number) => (
                  <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border border-white/10"
                        style={{ background: `${config.colors.primary}15`, color: config.colors.primary }}>{m.name?.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-600 truncate">{m.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2"><span className="text-xs text-slate-400">{m.department?.name || "—"}</span></div>
                    <div className="col-span-2"><span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium">{m.level}</span></div>
                    <div className="col-span-2"><span className="text-sm font-bold text-white font-mono">{m.score || 0}</span></div>
                    <div className="col-span-2"><button onClick={() => setSelectedMemberForView(m)} className="text-[10px] text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1"><Eye className="w-3 h-3" /> View</button></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "attendance":
        return (
          <AttendanceManager config={config} onUpdate={loadData} />
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">HR Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Recruitment Trends" type="bar" data={monthlyData} dataKey="recruited" xKey="month" colors={[config.colors.primary]} />
              <ChartCard title="Department Distribution" type="pie" data={deptDistribution} dataKey="value" xKey="name" />
              <ChartCard title="Attendance Trends" type="area" data={attendanceData} dataKey="rate" xKey="week" colors={[config.colors.secondary]} />
              <TeamLeaderboard entries={leaderboard.slice(0, 10)} title="Top Performers" showDepartment />
            </div>
          </div>
        );

      case "certificates":
        return (
          <CertificatesManager />
        );

      case "evaluations":
        return (
          <EvaluationsManager onUpdate={loadData} />
        );

      case "onboarding":
        return (
          <OnboardingManager />
        );

      case "settings":
        return (
          <SettingsManager />
        );

      case "tasks":
        return <CommitteeTasks committeeId={config.id} primaryColor={config.colors.primary} />;

      default:
        return (
          <div className="flex items-center justify-center py-20 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <config.icon className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">هذا القسم قيد المزامنة</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">جاري مزامنة بيانات {tab} مع النظام المركزي للموارد البشرية.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] glass-card !rounded-2xl text-white px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: config.colors.primary }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member View Modal */}
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
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMemberForView.name}</h3>
                  <p className="text-sm text-slate-400">{selectedMemberForView.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-md bg-white/5 text-xs text-slate-300">
                    {selectedMemberForView.department?.name || "بدون لجنة"} - {selectedMemberForView.level}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                {/* Attendance Section */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
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
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-bold" 
                               style={{ borderColor: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444', color: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {percentage}%
                          </div>
                          <div>
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
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
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
      <DashboardLayout
        committee={config}
        navItems={config.navItems}
        activeTab={tab}
        onTabChange={setTab}
        title={tab === "overview" ? "HR Dashboard" : undefined}
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default HRDashboard;
