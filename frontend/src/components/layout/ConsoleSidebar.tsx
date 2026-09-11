import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Briefcase,
  ShieldCheck,
  History,
  FileText,
  Settings,
  ShieldAlert,
  Cpu,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsoleSidebar: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();

  // Navigation schema configured per legal persona
  const navItems = [
    {
      label:
        role === 'AUDITOR'
          ? 'Vigilance Console'
          : role === 'ADMIN'
          ? 'Admin Console'
          : 'Scrutiny Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Procurement Tenders',
      path: '/tenders',
      icon: FileCheck2,
    },
    {
      label: 'Vendor Bidding Portal',
      path: '/bidding',
      icon: Briefcase,
    },
    {
      label: 'Govt Verifications',
      path: '/government-verification',
      icon: ShieldCheck,
    },
    {
      label: role === 'AUDITOR' ? 'Forensic Audit Trail' : 'Audit Trail',
      path: '/audit',
      icon: History,
    },
    {
      label: role === 'AUDITOR' ? 'Vigilance Dossiers' : 'Reports & Dossiers',
      path: '/reports',
      icon: FileText,
    },
    {
      label: role === 'ADMIN' ? 'Rule Engine & Config' : 'Settings',
      path: '/settings',
      icon: role === 'ADMIN' ? Sliders : Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-xs select-none">
      <div className="space-y-4">
        {/* Console Mode Label */}
        <div className="text-xs font-semibold text-slate-500 px-3 flex items-center justify-between">
          <span>
            {role === 'AUDITOR'
              ? 'CAG Vigilance Portal'
              : role === 'ADMIN'
              ? 'Administration Portal'
              : 'Procurement Scrutiny'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-bidsure-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-bidsure-cyan' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Mandate Info Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          {role === 'AUDITOR' ? (
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : role === 'ADMIN' ? (
            <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-bidsure-blue shrink-0" />
          )}
          <span className="text-xs font-semibold text-slate-900">
            {role === 'AUDITOR'
              ? 'Vigilance Mandate'
              : role === 'ADMIN'
              ? 'Platform Governance'
              : 'Decision Authority'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {role === 'AUDITOR'
            ? 'Independent oversight under CVC & CAG norms. Detect high-risk anomalies, turnover deficits, and officer overrides.'
            : role === 'ADMIN'
            ? 'Maintain 12 statutory Government connectors, monitor OCR pipelines, and configure the 7 scoring criteria.'
            : 'AI recommendations are advisory under GFR Rule 173. The authorized Procurement Officer holds final legal authority.'}
        </p>
      </div>
    </aside>
  );
};
