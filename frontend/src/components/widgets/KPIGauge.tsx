import React from "react";
import { motion } from "framer-motion";

interface KPIGaugeProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
  className?: string;
  format?: "percent" | "score" | "number";
}

const KPIGauge: React.FC<KPIGaugeProps> = ({
  value, max = 100, label, color = "#3b82f6", size = 120, className = "", format = "number"
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const formatValue = () => {
    if (format === "percent") return `${Math.round(value)}%`;
    if (format === "score") return value.toFixed(1);
    return Math.round(value).toLocaleString();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-bold text-white font-mono"
          >
            {formatValue()}
          </motion.span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3 text-center">
        {label}
      </p>
    </div>
  );
};

export default KPIGauge;
