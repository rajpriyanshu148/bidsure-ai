import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs px-3.5 py-2 gap-2 font-semibold',
      lg: 'text-sm px-5 py-2.5 gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-bidsure-primary hover:bg-blue-900 text-white shadow-sm hover:shadow focus:ring-bidsure-blue border border-bidsure-primary/20',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400',
      outline:
        'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-700',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 border border-emerald-700',
      ai:
        'bg-gradient-to-r from-bidsure-primary to-bidsure-deep text-white border border-bidsure-cyan/40 shadow-glass-intelligence hover:border-bidsure-cyan focus:ring-bidsure-cyan',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
