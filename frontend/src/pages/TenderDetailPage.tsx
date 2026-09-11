import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  ShieldCheck,
  Search,
  Building2,
} from 'lucide-react';
import { tendersApi } from '../services/api';
import { Tender, Bidder } from '../types';
import { GlassCard, Button, StatusBadge, RiskBadge } from '../components/ui';

export const TenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tender, setTender] = useState<Tender | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidderSearch, setBidderSearch] = useState('');

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([tendersApi.getById(id), tendersApi.getBidders(id)])
      .then(([tData, bData]) => {
        setTender(tData);
        setBidders(bData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-bidsure-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tender) {
    return <div className="text-center py-10 text-slate-500">Tender record not found.</div>;
  }

  const criticalCount = tender.requirements?.filter((r) => r.is_critical).length || 0;
  const filteredBidders = bidders.filter(
    (b) =>
      b.company_name.toLowerCase().includes(bidderSearch.toLowerCase()) ||
      (b.gstin && b.gstin.toLowerCase().includes(bidderSearch.toLowerCase())) ||
      (b.pan && b.pan.toLowerCase().includes(bidderSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <button
        onClick={() => navigate('/tenders')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Procurement Tenders</span>
      </button>

      {/* Tender Header Card */}
      <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-bidsure-primary bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {tender.tender_number}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-semibold border border-emerald-200">
                {tender.status}
              </span>
              <span className="text-xs text-slate-500 font-medium border-l border-slate-200 pl-2">
                Category: <strong>{tender.category || 'Machinery & Capital Equipment'}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{tender.title}</h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              {tender.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Estimated Tender Budget</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                ₹{(tender.estimated_value / 10000000).toFixed(1)} Crore
              </span>
            </div>
          </div>
        </div>

        {/* Tender Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Total Criteria
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {tender.requirements?.length || 0} Rules
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Critical Override Rules
            </span>
            <span className="text-base font-bold font-mono text-rose-700">
              {criticalCount} Mandatory
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Bidders Under Scrutiny
            </span>
            <span className="text-base font-bold font-mono text-bidsure-blue">
              {bidders.length} Enrolled
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Statutory Standard
            </span>
            <span className="text-base font-bold text-emerald-700">
              GFR 2017 & PPP-MII
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Requirements Matrix Section */}
      <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Eligibility Checklist ({tender.requirements?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mathematical criteria verified deterministically against official national databases.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-bidsure-blue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            RULE ENGINE v2.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tender.requirements?.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2 hover:border-bidsure-blue/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-bidsure-primary">
                    {req.rule_type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-blue-50 text-bidsure-blue font-bold px-1.5 py-0.5 rounded border border-blue-200">
                      {req.weight}%
                    </span>
                    {req.is_critical && (
                      <span className="text-[10px] font-mono bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1.5">{req.description}</p>
              </div>
              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5 flex justify-between">
                <span>Verification Threshold:</span>
                <span className="font-semibold font-mono text-slate-800">
                  {req.expected_text || 'Active & Valid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Participating Bidders Table */}
      <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-bidsure-blue" />
              <span>Participating Bidders ({bidders.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any bidder to launch the 3-panel compliance verification workstation.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter bidders by name, GSTIN..."
              value={bidderSearch}
              onChange={(e) => setBidderSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Bidder Enterprise</th>
                <th className="px-4 py-3">Corporate Identifiers</th>
                <th className="px-4 py-3">Database Verification</th>
                <th className="px-4 py-3">Compliance Score</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Officer Determination</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBidders.map((b) => {
                const isBenchmark = b.company_name.includes('ABC Engineering');
                return (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/bidders/${b.id}`)}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      isBenchmark ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{b.company_name}</span>
                        {isBenchmark && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold border border-amber-300">
                            BENCHMARK
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {b.udyam_number || 'MSME General Category'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      <div>GST: {b.gstin || 'NOT PROVIDED'}</div>
                      <div className="text-slate-400">PAN: {b.pan || 'NOT PROVIDED'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.verification_status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {b.compliance_score.toFixed(1)}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={b.risk_level} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.officer_decision_status || 'UNDER_REVIEW'} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bidders/${b.id}`);
                        }}
                        className="text-xs ml-auto"
                      >
                        <span>Inspect Dossier</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default TenderDetailPage;
