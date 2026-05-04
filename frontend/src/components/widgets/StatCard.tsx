import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label?: string };
  color?: string;
  bgColor?: string;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  label, value, icon: Icon, trend, color = "text-blue-400",
  bgColor = "bg-blue-400/10", delay = 0, className = "", onClick
}) => {
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;
  const trendColor = trend ? (trend.value > 0 ? "text-emerald-400" : trend.value < 0 ? "text-rose-400" : "text-slate-400") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      onClick={onClick}
      className={`glass-card p-6 group cursor-default ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendColor} bg-white/5 px-2 py-1 rounded-lg`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-100 tracking-tight">{value}</p>
      {trend?.label && (
        <p className="text-[10px] text-slate-600 mt-2 font-medium">{trend.label}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
