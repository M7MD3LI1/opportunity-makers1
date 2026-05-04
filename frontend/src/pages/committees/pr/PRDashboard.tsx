import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { COMMITTEE_CONFIGS } from "../../../config/committeeConfig";
import DashboardLayout from "../../../layouts/DashboardLayout";
import StatCard from "../../../components/widgets/StatCard";
import ChartCard from "../../../components/widgets/ChartCard";
import ActivityFeed from "../../../components/widgets/ActivityFeed";
import AIInsightsPanel from "../../../components/widgets/AIInsightsPanel";
import QuickActions from "../../../components/widgets/QuickActions";
import KPIGauge from "../../../components/widgets/KPIGauge";
import api from "../../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import CommitteeTasks from "../../../components/widgets/CommitteeTasks";

const getIcon = (name: string) => (Icons as any)[name] || Icons.HelpCircle;

const Handshake = getIcon("Handshake");
const Award = getIcon("Award");
const Mail = getIcon("Mail");
const Globe = getIcon("Globe");
const TrendingUp = getIcon("TrendingUp");
const Users = getIcon("Users");
const Star = getIcon("Star");
const Plus = getIcon("Plus");
const Phone = getIcon("Phone");
const Building = getIcon("Building");
const ExternalLink = getIcon("ExternalLink");
const Calendar = getIcon("Calendar");
const DollarSign = getIcon("DollarSign");
const BarChart3 = getIcon("BarChart3");
const Search = getIcon("Search");
const Filter = getIcon("Filter");
const Trash2 = getIcon("Trash2");
const Edit = getIcon("Edit");
const Save = getIcon("Save");
const X = getIcon("X");
const RefreshCw = getIcon("RefreshCw");
const Briefcase = getIcon("Briefcase");
const User = getIcon("User");
const CheckCircle = getIcon("CheckCircle");
const Clock = getIcon("Clock");
const AlertCircle = getIcon("AlertCircle");
const Megaphone = getIcon("Megaphone");
const FileText = getIcon("FileText");
const Send = getIcon("Send");

const config = COMMITTEE_CONFIGS.pr;

