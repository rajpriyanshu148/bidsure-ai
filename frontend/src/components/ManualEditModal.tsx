import React, { useState } from 'react';
import { X, Edit3, ShieldAlert } from 'lucide-react';
import { ExtractedEntity } from '../types';
import { documentsApi } from '../services/api';

interface ManualEditModalProps {
  entity: ExtractedEntity | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualEditModal: React.FC<ManualEditModalProps> = ({ entity, onClose, onSuccess }) => {
  if (!entity) return null;

  const [newValue, setNewValue] = useState(entity.raw_value || '');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory justification reason for this correction.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await documentsApi.correctEntity(entity.id, newValue, reason);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-bidsure-primary text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base">Manual Field Correction</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Audit Notice:</strong> Any modification to AI-extracted values is permanently logged in the immutable audit trail with your name, timestamp, and justification reason.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Field Entity Type</label>
            <input
              type="text"
              disabled
              value={entity.entity_type}
              className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Extracted Value</label>
            <input
              type="text"
              disabled
              value={entity.raw_value}
              className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corrected Value *</label>
            <input
              type="text"
              required
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bidsure-blue"
              placeholder="Enter verified correct value"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Officer Justification *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-bidsure-blue"
              placeholder="Explain why this correction is necessary (e.g. OCR misread digit on page 8)..."
            />
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-bidsure-primary hover:bg-blue-900 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Correction...' : 'Save & Log to Audit Trail'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
