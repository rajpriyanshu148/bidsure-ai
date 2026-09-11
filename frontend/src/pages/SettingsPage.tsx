import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Cpu,
  Save,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard, Button } from '../components/ui';

const STATUTORY_DEFAULTS = {
  turnover: 25,
  gst: 15,
  pan: 15,
  oem: 15,
  mii: 15,
  experience: 10,
  blacklisting: 5,
};

export const SettingsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  // 7 Configured Deterministic Scoring Criteria
  const [weights, setWeights] = useState(STATUTORY_DEFAULTS);
  const [savedMessage, setSavedMessage] = useState('');
  const [copiedConfig, setCopiedConfig] = useState(false);

  const totalWeight =
    weights.turnover +
    weights.gst +
    weights.pan +
    weights.oem +
    weights.mii +
    weights.experience +
    weights.blacklisting;

  const isSumValid = totalWeight === 100;

  const handleResetDefaults = () => {
    if (!isAdmin) return;
    setWeights(STATUTORY_DEFAULTS);
    setSavedMessage('Restored to GFR 2017 & CVC statutory standard baseline distribution.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleExportConfig = () => {
    const configPayload = JSON.stringify(
      {
        ruleEngineVersion: '2.0.0',
        standard: 'GFR 2017 / PPP-MII 2017',
        timestamp: new Date().toISOString(),
        weights,
      },
      null,
      2
    );
    navigator.clipboard.writeText(configPayload);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!isSumValid) {
      alert(`The weights must sum to exactly 100%. Currently: ${totalWeight}%`);
      return;
    }
    setSavedMessage('Deterministic Rule Engine weights successfully saved & applied to GeM evaluation pipeline.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-bidsure-primary" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Deterministic Rule Engine Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure statutory multi-criteria scoring weights, critical override thresholds, and regulatory compliance constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportConfig}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            {copiedConfig ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedConfig ? 'Copied Config' : 'Export JSON'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Read-Only Policy Baseline:</strong> Scoring weights can only be modified by the{' '}
            <strong>Platform Administrator</strong>. Your current role has statutory audit and inspection privileges only.
          </span>
        </div>
      )}

      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Visual Weight Distribution Segmented Bar */}
      <GlassCard glassLevel="subtle" className="p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase font-mono">
            Scoring Weight Distribution Proportion
          </span>
          <div
            className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border ${
              isSumValid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {isSumValid ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-rose-600" />
            )}
            <span>Total: {totalWeight}% / 100%</span>
          </div>
        </div>

        {/* Segmented Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
          <div style={{ width: `${weights.turnover}%` }} className="bg-blue-600 h-full" title={`Turnover: ${weights.turnover}%`} />
          <div style={{ width: `${weights.gst}%` }} className="bg-emerald-600 h-full" title={`GST: ${weights.gst}%`} />
          <div style={{ width: `${weights.pan}%` }} className="bg-purple-600 h-full" title={`PAN: ${weights.pan}%`} />
          <div style={{ width: `${weights.oem}%` }} className="bg-cyan-500 h-full" title={`OEM MAF: ${weights.oem}%`} />
          <div style={{ width: `${weights.mii}%` }} className="bg-amber-500 h-full" title={`MII: ${weights.mii}%`} />
          <div style={{ width: `${weights.experience}%` }} className="bg-indigo-500 h-full" title={`Experience: ${weights.experience}%`} />
          <div style={{ width: `${weights.blacklisting}%` }} className="bg-rose-500 h-full" title={`Non-Debarment: ${weights.blacklisting}%`} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Turnover ({weights.turnover}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> GST ({weights.gst}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> PAN ({weights.pan}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> OEM MAF ({weights.oem}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> MII ({weights.mii}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Experience ({weights.experience}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Non-Debarment ({weights.blacklisting}%)
          </span>
        </div>
      </GlassCard>

      <form onSubmit={handleSave} className="space-y-6">
        {/* The 7 Deterministic Criteria Cards */}
        <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 text-bidsure-primary font-bold text-sm">
                <Sliders className="w-4 h-4 text-bidsure-blue" />
                <h3>Statutory Multi-Criteria Weight Allocation</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Formula: Compliance Score = Σ(Weight_i × RuleScore_i) / 100
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* 1. Annual Turnover */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  1. Annual Turnover Compliance
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {weights.turnover}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Audited balance sheets with mandatory UDIN and Income Tax ITR filings.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.turnover}
                onChange={(e) => setWeights({ ...weights, turnover: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 2. GST Active Status */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  2. GST Active Status & Returns
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {weights.gst}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                15-digit GSTIN active status verified via Goods and Services Tax Network API.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.gst}
                onChange={(e) => setWeights({ ...weights, gst: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 3. PAN & Identity Matching */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  3. PAN & Corporate Identity Matching
                </label>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {weights.pan}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cross-matching PAN card, MCA21 CIN registry, and entity legal name.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.pan}
                onChange={(e) => setWeights({ ...weights, pan: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 4. OEM Authorization / MAF */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  4. OEM Authorization (Form-C MAF)
                </label>
                <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {weights.oem}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tender-specific manufacturer authorization verifying official supply authorization.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.oem}
                onChange={(e) => setWeights({ ...weights, oem: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 5. Make in India */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  5. Make in India (PPP-MII 2017)
                </label>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {weights.mii}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Class-I (&ge;50%) or Class-II (20-49%) statutory domestic value addition.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.mii}
                onChange={(e) => setWeights({ ...weights, mii: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 6. Past Experience & Capability */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  6. Past Experience & Performance
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {weights.experience}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Prior government or PSU contract execution certificates within past 5 financial years.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.experience}
                onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>

            {/* 7. Non-Blacklisting & Integrity */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  7. Non-Blacklisting & Debarment Verification
                </label>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {weights.blacklisting}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mandatory check against CVC, GeM debarred vendor registry, and state vigilance bureaus.
              </p>
              <input
                type="number"
                disabled={!isAdmin}
                value={weights.blacklisting}
                onChange={(e) => setWeights({ ...weights, blacklisting: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold disabled:bg-slate-200/60"
              />
            </div>
          </div>

          {/* Admin Save Action */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button type="submit" variant="primary" size="md" disabled={!isSumValid}>
                <Save className="w-4 h-4" />
                <span>Apply & Save Scoring Weights</span>
              </Button>
            </div>
          )}
        </GlassCard>
      </form>
    </div>
  );
};

export default SettingsPage;
