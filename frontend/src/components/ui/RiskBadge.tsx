import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export type RiskLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskBadgeProps {
  level: RiskLevelType | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const norm = (level || 'LOW').toUpperCase() as RiskLevelType;

  const styles: Record<
    RiskLevelType,
    { bg: string; text: string; border: string; label: string; icon: React.ReactNode }
  > = {
    LOW: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      label: 'LOW RISK',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      label: 'MEDIUM RISK',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    HIGH: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      label: 'HIGH RISK',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
    },
    CRITICAL: {
      bg: 'bg-rose-100',
      text: 'text-rose-950 font-bold',
      border: 'border-rose-500',
      label: 'CRITICAL RISK',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-700 animate-pulse" />,
    },
  };

  const current = styles[norm] || styles.LOW;

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center font-mono border rounded-md uppercase font-semibold ${current.bg} ${current.text} ${current.border} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
