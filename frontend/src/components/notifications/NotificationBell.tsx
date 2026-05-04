import React, { useState, useEffect, useRef } from "react";
import { Notification } from "../../types";
import api from "../../lib/api";

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setUnread(0);
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
  };

  const typeColor: Record<string, string> = {
    BADGE: "text-yellow-400", SUCCESS: "text-green-400",
    WARNING: "text-orange-400", SECURITY: "text-red-400", INFO: "text-blue-400",
  };

  return (
    <div className="relative" ref={ref} dir="rtl">
      <button onClick={() => setOpen(p => !p)}
        className="relative w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-smooth text-white">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">الإشعارات</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300">تحديد الكل كمقروء</button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">لا توجد إشعارات</div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  className={`px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-smooth ${!n.isRead ? "bg-purple-900/20" : ""}`}>
                  <div className="flex items-start gap-2">
                    {!n.isRead && <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />}
                    <div className={n.isRead ? "mr-4" : ""}>
                      <p className={`text-sm font-medium ${typeColor[n.type] || "text-white"}`}>{n.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
