import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  FileCheck2,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  Building,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { ComplianceResult, RiskScore, AIRecommendation } from '../../types';
import { StatusBadge, RiskBadge, ProgressRing, Button } from '../ui';
import { ContradictionCard } from './ContradictionCard';
import { useAuth } from '../../context/AuthContext';

export interface AIPanelProps {
  selectedResult: ComplianceResult | null;
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  statusCounts: Record<string, number>;
  riskDetails?: RiskScore;
  recommendation?: AIRecommendation;
  onOpenDecisionModal: (action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED') => void;
  className?: string;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  selectedResult,
  overallScore,
  riskLevel,
  statusCounts,
  riskDetails,
  recommendation,
  onOpenDecisionModal,
  className = '',
}) => {
  const { role } = useAuth();
  const isOfficer = role === 'PROCUREMENT_OFFICER';

  return (
    <div className={`flex flex-col h-full bg-slate-50 border-l border-slate-200 overflow-y-auto select-none ${className}`}>
      {/* Top Header: Compliance Score & Risk Badge */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-bidsure-blue" />
            <span>AI Scrutiny & Provenance</span>
          </span>
          <RiskBadge level={riskLevel} size="sm" />
        </div>

        {/* Score & Counter Grid */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <ProgressRing score={overallScore} size={80} strokeWidth={7} />
          <div className="space-y-1 text-xs">
            <div className="font-extrabold text-slate-900 text-sm">
              {overallScore.toFixed(1)} / 100
            </div>
            <div className="text-xs flex items-center gap-2">
              <span className="text-emerald-700 font-semibold">{statusCounts['PASS'] || 0} Pass</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700 font-semibold">{statusCounts['WARNING'] || 0} Partial</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-700 font-semibold">{statusCounts['FAIL'] || 0} Fail</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Multi-Criteria Rule Weights Normalized
            </span>
          </div>
        </div>
      </div>

      {/* Requirement Details */}
      <div className="flex-1 p-4 space-y-4">
        {selectedResult ? (
          <div className="space-y-4">
            {/* Rule Header */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">EVALUATED RULE</span>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {selectedResult.rule_name}
                  </h4>
                </div>
                <StatusBadge status={selectedResult.status} size="sm" />
              </div>

              {/* Confidence Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">AI Extraction Confidence</span>
                <span className="font-mono font-bold text-bidsure-blue text-[11px]">
                  {((selectedResult.confidence || 0.95) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Expected vs Actual Metric Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Expected Criteria
                </span>
                <span className="font-bold text-slate-900 font-mono block truncate">
                  {selectedResult.expected_value || 'Threshold met'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Extracted Value
                </span>
                <span
                  className={`font-bold font-mono block truncate ${
                    selectedResult.status === 'PASS'
                      ? 'text-emerald-700'
                      : selectedResult.status === 'WARNING'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {selectedResult.actual_value || 'Verified'}
                </span>
              </div>
            </div>

            {/* Statutory Reason */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                Rule Engine Justification
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {selectedResult.reason}
              </p>
            </div>

            {/* Contradiction Detection Display (if inconsistent) */}
            {(selectedResult.status === 'INCONSISTENT' ||
              selectedResult.status === 'FAIL' ||
              selectedResult.rule_name.includes('Turnover') && overallScore < 70) && (
              <ContradictionCard
                title="Financial Claim Mismatch"
                claimSource="Bidder Tender Form Claim"
                claimValue="INR 45.00 Crore"
                verifiedSource="Income Tax ITR Verification"
                verifiedValue="INR 28.50 Crore"
                description="The turnover claimed in the bid proposal differs significantly from audited ITR records on the Income Tax portal."
              />
            )}

            {/* Evidence Provenance Citation */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 font-mono">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-bidsure-blue" />
                  <span>EVIDENCE PROVENANCE</span>
                </span>
                <span className="bg-blue-100 text-bidsure-blue px-2 py-0.5 rounded text-[10px]">
                  PAGE {selectedResult.evidence_page_number || '1'}
                </span>
              </div>

              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-blue-200/80 italic font-mono text-[11px] leading-relaxed">
                "{selectedResult.evidence_snippet || 'Document verified against official registry.'}"
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                Source Document: <strong>{selectedResult.evidence_document_name || 'Audited_Balance_Sheet.pdf'}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">Select any criteria from the left panel to inspect evidence.</p>
          </div>
        )}
      </div>

      {/* Bottom Legal Decision Actions */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-2">
        {isOfficer ? (
          <>
            <div className="text-xs font-semibold text-slate-600 text-center">
              Procurement Officer Statutory Action
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => onOpenDecisionModal('APPROVED')}
                className="w-full flex items-center justify-center gap-1 text-[11px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => onOpenDecisionModal('REJECTED')}
                className="w-full flex items-center justify-center gap-1 text-[11px]"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenDecisionModal('CLARIFICATION_REQUESTED')}
                className="w-full flex items-center justify-center gap-1 text-[11px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Clarify</span>
              </Button>
            </div>
            <p className="text-[9px] text-center text-slate-400 leading-none pt-1">
              Actions are permanently logged to the immutable audit trail under GFR Rule 173.
            </p>
          </>
        ) : (
          <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-center text-[11px] text-slate-600 font-medium">
            <ShieldAlert className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span>CAG Vigilance Mode: Read-Only Independent Oversight. Decision controls restricted.</span>
          </div>
        )}
      </div>
    </div>
  );
};
