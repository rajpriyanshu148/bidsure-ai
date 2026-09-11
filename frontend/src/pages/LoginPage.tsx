import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  Building2,
  Sparkles,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { useAuth, RoleType, DEMO_PERSONAS } from '../context/AuthContext';
import { GlassCard, Button } from '../components/ui';
import { AmbientBackground } from '../components/layout/AmbientBackground';
import gemLogo from '../assets/gem-logo.png';
import bidsureArtwork from '../assets/bidsure-artwork.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Stage: 1 = Role Selection, 2 = Credentials + CAPTCHA, 3 = 2FA OTP
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>('PROCUREMENT_OFFICER');

  // Credentials State
  const [email, setEmail] = useState('officer@bidsure.gov.in');
  const [password, setPassword] = useState('Password@123');

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 2FA OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(299);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Countdown timer for 2FA
  useEffect(() => {
    if (stage !== 3) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  // Generate Distorted Canvas CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaError(false);

    // Draw on Canvas with distortion and noise lines
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#0F2642';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise lines
      for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 217, 255, 0.4)' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      // Draw distorted characters
      ctx.font = 'bold 24px monospace';
      for (let i = 0; i < code.length; i++) {
        ctx.save();
        const x = 20 + i * 22;
        const y = 30 + (Math.random() * 8 - 4);
        const angle = (Math.random() * 20 - 10) * (Math.PI / 180);
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = i % 2 === 0 ? '#00D9FF' : '#FFFFFF';
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
      }
    }, 50);
  };

  useEffect(() => {
    if (stage === 2) {
      generateCaptcha();
    }
  }, [stage]);

  // Quick direct login for instant evaluator access
  const handleDirectLogin = async (r: RoleType) => {
    setSelectedRole(r);
    const persona = DEMO_PERSONAS[r];
    setEmail(persona.email);
    setPassword('Password@123');
    setLoading(true);
    setLoginError(null);
    try {
      await login(persona.email, 'Password@123', r);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setLoginError('Authentication failed. Please verify credentials with directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillCaptcha = () => {
    setCaptchaInput(captchaCode);
    setCaptchaError(false);
  };

  // Handle Stage 1: Select Role
  const handleSelectRole = (r: RoleType) => {
    setSelectedRole(r);
    const persona = DEMO_PERSONAS[r];
    setEmail(persona.email);
    setPassword('Password@123');
    setStage(2);
  };

  // Handle Stage 2: Verify Credentials & CAPTCHA
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    setCaptchaError(false);
    setStage(3);
  };

  // Handle Stage 3: Submit 2FA OTP and Login
  const executeLogin = async (tokenArray: string[]) => {
    const fullOtp = tokenArray.join('');
    if (fullOtp.length !== 6) {
      setOtpError(true);
      return;
    }

    setLoading(true);
    setLoginError(null);

    try {
      await login(email, password || 'Password@123', selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setLoginError('Authentication failed. Please verify credentials with directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(otp);
  };

  const handleQuickAuthorize = async () => {
    const demoToken = ['8', '4', '2', '9', '1', '7'];
    setOtp(demoToken);
    setOtpError(false);
    await executeLogin(demoToken);
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      setOtpError(false);
      if (pasted.length === 6) {
        executeLogin(newOtp);
      } else {
        const nextInput = document.getElementById(`otp-input-${pasted.length}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setOtpError(false);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto submit if all 6 digits entered
    if (val && index === 5 && newOtp.every((d) => d !== '')) {
      executeLogin(newOtp);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bidsure-deep via-bidsure-primary to-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Waves */}
      <AmbientBackground intensity="intelligence" />

      {/* Top Government Bar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={gemLogo}
              alt="GeM"
              className="h-7 w-auto object-contain brightness-110"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
            <span className="text-xs text-blue-200/80 border-l border-white/20 pl-3">
              Government e-Marketplace Procurement Verification Framework
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
            TLS 1.3 ENCRYPTED
          </span>
        </div>
      </header>

      {/* Center Auth Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Visual Intelligence */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="relative w-40 h-40 mx-auto lg:mx-0 p-2 rounded-2xl bg-bidsure-deep/80 border border-bidsure-cyan/40 shadow-glass-intelligence">
              <img
                src={bidsureArtwork}
                alt="BidSure AI Gavel and Shield"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">BidSure AI</h1>
                <span className="text-[10px] bg-bidsure-cyan/20 text-bidsure-cyan px-2 py-0.5 rounded font-mono font-bold border border-bidsure-cyan/40">
                  v2.0
                </span>
              </div>
              <p className="text-sm font-semibold text-bidsure-softCyan mt-0.5">
                "Transparent Procurement. Trusted Decisions."
              </p>
              <p className="text-xs text-blue-200/80 mt-2 leading-relaxed">
                AI-powered deterministic compliance verification, document intelligence, and auditable
                decision support for public procurement scrutiny.
              </p>
            </div>

            {/* Statutory Security Affirmation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-blue-100/90 space-y-1.5">
              <div className="flex items-center gap-2 text-bidsure-cyan font-bold font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>GFR 2017 & CVC COMPLIANCE</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                All scrutiny actions and officer determinations are permanently recorded with cryptographic
                SHA-256 hashes for vigilance auditing.
              </p>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-7">
            <GlassCard
              glassLevel="elevated"
              enableSpotlight={false}
              className="bg-white/95 text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200"
            >
              {/* STAGE 1: ROLE SELECTION */}
              {stage === 1 && (
                <div className="space-y-5">
                  <div className="text-left border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold text-bidsure-blue">
                      Stage 1 of 3
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Select Procurement Authority
                    </h2>
                    <p className="text-xs text-slate-500">
                      Choose your authorized government role to initialize role-isolated session.
                    </p>
                  </div>

                  {/* 1-Click Instant Demo Access */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-bidsure-blue shrink-0 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Instant Evaluator Access
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Skip 2FA simulation for immediate platform inspection:
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('PROCUREMENT_OFFICER')}
                        className="flex-1 sm:flex-none text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer"
                      >
                        Officer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('AUDITOR')}
                        className="flex-1 sm:flex-none text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                      >
                        Auditor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('ADMIN')}
                        className="flex-1 sm:flex-none text-[11px] font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Role 1: Procurement Officer */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('PROCUREMENT_OFFICER')}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-3.5 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-5 h-5 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
                            Procurement Officer
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            Decision Authority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Inspect technical scrutiny queue, review evidence citations, and execute final legal awards.
                        </p>
                      </div>
                    </button>

                    {/* Role 2: CAG Vigilance Auditor */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('AUDITOR')}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-start gap-3.5 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                            CAG Vigilance Auditor
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            Read-Only Oversight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Independent forensic scrutiny of high-risk cases, shell entities, and officer overrides.
                        </p>
                      </div>
                    </button>

                    {/* Role 3: Platform Admin */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('ADMIN')}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all flex items-start gap-3.5 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Cpu className="w-5 h-5 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                            Platform Administrator
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            System Governance
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Configure deterministic scoring weights, manage simulated connectors, and monitor telemetry.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: CREDENTIALS & CAPTCHA */}
              {stage === 2 && (
                <form onSubmit={handleVerifyCredentials} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-bidsure-blue">
                        Stage 2 of 3
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        Credentials & Visual CAPTCHA
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage(1)}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Change Role</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Government Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Security Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none font-mono"
                      />
                    </div>

                    {/* Alphanumeric Canvas CAPTCHA */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                          Security Verification CAPTCHA
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAutoFillCaptcha}
                            className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 cursor-pointer"
                            title="Auto-fill CAPTCHA for quick evaluation"
                          >
                            Auto-Fill
                          </button>
                          <button
                            type="button"
                            onClick={generateCaptcha}
                            className="text-[11px] text-bidsure-blue hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                            title="Generate new image"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refresh</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <canvas
                          ref={canvasRef}
                          width={160}
                          height={40}
                          className="rounded-lg border border-slate-400 shadow-inner"
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter characters"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
                        />
                      </div>

                      {captchaError && (
                        <p className="text-[10px] text-rose-600 font-semibold">
                          Incorrect CAPTCHA entered. Please enter characters shown above.
                        </p>
                      )}

                      {/* Demo Quick Bypass */}
                      <button
                        type="button"
                        onClick={() => setCaptchaInput(captchaCode)}
                        className="text-[10px] text-slate-400 hover:text-bidsure-blue underline block"
                      >
                        [Demo Autofill CAPTCHA: {captchaCode}]
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full mt-2">
                    <span>Verify Credentials & Proceed to 2FA</span>
                  </Button>
                </form>
              )}

              {/* STAGE 3: 2FA OTP */}
              {stage === 3 && (
                <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-bidsure-blue">
                        Stage 3 of 3
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        Two-Factor Authentication (2FA)
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage(2)}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>

                  <div className="text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">
                        Enter 6-digit security token for <strong>{email}</strong>
                      </p>
                      <div className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-bidsure-blue border border-blue-200">
                        Valid: {Math.floor(otpCountdown / 60).toString().padStart(2, '0')}:{(otpCountdown % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <div
                      className="flex justify-between gap-2 max-w-xs mx-auto py-2"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-10 h-12 text-center text-lg font-extrabold font-mono border-2 border-slate-300 rounded-lg focus:border-bidsure-blue focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-[10px] text-center text-rose-600 font-semibold">
                        Please enter all 6 digits of the OTP token.
                      </p>
                    )}

                    {loginError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-[11px] text-center text-rose-700 font-semibold">
                        {loginError}
                      </div>
                    )}

                    {/* One-Click Demo Authorization Action */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleQuickAuthorize}
                        className="text-xs text-bidsure-blue hover:text-blue-800 font-mono font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        [Authorize with Demo Token: 842917]
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <span>Authorize Session & Enter Console</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-md px-6 py-2.5 text-center text-slate-400 text-[11px]">
        <span>BidSure AI | Decision Support Platform for GeM Procurement | Official Government Enterprise Edition</span>
      </footer>
    </div>
  );
};

export default LoginPage;
