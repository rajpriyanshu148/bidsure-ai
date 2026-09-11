import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number; // 0 to 6
  isProcessing?: boolean;
}

const STEPS = [
  'Document Upload',
  'File Validation',
  'OCR & Text Extraction',
  'Entity Normalization',
  'Mock Govt Verification',
  'Compliance Rule Engine',
  'Officer Review & Decision',
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep, isProcessing = false }) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center max-w-[120px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-bidsure-primary text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent && isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[11px] leading-tight ${
                    isCurrent
                      ? 'font-bold text-bidsure-primary'
                      : isCompleted
                      ? 'font-medium text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                    idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
