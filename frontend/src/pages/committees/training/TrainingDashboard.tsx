import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { COMMITTEE_CONFIGS } from "../../../config/committeeConfig";
import DashboardLayout from "../../../layouts/DashboardLayout";
import StatCard from "../../../components/widgets/StatCard";
import ChartCard from "../../../components/widgets/ChartCard";
import AIInsightsPanel from "../../../components/widgets/AIInsightsPanel";
import QuickActions from "../../../components/widgets/QuickActions";
import KPIGauge from "../../../components/widgets/KPIGauge";
import api from "../../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import CommitteeTasks from "../../../components/widgets/CommitteeTasks";

const getIcon = (name: string) => (Icons as any)[name] || Icons.HelpCircle;

const GraduationCap = getIcon("GraduationCap");
const BookOpen = getIcon("BookOpen");
const Users = getIcon("Users");
const TrendingUp = getIcon("TrendingUp");
const Brain = getIcon("Brain");
const CheckCircle = getIcon("CheckCircle");
const Plus = getIcon("Plus");
const BarChart3 = getIcon("BarChart3");
const Search = getIcon("Search");
const Filter = getIcon("Filter");
const Play = getIcon("Play");
const FileText = getIcon("FileText");
const Award = getIcon("Award");
const Clock = getIcon("Clock");
const Star = getIcon("Star");
const ChevronRight = getIcon("ChevronRight");
const MoreHorizontal = getIcon("MoreHorizontal");
const Video = getIcon("Video");
const Book = getIcon("Book");
const PenTool = getIcon("PenTool");
const Monitor = getIcon("Monitor");
const RefreshCw = getIcon("RefreshCw");
const CalendarCheck = getIcon("CalendarCheck");
const User = getIcon("User");

const config = COMMITTEE_CONFIGS.training;

