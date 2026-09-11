import React, { useState, useEffect } from 'react';
import {
  FileUp,
  ScanLine,
  Database,
  ListFilter,
  Search,
  Scale,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export type PipelineStageStatus = 'idle' | 'processing' | 'complete' | 'warning' | 'failed';

export interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  status: PipelineStageStatus;
  durationMs?: number;
}

export interface AIProcessingPipelineProps {
  isSimulating?: boolean;
  onSimulationComplete?: () => void;
  className?: string;
}

export const AIProcessingPipeline: React.FC<AIProcessingPipelineProps> = ({
  isSimulating = false,
  onSimulationComplete,
  className = '',
}) => {
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: 'ingestion',
      name: 'Document Ingestion',
      subtitle: 'Multi-document statutory PDF ingestion & SHA-256 integrity hash verification',
      icon: <FileUp className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'ocr',
      name: 'OCR & Layout Engine',
      subtitle: 'Tesseract & PyMuPDF optical parsing with tabular bounding box detection',
      icon: <ScanLine className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'entity_extraction',
      name: 'Entity Extraction',
      subtitle: 'Extracting CIN, PAN, GSTIN, UDIN, and audited turnover figures',
      icon: <Database className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'requirement_extraction',
      name: 'Requirement Extraction',
      subtitle: 'Parsing tender clauses for mandatory GFR thresholds & local content',
      icon: <ListFilter className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'evidence_matching',
      name: 'Evidence Provenance Matching',
      subtitle: 'Semantic RAG vector alignment mapping claims to exact document pages',
      icon: <Search className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'rule_evaluation',
      name: 'Deterministic Rule Evaluation',
      subtitle: 'Applying the 7 statutory procurement criteria & GFR 2017 norms',
      icon: <Scale className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'risk_analysis',
      name: 'Risk & Contradiction Analysis',
      subtitle: 'Cross-checking registry records against shell entities and debarments',
      icon: <ShieldAlert className="w-4 h-4" />,
      status: 'complete',
    },
    {
      id: 'report_generation',
      name: 'Cryptographic Dossier Generation',
      subtitle: 'Assembling legal evaluation summary with immutable audit timestamp',
      icon: <FileCheck className="w-4 h-4" />,
      status: 'complete',
    },
  ]);

  const [activeSimulationIndex, setActiveSimulationIndex] = useState<number | null>(null);

  const startDemoSimulation = () => {
    // Reset all to idle
    setStages((prev) => prev.map((s) => ({ ...s, status: 'idle' })));
    setActiveSimulationIndex(0);
  };

  useEffect(() => {
    if (activeSimulationIndex === null) return;

    if (activeSimulationIndex < stages.length) {
      // Set current to processing
      setStages((prev) =>
        prev.map((s, idx) =>
          idx === activeSimulationIndex
            ? { ...s, status: 'processing' }
            : idx < activeSimulationIndex
            ? { ...s, status: 'complete' }
            : { ...s, status: 'idle' }
        )
      );

      const timer = setTimeout(() => {
        // Complete current stage
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === activeSimulationIndex ? { ...s, status: 'complete' } : s
          )
        );
        setActiveSimulationIndex((curr) => (curr !== null ? curr + 1 : null));
      }, 700);

      return () => clearTimeout(timer);
    } else {
      // Completed all
      setActiveSimulationIndex(null);
      if (onSimulationComplete) onSimulationComplete();
    }
  }, [activeSimulationIndex, stages.length, onSimulationComplete]);

  return (
    <GlassCard glassLevel="intelligence" className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bidsure-cyan animate-pulse" />
            <h3 className="text-sm font-bold text-white">
              AI Multi-Stage Scrutiny & Reasoning Pipeline
            </h3>
          </div>
          <p className="text-xs text-blue-200/80">
            End-to-end ingestion, optical character parsing, deterministic scoring, and provenance audit.
          </p>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={startDemoSimulation}
          disabled={activeSimulationIndex !== null}
          className="self-start sm:self-auto shrink-0"
        >
          {activeSimulationIndex !== null ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-bidsure-cyan" />
              <span>Processing Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-bidsure-cyan" />
              <span>Run Pipeline Simulation</span>
            </>
          )}
        </Button>
      </div>

      {/* Pipeline Stages Vertical Tree */}
      <div className="space-y-3 relative">
        {stages.map((stage, idx) => {
          const isComplete = stage.status === 'complete';
          const isProcessing = stage.status === 'processing';
          const isIdle = stage.status === 'idle';

          return (
            <div key={stage.id} className="relative flex items-start gap-4">
              {/* Connector Line to next item */}
              {idx < stages.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-7 transition-colors duration-300 ${
                    isComplete ? 'bg-bidsure-cyan/60' : 'bg-white/10'
                  }`}
                />
              )}

              {/* Node Icon Circle */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 z-10 ${
                  isComplete
                    ? 'bg-bidsure-deep border-bidsure-cyan text-bidsure-cyan shadow-glass-intelligence'
                    : isProcessing
                    ? 'bg-blue-900 border-white text-white animate-pulse shadow-ai-glow'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-bidsure-cyan" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-bidsure-cyan" />
                ) : (
                  stage.icon
                )}
              </div>

              {/* Text Card */}
              <div
                className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${
                  isProcessing
                    ? 'bg-bidsure-primary/90 border-bidsure-cyan shadow-glass-intelligence'
                    : isComplete
                    ? 'bg-white/5 border-white/10'
                    : 'bg-transparent border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {idx + 1}. {stage.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isProcessing
                        ? 'bg-bidsure-cyan/20 text-bidsure-cyan border border-bidsure-cyan/40 animate-pulse'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/70 mt-0.5 leading-snug">
                  {stage.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default AIProcessingPipeline;
