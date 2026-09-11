import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { ComplianceResult } from '../../types';

export interface RequirementListProps {
  results: ComplianceResult[];
  selectedResultId: string | null;
  onSelectResult: (result: ComplianceResult) => void;
  className?: string;
}

export const RequirementList: React.FC<RequirementListProps> = ({
  results,
  selectedResultId,
  onSelectResult,
  className = '',
}) => {
  // Status Icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'FAIL':
      case 'MISSING':
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  // Group by category if possible or display clean chronological list
  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 select-none ${className}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Scrutiny Criteria
          </h3>
          <p className="text-[10px] text-slate-500">Select requirement to inspect evidence</p>
        </div>
        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded">
          {results.length} Criteria
        </span>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {results.map((r) => {
          const isSelected = r.id === selectedResultId;
          return (
            <div
              key={r.id}
              onClick={() => onSelectResult(r)}
              className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-bidsure-primary text-white shadow-xs'
                  : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {getStatusIcon(r.status)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {r.rule_name}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isSelected ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {r.reason}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : r.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(r.score * 100).toFixed(0)}%
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-bidsure-cyan' : 'text-slate-300'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
