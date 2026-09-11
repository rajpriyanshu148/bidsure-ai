import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FileText,
  FileCheck2,
  Download,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { biddersApi, documentsApi, reportsApi } from '../services/api';
import { Bidder, Document as BidderDoc, ComplianceResult, RiskScore, AIRecommendation } from '../types';
import { RequirementList } from '../components/scrutiny/RequirementList';
import { DocumentViewer } from '../components/scrutiny/DocumentViewer';
import { AIPanel } from '../components/scrutiny/AIPanel';
import { OfficerDecisionModal } from '../components/scrutiny/OfficerDecisionModal';
import { StatusBadge, RiskBadge, Button } from '../components/ui';

export const BidderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [documents, setDocuments] = useState<BidderDoc[]>([]);
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [riskDetails, setRiskDetails] = useState<RiskScore | undefined>();
  const [recommendation, setRecommendation] = useState<AIRecommendation | undefined>();
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Active Selected States in 3-panel workspace
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'criteria' | 'document' | 'scrutiny'>('criteria');

  // Decision Modal State
  const [decisionModalType, setDecisionModalType] = useState<
    'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | null
  >(null);

  // Fetch Bidder & Scrutiny Data
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bidderData, docsData, compData] = await Promise.all([
        biddersApi.getById(id),
        biddersApi.getDocuments(id),
        biddersApi.getCompliance(id),
      ]);

      setBidder(bidderData);
      setDocuments(docsData);
      setComplianceResults(compData.compliance_results || []);
      setRiskDetails(compData.risk_details);
      setRecommendation(compData.recommendation);
      setStatusCounts(compData.status_counts || {});

      // Auto select first requirement and corresponding document
      if (compData.compliance_results && compData.compliance_results.length > 0) {
        const first = compData.compliance_results[0];
        setSelectedResultId(first.id);
        if (first.evidence_document_id) {
          setActiveDocumentId(first.evidence_document_id);
        } else if (docsData.length > 0) {
          setActiveDocumentId(docsData[0].id);
        }
      } else if (docsData.length > 0) {
        setActiveDocumentId(docsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching bidder scrutiny details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Selected Result Helper
  const activeResult = complianceResults.find((r) => r.id === selectedResultId) || complianceResults[0] || null;

  // Interconnected interaction: Click criteria -> update document + page + evidence
  const handleSelectResult = (res: ComplianceResult) => {
    setSelectedResultId(res.id);
    setMobileTab('document');

    // If result cites a specific document, find and open it
    if (res.evidence_document_id) {
      const matchingDoc = documents.find((d) => d.id === res.evidence_document_id);
      if (matchingDoc) {
        setActiveDocumentId(matchingDoc.id);
        return;
      }
    }

    // Heuristic matching based on rule name if document ID not directly linked
    const ruleLower = res.rule_name.toLowerCase();
    if (ruleLower.includes('turnover') || ruleLower.includes('financial')) {
      const doc = documents.find((d) => d.document_type === 'FINANCIAL_STATEMENTS' || d.document_type === 'TURNOVER_CERTIFICATE');
      if (doc) setActiveDocumentId(doc.id);
    } else if (ruleLower.includes('gst')) {
      const doc = documents.find((d) => d.document_type === 'GST_CERTIFICATE');
      if (doc) setActiveDocumentId(doc.id);
    } else if (ruleLower.includes('pan')) {
      const doc = documents.find((d) => d.document_type === 'PAN_CARD');
      if (doc) setActiveDocumentId(doc.id);
    } else if (ruleLower.includes('oem') || ruleLower.includes('authorization')) {
      const doc = documents.find((d) => d.document_type === 'OEM_AUTHORIZATION');
      if (doc) setActiveDocumentId(doc.id);
    } else if (ruleLower.includes('india') || ruleLower.includes('local content')) {
      const doc = documents.find((d) => d.document_type === 'MAKE_IN_INDIA');
      if (doc) setActiveDocumentId(doc.id);
    }
  };

  // Submit Officer Decision
  const handleOfficerDecision = async (remarks: string) => {
    if (!id || !decisionModalType) return;
    await biddersApi.submitDecision(id, {
      decision: decisionModalType,
      justification_remarks: remarks,
      officer_name: 'Shri R. K. Sharma, Procurement Officer',
    });
    fetchData();
  };

  // Download PDF Dossier
  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const url = reportsApi.downloadPdfUrl(id);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `BidSure_Scrutiny_Dossier_${bidder?.company_name.replace(/\s+/g, '_') || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Failed to generate PDF dossier. Ensure backend is running.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-3">
        <div className="w-8 h-8 border-3 border-bidsure-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold text-slate-600">
          Initializing 3-Panel Bid Scrutiny Workstation...
        </span>
      </div>
    );
  }

  if (!bidder) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
        <h2 className="text-sm font-bold text-slate-800">Bidder Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested bidder identifier does not exist in the active registry.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors mt-0.5"
              title="Back to Scrutiny Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-bidsure-blue" />
                  <span>{bidder.company_name}</span>
                </h1>
                <StatusBadge status={bidder.officer_decision_status || 'UNDER_REVIEW'} size="sm" />
                <RiskBadge level={bidder.risk_level} size="sm" />
              </div>

              {/* Statutory metadata pills */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                <span>CIN: <strong className="text-slate-800">{bidder.cin || 'N/A'}</strong></span>
                <span className="text-slate-300">|</span>
                <span>PAN: <strong className="text-slate-800">{bidder.pan}</strong></span>
                <span className="text-slate-300">|</span>
                <span>GSTIN: <strong className="text-slate-800">{bidder.gstin}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Bid Ref: <strong className="text-slate-800 font-bold">GEM/BID/2026/{bidder.id.slice(0, 8).toUpperCase()}</strong></span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadPdf}
            >
              <span>Download Scrutiny Dossier</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchData}
              title="Re-run compliance evaluation"
            >
              <span>Re-Evaluate</span>
            </Button>
          </div>
        </div>
      </div>

      {/* THE FLAGSHIP THREE-PANEL WORKSPACE */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white min-h-[640px] h-[calc(100vh-210px)] max-h-[820px] flex flex-col">
        {/* Mobile / Tablet Tab Switcher (< 1024px) */}
        <div className="lg:hidden flex items-center border-b border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setMobileTab('criteria')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'criteria'
                ? 'bg-white text-bidsure-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Criteria ({complianceResults.length})
          </button>
          <button
            onClick={() => setMobileTab('document')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'document'
                ? 'bg-white text-bidsure-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Document Evidence
          </button>
          <button
            onClick={() => setMobileTab('scrutiny')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'scrutiny'
                ? 'bg-white text-bidsure-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Scrutiny & Decision
          </button>
        </div>

        {/* 3 Panels: Grid on desktop (>=1024px), Single Panel on Mobile/Tablet (<1024px) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* PANEL 1 (LEFT, 3 cols): Requirement & Scrutiny Criteria List */}
          <div
            className={`lg:col-span-3 h-full overflow-hidden ${
              mobileTab === 'criteria' ? 'block' : 'hidden lg:block'
            }`}
          >
            <RequirementList
              results={complianceResults}
              selectedResultId={selectedResultId}
              onSelectResult={handleSelectResult}
            />
          </div>

          {/* PANEL 2 (CENTER, 5 cols): Interactive Document Viewer & Evidence Canvas */}
          <div
            className={`lg:col-span-5 h-full overflow-hidden border-r border-slate-200 ${
              mobileTab === 'document' ? 'block' : 'hidden lg:block'
            }`}
          >
            <DocumentViewer
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelectDocument={(docId) => setActiveDocumentId(docId)}
              highlightedSnippet={activeResult?.evidence_snippet}
              activePageNumber={activeResult?.evidence_page_number || 1}
            />
          </div>

          {/* PANEL 3 (RIGHT, 4 cols): AI Scrutiny, Provenance, Risk & Officer Decision */}
          <div
            className={`lg:col-span-4 h-full overflow-hidden ${
              mobileTab === 'scrutiny' ? 'block' : 'hidden lg:block'
            }`}
          >
            <AIPanel
              selectedResult={activeResult}
              overallScore={bidder.compliance_score}
              riskLevel={bidder.risk_level}
              statusCounts={statusCounts}
              riskDetails={riskDetails}
              recommendation={recommendation}
              onOpenDecisionModal={(type) => setDecisionModalType(type)}
            />
          </div>
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      <OfficerDecisionModal
        isOpen={Boolean(decisionModalType)}
        onClose={() => setDecisionModalType(null)}
        decisionType={decisionModalType}
        companyName={bidder.company_name}
        bidReference={`GEM/BID/2026/${bidder.id.slice(0, 8).toUpperCase()}`}
        complianceScore={bidder.compliance_score}
        riskLevel={bidder.risk_level}
        onSubmitDecision={handleOfficerDecision}
      />
    </div>
  );
};

export default BidderDetailPage;
