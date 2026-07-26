'use client';

import Image from 'next/image';
import { useState } from 'react';
import { APP_CONFIG } from '@/app-config';
import { type CloserState, closerStateAria } from '@/lib/closer-state';

interface CloserOrbProps {
  state: CloserState;
}

/** Drei kreisende Lichtpunkte für den „Denken"-Zustand (auf Kreisbahn). */
const ORBIT_DOTS = [
  { left: '50%', top: '0%' },
  { left: '92.4%', top: '74.5%' },
  { left: '7.6%', top: '74.5%' },
];

/**
 * Der goldene Orb als visueller Mittelpunkt der Anwendung.
 * Rein präsentativ: erhält den Zustand als Prop, reagiert per CSS
 * (siehe globals.css, Selektoren `.orb-stage[data-state=…]`).
 */
export function CloserOrb({ state }: CloserOrbProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="orb-stage"
      data-state={state}
      role="img"
      aria-label={closerStateAria[state]}
    >
      {/* Hintergrund-Ebenen */}
      <div className="orb-vignette" />
      <div className="orb-ambient" />
      <div className="orb-halo orb-halo-3" />
      <div className="orb-halo orb-halo-2" />
      <div className="orb-halo orb-halo-1" />
      <div className="orb-arc" />

      {/* Äußere Wellen (Zuhören) */}
      <div className="orb-wave" />
      <div className="orb-wave" />
      <div className="orb-wave" />

      {/* Kreisende Lichtpunkte (Denken) */}
      <div className="orb-orbits">
        {ORBIT_DOTS.map((d, i) => (
          <span key={i} className="orb-orbit-dot" style={{ left: d.left, top: d.top }} />
        ))}
      </div>

      <div className="orb-platform" />

      {/* Der Orb selbst */}
      <div className="orb-core">
        {imgFailed ? (
          <div className="orb-fallback" aria-hidden="true" />
        ) : (
          <Image
            src={APP_CONFIG.orbImageSrc}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 68vw, 30rem"
            style={{ objectFit: 'contain' }}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
