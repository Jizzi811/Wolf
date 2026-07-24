'use client';

import { useCallback, useEffect, useState } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AmbientBackground } from '@/components/closer/ambient-background';
import { CloserControls } from '@/components/closer/closer-controls';
import { showConnectionError, showMicError } from '@/components/closer/closer-error';
import { CloserHero } from '@/components/closer/closer-hero';
import { CloserOrb } from '@/components/closer/closer-orb';
import { CloserStatus } from '@/components/closer/closer-status';
import { CloserTranscript } from '@/components/closer/closer-transcript';
import { useCloserState } from '@/hooks/useCloserState';
import { CLOSER_CONTENT } from '@/lib/closer-content';

interface CloserExperienceProps {
  appConfig: AppConfig;
}

/**
 * Zentrale Einseiten-Erfahrung von CLOSER (Sektion 6 & 9).
 *
 * Hintergrund und Orb bleiben über alle Zustände hinweg der visuelle
 * Mittelpunkt. Vor der Verbindung erscheint die Hero-Spalte, während der
 * Session die Steuerung und das optionale Transkript. Die gesamte
 * Session-Logik läuft über den vorhandenen LiveKit-Context – hier wird nichts
 * dupliziert (Sektion 16).
 */
export function CloserExperience({ appConfig }: CloserExperienceProps) {
  const session = useSessionContext();
  const { phase, isConnected, volume, audioTrack } = useCloserState();
  const [chatOpen, setChatOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  // Transkript schließen, sobald die Session endet.
  useEffect(() => {
    if (!isConnected) setChatOpen(false);
  }, [isConnected]);

  const handleStart = useCallback(async () => {
    if (starting || session.isConnected) return;
    setStarting(true);
    try {
      await session.start();
    } catch (error) {
      await showConnectionError(error);
    } finally {
      setStarting(false);
    }
  }, [session, starting]);

  const handleDeviceError = useCallback(
    ({ source, error }: { source: Track.Source; error: Error }) => {
      if (source === Track.Source.Microphone) {
        showMicError(error);
      }
    },
    []
  );

  return (
    <>
      <AmbientBackground />

      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center gap-8 px-5 py-16 md:grid md:grid-cols-2 md:items-center md:gap-12 md:py-20">
        {/* Marken-/Steuerspalte (links auf Desktop, unten auf Mobile) */}
        <div className="order-2 flex w-full justify-center md:order-1 md:justify-start">
          <div className="w-full max-w-xl">
            <CloserHero phase={phase} starting={starting} onStart={handleStart} />
          </div>
        </div>

        {/* Orb-Bühne (rechts auf Desktop, oben auf Mobile) */}
        <div className="order-1 flex w-full flex-col items-center gap-5 md:order-2">
          <span className="text-gold-light/90 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            {CLOSER_CONTENT.agentName} · {CLOSER_CONTENT.agentTagline}
          </span>

          <CloserOrb
            phase={phase}
            volume={volume}
            audioTrack={audioTrack}
            isConnected={isConnected}
          />

          <CloserStatus phase={phase} className="mt-2" />

          {/* Steuerung erscheint nur während der Session */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <CloserControls
                  chatOpen={chatOpen}
                  onToggleChat={() => setChatOpen((v) => !v)}
                  supportsChatInput={appConfig.supportsChatInput}
                  onDeviceError={handleDeviceError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Aufklappbares Transkript */}
      <CloserTranscript
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        supportsChatInput={appConfig.supportsChatInput}
      />

      {/* Footer-Hinweis (Sektion 7) */}
      <footer className="text-cream-muted/70 pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-3 text-center">
        <p className="mx-auto max-w-3xl text-[11px] leading-4 text-pretty">
          {CLOSER_CONTENT.footer}
        </p>
      </footer>
    </>
  );
}
