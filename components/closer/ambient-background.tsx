/**
 * Dekorativer Atmosphären-Hintergrund: dezentes Goldraster, sehr subtile
 * Chartlinien und langsam aufsteigende Partikel. Rein visuell, daher
 * aria-hidden. Bewegung wird per prefers-reduced-motion (CSS) reduziert.
 */

const PARTICLES = [
  { left: '12%', delay: '0s', duration: '14s' },
  { left: '24%', delay: '3s', duration: '18s' },
  { left: '38%', delay: '7s', duration: '16s' },
  { left: '57%', delay: '1.5s', duration: '20s' },
  { left: '69%', delay: '9s', duration: '15s' },
  { left: '81%', delay: '5s', duration: '19s' },
  { left: '91%', delay: '11s', duration: '17s' },
];

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-grid" />

      {/* Sehr dezente, aufsteigende Chartlinie (Erfolgs-/Börsenästhetik). */}
      <svg
        className="ambient-chart"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="chartline" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#8A6420" stopOpacity="0" />
            <stop offset="55%" stopColor="#D4A63A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F3D58A" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M-40 720 L180 660 L320 690 L470 560 L620 600 L780 430 L940 470 L1100 300 L1260 340 L1480 150"
          stroke="url(#chartline)"
          strokeWidth="2"
        />
        <path
          d="M-40 800 L200 770 L360 785 L520 700 L700 730 L880 610 L1060 650 L1240 520 L1480 470"
          stroke="url(#chartline)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </svg>

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="ambient-particle"
          style={{
            left: p.left,
            bottom: '8%',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
