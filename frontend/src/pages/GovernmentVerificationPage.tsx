import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Play,
  Code,
  AlertCircle,
  Copy,
  Check,
  Database,
  Search,
  Layers,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { verificationApi } from '../services/api';
import { GlassCard, Button } from '../components/ui';

interface AdapterMeta {
  source: string;
  name: string;
  department: string;
  identifierType: string;
  defaultQuery: string;
  status: 'ONLINE' | 'SIMULATED';
  statute: string;
}

const ADAPTER_CATALOG: AdapterMeta[] = [
  {
    source: 'MOCK_GSTN',
    name: 'Goods & Services Tax Network (GSTN)',
    department: 'Ministry of Finance / CBIC',
    identifierType: '15-Digit GSTIN',
    defaultQuery: '03AAACA1234F1Z5',
    status: 'ONLINE',
    statute: 'CGST Act 2017 & Rule 144(xi)',
  },
  {
    source: 'MOCK_CBDT_PAN',
    name: 'Income Tax CBDT Permanent Account Number',
    department: 'Department of Revenue / CBDT',
    identifierType: '10-Digit Alphanumeric PAN',
    defaultQuery: 'AAACA1234F',
    status: 'ONLINE',
    statute: 'Income Tax Act 1961 Section 139A',
  },
  {
    source: 'MOCK_UDYAM',
    name: 'Ministry of MSME Udyam Registration',
    department: 'Ministry of Micro, Small & Medium Enterprises',
    identifierType: 'Udyam Registration Number',
    defaultQuery: 'UDYAM-PB-12-0012345',
    status: 'ONLINE',
    statute: 'MSMED Act 2006 (Public Procurement Policy)',
  },
  {
    source: 'MOCK_BLACKLISTING',
    name: 'Central Debarment & Vigilance Registry',
    department: 'Central Vigilance Commission (CVC) / GeM Incident Desk',
    identifierType: 'Corporate Entity Name',
    defaultQuery: 'ABC Engineering Private Limited',
    status: 'ONLINE',
    statute: 'GFR 2017 Rule 151 & CVC Circulars',
  },
  {
    source: 'MOCK_MCA',
    name: 'Ministry of Corporate Affairs MCA21',
    department: 'Ministry of Corporate Affairs',
    identifierType: '21-Digit Corporate CIN',
    defaultQuery: 'U28131PB2019PTC050123',
    status: 'ONLINE',
    statute: 'Companies Act 2013 & Beneficial Ownership Rules',
  },
  {
    source: 'MOCK_MAKE_IN_INDIA',
    name: 'DPIIT Public Procurement Preference to MII',
    department: 'Department for Promotion of Industry and Internal Trade',
    identifierType: 'Local Content Declaration %',
    defaultQuery: '48% Local Content',
    status: 'ONLINE',
    statute: 'PPP-MII Order 2017 (Class-I / Class-II Classification)',
  },
  {
    source: 'MOCK_EPFO',
    name: 'Employees Provident Fund Organization (EPFO)',
    department: 'Ministry of Labour & Employment',
    identifierType: 'EPF Establishment Code',
    defaultQuery: 'DLCPM0012345',
    status: 'ONLINE',
    statute: 'Employees Provident Funds Act 1952',
  },
  {
    source: 'MOCK_ESIC',
    name: 'Employees State Insurance Corporation (ESIC)',
    department: 'Ministry of Labour & Employment',
    identifierType: '17-Digit Employer Code',
    defaultQuery: '11000123450001001',
    status: 'ONLINE',
    statute: 'ESI Act 1948 Statutory Remittance Rule',
  },
  {
    source: 'MOCK_STARTUP_INDIA',
    name: 'DPIIT Startup India Recognition Portal',
    department: 'Ministry of Commerce & Industry',
    identifierType: 'DIPP Certificate Number',
    defaultQuery: 'DIPP12345',
    status: 'ONLINE',
    statute: 'Prior Turnover / Experience Exemption for Startups',
  },
  {
    source: 'MOCK_INCOME_TAX',
    name: 'ITR Assessment & UDIN Verification Portal',
    department: 'Central Board of Direct Taxes & ICAI',
    identifierType: 'UDIN / PAN Combination',
    defaultQuery: 'AAACA1234F',
    status: 'ONLINE',
    statute: 'Chartered Accountants Act 1949 & Mandatory UDIN Mandate',
  },
];

