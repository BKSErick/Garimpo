import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonMinerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const ButtonMiner: React.FC<ButtonMinerProps> = ({
  children,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'btn-finch transition-all duration-300';
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-purple hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]',
    outline: 'bg-transparent border border-white/20 text-white hover:border-primary/60 hover:text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-text-muted hover:text-white hover:bg-white/10'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ width: 18, height: 18 }} />
      ) : Icon && iconPosition === 'left' ? (
        <span className={`inline-flex items-center justify-center flex-shrink-0 ${children ? 'mr-2' : ''}`}>
          <Icon size={18} strokeWidth={2.5} />
        </span>
      ) : null}
      
      {children}

      {!isLoading && Icon && iconPosition === 'right' && (
        <span className={`inline-flex items-center justify-center flex-shrink-0 ${children ? 'ml-2' : ''}`}>
          <Icon size={18} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
};
