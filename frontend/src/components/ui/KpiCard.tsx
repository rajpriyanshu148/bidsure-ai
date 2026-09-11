import React from 'react';
import { GlassCard } from './GlassCard';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const iconVariantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-bidsure-blue border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <GlassCard
      glassLevel="subtle"
      isHoverable={Boolean(onClick)}
      onClick={onClick}
      className={`p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            {title}
          </p>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-xs ${iconVariantStyles[variant]}`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 text-[11px] truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold text-[10px] px-1.5 py-0.5 rounded font-mono ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};
