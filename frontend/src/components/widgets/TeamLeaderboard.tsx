import React from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Star } from "lucide-react";

interface LeaderboardEntry {
  rank?: number;
  id: number;
  name: string;
  score: number;
  points?: number;
  level?: string;
  department?: { name: string };
  badges?: { icon: string }[];
}

interface TeamLeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  maxItems?: number;
  className?: string;
  showDepartment?: boolean;
}

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
  if (rank === 2) return { icon: Medal, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20" };
  if (rank === 3) return { icon: Medal, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" };
  return { icon: Star, color: "text-slate-500", bg: "bg-white/5", border: "border-white/5" };
};

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({
  entries, title = "Team Leaderboard", maxItems = 10, className = "", showDepartment = false
}) => {
  const items = entries.slice(0, maxItems);

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold">{entries.length} members</span>
      </div>
      <div className="space-y-2">
        {items.map((entry, i) => {
          const rank = entry.rank || i + 1;
          const badge = getRankBadge(rank);
          const RankIcon = badge.icon;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                rank <= 3 ? `${badge.bg} border ${badge.border}` : "hover:bg-white/5"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center shrink-0`}>
                {rank <= 3 ? (
                  <RankIcon className={`w-4 h-4 ${badge.color}`} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">#{rank}</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white border border-white/5">
                {entry.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-bold truncate">{entry.name}</p>
                {showDepartment && entry.department?.name && (
                  <p className="text-[10px] text-slate-500 truncate">{entry.department.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {entry.badges?.slice(0, 3).map((b, bi) => (
                  <span key={bi} className="text-xs">{b.icon}</span>
                ))}
                <div className="text-right">
                  <p className="text-sm font-bold text-white font-mono">{entry.score}</p>
                  {entry.level && (
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{entry.level}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamLeaderboard;
