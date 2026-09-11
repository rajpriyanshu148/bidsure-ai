import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Clock } from 'lucide-react';

export type ComplianceStatusType =
  | 'PASS'
  | 'WARNING'
  | 'FAIL'
  | 'MISSING'
  | 'EXPIRED'
  | 'INCONSISTENT'
  | 'REVIEW_REQUIRED'
  | 'NOT_APPLICABLE'
  | 'VERIFIED'
  | 'PROCESSING'
  | 'PENDING';

export interface StatusBadgeProps {
  status: ComplianceStatusType | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normStatus = (status || '').toUpperCase();

  const config: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PASS: {
      label: 'COMPLIANT',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    VERIFIED: {
      label: 'VERIFIED',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    WARNING: {
      label: 'PARTIAL / WARN',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    FAIL: {
      label: 'NON-COMPLIANT',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    MISSING: {
      label: 'DOC MISSING',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    EXPIRED: {
      label: 'EXPIRED',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <Clock className="w-3.5 h-3.5 text-rose-600" />,
    },
    REVIEW_REQUIRED: {
      label: 'SCRUTINY REQ',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" />,
    },
    INCONSISTENT: {
      label: 'CONTRADICTION',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />,
    },
    PROCESSING: {
      label: 'PROCESSING',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
    },
    PENDING: {
      label: 'PENDING',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
    },
    NOT_APPLICABLE: {
      label: 'EXEMPT / N/A',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const current = config[normStatus] || {
    label: normStatus || 'UNKNOWN',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
  };

  const sizeStyles = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center font-mono border rounded-md uppercase font-semibold ${current.bg} ${current.text} ${current.border} ${sizeStyles} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
