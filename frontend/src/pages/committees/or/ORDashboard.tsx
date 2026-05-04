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

const Cog = getIcon("Cog");
const Settings = getIcon("Settings");
const AlertTriangle = getIcon("AlertTriangle");
const CheckSquare = getIcon("CheckSquare");
const TrendingUp = getIcon("TrendingUp");
const Clock = getIcon("Clock");
const RefreshCw = getIcon("RefreshCw");
const Plus = getIcon("Plus");
const MapPin = getIcon("MapPin");
const Calendar = getIcon("Calendar");
const DollarSign = getIcon("DollarSign");
const Search = getIcon("Search");
const Filter = getIcon("Filter");
const Trash2 = getIcon("Trash2");
const Edit = getIcon("Edit");
const User = getIcon("User");

const config = COMMITTEE_CONFIGS.or;

// ─── Event Manager Sub-component ─────────────────────────────────────────────
const EventManager: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", location: "", startDate: "", endDate: "", status: "PLANNING", budget: 0
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/or/events");
      setEvents(res.data.events || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/or/events", newEvent);
      setShowAdd(false);
      setNewEvent({ title: "", description: "", location: "", startDate: "", endDate: "", status: "PLANNING", budget: 0 });
      fetchEvents();
    } catch (err) { alert("❌ فشل إنشاء الحدث"); }
  };

  const statusMap: any = {
    PLANNING: { label: "قيد التخطيط", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    ONGOING: { label: "جارٍ التنفيذ", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    COMPLETED: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    CANCELLED: { label: "ملغى", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة الفعاليات (Events)</h2>
          <p className="text-sm text-slate-500 mt-1">تخطيط وتنسيق ومتابعة كافة فعاليات المنظمة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20">
          <Plus className="w-5 h-5" /> إنشاء حدث جديد
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 border-r-4 border-r-orange-500">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusMap[ev.status]?.color}`}>
                  {statusMap[ev.status]?.label}
                </span>
                <p className="text-xs text-slate-500 flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(ev.startDate).toLocaleDateString("ar-EG")}</p>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{ev.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{ev.description}</p>
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5 mt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] text-white">{ev.location || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-white font-mono">{ev.budget.toLocaleString()} EGP</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] text-white">M</div>)}
                </div>
                <button className="text-[10px] font-bold text-orange-400 hover:underline">التفاصيل الكاملة ←</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-xl space-y-6">
            <h3 className="text-xl font-bold text-white">إضافة حدث جديد</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">عنوان الحدث</span>
                <input required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">تاريخ البدء</span>
                <input type="date" required value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">الميزانية المقدرة</span>
                <input type="number" value={newEvent.budget} onChange={e => setNewEvent({...newEvent, budget: Number(e.target.value)})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">الموقع</span>
                <input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">الوصف</span>
                <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white h-24 resize-none" />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-lg">حفظ</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};


// ─── Workflow Manager Sub-component ──────────────────────────────────────────
const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: "", steps: 1, status: "ACTIVE" });

  useEffect(() => {
    setWorkflows([
      { id: 1, name: "إجراءات تنظيم الفعاليات الكبرى", steps: 12, status: "ACTIVE", lastUpdate: "2024-03-20" },
      { id: 2, name: "بروتوكول استقبال كبار الزوار", steps: 8, status: "REVIEW", lastUpdate: "2024-03-18" },
      { id: 3, name: "خطة الطوارئ والإخلاء", steps: 5, status: "ACTIVE", lastUpdate: "2024-03-15" },
    ]);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const workflow = { ...newWorkflow, id: workflows.length + 1, lastUpdate: new Date().toISOString().split('T')[0] };
    setWorkflows([workflow, ...workflows]);
    setShowAdd(false);
    setNewWorkflow({ name: "", steps: 1, status: "ACTIVE" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">إدارة مسارات العمل (Workflows)</h2>
          <p className="text-sm text-slate-500 mt-1">تعريف ومتابعة الإجراءات التشغيلية القياسية للمنظمة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg">
          <Settings className="w-5 h-5" /> إنشاء مسار عمل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((w, i) => (
          <div key={w.id} className="glass-card p-6 border-r-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-200">{w.name}</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${w.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {w.status}
              </span>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-mono">{w.steps}</p>
                <p className="text-[10px] text-slate-500">خطوة تنفيذية</p>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400">{w.lastUpdate}</p>
                <p className="text-[10px] text-slate-500">آخر تحديث</p>
              </div>
            </div>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white transition-all">تعديل المسار</button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-slate-100">إنشاء مسار عمل جديد</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم المسار</span>
                <input required value={newWorkflow.name} onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500" placeholder="مثال: إجراءات الاستقبال" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">عدد الخطوات</span>
                <input type="number" required value={newWorkflow.steps} onChange={e => setNewWorkflow({...newWorkflow, steps: Number(e.target.value)})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg">إنشاء</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ─── Task Manager Sub-component ──────────────────────────────────────────────
const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", priority: "MEDIUM", deadline: "" });

  useEffect(() => {
    setTasks([
      { id: 1, title: "تجهيز القاعة الرئيسية", assignee: "فريق اللوجستيات", priority: "HIGH", deadline: "14:00" },
      { id: 2, title: "مراجعة كشوف الحضور", assignee: "فريق الاستقبال", priority: "MEDIUM", deadline: "16:30" },
      { id: 3, title: "توفير وجبات المتطوعين", assignee: "فريق الإطعام", priority: "LOW", deadline: "13:00" },
    ]);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setTasks([{ ...newTask, id: tasks.length + 1 }, ...tasks]);
    setShowAdd(false);
    setNewTask({ title: "", assignee: "", priority: "MEDIUM", deadline: "" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">توزيع المهام التشغيلية</h2>
          <p className="text-sm text-slate-500 mt-1">متابعة تنفيذ المهام الميدانية في الوقت الفعلي</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> إضافة مهمة
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-500">المهمة</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">المسؤول</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">الأولوية</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">الموعد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-white/[0.01] transition-all">
                <td className="px-6 py-4 text-xs font-bold text-slate-200">{t.title}</td>
                <td className="px-6 py-4 text-[10px] text-slate-400">{t.assignee}</td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">{t.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white">إضافة مهمة جديدة</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم المهمة</span>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500" placeholder="وصف المهمة" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">المسؤول</span>
                <input required value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500" placeholder="اسم المسؤول" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">الأولوية</span>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 bg-slate-900 appearance-none">
                    <option value="HIGH" className="bg-slate-900 text-slate-200">عالية</option>
                    <option value="MEDIUM" className="bg-slate-900 text-slate-200">متوسطة</option>
                    <option value="LOW" className="bg-slate-900 text-slate-200">منخفضة</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">الموعد (HH:mm)</span>
                  <input value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" placeholder="12:00" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">إضافة</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ─── Incident Tracker Sub-component ──────────────────────────────────────────
const IncidentTracker: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newIncident, setNewIncident] = useState({ type: "TECHNICAL", level: "MINOR", desc: "" });

  useEffect(() => {
    setIncidents([
      { id: 1, type: "TECHNICAL", level: "CRITICAL", desc: "انقطاع التيار الكهربائي في القاعة B", time: "10:15 AM", status: "RESOLVING" },
      { id: 2, type: "LOGISTICS", level: "MINOR", desc: "تأخر وصول حافلة المتطوعين", time: "09:45 AM", status: "PENDING" },
    ]);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const incident = { ...newIncident, id: incidents.length + 1, time: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }), status: "PENDING" };
    setIncidents([incident, ...incidents]);
    setShowAdd(false);
    setNewIncident({ type: "TECHNICAL", level: "MINOR", desc: "" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">مركز إدارة البلاغات (Incidents)</h2>
          <p className="text-sm text-slate-500 mt-1">الرصد الفعلي للمشكلات الميدانية وسرعة الاستجابة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-600/20">
          <AlertTriangle className="w-5 h-5" /> إبلاغ عن مشكلة
        </button>
      </div>

      <div className="space-y-4">
        {incidents.map(inc => (
          <div key={inc.id} className={`glass-card p-6 border-l-4 ${inc.level === 'CRITICAL' ? 'border-rose-500' : 'border-amber-500'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${inc.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{inc.desc}</h3>
                  <p className="text-[10px] text-slate-500">{inc.type} • {inc.time}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-3 py-1 bg-white/5 text-slate-400 rounded-full">{inc.status}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-slate-100">إبلاغ عن مشكلة</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">وصف المشكلة</span>
                <textarea required value={newIncident.desc} onChange={e => setNewIncident({...newIncident, desc: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 h-24 resize-none" placeholder="اكتب تفاصيل المشكلة هنا..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">النوع</span>
                  <select value={newIncident.type} onChange={e => setNewIncident({...newIncident, type: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 bg-slate-900 appearance-none">
                    <option value="TECHNICAL" className="bg-slate-900 text-slate-200">تقني</option>
                    <option value="LOGISTICS" className="bg-slate-900 text-slate-200">لوجستي</option>
                    <option value="SECURITY" className="bg-slate-900 text-slate-200">أمني</option>
                    <option value="OTHER" className="bg-slate-900 text-slate-200">أخرى</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">المستوى</span>
                  <select value={newIncident.level} onChange={e => setNewIncident({...newIncident, level: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 bg-slate-900 appearance-none">
                    <option value="CRITICAL" className="bg-slate-900 text-slate-200">حرج</option>
                    <option value="MAJOR" className="bg-slate-900 text-slate-200">هام</option>
                    <option value="MINOR" className="bg-slate-900 text-slate-200">بسيط</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg">إبلاغ</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};


// ─── Main OR Dashboard Component ─────────────────────────────────────────────
const ORDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, efficiency: 91, incidents: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, e] = await Promise.all([
          api.get("/ai/insights"),
          api.get("/or/events")
        ]);
        setInsights(ins.data?.insights || []);
        const evs = e.data.events || [];
        setStats({
          events: evs.filter((x:any) => x.status === 'ONGOING').length,
          efficiency: 91,
          incidents: 0
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
              style={{ background: `linear-gradient(135deg, ${config.colors.primary}25, ${config.colors.secondary}15)` }}>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.colors.primaryLight }}>مركز العمليات واللوجستيات</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">مركز التحكم الرقمي</h1>
                <p className="text-sm text-white/60 max-w-lg leading-relaxed">قم بتنسيق سير العمل، إدارة الموارد اللوجستية، وضمان التنفيذ المثالي لكافة المهام.</p>
              </div>
              <Cog className="absolute bottom-[-10%] left-10 w-48 h-48 text-white/5 animate-[spin_20s_linear_infinite]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="فعاليات جارية" value={stats.events} icon={Settings} color="text-orange-400" bgColor="bg-orange-400/10" delay={0} />
              <StatCard label="معدل الكفاءة" value={`${stats.efficiency}%`} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-400/10" delay={1} trend={{ value: 6 }} />
              <StatCard label="بلاغات مفتوحة" value={stats.incidents} icon={AlertTriangle} color="text-amber-400" bgColor="bg-amber-400/10" delay={2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="الكفاءة التشغيلية" type="area" data={[{m:'Jan',v:82},{m:'Feb',v:85},{m:'Mar',v:91}]} dataKey="v" xKey="m" colors={[config.colors.primary]} icon={TrendingUp} />
              </div>
              <QuickActions actions={config.quickActions} onAction={a => {
                if (a === "new-event") setTab("events");
                if (a === "report-incident") setTab("incidents");
                if (a === "new-workflow") setTab("workflows");
              }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-8">
                <h3 className="text-sm font-bold text-white mb-6">مؤشرات التنفيذ</h3>
                <div className="flex flex-wrap justify-center gap-10">
                  <KPIGauge value={stats.efficiency} label="كفاءة التنفيذ" color={config.colors.secondary} format="percent" />
                  <KPIGauge value={stats.events} max={5} label="فعاليات نشطة" color="#10b981" />
                </div>
              </div>
              <div className="lg:col-span-1"><AIInsightsPanel insights={insights} title="رؤى العمليات" /></div>
            </div>

            {/* New Tasks Overview Section */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Icons.CheckSquare className="w-4 h-4 text-primary" />
                  المهام الحالية
                </h3>
                <button onClick={() => setTab("committee-tasks")} className="text-[10px] font-bold text-primary hover:underline">عرض الكل</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs">
                  انتقل إلى تبويب مهام اللجنة لمتابعة وتسليم التكليفات
                </div>
              </div>
            </div>
          </div>
        );

      case "workflows": return <WorkflowManager />;
      
      case "tasks": return <TaskManager />;
      case "committee-tasks": return <CommitteeTasks committeeId={config.id} primaryColor={config.colors.primary} />;
      case "incidents": return <IncidentTracker />;
      
      case "analytics":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">تحليلات الأداء التشغيلي</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="معدل إنجاز المهام" type="bar" data={[{n:'E1',v:85},{n:'E2',v:92},{n:'E3',v:78}]} dataKey="v" xKey="n" colors={[config.colors.primary]} />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center py-20 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
                <config.icon className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">هذا القسم قيد المزامنة</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">جاري مزامنة بيانات {tab} مع مركز العمليات.</p>
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

export default ORDashboard;

