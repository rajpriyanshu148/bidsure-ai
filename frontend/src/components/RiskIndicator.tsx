import React from 'react';
import { ShieldAlert, ShieldCheck, AlertOctagon } from 'lucide-react';

interface RiskIndicatorProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  criticalOverride?: boolean;
  score?: number;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level, criticalOverride = false, score }) => {
  const getRiskConfig = () => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return {
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
          label: 'LOW RISK',
          textColor: 'text-emerald-700',
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <ShieldAlert className="w-4 h-4 text-amber-700" />,
          label: 'MEDIUM RISK',
          textColor: 'text-amber-700',
        };
      case 'HIGH':
      default:
        return {
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <AlertOctagon className="w-4 h-4 text-rose-700" />,
          label: 'HIGH RISK',
          textColor: 'text-rose-700',
        };
    }
  };

  const config = getRiskConfig();

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${config.badgeBg}`}>
        {config.icon}
        <span>{config.label}</span>
        {criticalOverride && (
          <span className="ml-1 text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
            OVERRIDE
          </span>
        )}
      </div>
      {score !== undefined && (
        <span className="text-xs font-mono font-medium text-slate-600">
          Score: <strong className={config.textColor}>{score.toFixed(1)}/100</strong>
        </span>
      )}
    </div>
  );
};
