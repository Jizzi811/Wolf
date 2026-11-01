'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, nativeName, shortCode, type CloserLanguage } from '@/lib/closer/languages';
import { uiFor } from '@/lib/closer/i18n';
import { Flag } from './flag';
import { cn } from '@/lib/utils';

interface LanguagePickerProps {
  open: boolean;
  value: CloserLanguage;
  onSelect: (l: CloserLanguage) => void;
  onClose: () => void;
}

/** Sprachauswahl: Suchfeld + Flaggenliste (wie im Header der Plattform), große Kacheln. */
export function LanguagePicker({ open, value, onSelect, onClose }: LanguagePickerProps) {
  const t = uiFor(value.lang);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const all = LANGUAGES.map((l) => ({ l, native: nativeName(l) }));
    const filtered = needle
      ? all.filter(({ l, native }) => native.toLowerCase().includes(needle) || l.nameDe.toLowerCase().includes(needle) || l.lang.toLowerCase().includes(needle))
      : all;
    // Sprachmodus zuerst, danach alphabetisch nach Eigenname.
    return filtered.sort((a, b) => Number(b.l.voice) - Number(a.l.voice) || a.native.localeCompare(b.native));
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.chooseLanguage}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92svh] w-full max-w-3xl flex-col rounded-t-3xl border border-gold/20 bg-ink-2 shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-gold/10 p-4">
          <h2 className="font-sans text-base font-semibold text-cream">{t.chooseLanguage}</h2>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchLanguage}
            aria-label={t.searchLanguage}
            className="ml-auto h-11 w-full max-w-xs rounded-full border border-gold/20 bg-ink px-4 text-sm text-cream placeholder:text-muted/60 focus:border-gold/60 focus:outline-none"
          />
          <button type="button" onClick={onClose} aria-label="×" className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-gold/20 text-cream hover:border-gold/60">
            ×
          </button>
        </div>
        <ul className="scroll-gold grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4" aria-label={t.chooseLanguage}>
          {items.map(({ l, native }) => {
            const active = l.lang === value.lang;
            return (
              <li key={l.lang}>
                <button
                  type="button"
                  onClick={() => onSelect(l)}
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition',
                    active ? 'border-gold bg-gold/15' : 'border-gold/15 bg-ink/50 hover:border-gold/50 hover:bg-gold/5'
                  )}
                >
                  <Flag language={l} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-cream" lang={l.bcp47} dir={l.rtl ? 'rtl' : undefined}>{native}</span>
                    <span className="block truncate text-[0.68rem] text-muted">
                      {l.nameDe} · {shortCode(l)}
                      {l.voice ? '' : ` · ${t.textOnly}`}
                    </span>
                  </span>
                  <span aria-hidden="true" className={cn('h-2 w-2 flex-none rounded-full', l.voice ? 'bg-emerald-400' : 'bg-muted/60')} title={l.voice ? t.voiceMode : t.textOnly} />
                </button>
              </li>
            );
          })}
          {items.length === 0 ? <li className="col-span-full py-8 text-center text-sm text-muted">–</li> : null}
        </ul>
        <p className="border-t border-gold/10 px-4 py-3 text-[0.72rem] text-muted">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" /> {t.voiceMode}
          <span className="mx-3 inline-block h-2 w-2 rounded-full bg-muted/60 align-middle" /> {t.textOnly}
        </p>
      </div>
    </div>
  );
}
