import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Shield, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsoleHeader: React.FC = () => {
  const navigate = useNavigate();
  const { role, activePersona, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-bidsure-primary text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm select-none">
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & GeM Institutional Context */}
        <div className="flex items-center gap-4">
          {/* GeM Context Badge */}
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-white/15">
            <img
              src="/assets/gem-logo.png"
              alt="Government e Marketplace"
              className="h-8 w-auto object-contain brightness-110"
              onError={(e) => {
                // Fallback if image path differs
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* BidSure AI Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-bidsure-deep border border-bidsure-cyan/40 p-1 flex items-center justify-center shadow-glass-intelligence">
              <img
                src="/assets/bidsure-artwork.png"
                alt="BidSure AI"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base text-white">BidSure AI</span>
                <span className="text-[10px] bg-bidsure-cyan/15 text-bidsure-cyan px-1.5 py-0.5 rounded border border-bidsure-cyan/30 font-mono font-semibold">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 leading-none">
                Transparent Procurement. Trusted Decisions.
              </p>
            </div>
          </div>
        </div>

        {/* User Identity & Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Bid Workspace Button */}
          <button
            onClick={() => navigate('/bidders/d8b43269-a1aa-4e32-861e-595e37309383')}
            className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-sm transition-all active:scale-95"
            title="Jump directly to flagship 3-panel Bid Scrutiny Workspace"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Benchmark Scrutiny Workspace</span>
          </button>

          {/* Secure Isolated User Identity Badge (Role-Switching Disabled) */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              role === 'PROCUREMENT_OFFICER'
                ? 'bg-amber-950/40 border-amber-400/40 text-amber-200'
                : role === 'AUDITOR'
                ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                : 'bg-purple-950/40 border-purple-400/40 text-purple-200'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 ${
                role === 'PROCUREMENT_OFFICER'
                  ? 'bg-amber-400'
                  : role === 'AUDITOR'
                  ? 'bg-emerald-400'
                  : 'bg-purple-300'
              }`}
            >
              {activePersona.avatarInitials}
            </div>
            <div className="text-left leading-none pr-1">
              <span className="text-[10px] font-medium block text-blue-200">
                {role === 'PROCUREMENT_OFFICER'
                  ? 'Scrutiny Officer'
                  : role === 'AUDITOR'
                  ? 'CAG Vigilance'
                  : 'Platform Admin'}
              </span>
              <span className="text-xs font-bold text-white">{activePersona.fullName}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
