import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

interface Notif {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_FILTERS = [
  { key: "ALL", label: "All", icon: "📬" },
  { key: "TASK", label: "Tasks", icon: "📋" },
  { key: "INFO", label: "Info", icon: "📢" },
  { key: "WARNING", label: "Alerts", icon: "⚠️" },
  { key: "BADGE", label: "Badges", icon: "🏅" },
];

const TYPE_COLORS: Record<string, string> = {
  TASK: "border-blue-500/40 bg-blue-500/10",
  INFO: "border-green-500/40 bg-green-500/10",
  WARNING: "border-yellow-500/40 bg-yellow-500/10",
  BADGE: "border-purple-500/40 bg-purple-500/10",
};

const TYPE_ICONS: Record<string, string> = {
  TASK: "📋",
  INFO: "📢",
  WARNING: "⚠️",
  BADGE: "🏅",
};

const NotificationsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await api.get("/notifications");
      setNotifications(r.data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const filtered = filter === "ALL" ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} days ago`;
    return new Date(d).toLocaleDateString("en-US");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="ltr">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-lg">🏛️</div>
              <div>
                <p className="text-white font-bold text-sm">Opportunity Makers</p>
                <p className="text-gray-500 text-xs">Ministry of Youth</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-b border-gray-800">
            <div className="bg-purple-900/30 rounded-xl p-3">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-purple-400 text-xs">{user?.role === "ADMIN" ? "System Admin" : user?.department?.name}</p>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <button onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <span>🏠</span> Back to Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium gradient-primary text-white shadow-glow">
              <span>🔔</span> Notifications {unreadCount > 0 && <span className="bg-red-500 text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            <button onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <span>⚙️</span> Settings
            </button>
          </nav>
          <div className="p-3 border-t border-gray-800">
            <button onClick={logout} className="w-full text-gray-500 hover:text-red-400 text-xs py-2 transition-all">Logout</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">🔔 Notifications</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "No new notifications"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all">
                  ✓ Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? "gradient-primary text-white shadow-glow" : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"}`}>
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>

            {/* Timeline */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-400 text-lg">No Notifications</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute right-6 top-0 bottom-0 w-px bg-gray-800" />

                <div className="space-y-4">
                  {filtered.map(n => (
                    <div key={n.id}
                      className={`relative mr-12 bg-gray-900 rounded-2xl p-5 border transition-all cursor-pointer hover:border-purple-500/30 ${n.isRead ? "border-gray-800 opacity-70" : TYPE_COLORS[n.type] || "border-purple-500/40 bg-purple-500/5"}`}
                      onClick={() => !n.isRead && markRead(n.id)}>

                      {/* Timeline dot */}
                      <div className={`absolute -right-[52px] top-6 w-4 h-4 rounded-full border-2 ${n.isRead ? "bg-gray-800 border-gray-700" : "bg-purple-500 border-purple-400 shadow-glow"}`} />

                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{TYPE_ICONS[n.type] || "🔔"}</span>
                          <div>
                            <p className={`font-semibold text-sm ${n.isRead ? "text-gray-400" : "text-white"}`}>{n.title}</p>
                            <p className={`text-xs mt-1 leading-relaxed ${n.isRead ? "text-gray-600" : "text-gray-300"}`}>{n.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!n.isRead && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                          <span className="text-gray-600 text-xs whitespace-nowrap">{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
