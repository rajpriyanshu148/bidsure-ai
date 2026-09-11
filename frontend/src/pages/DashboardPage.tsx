import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OfficerDashboardView } from './dashboard/OfficerDashboardView';
import { AuditorDashboardView } from './dashboard/AuditorDashboardView';
import { AdminDashboardView } from './dashboard/AdminDashboardView';
import { ShieldCheck, Lock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { role, activePersona } = useAuth();

  return (
    <div className="space-y-6">
      {/* Official Authenticated Session Banner (Strict RBAC Isolation) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-800 mr-2">Authenticated User:</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded border ${activePersona.badgeColor}`}
            >
              {activePersona.fullName} ({activePersona.designation})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
            <Lock className="w-3 h-3" />
            <span>RBAC Session Isolated</span>
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline">{activePersona.department}</span>
        </div>
      </div>

      {/* Render Exclusively the Authenticated Role's Dashboard */}
      {role === 'PROCUREMENT_OFFICER' && <OfficerDashboardView />}
      {role === 'AUDITOR' && <AuditorDashboardView />}
      {role === 'ADMIN' && <AdminDashboardView />}
    </div>
  );
};
