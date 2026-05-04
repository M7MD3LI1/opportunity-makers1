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

const PenTool = getIcon("PenTool");
const TrendingUp = getIcon("TrendingUp");
const Users = getIcon("Users");
const Hash = getIcon("Hash");
const BarChart3 = getIcon("BarChart3");
const Calendar = getIcon("Calendar");
const Megaphone = getIcon("Megaphone");
const Eye = getIcon("Eye");
const Heart = getIcon("Heart");
const Share2 = getIcon("Share2");
const Plus = getIcon("Plus");
const ImageIcon = getIcon("Image");
const Facebook = getIcon("Facebook");
const Linkedin = getIcon("Linkedin");
const Twitter = getIcon("Twitter");
const Instagram = getIcon("Instagram");
const Send = getIcon("Send");
const MoreHorizontal = getIcon("MoreHorizontal");
const Clock = getIcon("Clock");
const CheckCircle = getIcon("CheckCircle");
const AlertCircle = getIcon("AlertCircle");
const RefreshCw = getIcon("RefreshCw");
const Layers = getIcon("Layers");
const Zap = getIcon("Zap");
const Globe = getIcon("Globe");

const config = COMMITTEE_CONFIGS.social;

// ─── Content Planner Sub-component ──────────────────────────────────────────
const ContentPlanner: React.FC = () => {
  const [content, setContent] = useState<any[]>(() => {
    const saved = localStorage.getItem("social_content");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "منشور ترحيبي بالأعضاء الجدد", platform: "FACEBOOK", status: "PUBLISHED", scheduledDate: new Date().toISOString() },
      { id: 2, title: "إعلان عن ورشة عمل القادمة", platform: "INSTAGRAM", status: "DRAFT", scheduledDate: new Date().toISOString() }
    ];
  });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", platform: "FACEBOOK", status: "DRAFT", scheduledDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    localStorage.setItem("social_content", JSON.stringify(content));
  }, [content]);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get("/social/content");
      if (res.data.content && res.data.content.length > 0) {
        setContent(res.data.content);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = { id: Date.now(), ...newPost };
    setContent([item, ...content]);
    try { await api.post("/social/content", newPost); } catch {}
    setShowAdd(false);
    setNewPost({ title: "", platform: "FACEBOOK", status: "DRAFT", scheduledDate: new Date().toISOString().split('T')[0] });
  };

  const platformIcons: any = {
    FACEBOOK: <Facebook className="w-5 h-5 text-[#1877F2]" />,
    LINKEDIN: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
    INSTAGRAM: <Instagram className="w-5 h-5 text-[#E4405F]" />,
    TWITTER: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
  };

  const handleDelete = async (id: any) => {
    setContent(content.filter(p => p.id !== id));
    try { await api.delete(`/social/content/${id}`); } catch {}
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">مخطط المحتوى (Content Calendar)</h2>
          <p className="text-sm text-slate-500 mt-1">جدولة وتنظيم النشر عبر منصات التواصل</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-pink-600/20">
          <Plus className="w-5 h-5" /> إنشاء منشور جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">جاري تحميل المحتوى...</div>
        ) : content.length === 0 ? (
          <div className="py-20 text-center glass-card">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500">لا يوجد محتوى مجدول حالياً</p>
          </div>
        ) : (
          content.map((p, i) => (
            <motion.div key={p.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                {platformIcons[p.platform] || <Send className="w-5 h-5 text-pink-400" />}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <h3 className="text-sm font-bold text-white mb-1 truncate">{p.title}</h3>
                <div className="flex items-center justify-end gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">10:00 AM <Clock className="w-3 h-3" /></span>
                  <span className="flex items-center gap-1">{p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString("ar-EG") : "غير مجدول"} <Calendar className="w-3 h-3" /></span>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-4">
                <span className={`text-[9px] font-bold px-3 py-1 rounded-full border ${p.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {p.status === 'PUBLISHED' ? 'تم النشر' : 'مسودة'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/60 hover:text-rose-500 transition-all" title="حذف المنشور">
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-slate-100">إنشاء منشور جديد</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">عنوان المحتوى</span>
                <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-500" placeholder="عنوان المنشور" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">المنصة</span>
                  <select value={newPost.platform} onChange={e => setNewPost({...newPost, platform: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-slate-200 bg-slate-900 appearance-none">
                    <option value="FACEBOOK" className="bg-slate-900 text-slate-200">فيسبوك</option>
                    <option value="INSTAGRAM" className="bg-slate-900 text-slate-200">إنستجرام</option>
                    <option value="LINKEDIN" className="bg-slate-900 text-slate-200">لينكد إن</option>
                    <option value="TWITTER" className="bg-slate-900 text-slate-200">تويتر</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">تاريخ النشر</span>
                  <input type="date" required value={newPost.scheduledDate} onChange={e => setNewPost({...newPost, scheduledDate: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg">جدولة</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-xl">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ─── Campaign Manager Sub-component ──────────────────────────────────────────
const INITIAL_CAMPAIGNS = [
  { id: 1, title: "حملة توعية المجتمع", description: "نشر الوعي حول أهمية العمل التطوعي", platform: "All", reachGoal: "50K", status: "ACTIVE", color: "#ec4899" },
  { id: 2, title: "مبادرة شبابنا", description: "دعم مهارات الشباب في التكنولوجيا", platform: "LinkedIn", reachGoal: "10K", status: "PLANNING", color: "#3b82f6" }
];

const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>(() => {
    const saved = localStorage.getItem("social_campaigns_v2");
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCamp, setNewCamp] = useState({ title: "", description: "", platform: "All", reachGoal: "100K", status: "PLANNING", color: "#ec4899" });

  useEffect(() => {
    localStorage.setItem("social_campaigns_v2", JSON.stringify(campaigns));
  }, [campaigns]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = { id: Date.now(), ...newCamp };
    setCampaigns(prev => [...prev, item]);
    setShowAdd(false);
    setNewCamp({ title: "", description: "", platform: "All", reachGoal: "100K", status: "PLANNING", color: "#ec4899" });
    try { await api.post("/social/campaigns", newCamp); } catch (e) {}
  };

  const handleDelete = async (id: any) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    try { await api.delete(`/social/campaigns/${id}`); } catch (e) {}
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة الحملات الإعلامية</h2>
          <p className="text-sm text-slate-500 mt-1">تخطيط ومتابعة حملات المنظمة عبر المنصات المختلفة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl transition-all shadow-lg shadow-pink-600/20 font-bold">
          <Plus className="w-5 h-5" />
          <span>حملة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-3 py-20 text-center glass-card">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500">لا توجد حملات نشطة حالياً</p>
          </div>
        ) : (
          campaigns.map((camp, i) => (
            <motion.div key={camp.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 border-r-4 group relative overflow-hidden" style={{ borderRightColor: camp.color }}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${camp.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : camp.status === 'PLANNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {camp.status}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(camp.id)} className="p-1.5 glass rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20">
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                  <Megaphone className="w-5 h-5 text-white/20" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2 relative z-10">{camp.title}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 relative z-10">{camp.description || "لا يوجد وصف لهذه الحملة."}</p>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">الوصول المستهدف</span>
                  <span className="text-white font-bold">{camp.reachGoal}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: camp.status === 'ACTIVE' ? '65%' : camp.status === 'COMPLETED' ? '100%' : '0%' }}></div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white text-right">إطلاق حملة جديدة</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">اسم الحملة</span>
                <input required value={newCamp.title} onChange={e => setNewCamp({...newCamp, title: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white text-right" placeholder="مثال: حملة رمضان 2024" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold">وصف مختصر</span>
                <textarea value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white text-right h-24 resize-none" placeholder="اكتب تفاصيل الحملة هنا..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">المنصة</span>
                  <select value={newCamp.platform} onChange={e => setNewCamp({...newCamp, platform: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white bg-slate-900">
                    <option value="All">جميع المنصات</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">هدف الوصول</span>
                  <input required value={newCamp.reachGoal} onChange={e => setNewCamp({...newCamp, reachGoal: e.target.value})} className="w-full glass px-4 py-3 rounded-xl text-sm text-white text-right" placeholder="100K" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg">إطلاق</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Social Dashboard Component ────────────────────────────────────────
const SocialMediaDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, reach: "125K", engagement: 6.8, growth: 2400 });
  const [assets, setAssets] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await api.get("/social/assets");
      setAssets(res.data.assets || []);
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      await api.post("/social/assets", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchAssets();
    } catch (err) { 
      console.error(err);
      alert("❌ فشل رفع الملف"); 
    }
    finally { setIsUploading(false); }
  };

  useEffect(() => {
    if (tab === "assets") fetchAssets();
  }, [tab]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, sc] = await Promise.all([
          api.get("/ai/insights"),
          api.get("/social/content")
        ]);
        setInsights(ins.data?.insights || []);
        setStats(prev => ({ ...prev, posts: (sc.data.content || []).length }));
      } catch (err) { console.error("Social load error:", err); }
    };
    load();
  }, []);

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-8" dir="rtl">
            <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-white/[0.06]"
              style={{ background: `linear-gradient(135deg, ${config.colors.primary}25, #a855f720)` }}>
              <div className="relative z-10 text-right">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.colors.primaryLight }}>المركز الإعلامي</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-3">إدارة التواصل الاجتماعي</h1>
                <p className="text-sm text-white/60 max-w-lg leading-relaxed mr-auto lg:mr-0">قم بجدولة المحتوى، تتبع التفاعل، وتوسيع نطاق وصول المنظمة عبر كافة المنصات الرقمية.</p>
              </div>
              <ImageIcon className="absolute bottom-[-10%] left-10 w-48 h-48 text-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="منشورات الشهر" value={stats.posts} icon={PenTool} color="text-pink-400" bgColor="bg-pink-400/10" delay={0} />
              <StatCard label="إجمالي الوصول" value={stats.reach} icon={Eye} color="text-violet-400" bgColor="bg-violet-400/10" delay={1} trend={{ value: 18 }} />
              <StatCard label="معدل التفاعل" value={`${stats.engagement}%`} icon={Heart} color="text-rose-400" bgColor="bg-rose-400/10" delay={2} trend={{ value: 12 }} />
              <StatCard label="نمو المتابعين" value={`+${stats.growth}`} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" delay={3} trend={{ value: 8 }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="اتجاهات التفاعل" type="area" data={[{m:'Jan',l:2400},{m:'Feb',l:3100},{m:'Mar',l:4200}]} dataKey="l" xKey="m" colors={[config.colors.primary]} icon={TrendingUp} />
              </div>
              <QuickActions actions={config.quickActions} onAction={a => { 
                if (a === "schedule-post") setTab("calendar"); 
                if (a === "create-campaign") setTab("campaigns"); 
                if (a === "view-analytics") setTab("analytics"); 
                if (a === "upload-asset") setTab("assets");
              }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="توزيع المنصات" type="pie" data={[{n:'Facebook',v:45},{n:'LinkedIn',v:35},{n:'Instagram',v:20}]} dataKey="v" xKey="n" colors={["#1877F2", "#0A66C2", "#E4405F"]} />
              <div className="lg:col-span-2"><AIInsightsPanel insights={insights} title="رؤى المحتوى" /></div>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-sm font-bold text-white text-center mb-6">نظرة عامة على الأداء الرقمي</h3>
              <div className="flex flex-wrap justify-center gap-10">
                <KPIGauge value={stats.engagement} max={10} label="التفاعل" color={config.colors.primary} format="score" />
                <KPIGauge value={82} label="نمو الوصول" color="#a855f7" format="percent" />
                <KPIGauge value={stats.posts} max={30} label="كثافة النشر" color="#10b981" />
              </div>
            </div>

            {/* New Tasks Overview Section */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Icons.CheckSquare className="w-4 h-4 text-primary" />
                  <span className="text-slate-100">المهام الحالية</span>
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

      case "scheduling": 
      case "calendar":
        return <ContentPlanner />;

      case "analytics":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">تحليلات المنصات التفصيلية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="نمو الجمهور" type="line" data={[{m:'W1',v:100},{m:'W2',v:250},{m:'W3',v:400}]} dataKey="v" xKey="m" colors={["#a855f7"]} />
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">أفضل الهاشتاجات أداءً</h3>
                <div className="space-y-3">
                  {['#صناع_الفرص', '#تطوع', '#شباب_مصر'].map(tag => (
                    <div key={tag} className="flex items-center justify-between p-3 glass rounded-xl">
                      <span className="text-sm text-pink-400 font-bold">{tag}</span>
                      <span className="text-xs text-white">45K Reach</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "campaigns":
        return <CampaignManager />;

      case "tasks":
        return <CommitteeTasks committeeId={config.id} primaryColor={config.colors.primary} />;

      case "assets":
        return (
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white">المكتبة الإبداعية</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Uploaded Assets */}
              {assets.map((asset) => (
                <div key={asset.id} className="group relative aspect-square rounded-2xl overflow-hidden glass border border-white/5 hover:border-pink-500/50 transition-all cursor-pointer">
                  <img 
                    src={asset.url.startsWith('http') ? asset.url : `http://localhost:5000${asset.url}`} 
                    alt={asset.fileName} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-3">
                    <div className="flex gap-2 w-full">
                      <button className="p-2 bg-white/10 hover:bg-pink-500 rounded-lg flex-1 transition-colors"><Icons.Eye className="w-4 h-4 mx-auto" /></button>
                      <button className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg flex-1 transition-colors"><Icons.Share2 className="w-4 h-4 mx-auto" /></button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded text-[8px] text-white font-bold uppercase z-20">
                    {asset.fileType}
                  </div>
                </div>
              ))}

              {/* Static Placeholders (Only if assets are few) */}
              {assets.length < 5 && [
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=400&fit=crop",
              ].map((url, i) => (
                <div key={`static-${i}`} className="group relative aspect-square rounded-2xl overflow-hidden glass border border-white/5 opacity-40 hover:opacity-100 transition-all cursor-pointer">
                  <img src={url} alt="Static" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
              ))}

              {/* Upload Button */}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:text-pink-400 hover:border-pink-400/50 transition-all cursor-pointer bg-white/5 group relative">
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                {isUploading ? (
                  <Icons.Loader2 className="w-8 h-8 mb-2 animate-spin text-pink-500" />
                ) : (
                  <Icons.Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold">{isUploading ? "جاري الرفع..." : "رفع ملفات"}</span>
              </label>
            </div>
          </div>
        );

      case "trends":
      case "hashtags":
        return (
          <div className="space-y-8" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white">تحليل الهاشتاجات والاتجاهات</h2>
                <div className="glass-card p-6">
                  <ChartCard title="نمو الهاشتاجات الرئيسية" type="area" data={[{m:'Sat',v:1200,t:800},{m:'Sun',v:1900,t:1200},{m:'Mon',v:3200,t:2500},{m:'Tue',v:4500,t:3800}]} dataKey="v" xKey="m" colors={["#ec4899"]} />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">الأكثر تداولاً الآن</h3>
                <div className="space-y-4">
                  {[
                    { tag: "#صناع_الفرص", volume: "45.2K", trend: "up" },
                    { tag: "#تطوع_معنا", volume: "28.1K", trend: "up" },
                    { tag: "#شباب_مصر", volume: "19.5K", trend: "down" },
                    { tag: "#فرص_عمل", volume: "12.8K", trend: "up" },
                    { tag: "#مستقبل_أفضل", volume: "8.4K", trend: "up" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.tag}</p>
                          <p className="text-[10px] text-slate-500">{item.volume} من التفاعلات</p>
                        </div>
                      </div>
                      <div className={item.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                        <TrendingUp className={`w-4 h-4 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center py-20 text-center">
            <div className="space-y-6 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto border border-pink-500/20">
                <Zap className="w-12 h-12 text-pink-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">النظام في انتظار البيانات</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">جاري مزامنة الوحدات المتقدمة للجنة الميديا لضمان أعلى مستويات الأداء.</p>
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
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SocialMediaDashboard;
