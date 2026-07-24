'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MicIcon, MicOffIcon, PhoneOffIcon } from 'lucide-react';
import type { AppConfig } from '@/app-config';
import { AmbientBackground } from '@/components/closer/ambient-background';
import { showMicError } from '@/components/closer/closer-error';
import { CloserHero } from '@/components/closer/closer-hero';
import { CloserOrb } from '@/components/closer/closer-orb';
import { CloserStatus } from '@/components/closer/closer-status';
import { Button } from '@/components/ui/button';
import { useSimpleVoiceAgent } from '@/hooks/useSimpleVoiceAgent';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserExperienceProps {
  appConfig: AppConfig;
}

export function CloserExperience({ appConfig: _appConfig }: CloserExperienceProps) {
  const {
    phase,
    isConnected,
    volume,
    transcript,
    micEnabled,
    startListening,
    stopSession,
    toggleMic,
  } = useSimpleVoiceAgent();
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    if (starting || isConnected) return;
    setStarting(true);
    try {
      await startListening();
    } catch (error) {
      showMicError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setStarting(false);
    }
  }, [starting, isConnected, startListening]);

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

          <CloserOrb phase={phase} volume={volume} isConnected={isConnected} />

          <CloserStatus phase={phase} className="mt-2" />

          {/* Laufendes Transkript (Interim-Ergebnis der Spracheingabe) */}
          <AnimatePresence>
            {isConnected && transcript && (
              <motion.p
                key="transcript"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-cream-muted/80 max-w-xs text-center text-sm italic"
              >
                {transcript}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Steuerleiste erscheint nur während der Session */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div
                  aria-label="Gesprächssteuerung"
                  className="border-gold/20 flex items-center gap-2 rounded-full border bg-black/40 p-2 backdrop-blur-md"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleMic}
                    aria-pressed={micEnabled}
                    aria-label={micEnabled ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
                    className={cn(
                      'size-11 rounded-full transition-colors',
                      micEnabled
                        ? 'text-cream hover:bg-gold/15'
                        : 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                    )}
                  >
                    {micEnabled ? (
                      <MicIcon className="size-5" />
                    ) : (
                      <MicOffIcon className="size-5" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={stopSession}
                    className="text-destructive bg-destructive/10 hover:bg-destructive/20 h-11 gap-2 rounded-full px-5 font-mono text-xs font-bold tracking-wider uppercase"
                  >
                    <PhoneOffIcon className="size-4" />
                    <span className="hidden sm:inline">{CLOSER_CONTENT.buttons.end}</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer-Hinweis */}
      <footer className="text-cream-muted/70 pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-3 text-center">
        <p className="mx-auto max-w-3xl text-[11px] leading-4 text-pretty">
          {CLOSER_CONTENT.footer}
        </p>
      </footer>
    </>
  );
}
