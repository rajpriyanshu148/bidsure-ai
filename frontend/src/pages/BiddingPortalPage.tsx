import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Send,
  Sparkles,
  FileText,
  BadgeCheck,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Info,
} from 'lucide-react';
import { tendersApi, biddersApi } from '../services/api';
import { Tender } from '../types';

export const BiddingPortalPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loadingTenders, setLoadingTenders] = useState(true);

  // Step state: 1 = Enterprise Registration, 2 = Tender Bidding, 3 = Bid Submitted & Evaluated
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isRegistered, setIsRegistered] = useState(false);

  // Step 1: Corporate Enterprise Registration Form State
  const [companyName, setCompanyName] = useState('');
  const [cin, setCin] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [turnoverCr, setTurnoverCr] = useState<number>(35.0);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [repName, setRepName] = useState('');

  // Step 2: Tender Bidding Form State
  const [selectedTenderId, setSelectedTenderId] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number>(4.25);
  const [hasOemAuth, setHasOemAuth] = useState(true);
  const [localContentPct, setLocalContentPct] = useState<number>(65);
  const [caUdinDeclared, setCaUdinDeclared] = useState(true);
  const [legalUndertaking, setLegalUndertaking] = useState(false);

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [bidResult, setBidResult] = useState<{
    bid_reference: string;
    bidder_id: string;
    company_name: string;
    tender_number: string;
    compliance_score: number;
    risk_level: string;
    verification_status: string;
    submitted_at: string;
  } | null>(null);

  // Load active tenders
  useEffect(() => {
    tendersApi
      .list()
      .then((data) => {
        setTenders(data);
        if (data.length > 0) {
          setSelectedTenderId(data[0].id);
        }
      })
      .catch((err) => console.error('Error fetching tenders:', err))
      .finally(() => setLoadingTenders(false));
  }, []);

  const selectedTender = tenders.find((t) => t.id === selectedTenderId);

  // Quick Demo Auto-fills
  const handleAutofillEligible = () => {
    setCompanyName('Bharat Quantum Dynamics Pvt Ltd');
    setCin('U72200DL2021PTC380124');
    setPan('AABCB1234F');
    setGstin('07AABCB1234F1Z5');
    setUdyamNumber('UDYAM-DL-01-0045231');
    setTurnoverCr(42.5);
    setRepName('Dr. Rajeshwar Sharma');
    setContactEmail('compliance@bharatquantum.gov.in');
    setContactPhone('+91 98112 34567');
  };

  const handleAutofillBorderline = () => {
    setCompanyName('Apex Allied Technologies Ltd');
    setCin('L28920MH2018PLC099882');
    setPan('AACTA4455M');
    setGstin('27AACTA4455M1Z2');
    setUdyamNumber('');
    setTurnoverCr(12.0); // Borderline turnover
    setRepName('Vikram Malhotra');
    setContactEmail('tenders@apexallied.co.in');
    setContactPhone('+91 98200 99881');
  };

  // Submit Step 1: Enterprise Registration
  const handleRegisterEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Please enter your Legal Entity / Company Name.');
      return;
    }
    if (!pan.trim()) {
      alert('Please enter your Company Permanent Account Number (PAN).');
      return;
    }
    if (!gstin.trim()) {
      alert('Please enter your Goods & Services Tax Identification Number (GSTIN).');
      return;
    }

    setIsRegistered(true);
    setCurrentStep(2);
  };

  // Submit Step 2: Tender Bid Submission
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderId) {
      alert('Please select an active tender.');
      return;
    }
    if (!legalUndertaking) {
      alert('You must accept the Statutory Legal Undertaking before submitting your official bid.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await biddersApi.registerAndBid({
        tender_id: selectedTenderId,
        company_name: companyName,
        cin: cin || undefined,
        pan: pan || undefined,
        gstin: gstin || undefined,
        udyam_number: udyamNumber || undefined,
        contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        turnover_cr: Number(turnoverCr),
        has_oem_auth: hasOemAuth,
        local_content_pct: Number(localContentPct),
        quoted_price: quotedPrice ? Number(quotedPrice) * 10000000 : undefined,
      });

      setBidResult(res);
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Bid submission error:', err);
      setSubmissionError(
        err.response?.data?.detail || 'Failed to submit bid. Please ensure the backend service is reachable.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setIsRegistered(false);
    setBidResult(null);
    setLegalUndertaking(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-bidsure-primary text-white px-2 py-0.5 rounded font-mono font-bold">
                GeM SP-PORTAL
              </span>
              <span className="text-xs text-slate-500">Government e-Marketplace Vendor Submissions</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-bidsure-primary" />
              Vendor Registration & Tender Bidding Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory enterprise identity registration and AI-assisted tender bid compliance submission gateway.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
            >
              <span>Back to Officer Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Gate Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-amber-950">Statutory Prerequisite (GFR 2017 & GeM GTC):</span>
          <p className="text-amber-800 leading-relaxed">
            All prospective vendors must first complete corporate registration (verifying Legal CIN, PAN, and GSTIN)
            before bidding credentials are authorized for any active GeM procurement tender.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 Tab */}
          <div
            onClick={() => currentStep !== 3 && setCurrentStep(1)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              currentStep === 1
                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                : isRegistered
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 cursor-pointer'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : isRegistered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isRegistered ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div>
              <div className="font-bold text-xs">Step 1: Enterprise Registration</div>
              <div className="text-[11px] opacity-80">
                {isRegistered ? 'Verified Statutory Entity' : 'CIN, PAN, GSTIN & Turnover'}
              </div>
            </div>
          </div>

          {/* Step 2 Tab */}
          <div
            onClick={() => isRegistered && currentStep !== 3 && setCurrentStep(2)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              currentStep === 2
                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                : !isRegistered
                ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 cursor-pointer'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : !isRegistered
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {!isRegistered ? <Lock className="w-3.5 h-3.5" /> : '2'}
            </div>
            <div>
              <div className="font-bold text-xs">Step 2: Tender Bidding Desk</div>
              <div className="text-[11px] opacity-80">
                {!isRegistered ? 'Locked (Requires Reg.)' : 'Bid Parameters & Disclosures'}
              </div>
            </div>
          </div>

          {/* Step 3 Tab */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              currentStep === 3
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              3
            </div>
            <div>
              <div className="font-bold text-xs">Step 3: AI Scrutiny Receipt</div>
              <div className="text-[11px] opacity-80">
                {currentStep === 3 ? 'Compliance Score Evaluated' : 'Awaiting Submission'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: ENTERPRISE STATUTORY REGISTRATION */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                Enterprise Identity & Statutory Registry
              </h2>
              <p className="text-xs text-slate-500">
                Enter legal corporate credentials as registered with MCA21, GSTN, and Income Tax Department.
              </p>
            </div>

            {/* Autofill Demo Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Quick Demo:</span>
              <button
                type="button"
                onClick={handleAutofillEligible}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                title="Autofill a high-compliance enterprise"
              >
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Eligible Enterprise</span>
              </button>
              <button
                type="button"
                onClick={handleAutofillBorderline}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-semibold transition-colors"
                title="Autofill an enterprise with borderline turnover"
              >
                <span>Borderline Enterprise</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegisterEnterprise} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Legal Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Registered Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bharat Dynamics & Compute Technologies Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must match exactly with Certificate of Incorporation and PAN entity name.
                </span>
              </div>

              {/* CIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Identification Number (CIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., U72200DL2021PTC380124"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  21-digit alphanumeric Ministry of Corporate Affairs identifier.
                </span>
              </div>

              {/* PAN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g., AAACZ9876K"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  10-digit entity PAN verified against Income Tax Department (ITD).
                </span>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (Goods & Services Tax ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="e.g., 27AAACZ9876K1Z9"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  15-digit GSTIN active on Goods and Services Tax Network (GSTN).
                </span>
              </div>

              {/* Udyam MSME Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MSME Udyam Registration (URN) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., UDYAM-MH-01-0098765"
                  value={udyamNumber}
                  onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Eligible for MSME EMD exemption & turnover relaxation under GFR.
                </span>
              </div>

              {/* Average Annual Turnover */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3-Year Average Annual Turnover (₹ Crores) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="35.0"
                    value={turnoverCr}
                    onChange={(e) => setTurnoverCr(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">Crores</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Audited as per ICAI guidelines with Unique Document Identification Number (UDIN).
                </span>
              </div>

              {/* Authorized Representative */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorized Signatory / Bid Manager
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rajesh Kumar Gupta"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Communication Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="tenders@company.gov.in"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98201 12345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Credentials verified against MCA21, GSTN, and ITD upon submission.</span>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-bidsure-primary hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <span>Register & Proceed to Tender Bidding Desk</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: TENDER BIDDING DESK (GATED) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Registered Company Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">{companyName}</h3>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    REGISTERED VENDOR
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-800 mt-0.5 font-mono">
                  <span>CIN: {cin || 'N/A'}</span>
                  <span className="text-emerald-400">|</span>
                  <span>PAN: {pan}</span>
                  <span className="text-emerald-400">|</span>
                  <span>GSTIN: {gstin}</span>
                  <span className="text-emerald-400">|</span>
                  <span>Turnover: ₹{turnoverCr} Cr</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="px-3 py-1.5 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-md transition-colors self-start sm:self-auto"
            >
              Modify Enterprise Profile
            </button>
          </div>

          {/* Tender Selection & Bid Desk */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Select Active Tender & Submit Statutory Disclosures
              </h2>
              <p className="text-xs text-slate-500">
                Select the target procurement tender and provide technical compliance declarations.
              </p>
            </div>

            <form onSubmit={handleSubmitBid} className="p-6 space-y-6">
              {/* Tender Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Active Procurement Tender <span className="text-rose-500">*</span>
                </label>
                {loadingTenders ? (
                  <div className="text-xs text-slate-500 py-2">Loading active tenders...</div>
                ) : (
                  <select
                    value={selectedTenderId}
                    onChange={(e) => setSelectedTenderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tender_number} ({t.title}) [Est: ₹{(t.estimated_value / 10000000).toFixed(2)} Cr]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Tender Specification Overview */}
              {selectedTender && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">TENDER IDENTIFIER</span>
                      <span className="text-xs font-bold text-slate-900">{selectedTender.tender_number}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">ESTIMATED CONTRACT VALUE</span>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{(selectedTender.estimated_value / 10000000).toFixed(2)} Crore
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong>Title:</strong> {selectedTender.title}
                  </div>

                  {/* Scrutiny Rules Checkmarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Min. Turnover Req: <strong>₹20.00 Cr</strong></span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>OEM Authorization: <strong>Mandatory</strong></span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Class-I MII: <strong>Min. 50%</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bid Technical Disclosures */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Layers className="w-4 h-4 text-bidsure-primary" />
                  Statutory Disclosures & Quoted Bid Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Quoted Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quoted Commercial Bid (₹ Crores) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="4.25"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">Crores</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      All-inclusive price quoted for the complete scope of supply.
                    </span>
                  </div>

                  {/* Make in India Local Content */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Make in India (MII) Local Content % <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={localContentPct}
                        onChange={(e) => setLocalContentPct(parseInt(e.target.value))}
                        className="flex-1 accent-bidsure-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="w-14 text-center font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded border border-slate-300">
                        {localContentPct}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className="text-slate-400">PPP-MII 2017 Thresholds</span>
                      <span className="font-semibold text-slate-700">
                        {localContentPct >= 50
                          ? 'Class-I Local Supplier (>= 50%)'
                          : localContentPct >= 20
                          ? 'Class-II Local Supplier (20% to 49%)'
                          : 'Non-Local Supplier (< 20%)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory Checkboxes */}
                <div className="space-y-3 pt-2">
                  {/* OEM MAF Certificate */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOemAuth}
                      onChange={(e) => setHasOemAuth(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-bidsure-primary focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">
                        Original Equipment Manufacturer (OEM) Authorization (MAF) Attached
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Certified Form C authorization from the principal hardware/equipment manufacturer.
                      </span>
                    </div>
                  </label>

                  {/* CA Audited Statement */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caUdinDeclared}
                      onChange={(e) => setCaUdinDeclared(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-bidsure-primary focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">
                        Chartered Accountant Audited Balance Sheet with Valid UDIN Uploaded
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Confirms turnover of ₹{turnoverCr} Crore is certified by an active ICAI member.
                      </span>
                    </div>
                  </label>

                  {/* Legal Undertaking */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                    <input
                      type="checkbox"
                      required
                      checked={legalUndertaking}
                      onChange={(e) => setLegalUndertaking(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-bidsure-primary focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        Statutory Solemn Undertaking & Non-Debarment Affirmation <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-slate-600 text-[11px] leading-relaxed">
                        I hereby declare under Section 193 of the Indian Penal Code that all corporate credentials,
                        audited accounts, and statutory disclosures are authentic and verifiable against Government
                        portals (MCA21, GSTN, ITD, Udyam). Any misrepresentation will result in immediate disqualification,
                        forfeiture of EMD, and debarment under GFR Rule 151.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {submissionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Back to Registration
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !legalUndertaking}
                  className={`px-6 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
                    isSubmitting || !legalUndertaking
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Statutory Documents & Evaluating AI Scrutiny...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Official Bid to GeM AI Scrutiny Queue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: SUBMISSION RECEIPT & AI SCRUTINY EVALUATION */}
      {currentStep === 3 && bidResult && (
        <div className="space-y-6">
          {/* Official Acknowledgment Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-bidsure-primary text-white p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BID SUBMITTED & VERIFIED</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">GeM Technical Scrutiny Acknowledgment</h2>
                  <p className="text-xs text-blue-200">
                    Official Bid Reference: <span className="font-mono font-bold text-amber-300">{bidResult.bid_reference}</span>
                  </p>
                </div>

                {/* Score badge */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center shrink-0">
                  <div className="text-xs font-semibold text-blue-200">AI Scrutiny Score</div>
                  <div className="text-3xl font-extrabold text-white mt-0.5">
                    {bidResult.compliance_score.toFixed(1)}%
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bidResult.risk_level === 'LOW'
                          ? 'bg-emerald-500 text-slate-950'
                          : bidResult.risk_level === 'MEDIUM'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {bidResult.risk_level} RISK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Summary Breakdown */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 font-mono block">BIDDER FIRM</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">{bidResult.company_name}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 font-mono block">TENDER NUMBER</span>
                  <span className="text-xs font-bold text-slate-900 block font-mono">{bidResult.tender_number}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 font-mono block">SCRUTINY STATUS</span>
                  <span className="text-xs font-bold text-emerald-700 block">{bidResult.verification_status}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 font-mono block">SUBMITTED TIMESTAMP</span>
                  <span className="text-xs font-mono text-slate-700 block">
                    {new Date(bidResult.submitted_at).toLocaleDateString()} {new Date(bidResult.submitted_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Synthesized Statutory Documents Checklist */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Statutory Records Synthesized & OCR-Indexed
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">CA Audited Balance Sheet</div>
                      <div className="text-[10px] text-slate-500">UDIN Verified | ₹{turnoverCr} Cr</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">GST Registration (REG-06)</div>
                      <div className="text-[10px] text-slate-500 font-mono">{gstin} | ACTIVE</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Permanent Account Number (PAN)</div>
                      <div className="text-[10px] text-slate-500 font-mono">{pan} | ITD Verified</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                    {hasOemAuth ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-800">OEM Authorization (MAF)</div>
                      <div className="text-[10px] text-slate-500">
                        {hasOemAuth ? 'Valid Channel Partner' : 'Not Provided'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Make in India Self-Declaration</div>
                      <div className="text-[10px] text-slate-500">{localContentPct}% Local Content</div>
                    </div>
                  </div>

                  {udyamNumber && (
                    <div className="bg-white border border-slate-200 rounded p-2.5 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">MSME Udyam Certificate</div>
                        <div className="text-[10px] text-slate-500 font-mono">{udyamNumber}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleResetForm}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Register & Bid for Another Firm</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    View in Officer Scrutiny Queue
                  </button>

                  <button
                    onClick={() => navigate(`/bidders/${bidResult.bidder_id}`)}
                    className="px-5 py-2.5 bg-bidsure-primary hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                  >
                    <span>Inspect Full AI Scrutiny Record</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BiddingPortalPage;
