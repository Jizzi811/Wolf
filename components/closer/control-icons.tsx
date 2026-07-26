/**
 * Kleine, abhängigkeitsfreie Inline-SVG-Icons für die Steuerleiste.
 * currentColor + 20px, damit sie sich an Button-Farben anpassen.
 */
import type { SVGProps } from 'react';

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function Mic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
    </svg>
  );
}

export function MicOff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2 2l20 20" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33M9 9v2a3 3 0 0 0 4.24 2.74" />
      <path d="M5 10a7 7 0 0 0 10.7 5.98M19 10a7 7 0 0 1-.11 1.23M12 19v3" />
    </svg>
  );
}

export function PhoneOff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10.7 13.3a11 11 0 0 1-2-2C6 8.5 5.3 6 5.6 4.6a1.4 1.4 0 0 1 1.4-1.1h2a1.4 1.4 0 0 1 1.4 1.2c.1.9.3 1.7.6 2.5a1.4 1.4 0 0 1-.3 1.5l-1 1" />
      <path d="M13.3 10.7a11 11 0 0 0 2 2M22 2 2 22" />
      <path d="M16.9 13.4c.8.3 1.6.5 2.5.6a1.4 1.4 0 0 1 1.2 1.4v2a1.4 1.4 0 0 1-1.5 1.4 16 16 0 0 1-5.3-1.6" />
    </svg>
  );
}

export function Send(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

/** Transkript-Icon (Sprech-/Textzeilen). */
export function TextT(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
