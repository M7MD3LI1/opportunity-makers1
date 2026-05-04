import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import loginBg from "../assets/login-bg.png";
import logoImg from "../assets/logo-icon.png";
import { cn } from "../lib/utils";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(false);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      
      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.department) {
        const deptName = data.user.department.name.toLowerCase();
        let committeeId = "";
        if (deptName.includes("hr")) committeeId = "hr";
        else if (deptName.includes("pr")) committeeId = "pr";
        else if (deptName.includes("or")) committeeId = "or";
        else if (deptName.includes("train")) committeeId = "training";
        else if (deptName.includes("social")) committeeId = "social";
        
        if (committeeId) {
          navigate(`/committee/${committeeId}`);
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "فشل تسجيل الدخول. حاول مرة أخرى.";
      if (err.response?.status === 403) setIsPending(true);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background" dir="rtl">

      {/* ─── LEFT: Full Background Image Side ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-secondary-foreground/80 backdrop-blur-[2px]" />

        {/* Branding on top of image */}
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="w-28 h-28 bg-white p-4 rounded-2xl mx-auto mb-8 shadow-2xl">
            <img src={logoImg} alt="صناع الفرص" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-5xl font-sans font-light text-white mb-3 tracking-tight">
            صُناع الفرص
          </h2>
          <p className="text-accent text-lg font-bold uppercase tracking-[0.2em] mb-2">
            وزارة الشباب والرياضة
          </p>
          <div className="w-12 h-1 bg-accent/50 mx-auto my-6 rounded-full" />
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto font-sans">
            منصة الإدارة الذكية لتمكين الشباب وبناء الفرص وفق المعايير العالمية.
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Login Form Side ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white relative">
        
        <div className="relative z-10 w-full max-w-md px-10 py-16 animate-slide-right">
          
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-12">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl mx-auto mb-4 p-4 border border-primary/10">
              <img src={logoImg} alt="صناع الفرص" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-sans font-bold text-primary">صناع الفرص</h2>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">وزارة الشباب والرياضة</p>
          </div>

          {/* Welcome text */}
          <div className="mb-10 border-r-4 border-primary pr-6">
            <h1 className="text-3xl font-sans font-bold text-slate-900 mb-2">مرحباً بك 👋</h1>
            <p className="text-slate-500 text-sm font-sans">سجّل الدخول للوصول إلى لوحة التحكم الخاصة بك</p>
          </div>

          {/* Error */}
          {error && (
            <div className={cn(
              "p-4 mb-8 text-sm flex items-center gap-4 animate-fade-in border",
              isPending ? "bg-accent/5 border-accent/20 text-accent-foreground" : "bg-destructive/5 border-destructive/20 text-destructive"
            )}>
              <span className="text-xl">{isPending ? "⏳" : "⚠️"}</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">البريد الإلكتروني</label>
              <input 
                type="text" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
                placeholder="example@email.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                dir="ltr" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">كلمة المرور</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                dir="ltr" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-sans font-bold uppercase tracking-widest text-sm hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جارٍ التحقق...
                </span>
              ) : "تسجيل الدخول"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">أو</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-slate-600 text-sm font-sans">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline transition-all">
                انضم إلينا الآن
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 text-center border-t border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">صناعة · حوار · تعلم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
