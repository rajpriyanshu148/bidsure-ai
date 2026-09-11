import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle, FileQuestion, MinusCircle } from 'lucide-react';

interface ComplianceBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status.toUpperCase()) {
      case 'PASS':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'PASS',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          label: 'WARNING',
        };
      case 'FAIL':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'FAIL',
        };
      case 'MISSING':
        return {
          bg: 'bg-red-50 border-red-300 text-red-800',
          icon: <FileQuestion className="w-3.5 h-3.5 text-red-600" />,
          label: 'MISSING',
        };
      case 'EXPIRED':
        return {
          bg: 'bg-purple-50 border-purple-300 text-purple-800',
          icon: <Clock className="w-3.5 h-3.5 text-purple-600" />,
          label: 'EXPIRED',
        };
      case 'INCONSISTENT':
        return {
          bg: 'bg-orange-50 border-orange-300 text-orange-800',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
          label: 'INCONSISTENT',
        };
      case 'REVIEW_REQUIRED':
        return {
          bg: 'bg-blue-50 border-blue-300 text-blue-800',
          icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" />,
          label: 'REVIEW REQUIRED',
        };
      case 'NOT_APPLICABLE':
      default:
        return {
          bg: 'bg-slate-50 border-slate-300 text-slate-700',
          icon: <MinusCircle className="w-3.5 h-3.5 text-slate-500" />,
          label: status || 'N/A',
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-mono tracking-wide ${config.bg} ${sizeClasses}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
