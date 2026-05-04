import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) { setError("كلمة المرور الجديدة وتأكيدها غير متطابقتين."); return; }
    if (form.newPassword.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل."); return; }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setTimeout(() => { logout(); navigate("/login"); }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  const s = strength(form.newPassword);
  const strengthColor = ["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"][s - 1] || "bg-gray-600";
  const strengthLabel = ["","ضعيفة","متوسطة","جيدة","قوية"][s] || "";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-black" dir="rtl">
        <div className="glassmorphism rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-2">تم تغيير كلمة المرور!</h2>
          <p className="text-purple-300">سيتم تسجيل خروجك الآن لتسجيل الدخول بكلمة المرور الجديدة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-black to-purple-900" dir="rtl">
      <div className="w-full max-w-md px-4">
        <div className="glassmorphism rounded-3xl p-8 shadow-2xl border border-yellow-500/30">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-white">تغيير كلمة المرور</h1>
            <p className="text-yellow-300 text-sm mt-2">⚠️ يجب تغيير كلمة المرور المؤقتة قبل المتابعة</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-4 mb-5 text-sm">❌ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">كلمة المرور الحالية (المؤقتة)</label>
              <input type="password" value={form.currentPassword}
                onChange={(e) => setForm(p => ({ ...p, currentPassword: e.target.value }))} required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-smooth"
                dir="ltr" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">كلمة المرور الجديدة</label>
              <input type="password" value={form.newPassword}
                onChange={(e) => setForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-smooth"
                dir="ltr" placeholder="••••••••" />
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= s ? strengthColor : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-purple-400">قوة كلمة المرور: <span className="font-semibold">{strengthLabel}</span></p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">تأكيد كلمة المرور</label>
              <input type="password" value={form.confirm}
                onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} required
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-purple-400 focus:outline-none transition-smooth ${form.confirm && form.confirm !== form.newPassword ? "border-red-500/70" : "border-purple-500/30 focus:border-purple-400"}`}
                dir="ltr" placeholder="••••••••" />
              {form.confirm && form.confirm !== form.newPassword && (
                <p className="text-red-400 text-xs mt-1">كلمتا المرور غير متطابقتين</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-smooth mt-2 shadow-glow">
              {loading ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
