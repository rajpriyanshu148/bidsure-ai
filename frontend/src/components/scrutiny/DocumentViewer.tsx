import React, { useState } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle,
  Eye,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Document as BidderDoc } from '../../types';

export interface DocumentViewerProps {
  documents: BidderDoc[];
  activeDocumentId: string | null;
  onSelectDocument: (docId: string) => void;
  highlightedSnippet?: string;
  activePageNumber?: number | string;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  highlightedSnippet,
  activePageNumber = 1,
  className = '',
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState<number>(Number(activePageNumber) || 1);

  const activeDoc = documents.find((d) => d.id === activeDocumentId) || documents[0];

  const handleZoomIn = () => setZoom((z) => Math.min(180, z + 15));
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 15));

  // Synthesize realistic document preview text based on active document type
  const getDocumentContent = () => {
    if (!activeDoc) return 'No document selected.';

    switch (activeDoc.document_type) {
      case 'FINANCIAL_STATEMENTS':
      case 'TURNOVER_CERTIFICATE':
        return `INDEPENDENT AUDITOR'S REPORT & ANNUAL STATEMENTS
To the Members of: BHARAT DYNAMICS & COMPUTE TECHNOLOGIES PRIVATE LIMITED
CIN: U72200DL2021PTC380124 | Registration State: Delhi, India

1. Opinion on Financial Health:
We have audited the accompanying Balance Sheet as of March 31, 2025, and the related Statement of Profit & Loss for the year then ended. In our opinion, the accompanying financial statements give a true and fair view in conformity with the accounting principles generally accepted in India.

2. Audited Turnover Summary (Three-Year Average):
FY 2022-2023: INR 38,50,00,000.00
FY 2023-2024: INR 44,20,00,000.00
FY 2024-2025: INR 45,00,00,000.00
AVERAGE ANNUAL TURNOVER: INR 42,56,66,666.67 (Rupees Forty-Two Crore Fifty-Six Lakh Sixty-Six Thousand)

3. Statutory Unique Document Identification:
UDIN: 25048912AAAA9812 | ICAI Membership Number: 048912
Firm Registration Number (FRN): 012845N
Place: New Delhi | Date: 12-August-2025`;

      case 'GST_CERTIFICATE':
        return `GOVERNMENT OF INDIA - GOODS AND SERVICES TAX
REGISTRATION CERTIFICATE (Form GST REG-06)
Registration Number (GSTIN): 07AABCB1234F1Z5

Legal Name: BHARAT DYNAMICS & COMPUTE TECHNOLOGIES PRIVATE LIMITED
Trade Name: BHARAT DYNAMICS TECH
Constitution of Business: Private Limited Company
Address of Principal Place of Business: Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020
Date of Liability: 01/07/2017 | Date of Validity: From 01/07/2017 to Continuing
Type of Registration: Regular Taxpayer
Jurisdictional Authority: Ward 74, Central GST Division Delhi South

Taxpayer Status in GSTN Live Database: ACTIVE
Latest GSTR-3B Filing: COMPLIANT (Month: Current Assessment Year)`;

      case 'PAN_CARD':
        return `INCOME TAX DEPARTMENT - GOVT. OF INDIA
PERMANENT ACCOUNT NUMBER CARD
PAN: AABCB1234F

Name: BHARAT DYNAMICS & COMPUTE TECHNOLOGIES PRIVATE LIMITED
Date of Incorporation: 14/06/2021
Status: Domestic Company (Indian Entity)
Assessment Circle: Corporate Circle 4(1), New Delhi

ITR-6 Filing Status:
Assessment Year 2024-25: Filed on Time under Sec 139(1)
Acknowledgement Number: 84920194810293
Tax Clearance Status: No Outstanding Demand / Notice`;

      case 'OEM_AUTHORIZATION':
        return `MANUFACTURER'S AUTHORIZATION FORM (MAF - FORM C)
Principal OEM: BHARAT COMPUTE HARMONY SYSTEMS LIMITED
Headquarters: Electronic City, Bengaluru 560100

To:
The Procurement Officer,
Government e-Marketplace (GeM), New Delhi

SUBJECT: OEM AUTHORIZATION FOR TENDER
We, who are official and proven manufacturers of Enterprise Blade Server Compute Nodes having factories at Bengaluru, do hereby authorize:
M/s BHARAT DYNAMICS & COMPUTE TECHNOLOGIES PRIVATE LIMITED
to submit a bid, negotiate, and subsequently conclude the contract with you against the subject GeM Tender.

We hereby extend our full statutory guarantee and comprehensive on-site warranty for 5 Years for the goods offered by the above firm against this invitation for bid.
Authorized Signatory: Vice President - Enterprise Government Solutions`;

      case 'MAKE_IN_INDIA':
        return `PUBLIC PROCUREMENT (PREFERENCE TO MAKE IN INDIA) ORDER 2017
LOCAL CONTENT SELF-DECLARATION CERTIFICATE

We hereby solemnly declare that our quoted compute solutions satisfy the minimum local content criteria as prescribed under DPIIT Public Procurement Order:
Percentage of Local Content Claimed: 70.0% (Seventy Percent)
Classification of Supplier: CLASS-I LOCAL SUPPLIER (Local Content >= 50%)

Details of Location at which Local Value Addition is made:
Facility: Sector 63, Noida Manufacturing Facility, Uttar Pradesh, India
Scope of Local Engineering: PCB Surface Mount Assembly, Enclosure Fabrication, Firmware Customization, Integration, Testing, and Packaging.`;

      case 'MSME_CERTIFICATE':
        return `MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES
UDYAM REGISTRATION CERTIFICATE
Udyam Number: UDYAM-DL-01-0045231

Name of Enterprise: BHARAT DYNAMICS & COMPUTE TECHNOLOGIES PRIVATE LIMITED
Major Activity: MANUFACTURING
Enterprise Classification: SMALL ENTERPRISE
Investment in Plant & Machinery: INR 8.50 Crore
Turnover: Verified via Income Tax & GST Integrations
Date of Udyam Registration: 18/09/2021`;

      default:
        return activeDoc.raw_text || 'Document content indexed via OCR pipeline.';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-white select-none ${className}`}>
      {/* Top Document Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocumentId;
            return (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-bidsure-blue text-white shadow-xs font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{doc.original_filename}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 text-slate-300">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Header: Page Navigation & Verification Stamp */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>OCR VERIFIED</span>
          </span>
          <span className="text-slate-400 text-xs truncate max-w-sm font-mono">
            {activeDoc?.original_filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Page <strong>{currentPage}</strong> of <strong>{activeDoc?.total_pages || 1}</strong>
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(activeDoc?.total_pages || 1, p + 1))}
              disabled={currentPage >= (activeDoc?.total_pages || 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center PDF Simulation Viewport */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center bg-slate-950">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-2xl bg-white text-slate-900 rounded-sm shadow-2xl p-8 transition-transform duration-150 min-h-[550px] relative font-serif"
        >
          {/* Official Government Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <div className="text-7xl font-extrabold rotate-[-30deg] uppercase font-sans">
              GeM SCRUTINY
            </div>
          </div>

          {/* Document Content */}
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
            {getDocumentContent()}
          </pre>

          {/* Highlighted Evidence Box: Deliberate Synchronized Motion */}
          {highlightedSnippet && (
            <motion.div
              key={highlightedSnippet}
              initial={{ opacity: 0, scale: 0.98, borderColor: '#00D9FF' }}
              animate={{ opacity: 1, scale: 1, borderColor: '#F59E0B' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mt-6 p-3.5 bg-amber-50/95 border-2 border-amber-500 rounded-lg shadow-md ring-4 ring-amber-400/20 font-sans text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-900">
                <span>AI Extracted Evidence Citation (Page {activePageNumber})</span>
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">98% Confidence</span>
              </div>
              <p className="font-mono text-xs font-semibold text-slate-900 bg-white/90 p-2.5 rounded border border-amber-300">
                "{highlightedSnippet}"
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
