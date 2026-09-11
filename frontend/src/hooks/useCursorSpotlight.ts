import { useState, useCallback, MouseEvent } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface SpotlightState {
  x: number;
  y: number;
  opacity: number;
}

export const useCursorSpotlight = () => {
  const reducedMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState<SpotlightState>({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setSpotlight({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        opacity: 1,
      });
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return {
    spotlight,
    handleMouseMove,
    handleMouseLeave,
    reducedMotion,
  };
};
