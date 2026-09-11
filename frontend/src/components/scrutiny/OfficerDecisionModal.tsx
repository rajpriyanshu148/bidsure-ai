import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface OfficerDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionType: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | null;
  companyName: string;
  bidReference: string;
  complianceScore: number;
  riskLevel: string;
  onSubmitDecision: (remarks: string) => Promise<void>;
}

export const OfficerDecisionModal: React.FC<OfficerDecisionModalProps> = ({
  isOpen,
  onClose,
  decisionType,
  companyName,
  bidReference,
  complianceScore,
  riskLevel,
  onSubmitDecision,
}) => {
  const [remarks, setRemarks] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!decisionType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged) {
      alert('You must acknowledge the legal procurement disclaimer before confirming.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitDecision(remarks);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = {
    APPROVED: {
      title: 'Confirm Technical Approval of Bid',
      badge: 'TECHNICAL COMPLIANT - APPROVED',
      color: 'text-emerald-700',
      buttonVariant: 'success' as const,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      desc: 'You are certifying that the bidder satisfies all mandatory technical, financial, and statutory criteria.',
    },
    REJECTED: {
      title: 'Confirm Disqualification of Bid',
      badge: 'NON-COMPLIANT - REJECTED',
      color: 'text-rose-700',
      buttonVariant: 'danger' as const,
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      desc: 'You are issuing a formal disqualification for non-compliance with statutory or technical thresholds.',
    },
    CLARIFICATION_REQUESTED: {
      title: 'Issue Formal Clarification Request',
      badge: 'CLARIFICATION REQUIRED',
      color: 'text-amber-700',
      buttonVariant: 'secondary' as const,
      icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
      desc: 'You are requesting formal explanation or re-verification from the vendor within statutory time limits.',
    },
  }[decisionType];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-bold text-base text-slate-900">{config.title}</span>
        </div>
      }
      subtitle={`Official Reference: ${bidReference} | Bidder: ${companyName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold font-mono text-[11px] text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>STATUTORY AUDIT & GFR 2017 LEGAL UNDERTAKING</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Pursuant to Rule 173 of the General Financial Rules (GFR 2017), your determination will be recorded
            permanently into the tamper-proof cryptographic audit trail.
          </p>
          <p className="text-[10px] text-slate-500 leading-normal">
            *Legal Note: AI-generated scores and extractions are strictly advisory tools. The authorized
            Procurement Officer exercises ultimate discretion and assumes full legal accountability.
          </p>
        </div>

        {/* Justification Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Written Justification / Remarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={`Enter official procurement remarks explaining why this bid is ${decisionType.toLowerCase()}...`}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
          />
        </div>

        {/* Legal Undertaking Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
          <input
            type="checkbox"
            required
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-bidsure-primary focus:ring-bidsure-blue w-4 h-4"
          />
          <span className="text-[11px] text-slate-700 leading-relaxed">
            I hereby confirm that I have reviewed the supporting statutory documents, evaluated AI evidence
            citations, and executed this determination in accordance with the General Financial Rules (GFR 2017)
            and GeM procurement guidelines.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={config.buttonVariant}
            size="sm"
            loading={isSubmitting}
            disabled={!acknowledged}
          >
            <span>Record Official Decision</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
