import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'primary' | 'muted';

interface BadgeMinerProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  primary: 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
  muted: 'bg-white/5 text-text-muted border-white/10'
};

export const BadgeMiner: React.FC<BadgeMinerProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border
      ${variants[variant]}
      ${className}
    `}>
      <span className={`w-1 h-1 rounded-full mr-1.5 ${
        variant === 'muted' ? 'bg-text-muted' : `bg-current`
      }`} />
      {children}
    </span>
  );
};
