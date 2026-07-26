'use client';

import { type CloserState } from '@/lib/closer-state';
import { uiText } from '@/lib/ui-text';
import { cn } from '@/lib/utils';

interface CloserStatusProps {
  state: CloserState;
  className?: string;
}

/**
 * Statuszeile unter dem Orb. Kommuniziert den Zustand über Text UND ein
 * Symbol/Animation (nicht rein farbbasiert). Änderungen werden per
 * aria-live für Screenreader angekündigt.
 */
export function CloserStatus({ state, className }: CloserStatusProps) {
  const label = uiText.status[state];

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2.5 text-sm font-medium tracking-wide',
        className
      )}
      aria-live="polite"
      role="status"
    >
      <span className={cn('status-dot', `status-dot--${state}`)} aria-hidden="true" />
      <span className="text-cream/90">{label}</span>
    </div>
  );
}
