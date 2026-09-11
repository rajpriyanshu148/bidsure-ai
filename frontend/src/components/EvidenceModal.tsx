import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { ComplianceResult } from '../types';
import { ComplianceBadge } from './ComplianceBadge';

interface EvidenceModalProps {
  result: ComplianceResult | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-bidsure-primary text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="font-semibold text-base leading-tight">Grounded Compliance Evidence</h3>
              <p className="text-xs text-blue-200">Rule: {result.rule_name} Requirement Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Verification Outcome</span>
              <div className="mt-1">
                <ComplianceBadge status={result.status} size="lg" />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">AI Extraction Confidence</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 block">Required Standard</span>
              <p className="text-sm font-semibold text-slate-900 mt-1">{result.expected_value || 'N/A'}</p>
            </div>
            <div className={`border rounded-lg p-3 ${result.status === 'PASS' ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'}`}>
              <span className="text-xs font-semibold text-slate-500 block">Extracted Bidder Value</span>
              <p className="text-sm font-bold mt-1 text-slate-900">{result.actual_value || 'N/A'}</p>
              {result.difference && (
                <span className={`inline-block mt-1 text-xs font-mono font-medium ${result.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Difference: {result.difference}
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Audit Finding & Explanation</span>
            <div className="text-xs text-slate-700 bg-blue-50/60 border border-blue-200 p-3 rounded-lg leading-relaxed">
              {result.reason}
            </div>
          </div>

          {/* Evidence Citation */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-bidsure-primary" />
              Source Document Citation
            </span>
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 text-[11px]">
                <span>Document: {result.evidence_document_name || 'Attached Bid Document'}</span>
                <span>Page: {result.evidence_page_number || '1'}</span>
              </div>
              <div className="text-emerald-300 leading-relaxed bg-slate-950/70 p-2.5 rounded border border-slate-800">
                "{result.evidence_snippet || 'Document text extracted and matched via OCR and structured field parser.'}"
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-200">
            Note: The Procurement Officer may open the raw PDF or cross-check statutory filings in the Documents tab.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
