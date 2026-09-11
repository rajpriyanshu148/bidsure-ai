import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { RiskIndicator } from '../../components/RiskIndicator';

export const OfficerDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getOfficerStats()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching officer stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-bidsure-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading Procurement Officer Scrutiny Queue...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    total_assigned: 5,
    pending_action: 2,
    clarifications_active: 1,
    approved_count: 1,
    rejected_count: 1,
    evaluation_completion_pct: 40.0,
  };

  const queue = data?.scrutiny_queue || [];
  const tenders = data?.active_tenders || [];
  const alerts = data?.critical_alerts || [];

  return (
    <div className="space-y-6">
      {/* Officer Goal Banner */}
      <div className="bg-gradient-to-r from-bidsure-deep via-bidsure-primary to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-400 text-slate-950">
                Officer Desk
              </span>
              <span className="text-xs text-blue-200">Role: Procurement Officer (Scrutiny Authority)</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              Technical Bid Scrutiny & Decision Queue
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              <strong>Your Core Goal:</strong> Review AI-extracted compliance evidence, examine technical documentation, and record legally binding procurement decisions (Accept, Reject, Clarification) under GFR 2017.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/bidders/d8b43269-a1aa-4e32-861e-595e37309383')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Scrutinize Primary Demo Bid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Officer Action KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Pending Decision</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{stats.pending_action}</span>
            <span className="text-xs text-amber-700 font-medium">Bidders awaiting review</span>
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">Clarifications In-Flight</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900">{stats.clarifications_active}</span>
            <span className="text-xs text-blue-700 font-medium">Vendor responses awaited</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Technically Qualified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{stats.approved_count}</span>
            <span className="text-xs text-emerald-700 font-medium">Approved for commercial</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Disqualified / Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900">{stats.rejected_count}</span>
            <span className="text-xs text-rose-700 font-medium">Defects / debarred</span>
          </div>
        </div>
      </div>

      {/* Critical Scrutiny Alerts */}
      {alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>High Risk Disqualification Warnings Requiring Immediate Officer Review</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert: any, idx: number) => (
              <div key={idx} className="bg-white border border-rose-200 rounded-lg p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{alert.company_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Score: {alert.compliance_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1 line-clamp-2">
                    {Array.isArray(alert.reasons) ? alert.reasons.join(' | ') : alert.reasons}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Status: {alert.decision_status}</span>
                  <button
                    onClick={() => navigate(`/bidders/${alert.bidder_id}`)}
                    className="text-xs font-bold text-bidsure-blue hover:text-blue-800 transition-colors"
                  >
                    <span>Inspect Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrutiny Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Officer Scrutiny Worklist</h3>
            <p className="text-xs text-slate-500">Bidders requiring official evaluation and decision recording</p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
            {queue.length} Active in Queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                <th className="px-5 py-3">Bidder Enterprise</th>
                <th className="px-4 py-3">Compliance Score</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Decision Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {queue.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{b.company_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {b.id.substring(0, 13)}...</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            b.compliance_score >= 80 ? 'bg-emerald-500' : b.compliance_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${b.compliance_score}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-700">{b.compliance_score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <RiskIndicator level={b.risk_level} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.officer_decision_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.officer_decision_status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : b.officer_decision_status === 'CLARIFICATION_REQUESTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.officer_decision_status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/bidders/${b.id}`)}
                      className="px-3 py-1.5 bg-bidsure-primary hover:bg-blue-900 text-white font-semibold text-xs rounded shadow-xs transition-colors inline-flex items-center"
                    >
                      <span>Scrutinize & Decide</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Tenders Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active Tenders Under Technical Scrutiny</h3>
          <button
            onClick={() => navigate('/tenders')}
            className="text-xs text-bidsure-blue hover:underline font-semibold"
          >
            View All Tenders
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenders.map((t: any) => (
            <div key={t.id} className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {t.tender_number}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{t.category}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.title}</h4>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Scrutiny Progress</span>
                  <span className="font-semibold text-slate-700">{t.decided_bidders} of {t.total_bidders} Bidders</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-bidsure-blue h-full" style={{ width: `${t.evaluation_pct}%` }} />
                </div>
              </div>
              <button
                onClick={() => navigate(`/tenders/${t.id}`)}
                className="w-full text-center text-xs text-bidsure-blue font-bold hover:text-blue-800 pt-2 block"
              >
                Inspect Tender Bidders
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
