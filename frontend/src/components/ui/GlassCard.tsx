import React, { forwardRef } from 'react';
import { useCursorSpotlight } from '../../hooks/useCursorSpotlight';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glassLevel?: 'subtle' | 'elevated' | 'intelligence';
  enableSpotlight?: boolean;
  spotlightColor?: string;
  isHoverable?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      glassLevel = 'subtle',
      enableSpotlight = true,
      spotlightColor,
      isHoverable = false,
      className = '',
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const { spotlight, handleMouseMove, handleMouseLeave, reducedMotion } = useCursorSpotlight();

    const levelClasses = {
      subtle: 'glass-subtle rounded-xl',
      elevated: 'glass-elevated rounded-xl',
      intelligence: 'glass-intelligence rounded-xl',
    };

    const hoverClass = isHoverable
      ? 'transition-colors duration-150 hover:border-bidsure-blue/40'
      : '';

    return (
      <div
        ref={ref}
        className={`cursor-spotlight-container relative ${levelClasses[glassLevel]} ${hoverClass} ${className}`}
        onMouseMove={(e) => {
          if (enableSpotlight) handleMouseMove(e);
          if (onMouseMove) onMouseMove(e);
        }}
        onMouseLeave={(e) => {
          if (enableSpotlight) handleMouseLeave();
          if (onMouseLeave) onMouseLeave(e);
        }}
        {...props}
      >
        {enableSpotlight && !reducedMotion && spotlight.opacity > 0 && (
          <div
            className="cursor-spotlight pointer-events-none absolute w-64 h-64"
            style={{
              left: `${spotlight.x}px`,
              top: `${spotlight.y}px`,
              opacity: spotlight.opacity,
              background:
                spotlightColor ||
                (glassLevel === 'intelligence'
                  ? 'radial-gradient(circle, rgba(0, 217, 255, 0.18) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(22, 119, 255, 0.10) 0%, transparent 70%)'),
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
