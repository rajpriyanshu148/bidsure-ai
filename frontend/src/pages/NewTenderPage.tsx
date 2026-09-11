import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
} from 'lucide-react';
import { tendersApi } from '../services/api';
import { GlassCard, Button } from '../components/ui';

export const NewTenderPage: React.FC = () => {
  const navigate = useNavigate();

  const [tenderNumber, setTenderNumber] = useState(
    `GEM/2026/B/BID${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Machinery & Capital Equipment');
  const [estimatedValue, setEstimatedValue] = useState<number>(450000000);
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState<any[]>([
    {
      rule_type: 'TURNOVER',
      description: 'Minimum average annual turnover for past 3 years with valid UDIN',
      min_value: 100000000,
      currency: 'INR',
      weight: 20,
      mandatory: true,
      is_critical: true,
    },
    {
      rule_type: 'GST',
      description: 'Active GSTIN registration certificate and GSTR-3B return compliance',
      weight: 15,
      mandatory: true,
      is_critical: false,
    },
    {
      rule_type: 'PAN',
      description: 'Valid Permanent Account Number (PAN) issued by Income Tax Department',
      weight: 10,
      mandatory: true,
      is_critical: false,
    },
    {
      rule_type: 'UDYAM',
      description: 'MSME Udyam Registration Certificate under relevant manufacturing NIC code',
      weight: 10,
      mandatory: true,
      is_critical: false,
    },
    {
      rule_type: 'OEM_AUTHORIZATION',
      description: 'Tender-specific Manufacturer Authorization Form (MAF / Form-C)',
      weight: 15,
      mandatory: true,
      is_critical: false,
    },
    {
      rule_type: 'LOCAL_CONTENT',
      description: 'Minimum 50% Local Content under Public Procurement (Preference to Make in India)',
      min_value: 50,
      weight: 15,
      mandatory: true,
      is_critical: false,
    },
    {
      rule_type: 'EXPERIENCE',
      description: 'Past execution of similar government contracts valued >= 50% of estimated value',
      weight: 15,
      mandatory: true,
      is_critical: false,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalWeight = requirements.reduce((acc, r) => acc + (Number(r.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const loadMachineryTemplate = () => {
    setTitle('Supply and Commissioning of Industrial Centrifugal Water Pumps');
    setDescription(
      'Supply, testing, and 3-year comprehensive warranty maintenance of multi-stage industrial centrifugal pumping sets for state irrigation infrastructure.'
    );
    setCategory('Machinery & Capital Equipment');
    setEstimatedValue(450000000);
  };

  const loadITTemplate = () => {
    setTitle('Procurement of Enterprise Data Center Servers and Storage Blades');
    setDescription(
      'Supply, installation, and 5-year 24x7 mission-critical support for rackmount hyperconverged compute nodes complying with MeitY security guidelines.'
    );
    setCategory('IT Hardware & Infrastructure');
    setEstimatedValue(280000000);
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a tender title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const created = await tendersApi.create({
        tender_number: tenderNumber,
        title,
        description,
        category,
        estimated_value: Number(estimatedValue),
        requirements,
      });

      if (file) {
        await tendersApi.uploadDocument(created.id, file);
      }

      navigate(`/tenders/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create tender');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, idx) => idx !== index));
  };

  const addEmptyRequirement = () => {
    setRequirements([
      ...requirements,
      {
        rule_type: 'CUSTOM',
        description: 'New statutory or technical condition',
        weight: 10,
        mandatory: true,
        is_critical: false,
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate('/tenders')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Tenders</span>
      </button>

      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-bidsure-primary" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Procurement Tender
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define tender parameters and configure deterministic AI compliance evaluation rules.
          </p>
        </div>

        {/* Quick Template Fill Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMachineryTemplate}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            Load Machinery Template
          </button>
          <button
            type="button"
            onClick={loadITTemplate}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            Load IT Server Template
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateTender} className="space-y-6">
        {/* Basic Specifications Card */}
        <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. GeM Tender Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tender Reference Number *
              </label>
              <input
                type="text"
                required
                value={tenderNumber}
                onChange={(e) => setTenderNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procurement Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tender Scope & Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Procurement of High-Capacity Industrial Centrifugal Pumps"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Tender Value (INR) *
              </label>
              <input
                type="number"
                required
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                ₹{(estimatedValue / 10000000).toFixed(2)} Crore
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attach Tender RFP Document (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-bidsure-blue hover:file:bg-blue-100"
              />
              {file && (
                <span className="text-[11px] font-mono text-emerald-700 mt-1 block">
                  Attached: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Scope Clauses & Technical Conditions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed scope, technical guidelines, statutory requirements, warranty terms..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-bidsure-blue focus:outline-none"
            />
          </div>
        </GlassCard>

        {/* Structured Compliance Checklist Card */}
        <GlassCard glassLevel="subtle" className="p-6 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Multi-Criteria Scrutiny Checklist ({requirements.length} Rules)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic rules verified during bidder scrutiny. Weights must sum to 100%.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  isWeightValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {isWeightValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Total Weight: {totalWeight}% / 100%</span>
              </div>

              <button
                type="button"
                onClick={addEmptyRequirement}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                      Rule Type
                    </span>
                    <span className="text-xs font-mono font-bold text-bidsure-primary">
                      {req.rule_type}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                      Verification Condition
                    </span>
                    <input
                      type="text"
                      value={req.description}
                      onChange={(e) => {
                        const updated = [...requirements];
                        updated[idx].description = e.target.value;
                        setRequirements(updated);
                      }}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        Weight %
                      </span>
                      <input
                        type="number"
                        value={req.weight}
                        onChange={(e) => {
                          const updated = [...requirements];
                          updated[idx].weight = Number(e.target.value);
                          setRequirements(updated);
                        }}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                    </div>
                    {req.is_critical && (
                      <span className="text-[10px] font-mono bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded mt-3">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeRequirement(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/tenders')}
          >
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={!isWeightValid}
          >
            <span>Publish Tender & Activate Scrutiny Pipeline</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTenderPage;
