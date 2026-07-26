'use client';

import { type CloserState } from '@/lib/closer-state';
import { cn } from '@/lib/utils';

// Feste Gewichtung pro Balken für eine natürliche, mittig betonte Kurve.
const WEIGHTS = [0.5, 0.72, 0.9, 1, 0.9, 0.72, 0.5];

interface CloserVisualizerProps {
  state: CloserState;
  /** Lautstärke der Agentenstimme (0..1). */
  level: number;
}

/**
 * Schlanke, audio-reaktive Balkenreihe. Nutzt den `volume-level` aus Vapi
 * (0..1). Nur beim Sprechen sichtbar; ansonsten ruht sie.
 */
export function CloserVisualizer({ state, level }: CloserVisualizerProps) {
  const active = state === 'speaking';

  return (
    <div className={cn('closer-visualizer', active && 'is-active')} aria-hidden="true">
      {WEIGHTS.map((w, i) => {
        const height = active ? Math.max(10, Math.min(100, level * w * 130)) : 8;
        return <span key={i} style={{ height: `${height}%` }} />;
      })}
    </div>
  );
}
