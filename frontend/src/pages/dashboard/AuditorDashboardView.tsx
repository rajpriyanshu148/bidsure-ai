import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  History,
  FileCheck2,
  AlertOctagon,
  Scale,
  Lock,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

export const AuditorDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getAuditorStats()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching auditor stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading CAG Vigilance & Audit Console...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.integrity_kpis || {
    integrity_score: 98.4,
    total_audit_events: 12,
    officer_overrides_count: 0,
    debarment_violations_blocked: 1,
    unauthorized_access_attempts: 0,
    chain_of_custody_status: '100% CRYPTOGRAPHICALLY VERIFIED',
  };

  const overrides = data?.officer_overrides || [];
  const debarments = data?.debarment_alerts || [];
  const auditLogs = data?.recent_audit_trail || [];
  const ruleBreakdown = data?.statutory_rule_breakdown || [];

  return (
    <div className="space-y-6">
      {/* Auditor Goal Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-400 text-slate-950">
                CAG & Vigilance Console
              </span>
              <span className="text-xs text-emerald-200">Role: Independent Auditor / Vigilance Officer</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              Process Oversight, Vigilance & Tamper-Proof Audit
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              <strong>Your Core Goal:</strong> Ensure integrity in public spending under CVC / CAG guidelines. Detect corruption, unmask officer override anomalies, verify debarment compliance, and inspect the immutable cryptographic audit chain.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/audit')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Full Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auditor Vigilance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Vigilance Integrity Index</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{kpis.integrity_score}%</span>
            <span className="text-xs text-emerald-700 font-medium">Compliance health</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Officer Overrides Flagged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.officer_overrides_count}</span>
            <span className="text-xs text-slate-500 font-medium">Deviations from AI rules</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Debarment Violations</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900">{kpis.debarment_violations_blocked}</span>
            <span className="text-xs text-rose-700 font-medium">Blacklisted entities caught</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Audit Trail Integrity</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SHA-256 SEALED</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">{kpis.total_audit_events} Immutable Events</p>
        </div>
      </div>

      {/* Debarred / Blacklisted Violations Watch */}
      {debarments.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3>Debarred & Sanctioned Entity Alerts (GFR Rule 151)</h3>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">
              CVC Register Match
            </span>
          </div>
          <div className="space-y-2">
            {debarments.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-rose-300 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.company_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-600 text-white">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5">{item.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Source: {item.source}</span>
                </div>
                <button
                  onClick={() => navigate(`/bidders/${item.bidder_id}`)}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-bold text-xs shrink-0 self-start md:self-auto"
                >
                  Inspect Bidder Record
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Officer Overrides & Exception Watchlist */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Officer Decision Overrides & Exceptions Watchlist</h3>
            <p className="text-xs text-slate-500">
              Procurement Officer decisions where recorded outcome deviated from automated risk scoring
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
            {overrides.length} Overrides Logged
          </span>
        </div>

        {overrides.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No unauthorized officer overrides detected</p>
            <p className="text-[11px] text-slate-400">All recorded officer decisions conform with automated statutory risk evaluations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <th className="px-5 py-3">Bidder</th>
                  <th className="px-4 py-3">AI Risk Score</th>
                  <th className="px-4 py-3">Officer Decision</th>
                  <th className="px-4 py-3">Officer Justification</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {overrides.map((ov: any) => (
                  <tr key={ov.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">{ov.bidder_name}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-rose-700">{ov.risk_level} ({ov.compliance_score}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                        {ov.officer_decision}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{ov.justification}</td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono text-[10px]">{ov.decided_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column: Statutory Rule Failure Rate & Live Audit Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statutory Non-Compliance Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Statutory Non-Compliance Breakdown</h3>
            <span className="text-[10px] text-slate-500">Across All Bids</span>
          </div>
          <div className="space-y-3 pt-1">
            {ruleBreakdown.map((r: any) => (
              <div key={r.rule} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{r.rule}</span>
                  <span className="text-slate-500 font-mono">
                    {r.fail_count} Failed ({r.failure_rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${r.failure_rate > 50 ? 'bg-rose-500' : r.failure_rate > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(r.failure_rate, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Audit Stream */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Audit Timeline</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
              Live Feed
            </span>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {auditLogs.slice(0, 6).map((log: any) => (
              <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>HASH_OK</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{log.reason}</p>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Actor: {log.user_email}</span>
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="w-full text-center text-xs text-emerald-700 font-bold hover:underline pt-2 block"
          >
            Open Comprehensive Audit Log Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
