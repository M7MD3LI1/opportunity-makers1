import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Lock, Palette, Camera, Save, ArrowLeft, 
  Settings as SettingsIcon, Bell, Home, LogOut, Shield, LayoutDashboard 
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme, customColor, setCustomColor } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.profilePicture ? `${api.defaults.baseURL?.replace("/api", "")}${user.profilePicture}` : null
  );
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      const fd = new FormData();
      fd.append("avatar", file);
      try {
        const res = await api.put("/users/profile-picture", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const newPic = res.data.profilePicture + "?t=" + Date.now();
        if (user) {
          updateUser({ ...user, profilePicture: newPic });
        }
        showToast("✅ Profile picture updated");
      } catch (err: any) {
        showToast("❌ " + (err.response?.data?.message || "Failed to update picture"));
      }
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", {
        name: profileForm.name,
        email: profileForm.email,
        currentPassword: profileForm.currentPassword
      });
      updateUser(res.data.user);

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          showToast("❌ Passwords do not match");
          setSaving(false);
          return;
        }
        await api.put("/users/password", {
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        });
      }

      showToast("✅ Data updated successfully");
      setProfileForm(p => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (e: any) {
      showToast("❌ " + (e.response?.data?.message || "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0f1e] font-sans selection:bg-primary/30 overflow-hidden relative dashboard-theme" dir="ltr">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 z-0 gradient-mesh pointer-events-none opacity-60" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 border border-primary/30 text-white px-8 py-4 rounded-2xl shadow-glow text-sm font-bold flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Matches Admin Style */}
      <aside className="w-72 bg-[#0d1321]/80 border-r border-white/5 flex flex-col relative z-50 backdrop-blur-3xl shadow-2xl">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-smooth">
              <LayoutDashboard className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tighter block leading-none">Settings</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Sona3 El Foras</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button
            onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")}
            className="w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-smooth"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to Dashboard</span>
          </button>
          


          <button
            className="w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white bg-primary/20 border border-primary/30 shadow-glow relative"
          >
            <SettingsIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Account Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {user?.role === "ADMIN" && (
            <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-primary hover:text-white hover:bg-primary/20 transition-smooth border border-primary/20 bg-primary/5 mb-2 group">
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Admin Panel</span>
            </button>
          )}
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-smooth">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - EXACTLY LIKE ADMIN DASHBOARD SETTINGS TAB */}
      <main className="flex-1 overflow-y-auto p-10 relative z-30 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">User Profile</p>
              <h1 className="text-4xl font-bold text-white tracking-tight">Account Settings</h1>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-[24px] text-sm font-bold transition-all shadow-glow flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : <><Save className="w-5 h-5" /> Save All Changes</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Avatar Upload - Matches Admin UI */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 text-center backdrop-blur-md">
                <div className="relative inline-block mb-8">
                  <div className="w-48 h-48 rounded-full bg-slate-800 border-4 border-white/5 overflow-hidden shadow-2xl">
                    {avatarPreview ? (
                      <img src={avatarPreview.includes("?") ? avatarPreview : avatarPreview + "?t=" + Date.now()} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                        <User className="w-20 h-20" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center cursor-pointer shadow-glow hover:scale-110 transition-transform border border-white/10">
                    <Camera className="text-white w-6 h-6" />
                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                  </label>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{user?.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user?.role === "ADMIN" ? "Platform Administrator" : "Department Member"}</p>
                <p className="text-[10px] text-primary font-bold mt-4 px-4 py-1.5 bg-primary/10 rounded-full inline-block border border-primary/20">
                  {user?.department?.name || "No Department Assigned"}
                </p>
              </div>
            </div>

            {/* Profile Forms - Matches Admin UI */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                  <User className="text-primary w-6 h-6" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      value={profileForm.email}
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                      placeholder="example@sona3.com"
                    />
                  </div>
                </div>
              </div>



              {/* Change Password Section */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                  <Lock className="text-rose-400 w-6 h-6" />
                  Security & Password
                </h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                    <input 
                      type="password" 
                      value={profileForm.currentPassword}
                      onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                      placeholder="Required to confirm any changes"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">New Password</label>
                      <input 
                        type="password" 
                        value={profileForm.newPassword}
                        onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                        placeholder="Leave empty if no change"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={profileForm.confirmPassword}
                        onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                        placeholder="Must match new password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