// ─── Partner Manager Sub-component ───────────────────────────────────────────
const PartnerManager: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "", type: "CORPORATE", contactName: "", email: "", phone: "", tier: "GOLD", status: "PROSPECT"
  });

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      const res = await api.get("/pr/partners");
      setPartners(res.data.partners || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/pr/partners", newPartner);
      setShowAddModal(false);
      setNewPartner({ name: "", type: "CORPORATE", contactName: "", email: "", phone: "", tier: "GOLD", status: "PROSPECT" });
      fetchPartners();
    } catch (err) { console.error(err); alert("❌ فشل إضافة الشريك"); }
  };

  const filtered = partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors: any = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    NEGOTIATING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PROSPECT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    INACTIVE: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة الشركاء (Partnerships)</h2>
          <p className="text-sm text-slate-500 mt-1">إدارة العلاقات مع الجهات الحكومية والخاصة والمنظمات</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> إضافة شريك جديد
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="بحث عن شريك..." value={search} onChange={e => setSearch(e.target.value)} className="w-full glass pr-11 pl-4 py-2.5 rounded-xl text-sm text-white outline-none" />
        </div>
        <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all"><Filter className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-6 group hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all">
                  {p.name.charAt(0)}
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[p.status] || statusColors.PROSPECT}`}>{p.status}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mb-4"><Building className="w-3 h-3" /> {p.type}</p>
              
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">مسؤول التواصل</span>
                  <span className="text-white font-bold">{p.contactName || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">الفئة</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1"><Award className="w-3 h-3" /> {p.tier}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold text-white">إضافة شريك جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم الجهة</span>
                <input required value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">النوع</span>
                <select value={newPartner.type} onChange={e => setNewPartner({...newPartner, type: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                  <option value="CORPORATE">شركة</option>
                  <option value="GOVERNMENT">جهة حكومية</option>
                  <option value="NGO">منظمة خيرية</option>
                  <option value="EDUCATIONAL">جهة تعليمية</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">الفئة</span>
                <select value={newPartner.tier} onChange={e => setNewPartner({...newPartner, tier: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                  <option value="STRATEGIC">استراتيجي</option>
                  <option value="GOLD">ذهبي</option>
                  <option value="SILVER">فضي</option>
                  <option value="BRONZE">برونزي</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم المسؤول</span>
                <input value={newPartner.contactName} onChange={e => setNewPartner({...newPartner, contactName: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">رقم الهاتف</span>
                <input value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="col-span-2 flex gap-4 mt-4">
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30">حفظ البيانات</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/5 hover:bg-white/10 transition-all">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ─── Sponsorship Manager Sub-component ───────────────────────────────────────
const SponsorshipManager: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSpon, setNewSpon] = useState({ partnerId: "", amount: 0, type: "FINANCIAL", notes: "", status: "PENDING" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, p] = await Promise.all([api.get("/pr/sponsorships"), api.get("/pr/partners")]);
      setSponsorships(s.data.sponsorships || []);
      setPartners(p.data.partners || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newSpon.partnerId) return alert("اختر الشريك");
    try {
      await api.post("/pr/sponsorships", newSpon);
      setShowAdd(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">تتبع الرعايات (Sponsorship Tracking)</h2>
          <p className="text-sm text-slate-500 mt-1">متابعة الميزانيات المعتمدة والرعايات العينية والمادية</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
          <DollarSign className="w-5 h-5" /> تسجيل رعاية جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-slate-400">الشريك</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">النوع</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">القيمة</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s, i) => (
                <tr key={s.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">{s.partner?.name?.charAt(0)}</div>
                      <span className="text-xs font-bold text-white">{s.partner?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-[10px] text-slate-400">{s.type}</span></td>
                  <td className="px-6 py-4"><span className="text-xs font-bold text-emerald-400 font-mono">{s.amount.toLocaleString()} EGP</span></td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">{new Date(s.date).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-emerald-600/20 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">إجمالي التمويل</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2 font-mono">
              {sponsorships.reduce((acc, s) => acc + s.amount, 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">EGP</span>
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[75%]" />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">معدل نمو 15% عن الشهر السابق</p>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white">تسجيل رعاية</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اختر الشريك</span>
                <select value={newSpon.partnerId} onChange={e => setNewSpon({...newSpon, partnerId: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                  <option value="">— اختر —</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">المبلغ</span>
                <input type="number" value={newSpon.amount} onChange={e => setNewSpon({...newSpon, amount: Number(e.target.value)})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">النوع</span>
                <select value={newSpon.type} onChange={e => setNewSpon({...newSpon, type: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                  <option value="FINANCIAL">مادي</option>
                  <option value="IN_KIND">عيني</option>
                  <option value="MEDIA">إعلامي</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleAdd} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">حفظ</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-xl">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Communication Manager Sub-component ───────────────────────────────────────
const CommunicationManager: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [newMsg, setNewMsg] = useState({ subject: "", recipient: "", content: "" });

  useEffect(() => {
    // Mock data for demonstration
    setMessages([
      { id: 1, subject: "طلب رعاية موسم رمضان", recipient: "شركة فودافون", date: "2024-03-15", status: "SENT" },
      { id: 2, subject: "دعوة لحضور الحفل الختامي", recipient: "وزارة الشباب", date: "2024-03-10", status: "READ" },
      { id: 3, subject: "تحديث ملف الشراكة", recipient: "بنك مصر", date: "2024-03-05", status: "REPLIED" },
    ]);
    setLoading(false);
  }, []);

  const handleSend = () => {
    if (!newMsg.subject || !newMsg.recipient) return alert("يرجى ملء البيانات");
    const msg = {
      id: Date.now(),
      ...newMsg,
      date: new Date().toISOString().split('T')[0],
      status: "SENT"
    };
    setMessages([msg, ...messages]);
    setShowNewModal(false);
    setNewMsg({ subject: "", recipient: "", content: "" });
  };

  const filtered = messages.filter(m => {
    const matchesSearch = m.subject.toLowerCase().includes(search.toLowerCase()) || 
                         m.recipient.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">مركز المراسلات والبيانات الإعلامية</h2>
          <p className="text-sm text-slate-500 mt-1">إدارة كافة التواصلات الصادرة والواردة لتعزيز صورة المنظمة</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="px-8 py-3.5 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <Mail className="w-5 h-5" /> إنشاء مراسلة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "بانتظار الرد", value: messages.filter(m => m.status === 'READ').length || 12, icon: Clock, color: "text-amber-400" },
          { label: "تم الإرسال", value: messages.filter(m => m.status === 'SENT').length || 45, icon: Send, color: "text-blue-400" },
          { label: "معدل الاستجابة", value: "88%", icon: TrendingUp, color: "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4 flex-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest whitespace-nowrap">أحدث المراسلات</h3>
            <AnimatePresence>
              {showSearchInput && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "100%", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="max-w-xs relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="بحث..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full glass pr-9 pl-3 py-1.5 rounded-lg text-xs text-white outline-none" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex glass rounded-lg p-1">
              {["ALL", "SENT", "REPLIED"].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {f === 'ALL' ? 'الكل' : f}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`p-2 glass rounded-lg transition-all ${showSearchInput ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">لا توجد مراسلات تطابق البحث</div>
          ) : filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-r-2 border-transparent hover:border-primary">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors mb-1">{m.subject}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {m.recipient}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {m.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-left">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg tracking-wider border ${
                    m.status === 'REPLIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    m.status === 'READ' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <button className="p-2.5 glass rounded-xl text-slate-500 hover:text-white hover:bg-primary transition-all shadow-sm">
                  <ExternalLink className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 bg-white/[0.01] text-center border-t border-white/5">
          <button className="text-[11px] font-bold text-primary hover:underline">عرض أرشيف المراسلات بالكامل</button>
        </div>
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-8 w-full max-w-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white">إنشاء مراسلة جديدة</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">الموضوع</span>
                  <input value={newMsg.subject} onChange={e => setNewMsg({...newMsg, subject: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="مثال: طلب رعاية مؤتمر الشباب" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">المُستلم (الجهة)</span>
                  <input value={newMsg.recipient} onChange={e => setNewMsg({...newMsg, recipient: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="مثال: شركة بيبسيكو مصر" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">محتوى الرسالة</span>
                  <textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} className="w-full glass px-4 py-4 rounded-xl text-sm text-white h-32 resize-none" placeholder="اكتب نص المراسلة هنا..." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSend} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> إرسال المراسلة
                  </button>
                  <button onClick={() => setShowNewModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/5">إلغاء</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Contact CRM Sub-component ────────────────────────────────────────────────
const ContactCRM: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newContact, setNewContact] = useState({ name: "", company: "", role: "", email: "", phone: "", type: "CORPORATE" });

  useEffect(() => {
    setContacts([
      { id: 1, name: "أحمد كمال", company: "إعمار مصر", role: "مدير التسويق", email: "a.kamal@emaar.com", phone: "01012345678", type: "CORPORATE" },
      { id: 2, name: "سارة محمود", company: "وزارة التضامن", role: "منسق علاقات", email: "s.mahmoud@moss.gov.eg", phone: "01234567890", type: "GOVERNMENT" },
      { id: 3, name: "ياسر علي", company: "بيبسيكو", role: "مسؤول المسؤولية المجتمعية", email: "y.ali@pepsico.com", phone: "01123456789", type: "CORPORATE" },
    ]);
  }, []);

  const handleSubmit = () => {
    if (!newContact.name || !newContact.company) return alert("يرجى إكمال البيانات الأساسية");
    
    if (editingId) {
      setContacts(contacts.map(c => c.id === editingId ? { ...c, ...newContact } : c));
    } else {
      setContacts([{ id: Date.now(), ...newContact }, ...contacts]);
    }
    
    handleClose();
  };

  const handleEdit = (c: any) => {
    setNewContact({ name: c.name, company: c.company, role: c.role, email: c.email, phone: c.phone, type: c.type });
    setEditingId(c.id);
    setShowAddModal(true);
  };

  const handleClose = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewContact({ name: "", company: "", role: "", email: "", phone: "", type: "CORPORATE" });
  };

  const handleExport = () => {
    const csv = "Name,Company,Role,Email,Phone\n" + contacts.map(c => `${c.name},${c.company},${c.role},${c.email},${c.phone}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
  };

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || (filter === "CORPORATE" && c.type === "CORPORATE") || (filter === "GOVERNMENT" && c.type === "GOVERNMENT");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">قاعدة جهات الاتصال الذكية (CRM)</h2>
          <p className="text-sm text-slate-500 mt-1">إدارة وتحليل شبكة العلاقات الاستراتيجية للمنظمة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95" title="تصدير البيانات">
            <Icons.FileDown className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <User className="w-5 h-5" /> إضافة جهة اتصال
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="بحث في جهات الاتصال..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass pr-11 pl-4 py-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500/50 transition-all" 
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: "ALL", label: "الكل" },
            { id: "CORPORATE", label: "شركات" },
            { id: "GOVERNMENT", label: "جهات حكومية" }
          ].map((f) => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'glass text-slate-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card text-slate-500">لا توجد نتائج تطابق بحثك</div>
        ) : filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-6 group hover:border-indigo-500/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-500/20 transition-all" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {c.name.charAt(0)}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(c)} className="p-2 glass rounded-lg text-slate-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                <button 
                  onClick={() => setContacts(contacts.filter(x => x.id !== c.id))}
                  className="p-2 glass rounded-lg text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{c.name}</h3>
              <p className="text-xs text-indigo-300 font-medium mb-4">{c.role} @ {c.company}</p>
              
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                  {c.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                  {c.phone}
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 glass rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                <Icons.History className="w-3.5 h-3.5" /> سجل التفاعلات
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Modal (Add/Edit) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-8 w-full max-w-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white">{editingId ? 'تعديل جهة الاتصال' : 'إضافة جهة اتصال جديدة'}</h3>
                <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold">الاسم الكامل</span>
                  <input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="الاسم الرباعي" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">الشركة / الجهة</span>
                  <input value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="اسم المؤسسة" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">المسمى الوظيفي</span>
                  <input value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="مثال: مدير العلاقات" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">البريد الإلكتروني</span>
                  <input value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="email@example.com" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">رقم الهاتف</span>
                  <input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="01xxxxxxxxx" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold">نوع الجهة</span>
                  <select value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                    <option value="CORPORATE">شركة (خاص)</option>
                    <option value="GOVERNMENT">جهة حكومية</option>
                    <option value="NGO">منظمة خيرية</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4 col-span-2">
                  <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30">
                    {editingId ? 'تحديث البيانات' : 'حفظ جهة الاتصال'}
                  </button>
                  <button onClick={handleClose} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/5">إلغاء</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Outreach Pipeline Sub-component ──────────────────────────────────────────
const OutreachPipeline: React.FC = () => {
  const [pipeline, setPipeline] = useState<any[]>([
    { id: "PROSPECT", label: "مرشح", color: "bg-blue-500", items: [{ id: 1, name: "البنك الأهلي" }, { id: 2, name: "مايكروسوفت" }] },
    { id: "CONTACTED", label: "تم التواصل", color: "bg-amber-500", items: [{ id: 3, name: "سيمنز" }] },
    { id: "MEETING", label: "اجتماع عمل", color: "bg-violet-500", items: [{ id: 4, name: "اتصالات مصر" }] },
    { id: "PROPOSAL", label: "تقديم عرض", color: "bg-pink-500", items: [] },
    { id: "WON", label: "تم الاتفاق", color: "bg-emerald-500", items: [{ id: 5, name: "فوري" }] },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [targetStage, setTargetStage] = useState("PROSPECT");
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName) return;
    const newPipeline = pipeline.map(s => {
      if (s.id === targetStage) {
        return { ...s, items: [...s.items, { id: Date.now(), name: newName }] };
      }
      return s;
    });
    setPipeline(newPipeline);
    setShowAdd(false);
    setNewName("");
  };

  const moveCard = (cardId: number, fromStage: string, toStage: string) => {
    let card: any;
    const step1 = pipeline.map(s => {
      if (s.id === fromStage) {
        card = s.items.find((i: any) => i.id === cardId);
        return { ...s, items: s.items.filter((i: any) => i.id !== cardId) };
      }
      return s;
    });
    const step2 = step1.map(s => {
      if (s.id === toStage) {
        return { ...s, items: [...s.items, card] };
      }
      return s;
    });
    setPipeline(step2);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">مسار الاستقطاب الرقمي (Pipeline)</h2>
          <p className="text-sm text-slate-500 mt-1">تتبع رحلة الشركاء من الترشيح المبدئي حتى توقيع البروتوكول</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setTargetStage("PROSPECT"); setShowAdd(true); }} className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20">+ إضافة فرصة</button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {pipeline.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="min-w-[280px] w-[280px] flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${s.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ boxShadow: `0 0 15px ${s.color.replace('bg-', '')}` }} />
                <h3 className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{s.label}</h3>
              </div>
              <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-slate-500 font-bold">{s.items.length}</span>
            </div>

            <div className="flex-1 space-y-3 bg-white/[0.01] p-3 rounded-3xl border border-white/5 min-h-[500px] backdrop-blur-3xl">
              {s.items.map((item: any) => (
                <div key={item.id} className="glass-card p-4 hover:border-primary/50 transition-all cursor-default group relative">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{item.name}</p>
                    <div className="flex gap-1">
                      {i > 0 && (
                        <button onClick={() => moveCard(item.id, s.id, pipeline[i-1].id)} className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white"><Icons.ChevronRight className="w-3 h-3" /></button>
                      )}
                      {i < pipeline.length - 1 && (
                        <button onClick={() => moveCard(item.id, s.id, pipeline[i+1].id)} className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white"><Icons.ChevronLeft className="w-3 h-3" /></button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2].map(u => (
                        <div key={u} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] text-slate-400">U{u}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>منذ يومين</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={() => { setTargetStage(s.id); setShowAdd(true); }} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] text-slate-600 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                إضافة بطاقة جديدة
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Opportunity Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-8 w-full max-w-sm space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white">إضافة فرصة جديدة</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">اسم الجهة / المؤسسة</span>
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="w-full glass px-4 py-3 rounded-xl text-sm text-white focus:border-primary/50 outline-none" placeholder="مثال: البنك العربي الأفريقي" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleAdd} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30">إضافة</button>
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/5">إلغاء</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ─── Main PR Dashboard Component ─────────────────────────────────────────────
const PRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState({ partners: 0, revenue: 0, outreach: 62, reputation: 9.2 });

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, p, s] = await Promise.all([
          api.get("/ai/insights"),
          api.get("/pr/partners"),
          api.get("/pr/sponsorships")
        ]);
        setInsights(ins.data?.insights || []);
        const ps = p.data.partners || [];
        const ss = s.data.sponsorships || [];
        setStats({
          partners: ps.filter((x:any) => x.status === 'ACTIVE').length,
          revenue: ss.reduce((a:any, b:any) => a + b.amount, 0),
          outreach: 62,
          reputation: 9.2
        });
      } catch {}
    };
    load();
  }, []);

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-8" dir="rtl">
            <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-white/[0.06]"
              style={{ background: `linear-gradient(135deg, ${config.colors.primary}30, ${config.colors.secondary}15)` }}>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.colors.primaryLight }}>مركز العلاقات العامة</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">أهلاً بك، {user?.name?.split(" ")[0]}</h1>
                <p className="text-sm text-white/60 max-w-lg leading-relaxed">قم بإدارة الشراكات الاستراتيجية، تتبع الرعايات، وتعزيز الصورة الذهنية للمنظمة.</p>
              </div>
              <Handshake className="absolute bottom-[-10%] left-10 w-48 h-48 text-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="شركاء فاعلون" value={stats.partners} icon={Handshake} color="text-violet-400" bgColor="bg-violet-400/10" delay={0} />
              <StatCard label="إجمالي التمويل" value={`${(stats.revenue/1000).toFixed(1)}K`} icon={DollarSign} color="text-amber-400" bgColor="bg-amber-400/10" delay={1} />
              <StatCard label="معدل التواصل" value={`${stats.outreach}%`} icon={Globe} color="text-blue-400" bgColor="bg-blue-400/10" delay={2} />
              <StatCard label="الصورة الذهنية" value={stats.reputation} icon={Star} color="text-emerald-400" bgColor="bg-emerald-400/10" delay={3} trend={{ value: 8 }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="نمو التمويل السنوي" type="area" data={[{m:'Jan',v:10000},{m:'Feb',v:15000},{m:'Mar',v:stats.revenue}]} dataKey="v" xKey="m" colors={[config.colors.primary]} icon={TrendingUp} />
              </div>
              <QuickActions actions={config.quickActions} onAction={a => {
                if (a === "new-partnership") setTab("partnerships");
                if (a === "send-outreach") setTab("communications");
                if (a === "view-analytics") setTab("analytics");
              }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1"><AIInsightsPanel insights={insights} title="توصيات العلاقات العامة" /></div>
              <div className="lg:col-span-2 glass-card p-8">
                <h3 className="text-sm font-bold text-white mb-6">مؤشرات صحة العلاقات</h3>
                <div className="flex flex-wrap justify-center gap-10">
                  <KPIGauge value={92} label="رضا الشركاء" color={config.colors.primary} format="percent" />
                  <KPIGauge value={stats.outreach} label="معدل الرد" color={config.colors.secondary} format="percent" />
                  <KPIGauge value={stats.partners} max={10} label="شركاء جدد" color="#10b981" />
                </div>
              </div>
            </div>

            {/* New Tasks Overview Section */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Icons.CheckSquare className="w-4 h-4 text-primary" />
                  المهام الحالية
                </h3>
                <button onClick={() => setTab("tasks")} className="text-[10px] font-bold text-primary hover:underline">عرض الكل</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs">
                  انتقل إلى تبويب المهام لمتابعة وتسليم التكليفات
                </div>
              </div>
            </div>
          </div>
        );

      case "partnerships": return <PartnerManager />;
      case "sponsors": return <SponsorshipManager />;
      case "communications": return <CommunicationManager />;
      case "contacts": return <ContactCRM />;
      case "outreach": return <OutreachPipeline />;
      
      case "tasks":
        return <CommitteeTasks committeeId={config.id} primaryColor={config.colors.primary} />;

      case "analytics":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">تحليلات العلاقات العامة</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="توزيع الشركاء حسب القطاع" type="pie" data={[
                { name: "حكومي", value: 2 }, { name: "خاص", value: 5 }, { name: "أهلي", value: 3 }
              ]} dataKey="value" xKey="name" />
              <ChartCard title="نمو التمويل" type="line" data={[{m:'Jan',v:4000},{m:'Feb',v:7000},{m:'Mar',v:stats.revenue}]} dataKey="v" xKey="m" colors={[config.colors.secondary]} />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center py-20 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <config.icon className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">هذا القسم قيد المزامنة</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">جاري مزامنة بيانات {tab} مع قاعدة البيانات المركزية.</p>
              </div>
            </div>
          </div>
        );
    }
  };


  return (
    <DashboardLayout committee={config} navItems={config.navItems} activeTab={tab} onTabChange={setTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default PRDashboard;

