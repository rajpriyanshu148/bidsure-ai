import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  ShieldCheck,
  FileDown,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { tendersApi, reportsApi } from '../services/api';
import { generateClientPdfDossier } from '../services/pdfExportService';
import { Tender, Bidder } from '../types';
import { StatusBadge, RiskBadge, Button, GlassCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    tendersApi
      .list()
      .then((data) => {
        setTenders(data);
        if (data.length > 0) {
          setSelectedTenderId(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTenderId) return;
    tendersApi
      .getBidders(selectedTenderId)
      .then((bData) => setBidders(bData))
      .catch((err) => console.error(err));
  }, [selectedTenderId]);

  const handleDownloadPdf = async (bidderId: string, companyName: string) => {
    try {
      setDownloadingId(bidderId);
      const token = localStorage.getItem('bidsure_token');
      const response = await fetch(reportsApi.downloadPdfUrl(bidderId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `BidSure_Scrutiny_Dossier_${companyName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.warn('[BidSure AI] Server-side PDF fetch failed or offline; generating client-side compliance dossier:', err);
      const matchedBidder = bidders.find((b) => b.id === bidderId) || { id: bidderId, company_name: companyName };
      const currentTender = tenders.find((t) => t.id === selectedTenderId);
      generateClientPdfDossier({
        bidder: matchedBidder,
        tender: currentTender,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-bidsure-primary" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {role === 'AUDITOR'
                ? 'Vigilance Dossiers & Forensic Reports'
                : role === 'ADMIN'
                ? 'Platform Telemetry & Gateway Reports'
                : 'Scrutiny Reports & Bidding Dossiers'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official PDF scrutiny exports, evidence provenance logs, and statutory decision documentation.
          </p>
        </div>
      </div>

      {/* Role-Specific Report Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glassLevel="subtle" className="p-4 bg-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
            <ShieldCheck className="w-4 h-4 text-bidsure-blue" />
            <span>{role === 'AUDITOR' ? 'VIGILANCE DOSSIER' : 'TECHNICAL SCRUTINY DOSSIER'}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Comprehensive audit report detailing all deterministic rules, extracted statutory entities, and officer decisions.
          </p>
          <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-mono block w-fit">
            PDF | ReportLab Engine
          </span>
        </GlassCard>

        <GlassCard glassLevel="subtle" className="p-4 bg-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>DEVIATION & RISK ANALYSIS</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Highlights contradictions between tender claim forms and official external government verification databases.
          </p>
          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono block w-fit">
            Integrated in Dossier
          </span>
        </GlassCard>

        <GlassCard glassLevel="subtle" className="p-4 bg-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>CHAIN OF CUSTODY AUDIT LOG</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Cryptographically verifiable transaction ledger matching digital signatures and officer determinations.
          </p>
          <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-mono block w-fit">
            SHA-256 Verified
          </span>
        </GlassCard>
      </div>

      {/* Tender Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
            Target Procurement Tender
          </label>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="w-full sm:w-96 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tender_number} ({t.title})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-mono text-slate-500 self-start sm:self-end">
          Total Scrutinized Bidders: <strong>{bidders.length}</strong>
        </div>
      </div>

      {/* Bidders Dossier Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-sm font-semibold text-slate-900">
            Available Scrutiny Dossiers for Selected Tender
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading tender bidders...</div>
          ) : bidders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs italic">
              No bids have been submitted for this tender yet.
            </div>
          ) : (
            bidders.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-slate-900">{b.company_name}</span>
                    <RiskBadge level={b.risk_level} size="sm" />
                    <StatusBadge status={b.officer_decision_status || 'UNDER_REVIEW'} size="sm" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    <span>Score: <strong>{b.compliance_score.toFixed(1)}%</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Ref: <strong>GEM/BID/2026/{b.id.slice(0, 8).toUpperCase()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/bidders/${b.id}`)}
                    className="text-xs"
                  >
                    <span>Inspect Workspace</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={downloadingId === b.id}
                    onClick={() => handleDownloadPdf(b.id, b.company_name)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    <span>Generate Official PDF Dossier</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
