'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import type { CloserPhase } from '@/hooks/useCloserState';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserOrbProps {
  phase: CloserPhase;
  /** Audiopegel des Agenten (0–1) für die Sprech-Reaktion. */
  volume: number;
  /** Ob eine Session verbunden ist (blendet den Visualizer ein). */
  isConnected?: boolean;
  className?: string;
}

/**
 * Steuert Animationsparameter (als CSS-Variablen) und Grund-Glow je Phase.
 */
const PHASE_CONFIG: Record<
  CloserPhase,
  { vars: React.CSSProperties; baseGlow: number; brightness: number }
> = {
  idle: {
    vars: {
      ['--orb-float-duration' as string]: '8s',
      ['--orb-float-distance' as string]: '8px',
      ['--halo-pulse-duration' as string]: '6s',
      ['--halo-opacity-min' as string]: '0.12',
      ['--halo-opacity-max' as string]: '0.28',
      ['--halo-rotate-duration' as string]: '28s',
    },
    baseGlow: 0.25,
    brightness: 0.9,
  },
  connecting: {
    vars: {
      ['--orb-float-duration' as string]: '6s',
      ['--orb-float-distance' as string]: '10px',
      ['--halo-pulse-duration' as string]: '1.8s',
      ['--halo-opacity-min' as string]: '0.3',
      ['--halo-opacity-max' as string]: '0.7',
      ['--halo-rotate-duration' as string]: '6s',
    },
    baseGlow: 0.5,
    brightness: 1,
  },
  listening: {
    vars: {
      ['--orb-float-duration' as string]: '7s',
      ['--orb-float-distance' as string]: '10px',
      ['--halo-pulse-duration' as string]: '4s',
      ['--halo-opacity-min' as string]: '0.28',
      ['--halo-opacity-max' as string]: '0.5',
      ['--halo-rotate-duration' as string]: '20s',
      ['--ripple-duration' as string]: '3.4s',
    },
    baseGlow: 0.45,
    brightness: 1,
  },
  thinking: {
    vars: {
      ['--orb-float-duration' as string]: '6s',
      ['--orb-float-distance' as string]: '12px',
      ['--halo-pulse-duration' as string]: '2.4s',
      ['--halo-opacity-min' as string]: '0.32',
      ['--halo-opacity-max' as string]: '0.6',
      ['--halo-rotate-duration' as string]: '9s',
      ['--orbit-duration' as string]: '4.5s',
    },
    baseGlow: 0.5,
    brightness: 1.03,
  },
  speaking: {
    vars: {
      ['--orb-float-duration' as string]: '6.5s',
      ['--orb-float-distance' as string]: '11px',
      ['--halo-pulse-duration' as string]: '2.6s',
      ['--halo-opacity-min' as string]: '0.35',
      ['--halo-opacity-max' as string]: '0.65',
      ['--halo-rotate-duration' as string]: '16s',
    },
    baseGlow: 0.55,
    brightness: 1.05,
  },
};

/** Simple bar heights based on position to create a wave shape. */
const BAR_FACTORS = [0.4, 0.7, 1.0, 0.7, 0.4] as const;

