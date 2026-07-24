'use client';

import type { CloserPhase } from '@/hooks/useCloserState';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserStatusProps {
  phase: CloserPhase;
  className?: string;
}

const PHASE_TEXT: Record<CloserPhase, string> = {
  idle: CLOSER_CONTENT.status.idle,
  connecting: CLOSER_CONTENT.status.connecting,
  listening: CLOSER_CONTENT.status.listening,
  thinking: CLOSER_CONTENT.status.thinking,
  speaking: CLOSER_CONTENT.status.speaking,
};

/**
 * Zeigt den aktuellen Agentenzustand als Text (Sektion 5 & 19).
 * Der Zustand wird nie nur über Farbe kommuniziert: ein sichtbarer Text und
 * eine `aria-live`-Region sorgen für Barrierefreiheit. Der pulsierende Punkt
 * ist nur eine zusätzliche, dekorative Verstärkung.
 */
export function CloserStatus({ phase, className }: CloserStatusProps) {
  const active = phase !== 'idle';

  return (
    <div
      className={cn(
        'border-gold/20 inline-flex items-center gap-2.5 rounded-full border bg-black/30 px-4 py-2 backdrop-blur-sm',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-full',
          active ? 'bg-gold-light' : 'bg-cream-muted',
          (phase === 'connecting' || phase === 'thinking' || phase === 'speaking') &&
            'closer-anim-halo-pulse'
        )}
      />
      <span
        aria-live="polite"
        className="text-cream font-mono text-xs font-semibold tracking-wide uppercase"
      >
        {PHASE_TEXT[phase]}
      </span>
    </div>
  );
}