// ─── Course Manager Sub-component ────────────────────────────────────────────
const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", category: "SOFT_SKILLS", isPublished: true });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/training/courses");
      setCourses(res.data.courses || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/training/courses", newCourse);
      setShowAdd(false);
      setNewCourse({ title: "", description: "", category: "SOFT_SKILLS", isPublished: true });
      fetchCourses();
    } catch (err) { alert("❌ فشل إنشاء الكورس"); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة البرامج التدريبية (LMS)</h2>
          <p className="text-sm text-slate-500 mt-1">إنشاء وتطوير المحتوى التعليمي للمنظمة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20">
          <Plus className="w-5 h-5" /> إنشاء برنامج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card group overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-cyan-600/20 to-indigo-600/20 flex items-center justify-center relative overflow-hidden">
              <BookOpen className="w-12 h-12 text-cyan-400 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <span className="absolute bottom-4 right-4 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">{c.category}</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6">{c.description || "لا يوجد وصف حالياً لهذا البرنامج التدريبي."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Video className="w-3.5 h-3.5" /> {c.lessons?.length || 0} درس
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <PenTool className="w-3.5 h-3.5" /> {c.quizzes?.length || 0} اختبار
                  </div>
                </div>
                <button className="p-2 glass rounded-xl text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"><ChevronRight className="w-4 h-4 rotate-180" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white">إضافة برنامج تدريبي</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم البرنامج</span>
                <input required value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">التصنيف</span>
                <select value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                  <option value="SOFT_SKILLS">مهارات ناعمة</option>
                  <option value="TECHNICAL">تقني</option>
                  <option value="MANAGEMENT">إدارة</option>
                  <option value="ONBOARDING">توجيه (Onboarding)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">الوصف</span>
                <textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white h-24 resize-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-lg">إنشاء</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Training Dashboard Component ───────────────────────────────────────
const TrainingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [insights, setInsights] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, members: 162, rate: 82, score: 8.4 });

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, c, t] = await Promise.all([
          api.get("/ai/insights"),
          api.get("/training/courses"),
          api.get("/tasks")
        ]);
        setInsights(ins.data?.insights || []);
        setStats(prev => ({ ...prev, courses: (c.data.courses || []).length }));
        setTasks(t.data.tasks || []);
      } catch {}
    };
    load();
  }, [tab]);


  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-8" dir="rtl">
            <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-white/[0.06]"
              style={{ background: `linear-gradient(135deg, ${config.colors.primary}25, ${config.colors.secondary}15)` }}>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.colors.primaryLight }}>منصة التدريب والتطوير</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">بوابة التعلم المستمر</h1>
                <p className="text-sm text-white/60 max-w-lg leading-relaxed">قم بإدارة البرامج التعليمية، تتبع تقدم الأعضاء، وتطوير المهارات القيادية والتقنية للفريق.</p>
              </div>
              <GraduationCap className="absolute bottom-[-10%] left-10 w-48 h-48 text-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="برامج نشطة" value={stats.courses} icon={BookOpen} color="text-cyan-400" bgColor="bg-cyan-400/10" delay={0} />
              <StatCard label="أعضاء ملتحقون" value={stats.members} icon={Users} color="text-indigo-400" bgColor="bg-indigo-400/10" delay={1} />
              <StatCard label="نسبة الإنجاز" value={`${stats.rate}%`} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-400/10" delay={2} trend={{ value: 5 }} />
              <StatCard label="متوسط التقييم" value={stats.score} icon={Brain} color="text-violet-400" bgColor="bg-violet-400/10" delay={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="إنجازات الأعضاء الشهرية" type="bar" data={[{m:'Jan',v:45},{m:'Feb',v:52},{m:'Mar',v:68}]} dataKey="v" xKey="m" colors={[config.colors.primary]} icon={BarChart3} />
              </div>
              <QuickActions actions={config.quickActions} onAction={a => { if (a === "new-program") setTab("courses"); }} />
            </div>

            {/* Task Summary Widget */}
            <div className="glass-card p-8 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-400 border border-cyan-600/20">
                      <Icons.CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">آخر التكليفات</h3>
                      <p className="text-[10px] text-slate-500 font-medium">المهام المسندة للجنة حالياً</p>
                    </div>
                  </div>
                  <button onClick={() => setTab("tasks")} className="text-[10px] font-bold text-cyan-400 hover:text-white transition-colors bg-cyan-600/10 px-4 py-2 rounded-xl border border-cyan-600/20">عرض الكل</button>
               </div>
               <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-slate-600">لا توجد مهام نشطة حالياً</p>
                    </div>
                  ) : (
                    tasks.slice(0, 3).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer" onClick={() => setTab("tasks")}>
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${task.submissions?.length > 0 ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-cyan-400 animate-pulse shadow-[0_0_10px_#06b6d4]"}`} />
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{task.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No Deadline"}</span>
                          <Icons.ChevronLeft className="w-4 h-4 text-slate-700" />
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1"><AIInsightsPanel insights={insights} title="رؤى تعليمية" /></div>
              <div className="lg:col-span-2 glass-card p-8">
                <h3 className="text-sm font-bold text-white mb-6">مؤشرات الأداء التعليمي</h3>
                <div className="flex flex-wrap justify-center gap-10">
                  <KPIGauge value={stats.rate} label="إكمال البرامج" color={config.colors.primary} format="percent" />
                  <KPIGauge value={stats.score} max={10} label="معدل الاختبارات" color={config.colors.secondary} format="score" />
                  <KPIGauge value={92} label="رضا المتدربين" color="#10b981" format="percent" />
                </div>
              </div>
            </div>
          </div>
        );

      case "programs":
        return <CourseManager />;
      
      case "sessions":
        return (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">إدارة الجلسات التدريبية</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm font-bold">
                <Plus className="w-4 h-4" />
                <span>جدولة جلسة</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "أساسيات الذكاء الاصطناعي", instructor: "د. هبة علي", date: "2024-05-15", time: "06:00 PM", status: "UPCOMING" },
                { title: "مهارات العرض والتقديم", instructor: "أ. محمد سالم", date: "2024-05-10", time: "08:00 PM", status: "COMPLETED" }
              ].map((session, i) => (
                <div key={i} className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-1 rounded-md text-[8px] font-bold ${session.status === 'UPCOMING' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {session.status}
                      </span>
                      <Video className="w-5 h-5 text-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{session.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                      <Users className="w-3 h-3" /> المدرب: {session.instructor}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">سجلات الحضور والغياب</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10">
                    <th className="p-4">المتدرب</th>
                    <th className="p-4">البرنامج</th>
                    <th className="p-4">الجلسة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: "أحمد محمد", program: "القيادة", session: "المستوى 1", status: "PRESENT", time: "06:05 PM" },
                    { name: "سارة محمود", program: "القيادة", session: "المستوى 1", status: "ABSENT", time: "-" },
                    { name: "ياسين كمال", program: "AI Basics", session: "Intro", status: "LATE", time: "06:20 PM" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white font-medium">{row.name}</td>
                      <td className="p-4 text-slate-400">{row.program}</td>
                      <td className="p-4 text-slate-400">{row.session}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' : 
                          row.status === 'LATE' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "progress":
        return (
          <div className="space-y-8" dir="rtl">
            <h2 className="text-2xl font-bold text-white">متابعة تقدم المتدربين</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">معدلات النجاح التراكمية</h3>
                <ChartCard title="تطور الأداء" type="area" data={[{m:'W1',v:65},{m:'W2',v:72},{m:'W3',v:85},{m:'W4',v:88}]} dataKey="v" xKey="m" colors={["#06b6d4"]} />
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">تحليل الفجوات المهارية</h3>
                <div className="space-y-6">
                  {[
                    { skill: "التفكير النقدي", level: 85, color: "bg-cyan-500" },
                    { skill: "العمل الجماعي", level: 92, color: "bg-indigo-500" },
                    { skill: "إدارة الوقت", level: 68, color: "bg-violet-500" },
                    { skill: "المهارات التقنية", level: 75, color: "bg-emerald-500" }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white">{s.skill}</span>
                        <span className="text-slate-400">{s.level}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color}`} style={{ width: `${s.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "instructors":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">قاعدة بيانات المدربين</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "د. هبة علي", specialty: "AI & Data Science", rate: 4.9, sessions: 24 },
                { name: "أ. محمد سالم", specialty: "Soft Skills", rate: 4.8, sessions: 42 },
                { name: "أ. سارة حسن", specialty: "Management", rate: 4.7, sessions: 15 }
              ].map((ins, i) => (
                <div key={i} className="glass-card p-6 text-center group hover:border-cyan-500/50 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                    <User className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{ins.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{ins.specialty}</p>
                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">التقييم</p>
                      <p className="text-sm font-bold text-yellow-400 flex items-center gap-1 justify-center">
                        <Star className="w-3 h-3 fill-yellow-400" /> {ins.rate}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">الجلسات</p>
                      <p className="text-sm font-bold text-white">{ins.sessions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">إصدار الشهادات المعتمدة</h2>
              <button className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-2xl flex items-center gap-2">
                <Award className="w-5 h-5" /> إصدار دفعي
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "شهادة إتمام برنامج القيادة", issued: 12, style: "Premium Gold" },
                { name: "شهادة مهارات التواصل", issued: 84, style: "Standard Blue" }
              ].map((c, i) => (
                <div key={i} className="glass-card p-6 border border-white/5 group hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <Award className="w-12 h-12 text-cyan-400 opacity-20 group-hover:opacity-100 transition-all" />
                    <span className="text-[10px] font-bold text-slate-500">{c.style}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">تم إصدار {c.issued} شهادة حتى الآن</p>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-white/5 hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-xl border border-white/5 transition-all">تخصيص القالب</button>
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl border border-white/5 transition-all">معاينة</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">تحليلات الأداء التعليمي الشاملة</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="تطور مهارات الأعضاء" type="line" data={[{m:'Jan',v:40},{m:'Feb',v:65},{m:'Mar',v:82}]} dataKey="v" xKey="m" colors={[config.colors.secondary]} />
              </div>
              <ChartCard title="توزيع المتدربين" type="pie" data={[
                { name: "تقني", value: 40 }, { name: "إداري", value: 35 }, { name: "مهارات ناعمة", value: 25 }
              ]} dataKey="value" xKey="name" colors={["#06b6d4", "#6366f1", "#10b981"]} />
            </div>
          </div>
        );

      case "tasks":
        return <CommitteeTasks committeeId={config.id} primaryColor={config.colors.primary} />;

      default:
        return (
          <div className="flex items-center justify-center py-20 text-center">
            <div className="space-y-6 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto border border-cyan-500/20">
                <GraduationCap className="w-12 h-12 text-cyan-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">النظام قيد المزامنة</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">جاري مزامنة بيانات القسم {tab} مع بوابة التعلم الذكية.</p>
              </div>
              <button onClick={() => setTab("overview")} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 transition-all">
                العودة للرئيسية
              </button>
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

export default TrainingDashboard;

