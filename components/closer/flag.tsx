'use client';

import { useState } from 'react';
import { flagUrl, shortCode, type CloserLanguage } from '@/lib/closer/languages';
import { cn } from '@/lib/utils';

/**
 * Flagge einer Sprache (flagcdn.com). Ohne Landesflagge oder bei Ladefehler:
 * Sprachkürzel im Goldrahmen – nie ein kaputtes Bild.
 */
export function Flag({ language, size = 28, className }: { language: CloserLanguage; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const url = flagUrl(language);
  const code = shortCode(language);
  if (!url || failed) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex flex-none items-center justify-center rounded-full border border-gold/60 bg-ink font-mono font-bold text-gold-light', className)}
        style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.32)) }}
      >
        {code.length > 3 ? code.slice(0, 2) : code}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('inline-block flex-none rounded-full border border-gold/30 object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
