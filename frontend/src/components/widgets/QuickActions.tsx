import React from "react";
import { motion } from "framer-motion";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  action: string;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (action: string) => void;
  title?: string;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions, onAction, title = "Quick Actions", className = ""
}) => (
  <div className={`glass-card p-6 ${className}`}>
    {title && <h3 className="text-sm font-bold text-white mb-4">{title}</h3>}
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.action}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onAction(action.action)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group press-effect"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white text-center leading-tight uppercase tracking-wider">
              {action.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default QuickActions;
