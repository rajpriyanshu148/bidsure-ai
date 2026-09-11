import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Cpu, Lock } from 'lucide-react';
import { useAuth, RoleType, DEMO_PERSONAS } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Top Government Portal Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={gemLogo}
              alt="GeM"
              className="h-8 w-auto object-contain brightness-105"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">
                Government e-Marketplace (GeM)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                National Public Procurement Portal of India
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded font-mono font-medium">
              GFR 2017 & CVC Compliant
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md w-full max-w-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-900 text-white p-6 text-center relative border-b border-slate-800">
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
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Select User Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('PROCUREMENT_OFFICER')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'PROCUREMENT_OFFICER'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-700 dark:text-amber-400" />
                  <span className="text-[11px] block leading-tight">Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('AUDITOR')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'AUDITOR'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[11px] block leading-tight">Auditor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('ADMIN')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Cpu className="w-4 h-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
                  <span className="text-[11px] block leading-tight">Admin</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="officer@bidsure.gov.in"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
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
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Smart India Hackathon 2024 (SIH26100) • BidSure AI Decision Support System • Government e-Marketplace
        </p>
      </footer>
    </div>
  );
};
