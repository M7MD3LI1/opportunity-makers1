import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, Trash2 } from "lucide-react";
import api from "../../lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  onItemClick?: (item: NotificationItem) => void;
  className?: string;
}

const typeColors: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  WARNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DANGER: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications, onRefresh, onItemClick, className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      onRefresh();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      onRefresh();
    } catch {}
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all hover:bg-white/10 text-slate-400 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute top-14 right-0 w-96 max-h-[70vh] glass-panel z-50 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 uppercase tracking-widest"
                    >
                      <CheckCheck className="w-3 h-3" /> Read All
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/5 rounded-lg text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
                {notifications.slice(0, 20).map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-xl transition-colors cursor-pointer group ${
                      n.isRead ? "opacity-60 hover:opacity-100" : "bg-white/5"
                    } hover:bg-white/10`}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      if (onItemClick) onItemClick(n);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.isRead ? "bg-slate-600" : "bg-blue-400 animate-pulse"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-slate-600 mt-1 font-medium">
                          {new Date(n.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No notifications</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
