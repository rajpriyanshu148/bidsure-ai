import React from 'react';

export interface ProgressRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  label?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  maxScore = 100,
  size = 110,
  strokeWidth = 9,
  showText = true,
  label = 'COMPLIANCE',
  className = '',
}) => {
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / maxScore) * circumference;
  const dashoffset = circumference - progress;

  // Determine color based on score thresholds
  let strokeColor = '#16A34A'; // emerald (>= 80)
  let textColor = 'text-emerald-700';
  if (normalizedScore < 50) {
    strokeColor = '#DC2626'; // rose
    textColor = 'text-rose-700';
  } else if (normalizedScore < 80) {
    strokeColor = '#D97706'; // amber
    textColor = 'text-amber-700';
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-xl font-extrabold tracking-tight ${textColor} font-mono`}>
            {normalizedScore.toFixed(0)}%
          </span>
          {label && (
            <span className="text-[10px] font-semibold text-slate-500">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
