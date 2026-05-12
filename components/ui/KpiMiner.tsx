import React from 'react';
import { CardMiner } from './CardMiner';
import { LucideIcon } from 'lucide-react';

interface KpiMinerProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: LucideIcon;
  className?: string;
}

export const KpiMiner: React.FC<KpiMinerProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  className = ''
}) => {
  return (
    <CardMiner className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-text-muted uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-black text-white tracking-tighter">{value}</h2>
        {trend && (
          <span className={`text-[10px] font-bold ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      
      {/* Mini Visualizer Decoration */}
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
          style={{ width: '65%' }} 
        />
      </div>
    </CardMiner>
  );
};
