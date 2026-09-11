import React from 'react';
import { AlertOctagon, FileText, ArrowRightLeft, ExternalLink } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export interface ContradictionCardProps {
  title: string;
  claimSource: string;
  claimValue: string;
  verifiedSource: string;
  verifiedValue: string;
  riskLevel?: 'HIGH' | 'CRITICAL';
  description: string;
  onInspectClaimDoc?: () => void;
  onInspectVerifiedDoc?: () => void;
  className?: string;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({
  title,
  claimSource,
  claimValue,
  verifiedSource,
  verifiedValue,
  riskLevel = 'HIGH',
  description,
  onInspectClaimDoc,
  onInspectVerifiedDoc,
  className = '',
}) => {
  return (
    <GlassCard
      glassLevel="subtle"
      enableSpotlight={false}
      className={`border-2 border-rose-300 bg-rose-50/40 p-4 rounded-xl space-y-3 ${className}`}
    >
      {/* Contradiction Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <span>Contradiction Detected: {title}</span>
        </div>
        <span className="text-[10px] bg-rose-600 text-white font-mono font-bold px-2 py-0.5 rounded uppercase">
          {riskLevel} RISK
        </span>
      </div>

      <p className="text-xs text-rose-900 leading-relaxed font-medium">{description}</p>

      {/* Discrepancy Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-white/80 p-3 rounded-lg border border-rose-200">
        {/* Claim */}
        <div className="sm:col-span-3 text-left space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block uppercase">
            {claimSource}
          </span>
          <div className="text-sm font-extrabold text-slate-900 font-mono bg-slate-50 p-2 rounded border border-slate-200 truncate">
            {claimValue}
          </div>
          {onInspectClaimDoc && (
            <button
              onClick={onInspectClaimDoc}
              className="text-[10px] text-bidsure-blue hover:underline flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              <span>Inspect Tender Doc</span>
            </button>
          )}
        </div>

        {/* Inequality Symbol */}
        <div className="sm:col-span-1 flex items-center justify-center text-rose-600 font-extrabold text-base">
          <span className="bg-rose-100 p-1.5 rounded-full border border-rose-300">≠</span>
        </div>

        {/* Verified Value */}
        <div className="sm:col-span-3 text-left space-y-1">
          <span className="text-[10px] text-rose-600 font-mono block uppercase font-bold">
            {verifiedSource}
          </span>
          <div className="text-sm font-extrabold text-rose-700 font-mono bg-rose-50 p-2 rounded border border-rose-200 truncate">
            {verifiedValue}
          </div>
          {onInspectVerifiedDoc && (
            <button
              onClick={onInspectVerifiedDoc}
              className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              <span>Inspect Verified Record</span>
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