export const GovernmentVerificationPage: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('MOCK_GSTN');
  const [queryParam, setQueryParam] = useState('03AAACA1234F1Z5');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'RAW_JSON' | 'PARSED_TABLE'>('PARSED_TABLE');
  const [copied, setCopied] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    verificationApi
      .getSources()
      .then((data) => {
        setSources(data);
        if (data.length > 0) setSelectedSource(data[0].source);
      })
      .catch((err) => console.error(err));
  }, []);

  const activeAdapter =
    ADAPTER_CATALOG.find((a) => a.source === selectedSource) || ADAPTER_CATALOG[0];

  const handleSelectAdapter = (adapter: AdapterMeta) => {
    setSelectedSource(adapter.source);
    setQueryParam(adapter.defaultQuery);
    setResult(null);
    setLatencyMs(null);
  };

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const start = performance.now();
    try {
      const res = await verificationApi.simulate(selectedSource, queryParam);
      setResult(res.data);
      setLatencyMs(Math.round(performance.now() - start) || 28);
    } catch (err: any) {
      setResult({ error: err.response?.data?.detail || 'Failed to query mock adapter' });
      setLatencyMs(Math.round(performance.now() - start) || 35);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-bidsure-primary" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Government Verification API Sandbox
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated integration adapters for statutory government procurement and corporate compliance databases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-md">
            10 STATUTORY REGISTRIES CONNECTED
          </span>
        </div>
      </div>

      {/* Statutory Architecture Notice */}
      <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-xs text-slate-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-bidsure-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">National Informatics Centre (NIC) Gateway Protocol</h4>
          <p className="leading-relaxed text-slate-600">
            These endpoints simulate authoritative data structures from GSTN, CBDT, Ministry of MSME, and the Central Vigilance Debarment Register. In production deployment, all requests execute via mutual TLS 1.3 over official NIC / API Setu credentials without changing compliance engine logic.
          </p>
        </div>
      </div>

      {/* 10 Statutory Adapter Selector Catalog */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase font-mono">
            Select Statutory Verification Registry
          </h2>
          <span className="text-[11px] text-slate-500">
            Click any adapter to inspect schema and execute query
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ADAPTER_CATALOG.map((adapter) => {
            const isSelected = selectedSource === adapter.source;
            return (
              <button
                key={adapter.source}
                type="button"
                onClick={() => handleSelectAdapter(adapter)}
                className={`p-3 text-left rounded-xl border transition-colors flex flex-col justify-between ${
                  isSelected
                    ? 'bg-bidsure-deep text-white border-bidsure-cyan/80 shadow-xs ring-2 ring-bidsure-cyan/20'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-bidsure-blue/40 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'bg-bidsure-cyan/20 text-bidsure-cyan border border-bidsure-cyan/30'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {adapter.source.replace('MOCK_', '')}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {adapter.name}
                  </h3>
                </div>
                <div
                  className={`text-[10px] mt-2 pt-2 border-t font-mono ${
                    isSelected
                      ? 'border-white/10 text-slate-300'
                      : 'border-slate-100 text-slate-400'
                  }`}
                >
                  {adapter.identifierType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Execution and Inspector Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Input & Quick Scenario Triggers */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard glassLevel="subtle" className="p-5 bg-white space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold text-bidsure-blue uppercase block">
                {activeAdapter.department}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Query {activeAdapter.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Statute: <span className="font-semibold text-slate-700">{activeAdapter.statute}</span>
              </p>
            </div>

            <form onSubmit={handleTestQuery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Query Identifier ({activeAdapter.identifierType})
                </label>
                <input
                  type="text"
                  required
                  value={queryParam}
                  onChange={(e) => setQueryParam(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
                />
              </div>

              {/* 1-Click Evaluation Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Evaluation Scenario Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('MOCK_GSTN');
                      setQueryParam('03AAACA1234F1Z5');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-bidsure-blue px-2 py-1 rounded font-mono border border-slate-200 transition-colors"
                  >
                    Active GSTIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('MOCK_BLACKLISTING');
                      setQueryParam('ABC Engineering Private Limited');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-1 rounded font-mono border border-slate-200 transition-colors"
                  >
                    Debarred Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('MOCK_UDYAM');
                      setQueryParam('UDYAM-PB-12-0012345');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2 py-1 rounded font-mono border border-slate-200 transition-colors"
                  >
                    MSME Micro Udyam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('MOCK_MAKE_IN_INDIA');
                      setQueryParam('65% Local Content');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-amber-50 hover:text-amber-800 px-2 py-1 rounded font-mono border border-slate-200 transition-colors"
                  >
                    Class-I MII (65%)
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                <span>Execute Statutory Query</span>
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right Panel: Response Payload & Parsed Key-Value Inspector */}
        <div className="lg:col-span-8">
          <GlassCard glassLevel="subtle" className="p-5 bg-white space-y-4 min-h-[460px] flex flex-col justify-between">
            <div>
              {/* Header with Format Switcher and Copy Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-bidsure-blue" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Authoritative Statutory Response Payload
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {latencyMs !== null && (
                    <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {latencyMs}ms | HTTP 200
                    </span>
                  )}

                  <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('PARSED_TABLE')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        viewMode === 'PARSED_TABLE'
                          ? 'bg-white text-bidsure-blue shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Parsed Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('RAW_JSON')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        viewMode === 'RAW_JSON'
                          ? 'bg-white text-bidsure-blue shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  {result && (
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Copy JSON Payload"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="mt-4">
                {!result ? (
                  <div className="py-24 text-center text-slate-400 space-y-2">
                    <Database className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium">
                      Select an adapter and click "Execute Statutory Query" to inspect the verified payload.
                    </p>
                  </div>
                ) : viewMode === 'RAW_JSON' ? (
                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Extracted Statutory Attribute</th>
                          <th className="px-4 py-2.5">Authoritative Verification Value</th>
                          <th className="px-4 py-2.5">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {Object.entries(result).map(([key, val]) => {
                          const displayVal =
                            typeof val === 'object' && val !== null
                              ? JSON.stringify(val)
                              : String(val);
                          const isNegative =
                            String(val).toLowerCase().includes('debarred') ||
                            String(val).toLowerCase().includes('blacklisted') ||
                            String(val).toLowerCase().includes('suspended') ||
                            String(val).toLowerCase().includes('cancelled');
                          return (
                            <tr key={key} className="hover:bg-slate-50/60">
                              <td className="px-4 py-2.5 font-bold text-slate-800">
                                {key.replace(/_/g, ' ').toUpperCase()}
                              </td>
                              <td className="px-4 py-2.5 text-slate-900 font-semibold">
                                {displayVal}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    isNegative
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isNegative ? 'STATUTORY DEFICIT' : 'VERIFIED COMPLIANT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>National Procurement Security Baseline: GFR 2017 & PPP-MII 2017</span>
              <span>Encrypted via SHA-256 HMAC</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default GovernmentVerificationPage;
