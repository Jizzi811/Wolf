'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AmbientBackground } from '@/components/closer/ambient-background';
import { CloserControlsBase } from '@/components/closer/closer-controls-base';
import { CloserHero } from '@/components/closer/closer-hero';
import { CloserOrb } from '@/components/closer/closer-orb';
import { CloserStatus } from '@/components/closer/closer-status';
import { CloserTranscriptView } from '@/components/closer/closer-transcript-view';
import { useDeepgramCloser } from '@/hooks/useDeepgramCloser';
import { CLOSER_CONTENT } from '@/lib/closer-content';

/**
 * CLOSER-Erfahrung mit der Deepgram-Voice-Agent-Engine (kein LiveKit).
 * Nutzt dieselbe Orb-Oberfläche wie die LiveKit-Variante – nur die
 * "Sprech-Maschine" darunter ist eine andere (Sektion 6 & 9).
 */
export function CloserExperienceDeepgram() {
  const { phase, volume, transcript, isConnected, micEnabled, start, end, toggleMic } =
    useDeepgramCloser();
  const [chatOpen, setChatOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!isConnected) setChatOpen(false);
  }, [isConnected]);

  const handleStart = async () => {
    if (starting || isConnected) return;
    setStarting(true);
    try {
      await start();
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <AmbientBackground />

      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center gap-8 px-5 py-16 md:grid md:grid-cols-2 md:items-center md:gap-12 md:py-20">
        <div className="order-2 flex w-full justify-center md:order-1 md:justify-start">
          <div className="w-full max-w-xl">
            <CloserHero phase={phase} starting={starting} onStart={handleStart} />
          </div>
        </div>

        <div className="order-1 flex w-full flex-col items-center gap-5 md:order-2">
          <span className="text-gold-light/90 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            {CLOSER_CONTENT.agentName} · {CLOSER_CONTENT.agentTagline}
          </span>

          {/* Kein LiveKit-Track -> Orb reagiert rein über Phase + Lautstärke. */}
          <CloserOrb phase={phase} volume={volume} isConnected={isConnected} />

          <CloserStatus phase={phase} className="mt-2" />

          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <CloserControlsBase
                  micOn={micEnabled}
                  onToggleMic={toggleMic}
                  onEnd={end}
                  chatOpen={chatOpen}
                  onToggleChat={() => setChatOpen((v) => !v)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CloserTranscriptView
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={transcript}
      />

      <footer className="text-cream-muted/70 pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-3 text-center">
        <p className="mx-auto max-w-3xl text-[11px] leading-4 text-pretty">
          {CLOSER_CONTENT.footer}
        </p>
      </footer>
    </>
  );
}
