import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Scale, Sparkles, Loader2 } from 'lucide-react';
import { biddersApi } from '../services/api';

interface OfficerDecisionModalProps {
  bidderId: string;
  bidderName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_REMARKS: Record<string, string> = {
  UNDER_REVIEW:
    'Bidder eligibility parameters are currently under review by the tender scrutiny committee. Documents and financial statements are being cross-verified against tender requirements.',
  REJECTED:
    'Bidder is disqualified due to failure to meet mandatory eligibility conditions: Annual turnover is below the minimum ₹10.0 Crore threshold and the mandatory OEM Authorization Form (MAF) was not submitted.',
  CLARIFICATION_REQUESTED:
    'Clarification notice issued to bidder via GeM Representation Window regarding turnover computation and local content percentage declaration.',
  APPROVED:
    'Bidder has satisfactorily fulfilled all mandatory statutory, financial, and technical eligibility criteria specified in the bid document.',
};

export const OfficerDecisionModal: React.FC<OfficerDecisionModalProps> = ({
  bidderId,
  bidderName,
  onClose,
  onSuccess,
}) => {
  const [decision, setDecision] = useState<'UNDER_REVIEW' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'APPROVED'>('UNDER_REVIEW');
  const [remarks, setRemarks] = useState(PRESET_REMARKS['UNDER_REVIEW']);
  const [officerName, setOfficerName] = useState('Rajesh Kumar, GeM Procurement Officer');
  const [acknowledged, setAcknowledged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDecisionChange = (newDecision: any) => {
    setDecision(newDecision);
    if (PRESET_REMARKS[newDecision]) {
      setRemarks(PRESET_REMARKS[newDecision]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged) {
      setError('You must check the legal acknowledgement box to confirm official sign-off.');
      return;
    }
    if (!remarks.trim()) {
      setError('Please provide officer justification remarks for this decision.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await biddersApi.submitDecision(bidderId, {
        decision,
        justification_remarks: remarks.trim(),
        officer_name: officerName.trim() || 'Rajesh Kumar, GeM Procurement Officer',
      });
      setSuccessMessage('Decision successfully recorded in official audit ledger!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit officer decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-bidsure-primary text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-semibold text-base leading-tight">Record Procurement Officer Decision</h3>
              <p className="text-xs text-blue-200">Official Tender Scrutiny Sign-Off</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Legal Accountability:</strong> Under General Financial Rules (GFR 2017) and GeM Guidelines, AI evaluation is decision-support advisory. The authorized Procurement Officer is legally accountable for the final determination.
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-0.5">Bidder Enterprise</span>
            <span className="text-sm font-bold text-slate-900">{bidderName}</span>
          </div>

          {/* Decision Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Final Scrutiny Decision *</label>
            <select
              value={decision}
              onChange={(e) => handleDecisionChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bidsure-blue bg-white"
            >
              <option value="UNDER_REVIEW">Keep Under Review (Pending Committee Scrutiny)</option>
              <option value="REJECTED">Disqualify / Reject Bidder</option>
              <option value="CLARIFICATION_REQUESTED">Request Clarification (Notice to Bidder)</option>
              <option value="APPROVED">Technically Qualify / Approve Bidder</option>
            </select>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
            <button
              type="button"
              onClick={() => handleDecisionChange('REJECTED')}
              className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200 transition-colors"
            >
              Turnover Deficit & Missing OEM
            </button>
            <button
              type="button"
              onClick={() => handleDecisionChange('UNDER_REVIEW')}
              className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 transition-colors"
            >
              Committee Review
            </button>
            <button
              type="button"
              onClick={() => handleDecisionChange('CLARIFICATION_REQUESTED')}
              className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200 transition-colors"
            >
              Clarification Notice
            </button>
          </div>

          {/* Justification remarks textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Justification & Reason *
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-bidsure-blue leading-relaxed"
              placeholder="Provide detailed reasons for this procurement decision..."
            />
          </div>

          {/* Officer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Officer Name / Designation *</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-bidsure-blue"
            />
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="ack_decision"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-bidsure-primary focus:ring-bidsure-blue cursor-pointer"
            />
            <label htmlFor="ack_decision" className="text-xs text-slate-600 select-none cursor-pointer leading-tight">
              I acknowledge that I have independently reviewed the extracted evidence and statutory findings. This decision represents my official recorded action as authorized Procurement Officer.
            </label>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-bidsure-primary hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording Decision...</span>
                </>
              ) : (
                <span>Confirm & Record Decision</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
