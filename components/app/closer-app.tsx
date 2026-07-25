'use client';

import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import { CloserExperienceDeepgram } from '@/components/closer/closer-experience-deepgram';
import { Toaster } from '@/components/ui/sonner';

/**
 * App-Einstieg für die Deepgram-Voice-Agent-Engine (kein LiveKit-Provider nötig).
 * Rendert die Orb-Erfahrung plus den Toaster für nutzerfreundliche Fehler.
 */
export function CloserApp() {
  return (
    <>
      <main className="relative min-h-svh w-full">
        <CloserExperienceDeepgram />
      </main>
      <Toaster
        icons={{ warning: <WarningIcon weight="bold" /> }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </>
  );
}
