import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Plus,
  Briefcase,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { tendersApi } from '../services/api';
import { Tender } from '../types';
import { GlassCard, Button, KpiCard } from '../components/ui';

export const TendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    tendersApi
      .list()
      .then((data) => setTenders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalValueCr =
    tenders.reduce((acc, t) => acc + (t.estimated_value || 0), 0) / 10000000;
  const totalBidders = tenders.reduce((acc, t) => acc + (t.bidders_count || 0), 0);
  const avgScore =
    tenders.length > 0
      ? tenders.reduce((acc, t) => acc + (t.average_score || 0), 0) / tenders.length
      : 0;

  const categories = ['ALL', ...Array.from(new Set(tenders.map((t) => t.category).filter(Boolean)))];

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.tender_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-bidsure-primary" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Procurement Tenders Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active tenders, eligibility rulebooks, and evaluated vendor submissions on Government e-Marketplace.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/bidding')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Company Bidding Portal</span>
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/tenders/new')}
            icon={<Plus className="w-4 h-4" />}
          >
            <span>Create New Tender</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active GeM Tenders"
          value={tenders.length}
          subtitle="Live procurement scopes"
          icon={<FileCheck2 className="w-5 h-5 text-bidsure-blue" />}
        />
        <KpiCard
          title="Total Value Under Scrutiny"
          value={`₹${totalValueCr.toFixed(1)} Cr`}
          subtitle="Aggregate procurement budget"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          title="Participating Bidders"
          value={totalBidders}
          subtitle="Vetted corporate submissions"
          icon={<Building2 className="w-5 h-5 text-purple-600" />}
        />
        <KpiCard
          title="Deterministic Compliance"
          value={`${avgScore.toFixed(1)}%`}
          subtitle="Average rule satisfaction"
          icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Benchmark Scenario Banner */}
      <div className="bg-bidsure-deep text-white rounded-xl p-5 border border-bidsure-blue/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
            <span>OFFICIAL EVALUATION BENCHMARK</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Industrial Heavy-Duty Centrifugal Pump Procurement
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Tender Ref: <strong className="font-mono text-bidsure-softCyan">GEM/2026/B/DEMO001</strong>. Pre-configured benchmark containing multi-document scrutiny for <strong>ABC Engineering Private Limited</strong> exhibiting turnover deficit, missing OEM Form-C, and local content contradictions.
          </p>
        </div>
        <button
          onClick={() => {
            const demo = tenders.find((t) => t.tender_number === 'GEM/2026/B/DEMO001');
            if (demo) navigate(`/tenders/${demo.id}`);
            else if (tenders.length > 0) navigate(`/tenders/${tenders[0].id}`);
          }}
          className="px-4 py-2.5 bg-bidsure-blue hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          <span>Open Benchmark Tender</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tender reference, title, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-bidsure-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Scopes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-bidsure-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
          No procurement tenders match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTenders.map((t) => (
            <GlassCard
              key={t.id}
              glassLevel="subtle"
              onClick={() => navigate(`/tenders/${t.id}`)}
              className="p-5 bg-white cursor-pointer transition-colors flex flex-col justify-between space-y-4 hover:border-bidsure-blue/50"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-bidsure-primary bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                    {t.tender_number}
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    {t.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {t.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {t.description || 'GeM technical specification and eligibility criteria.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Value:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{(t.estimated_value / 10000000).toFixed(1)} Crore
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Registered Bidders:</span>
                  <span className="font-bold text-bidsure-primary">{t.bidders_count || 0} Bidders</span>
                </div>

                {t.average_score !== undefined && t.average_score > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Average Compliance:</span>
                    <span className="font-bold font-mono text-emerald-600">
                      {t.average_score.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <span className="text-xs font-semibold text-bidsure-blue hover:text-blue-800">
                    Inspect Tender Dossier
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default TendersPage;
