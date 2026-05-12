import React from 'react';

interface CardMinerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

export const CardMiner: React.FC<CardMinerProps> = ({ 
  children, 
  className = '', 
  elevated = false,
  ...props 
}) => {
  return (
    <div 
      className={`card-miner p-6 ${elevated ? 'bg-surface-high' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardMinerHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardMinerTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-sm font-bold text-white tracking-tight ${className}`}>
    {children}
  </h3>
);
