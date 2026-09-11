import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AmbientBackgroundProps {
  intensity?: 'none' | 'subtle' | 'elevated' | 'intelligence';
  className?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  intensity = 'subtle',
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  if (intensity === 'none') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* Top Right Cyan Glow */}
      <div
        className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full filter blur-[120px] ${
          reducedMotion ? '' : 'ambient-blob-1'
        } ${
          intensity === 'intelligence'
            ? 'bg-gradient-to-br from-bidsure-cyan/20 to-bidsure-blue/15'
            : intensity === 'elevated'
            ? 'bg-gradient-to-br from-blue-400/15 to-cyan-300/10'
            : 'bg-gradient-to-br from-blue-300/10 to-transparent'
        }`}
      />

      {/* Bottom Left Deep Navy/Blue Glow */}
      <div
        className={`absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full filter blur-[140px] ${
          reducedMotion ? '' : 'ambient-blob-2'
        } ${
          intensity === 'intelligence'
            ? 'bg-gradient-to-tr from-bidsure-deep/40 to-blue-900/20'
            : intensity === 'elevated'
            ? 'bg-gradient-to-tr from-slate-300/20 to-blue-200/15'
            : 'bg-gradient-to-tr from-slate-200/15 to-transparent'
        }`}
      />
    </div>
  );
};
