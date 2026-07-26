import { uiText } from '@/lib/ui-text';

/** Kleiner violetter Aufzählungspunkt (Diamant). */
function Bullet() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="mt-1 flex-none">
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6z" fill="url(#closer-bullet)" />
      <defs>
        <linearGradient id="closer-bullet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A99BFF" />
          <stop offset="1" stopColor="#7B6CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Oberer Hero-Block: Eyebrow, Hauptüberschrift, Kurzbeschreibung.
 * Auf Mobil steht darunter direkt der Orb.
 */
export function CloserHeroHeadline() {
  return (
    <div className="flex flex-col">
      <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold/80">
        {uiText.eyebrow}
      </p>

      <h1 className="mt-5 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
        <span className="block text-cream">{uiText.heroTitleLine1}</span>
        <span className="mt-2 block bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
          {uiText.heroTitleLine2}
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {uiText.heroDescription}
      </p>
    </div>
  );
}

interface CloserHeroPitchProps {
  /** Aktionsbereich (Startbutton bzw. Verbindungs-Button). Optional. */
  action?: React.ReactNode;
}

/**
 * Unterer Hero-Block: Aktionsbereich, drei Merkmale, Datenschutzhinweis.
 */
export function CloserHeroPitch({ action }: CloserHeroPitchProps) {
  return (
    <div className="flex flex-col">
      {action ? <div className="mb-9">{action}</div> : null}

      <ul className="flex flex-col gap-3">
        {uiText.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-cream/90">
            <Bullet />
            <span className="text-[0.95rem] font-medium">{f}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted/80">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mt-0.5 flex-none text-gold/70"
        >
          <path
            d="M6 10V8a6 6 0 1 1 12 0v2m-9 0h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {uiText.privacyNote}
      </p>
    </div>
  );
}
