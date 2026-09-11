import React from 'react';
import { AlertCircle } from 'lucide-react';

export const GovernmentDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 max-w-5xl">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <div>
          <span className="font-semibold">DEMO ENVIRONMENT:</span> Government verification (GSTN, Udyam, CBDT PAN, CVC Debarment, MCA, ITR) is simulated using mock API adapters with realistic statutory schemas. Production deployment requires authorized NIC/GeM government gateway credentials.
        </div>
      </div>
      <span className="shrink-0 bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded text-[11px] font-mono font-medium ml-3">
        SIMULATED ADAPTERS ACTIVE
      </span>
    </div>
  );
};
