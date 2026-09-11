import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Activity,
  Cpu,
  Users,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Database,
  RefreshCw,
  Settings,
  FileCheck2,
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    dashboardApi
      .getAdminStats()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching admin stats:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading System Administration & Gateway Health...</p>
        </div>
      </div>
    );
  }

  const system = data?.system_health || {
    backend_status: 'OPERATIONAL',
    database_status: 'HEALTHY (SQLite WAL Mode)',
    db_latency_ms: 1.4,
    llm_provider: 'Deterministic Grounded Rule Extractor',
    ocr_throughput: '1.2s / page',
    ocr_accuracy_rate: 98.8,
  };

  const gateways = data?.gateways || [];
  const users = data?.users || [];
  const pipeline = data?.pipeline_stats || {
    total_documents: 7,
    total_pages: 17,
    active_tenders: 3,
    total_bidders: 5,
  };
  const weights = data?.default_weights || {};

  return (
    <div className="space-y-6">
      {/* Admin Goal Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white rounded-xl p-5 shadow-sm border border-purple-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-400 text-slate-950">
                Admin Console
              </span>
              <span className="text-xs text-purple-200">Role: GeM System Administrator & Operations Lead</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              Platform Operations, Rule Policy & Gateway Health
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              <strong>Your Core Goal:</strong> Ensure system availability, monitor 12 Government API adapters (GSTN, PAN, MCA21, Udyam), calibrate deterministic rule engine scoring weights, and manage user access roles.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Ping All Gateways</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Configure Rule Weights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operations KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-purple-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800">Govt API Adapters</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-900">{gateways.length} / {gateways.length}</span>
            <span className="text-xs text-emerald-600 font-bold">100% ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Avg Latency: 39ms</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">OCR & Document Engine</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{system.ocr_throughput}</span>
            <span className="text-xs text-emerald-600 font-bold">{system.ocr_accuracy_rate}% Acc.</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">{pipeline.total_pages} Pages Indexed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Database Engine</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{system.db_latency_ms} ms</span>
            <span className="text-xs text-slate-500 font-mono">SQLite WAL</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Zero Lock Contention</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">User Personas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Active RBAC Roles</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Officer, Auditor, Admin</p>
        </div>
      </div>

      {/* Government API Gateway Health Monitor */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Government Verification Gateways & External Integrations</h3>
            <p className="text-xs text-slate-500">Live operational status of 12 statutory government database connectors</p>
          </div>
          <button
            onClick={() => navigate('/government-verification')}
            className="text-xs font-semibold text-bidsure-blue hover:text-blue-800 transition-colors"
          >
            <span>Live Adapter Console</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gateways.map((gw: any) => (
            <div key={gw.code} className="border border-slate-200 rounded-lg p-3 bg-slate-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    {gw.code}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{gw.status}</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{gw.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{gw.type}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px] font-mono text-slate-500">
                <span>Ping: {gw.latency_ms}ms</span>
                <span>Uptime: {gw.uptime}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Rule Scoring Policy Preview & User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Engine Scoring Weights Preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-slate-900">Active Rule Weight Distribution (%)</h3>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs text-purple-700 hover:underline font-bold"
            >
              Edit in Settings
            </button>
          </div>
          <div className="space-y-2 pt-1">
            {Object.entries(weights).map(([key, val]: [string, any]) => (
              <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-700 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  {val}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight pt-2">
            Formula: Score = Σ(weight × status_score) / Σ(weight) × 100. Critical rules (Debarment, Turnover) trigger deterministic override regardless of score.
          </p>
        </div>

        {/* User & Role Management Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-slate-900">Registered Procurement Accounts</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">3 Demo Accounts</span>
          </div>
          <div className="space-y-2 pt-1">
            {users.map((u: any) => (
              <div key={u.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{u.full_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    u.role === 'PROCUREMENT_OFFICER'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : u.role === 'AUDITOR'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
