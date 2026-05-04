import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { Department } from "../types";
import loginBg from "../assets/login-bg.png";
import logoImg from "../assets/logo-icon.png";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";

const GOVERNORATES = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum","Gharbia",
  "Ismailia","Monufia","Minya","Qalyubia","New Valley","Suez","Aswan","Asyut",
  "Beni Suef","Port Said","Damietta","South Sinai","Kafr El Sheikh","Matrouh","Luxor","Qena",
  "North Sinai","Sharqia","Sohag",
];

function validateNID(nid: string): string | null {
  if (!/^\d{14}$/.test(nid)) return "National ID must be 14 digits";
  const c = parseInt(nid[0]);
  if (c !== 2 && c !== 3) return "Invalid National ID";
  const m = parseInt(nid.slice(3, 5));
  const d = parseInt(nid.slice(5, 7));
  if (m < 1 || m > 12 || d < 1 || d > 31) return "Invalid birth date in National ID";
  return null;
}

function getAgeFromNID(nid: string): string {
  if (nid.length < 7) return "";
  try {
    const c = parseInt(nid[0]);
    const year = (c === 2 ? 1900 : 2000) + parseInt(nid.slice(1, 3));
    const month = parseInt(nid.slice(3, 5)) - 1;
    const day = parseInt(nid.slice(5, 7));
    const birth = new Date(year, month, day);
    const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return isNaN(age) || age < 0 || age > 120 ? "" : `${age} years`;
  } catch { return ""; }
}

const fieldStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", nationalId: "", gender: "", governorate: "", departmentId: "",
  });
  const [nidError, setNidError] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "nationalId") {
      const err = validateNID(value);
      setNidError(err);
      setAge(err ? "" : getAgeFromNID(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nidErr = validateNID(form.nationalId);
    if (nidErr) { setNidError(nidErr); return; }
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ───
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="ltr">
        <div className="relative z-10 text-center max-w-md w-full bg-white p-12 shadow-2xl border border-border animate-fade-up">
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-green-50 text-green-600 border-4 border-green-100">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-sans font-bold text-foreground mb-4">Your request has been sent successfully!</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed font-sans">
            We have received your request to join. The Opportunity Makers team will review it and send your login credentials to your email upon approval.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full py-4 bg-primary text-white font-sans font-bold uppercase tracking-widest text-sm hover:bg-primary-light transition-all shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Form ───
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background" dir="ltr">

      {/* ─── LEFT: Background Image Side ─── */}
      <div className="hidden lg:flex lg:w-5/12 relative items-center justify-center overflow-hidden">
        <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-secondary-foreground/80 backdrop-blur-[2px]" />

        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="w-28 h-28 bg-white p-4 rounded-2xl mx-auto mb-8 shadow-2xl">
            <img src={logoImg} alt="Opportunity Makers" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-sans font-light text-white mb-3 tracking-tight">
            Opportunity Makers
          </h2>
          <p className="text-accent text-lg font-bold uppercase tracking-[0.2em] mb-2">
            Ministry of Youth and Sports
          </p>
          <div className="w-12 h-1 bg-accent/50 mx-auto my-6 rounded-full" />
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto font-sans">
            Join the Opportunity Makers team and be part of the largest youth empowerment system in Egypt.
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Form Side ─── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-white relative overflow-y-auto">
        <div className="relative z-10 w-full max-w-2xl px-10 py-16 animate-slide-right">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-12">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl mx-auto mb-4 p-4 border border-primary/10">
              <img src={logoImg} alt="Opportunity Makers" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-sans font-bold text-primary">Opportunity Makers</h2>
          </div>

          {/* Title */}
          <div className="mb-10 border-r-4 border-primary pr-6">
            <h1 className="text-3xl font-sans font-bold text-slate-900 mb-2">Join Request</h1>
            <p className="text-slate-500 text-sm font-sans">Enter your details and your request will be reviewed by the Central Administration</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 mb-8 text-sm flex items-center gap-4 animate-fade-in border bg-destructive/5 border-destructive/20 text-destructive font-bold">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="example@email.com"
                  className="w-full px-6 py-4 bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans" dir="ltr" />
              </div>

              {/* Phone */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="01xxxxxxxxx"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans" dir="ltr" />
              </div>
            </div>

            {/* National ID */}
            <div className="space-y-2">
              <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">
                National ID <span className="text-slate-400">(14 digits)</span>
              </label>
              <input name="nationalId" value={form.nationalId} onChange={handleChange} required
                placeholder="00000000000000" maxLength={14}
                className={cn(
                  "w-full px-6 py-4 bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans tracking-[0.2em]",
                  nidError ? "border-destructive ring-destructive/10" : form.nationalId.length === 14 ? "border-green-500 ring-green-500/10" : "border-slate-200"
                )}
                dir="ltr" />

              <div className="flex flex-wrap items-center gap-4 mt-2">
                {age && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 text-green-600 rounded text-xs font-bold">
                    <span className="text-sm">🎂</span>
                    <span>Age: {age}</span>
                  </div>
                )}
                {nidError && <p className="text-destructive text-[10px] font-bold">⚠️ {nidError}</p>}
                {!nidError && form.nationalId.length === 14 && <p className="text-green-600 text-[10px] font-bold">✓ Valid National ID</p>}
                <p className="text-slate-400 text-[10px] font-medium flex items-center gap-1 mr-auto">
                   <span>🔒 Data is fully encrypted</span>
                </p>
              </div>
            </div>

            {/* Gender & Governorate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Governorate</label>
                <select name="governorate" value={form.governorate} onChange={handleChange} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans">
                  <option value="">Select Governorate</option>
                  {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Committee */}
            <div className="space-y-2">
              <label className="block text-slate-800 text-[11px] font-bold uppercase tracking-widest">Requested Department</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange} required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans">
                <option value="">Select Department</option>
                {departments.length > 0 ? departments.map((dept) => (
                   <option key={dept.id} value={dept.id}>{dept.name}</option>
                )) : (
                  ["HR", "PR", "OR", "Training", "Social Media"].map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Note */}
            <div className="p-4 bg-primary/5 border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              📋 <strong>Note:</strong> After submitting the request, the administration will review it and send your login credentials to your email upon approval.
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading || !!nidError}
              className="w-full py-4 bg-primary text-white font-sans font-bold uppercase tracking-widest text-sm hover:bg-primary-light transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Submitting Request..." : "Submit Join Request"}
            </button>

            {/* Divider + login link */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-slate-600 text-sm font-sans">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline transition-all">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
