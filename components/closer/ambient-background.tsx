'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface AmbientBackgroundProps {
  className?: string;
}

/**
 * Atmosphärischer Hintergrund für die gesamte Bühne (Sektion 3 & 4):
 * weiches radiales Goldlicht, sehr dezente Chartlinien und eine dunkle
 * Vignette. Rein dekorativ und daher `aria-hidden`. Nutzt ausschließlich
 * CSS-Gradients und statisches SVG – keine laufende Canvas-Schleife
 * (Sektion 20).
 */
export function AmbientBackground({ className }: AmbientBackgroundProps) {
  // Chartlinie einmalig erzeugen (nur Dekoration, keine echten Kurse).
  const chartPath = useMemo(() => buildChartPath(), []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-background pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className
      )}
    >
      {/* Warmes radiales Goldlicht, oben links */}
      <div
        className="absolute -top-1/3 -left-1/4 h-[120vh] w-[120vh] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,166,58,0.16) 0%, rgba(212,166,58,0.05) 35%, transparent 70%)',
        }}
      />
      {/* Zweiter, kühlerer Lichtkegel rechts unten für Tiefe */}
      <div
        className="absolute -right-1/4 -bottom-1/3 h-[100vh] w-[100vh] rounded-full opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(138,100,32,0.14) 0%, transparent 65%)',
        }}
      />

      {/* Dezente Börsen-/Erfolgsästhetik: Chartlinien im Hintergrund */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="closer-chart-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a6420" />
            <stop offset="50%" stopColor="#f3d58a" />
            <stop offset="100%" stopColor="#d4a63a" />
          </linearGradient>
          <pattern id="closer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" fill="none" stroke="#d4a63a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#closer-grid)" />
        <path d={chartPath} stroke="url(#closer-chart-line)" strokeWidth="2" fill="none" />
      </svg>

      {/* Dunkle Vignette für Kontrast zum Orb */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* Feines Grundrauschen oben, damit der Verlauf nicht flach wirkt */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
      />
    </div>
  );
}

/** Baut eine ansteigende, gezackte Chartlinie (nur Dekoration). */
function buildChartPath(): string {
  const points = [
    [0, 620],
    [120, 560],
    [240, 600],
    [360, 500],
    [480, 540],
    [600, 420],
    [720, 460],
    [840, 320],
    [960, 360],
    [1080, 220],
    [1200, 180],
  ];
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}
