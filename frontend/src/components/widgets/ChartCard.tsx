import React from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

type ChartType = "line" | "bar" | "area" | "pie" | "radar";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: ChartType;
  data: any[];
  dataKey: string;
  xKey?: string;
  colors?: string[];
  height?: number;
  delay?: number;
  className?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !rounded-xl text-xs">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

const ChartCard: React.FC<ChartCardProps> = ({
  title, subtitle, type, data, dataKey, xKey = "name",
  colors = DEFAULT_COLORS, height = 260, delay = 0,
  className = "", icon: Icon, action
}) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2.5} dot={false} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={colors[0]} radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`areaGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} fill={`url(#areaGrad-${title})`} />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} innerRadius={50} strokeWidth={0} paddingAngle={3}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius={80}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar dataKey={dataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      className={`glass-card p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-slate-400" />}
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ChartCard;