export function CloserOrb({ phase, volume, isConnected = false, className }: CloserOrbProps) {
  const [imageOk, setImageOk] = useState(true);
  const config = PHASE_CONFIG[phase];
  const clampedVolume = Math.min(Math.max(volume, 0), 1);

  const isSpeaking = phase === 'speaking';
  const orbScale = isSpeaking ? 1 + clampedVolume * 0.05 : 1;
  const glowOpacity = isSpeaking ? config.baseGlow + clampedVolume * 0.45 : config.baseGlow;
  const glowScale = isSpeaking ? 1 + clampedVolume * 0.12 : 1;

  return (
    <div
      className={cn(
        'relative flex aspect-square w-full max-w-[460px] items-center justify-center',
        className
      )}
      style={config.vars}
    >
      {/* Weicher radialer Goldschein hinter dem Orb */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(243,213,138,0.55) 0%, rgba(212,166,58,0.28) 40%, transparent 70%)',
        }}
        animate={{ opacity: glowOpacity, scale: glowScale }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />

      {/* Halo-Ringe */}
      <div
        aria-hidden="true"
        className="closer-anim-halo-pulse border-gold/30 absolute inset-[6%] rounded-full border"
        style={{ boxShadow: '0 0 60px rgba(212,166,58,0.25) inset' }}
      />
      <div
        aria-hidden="true"
        className="closer-anim-halo-pulse border-gold/15 absolute inset-[-4%] rounded-full border"
      />

      {/* Rotierender Lichtbogen */}
      <div aria-hidden="true" className="closer-anim-halo-rotate absolute inset-[-2%]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(243,213,138,0.5) 40deg, transparent 90deg)',
            opacity: phase === 'connecting' ? 0.9 : 0.35,
            maskImage:
              'radial-gradient(circle, transparent 62%, black 64%, black 66%, transparent 68%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 62%, black 64%, black 66%, transparent 68%)',
          }}
        />
      </div>

      {/* Äußere Wellen beim Zuhören */}
      {phase === 'listening' && (
        <>
          <div
            aria-hidden="true"
            className="closer-anim-ripple border-gold/25 absolute inset-[4%] rounded-full border"
          />
          <div
            aria-hidden="true"
            className="closer-anim-ripple border-gold/20 absolute inset-[4%] rounded-full border"
            style={{ animationDelay: '1.4s' }}
          />
        </>
      )}

      {/* Kreisende Lichtpunkte beim Nachdenken */}
      {phase === 'thinking' && (
        <div aria-hidden="true" className="absolute inset-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="closer-anim-orbit bg-gold-light absolute top-1/2 left-1/2 h-2 w-2 rounded-full"
              style={{
                marginLeft: '-4px',
                marginTop: '-4px',
                boxShadow: '0 0 10px rgba(243,213,138,0.9)',
                animationDelay: `${i * -1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Aufsteigende Partikel */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
        {[12, 32, 55, 72, 88].map((leftPct, i) => (
          <div
            key={leftPct}
            className="closer-anim-particle bg-gold-light/70 absolute bottom-[18%] h-1 w-1 rounded-full"
            style={{
              left: `${leftPct}%`,
              animationDelay: `${i * 1.1}s`,
              ['--particle-duration' as string]: `${5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Schwebender Orb mit Audio-Reaktion */}
      <motion.div
        className="closer-anim-float relative z-10 flex aspect-square w-[74%] items-center justify-center"
        animate={{ scale: orbScale }}
        transition={{ type: 'spring', stiffness: 140, damping: 15 }}
        style={{ filter: `brightness(${config.brightness})` }}
      >
        {imageOk ? (
          <Image
            src="/johann-orb.png"
            alt={CLOSER_CONTENT.orbAlt}
            fill
            priority
            sizes="(max-width: 768px) 70vw, 460px"
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            onError={() => setImageOk(false)}
          />
        ) : (
          <OrbFallback />
        )}
      </motion.div>

      {/* Glas-/Metallplattform */}
      <div
        aria-hidden="true"
        className="absolute bottom-[2%] left-1/2 h-[14%] w-[70%] -translate-x-1/2"
      >
        <div
          className="absolute inset-0 rounded-[50%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(243,213,138,0.25) 0%, rgba(212,166,58,0.08) 45%, transparent 70%)',
          }}
        />
        <div
          className="closer-anim-halo-rotate absolute inset-x-[10%] top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(243,213,138,0.6), transparent)',
          }}
        />
      </div>

      {/* Lautstärke-Visualizer (ersetzt LiveKit AudioVisualizerBar) */}
      {isConnected && (
        <div className="pointer-events-none absolute bottom-[-6%] left-1/2 z-20 flex -translate-x-1/2 items-end gap-[3px]">
          {BAR_FACTORS.map((factor, i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              className="bg-gold-light w-[3px] rounded-full opacity-80"
              animate={{
                height:
                  phase === 'speaking'
                    ? `${Math.max(4, clampedVolume * 22 * factor)}px`
                    : phase === 'listening'
                      ? '4px'
                      : '2px',
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Rein CSS-basierter Ersatz-Orb.
 */
function OrbFallback() {
  return (
    <div className="relative aspect-square w-full" role="img" aria-label={CLOSER_CONTENT.orbAlt}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 28%, #ffe9b0 0%, #f3d58a 20%, #d4a63a 52%, #8a6420 82%, #3a2a0c 100%)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.6), inset -18px -22px 50px rgba(58,42,12,0.65), inset 14px 16px 40px rgba(255,233,176,0.55)',
        }}
      />
      <div className="absolute top-[40%] left-1/2 flex -translate-x-1/2 gap-2">
        <div className="h-5 w-8 rounded-md bg-black/85 shadow-inner md:h-8 md:w-14" />
        <div className="h-5 w-8 rounded-md bg-black/85 shadow-inner md:h-8 md:w-14" />
      </div>
      <div className="absolute top-[16%] left-[24%] h-[16%] w-[16%] rounded-full bg-white/50 blur-md" />
    </div>
  );
}
