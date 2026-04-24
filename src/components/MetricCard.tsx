import React from 'react';
import { motion } from 'motion/react';
import { cn, formatMoney } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'accent';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, icon: Icon, variant = 'default' }) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="panel-geo p-5 relative overflow-hidden group"
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{label}</span>
             <Icon size={14} className={cn(
               variant === 'accent' && "text-brand-accent",
               variant === 'success' && "text-brand-success",
               variant === 'danger' && "text-brand-danger",
               variant === 'default' && "text-gray-600"
             )} />
          </div>

          <div className={cn(
            "text-3xl font-mono font-bold tracking-tighter mb-4",
            variant === 'success' && "text-brand-success",
            variant === 'danger' && "text-brand-danger",
            variant === 'default' && "text-white",
            variant === 'accent' && "text-brand-accent"
          )}>
            {value}
          </div>
        </div>
        
        <div className="pt-4 border-t border-brand-border">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">{subtext}</p>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Icon size={64} strokeWidth={1} />
      </div>
    </motion.div>
  );
};
