import React from "react";
import { motion } from "framer-motion";
import { Cpu, Lightbulb, AlertTriangle, Info, TrendingUp, Zap } from "lucide-react";

interface AiInsight {
  type: "warning" | "suggestion" | "info" | "danger";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

interface AIInsightsPanelProps {
  insights: AiInsight[];
  title?: string;
  className?: string;
  onAction?: (action: string) => void;
}

const insightMeta: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  danger: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  suggestion: { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  info: { icon: Info, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights, title = "AI Insights", className = "", onAction
}) => {
  const sorted = [...insights].sort((a, b) => b.priority - a.priority);

  return (
    <div className={`glass-card p-6 relative overflow-hidden ${className}`}>
      {/* Animated gradient top border */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 animate-gradient" style={{ backgroundSize: '200% 100%' }} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">AI-Powered Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        {sorted.slice(0, 5).map((insight, i) => {
          const meta = insightMeta[insight.type] || insightMeta.info;
          const Icon = meta.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-4 rounded-2xl border ${meta.border} ${meta.bg} group hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 ${meta.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white mb-1">{insight.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{insight.message}</p>
                  {insight.action && onAction && (
                    <button
                      onClick={() => onAction(insight.action!)}
                      className="mt-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {insights.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No insights available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
