'use client';

import { createContext, useContext } from 'react';
import { uiFor, type UiStrings } from '@/lib/closer/i18n';
import { LANGUAGES, type CloserLanguage } from '@/lib/closer/languages';
import { DEFAULT_PUBLIC_UI, type PublicUi } from '@/lib/public-ui';

const Ctx = createContext<PublicUi>(DEFAULT_PUBLIC_UI);

export function PublicUiProvider({ ui, children }: { ui: PublicUi; children: React.ReactNode }) {
  return <Ctx.Provider value={ui}>{children}</Ctx.Provider>;
}

/** Texte, Name, Bild und Schalter der öffentlichen Seite (aus dem Admin). */
export function usePublicUi(): PublicUi {
  return useContext(Ctx);
}

interface LanguageCtx {
  language: CloserLanguage;
  t: UiStrings;
}

const LangCtx = createContext<LanguageCtx>({ language: LANGUAGES[0], t: uiFor('de') });

export function LanguageProvider({ language, children }: { language: CloserLanguage; children: React.ReactNode }) {
  const ui = usePublicUi();
  // Oberfläche nur Deutsch (Standard), außer der Schalter im Admin ist an.
  const t = ui.uiTranslations ? uiFor(language.lang) : uiFor('de');
  return <LangCtx.Provider value={{ language, t }}>{children}</LangCtx.Provider>;
}

/** Aktive Sprache der Seite und die passenden Oberflächentexte. */
export function useLanguage(): LanguageCtx {
  return useContext(LangCtx);
}

/** Statuszeile: deutsche Texte aus dem Admin, sonst Übersetzung. */
export function useStatusText(): Record<'disconnected' | 'connecting' | 'listening' | 'thinking' | 'speaking', string> {
  const ui = usePublicUi();
  const { language, t } = useLanguage();
  if (language.lang === 'de' || !ui.uiTranslations) return ui.status;
  return { disconnected: t.ready, connecting: t.connecting, listening: t.listening, thinking: t.thinking, speaking: t.speaking };
}
