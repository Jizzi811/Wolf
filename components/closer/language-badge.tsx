'use client';

import { nativeName, shortCode, type CloserLanguage } from '@/lib/closer/languages';
import { Flag } from './flag';
import { cn } from '@/lib/utils';

/**
 * Flagge + Kürzel der aktiven Sprache, oben links neben dem Namen. Tippfläche
 * mindestens 44 px; ein Tipp öffnet die Sprachauswahl.
 */
export function LanguageBadge({ language, onClick, label, className }: { language: CloserLanguage; onClick: () => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${nativeName(language)}`}
      title={`${label}: ${nativeName(language)}`}
      className={cn(
        'inline-flex h-11 min-w-11 items-center gap-2 rounded-full border border-gold/30 bg-ink-2/70 pl-1.5 pr-3 text-cream backdrop-blur-sm transition hover:border-gold/60 hover:bg-gold/10',
        className
      )}
    >
      <Flag language={language} size={30} />
      <span className="font-mono text-xs font-semibold tracking-wide">{shortCode(language)}</span>
    </button>
  );
}
