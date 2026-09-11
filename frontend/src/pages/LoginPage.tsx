import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth, RoleType, DEMO_PERSONAS } from '../context/AuthContext';
import gemLogo from '../assets/gem-logo.png';
import bidsureArtwork from '../assets/bidsure-artwork.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleType>('PROCUREMENT_OFFICER');
  const [email, setEmail] = useState('officer@bidsure.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    const persona = DEMO_PERSONAS[role];
    setEmail(persona.email);
    setPassword('Password@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials or authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Government Portal Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={gemLogo}
              alt="GeM"
              className="h-8 w-auto object-contain"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Government e-Marketplace (GeM)
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight">
                National Public Procurement Portal of India
              </span>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded font-mono font-medium">
            GFR 2017 & CVC Compliant
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-md w-full max-w-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-900 text-white p-6 text-center relative">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-1.5 mx-auto mb-3 flex items-center justify-center shadow-inner">
              <img
                src={bidsureArtwork}
                alt="BidSure Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BidSure AI</h1>
            <p className="text-xs text-slate-300 mt-1">
              Integrated Bid Compliance Verification & Scrutiny Portal
            </p>
          </div>

          {/* Card Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Select User Role (Demo Mode)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('PROCUREMENT_OFFICER')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'PROCUREMENT_OFFICER'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                  <span className="text-[11px] block leading-tight">Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('AUDITOR')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'AUDITOR'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                  <span className="text-[11px] block leading-tight">Auditor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('ADMIN')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-4 h-4 mx-auto mb-1 text-purple-700" />
                  <span className="text-[11px] block leading-tight">Admin</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                placeholder="officer@bidsure.gov.in"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                placeholder="Password@123"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In as {DEMO_PERSONAS[selectedRole].fullName.split(',')[0]}</span>
                </>
              )}
            </button>

            {/* Persona Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  {DEMO_PERSONAS[selectedRole].fullName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {DEMO_PERSONAS[selectedRole].designation} • {DEMO_PERSONAS[selectedRole].department}
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
        <p>
          Smart India Hackathon 2024 (SIH26100) • BidSure AI Decision Support System • Government e-Marketplace
        </p>
      </footer>
    </div>
  );
};
