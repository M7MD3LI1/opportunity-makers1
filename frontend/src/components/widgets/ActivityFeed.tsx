import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, UserPlus, FileText, MessageSquare, Award, Zap } from "lucide-react";

interface ActivityItem {
  id: number;
  action: string;
  details?: string;
  user?: { name: string };
  severity?: string;
  createdAt: string;
  type?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const getActivityIcon = (action: string, severity?: string) => {
  if (severity === "WARNING" || severity === "HIGH") return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" };
  if (severity === "CRITICAL") return { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10" };
  const a = action.toLowerCase();
  if (a.includes("approve") || a.includes("accept")) return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" };
  if (a.includes("signup") || a.includes("register") || a.includes("join")) return { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10" };
  if (a.includes("task") || a.includes("submit")) return { icon: FileText, color: "text-violet-400", bg: "bg-violet-400/10" };
  if (a.includes("chat") || a.includes("message")) return { icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-400/10" };
  if (a.includes("badge") || a.includes("award")) return { icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" };
  return { icon: Zap, color: "text-slate-400", bg: "bg-white/5" };
};

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities, title = "Recent Activity", maxItems = 8, className = ""
}) => {
  const items = activities.slice(0, maxItems);

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          {activities.length} events
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => {
          const { icon: Icon, color, bg } = getActivityIcon(item.action, item.severity);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 font-medium truncate">{item.action}</p>
                {item.user?.name && (
                  <p className="text-[10px] text-slate-500 truncate">{item.user.name}</p>
                )}
              </div>
              <span className="text-[10px] text-slate-600 font-medium shrink-0 pt-0.5">
                {timeAgo(item.createdAt)}
              </span>
            </motion.div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-10">
            <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
