'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CloserScene } from './closer-scene';
import { LanguageProvider, PublicUiProvider } from './ui-context';
import { refUsername, useVapi, visitorId } from '@/hooks/use-vapi';
import { getLanguage, isKnownLanguage, type CloserLanguage } from '@/lib/closer/languages';
import type { PublicUi } from '@/lib/public-ui';

const LANG_KEY = 'closer_lang';

/** Sprache ermitteln: ?lang= aus dem Link → gemerkte Wahl → Browser → Voreinstellung aus dem Admin. */
function detectLanguage(fallback: string): CloserLanguage {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && isKnownLanguage(fromUrl)) return getLanguage(fromUrl);
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved && isKnownLanguage(saved)) return getLanguage(saved);
    for (const cand of navigator.languages ?? [navigator.language]) {
      if (!cand) continue;
      if (isKnownLanguage(cand)) return getLanguage(cand);
      const base = cand.split('-')[0];
      if (isKnownLanguage(base)) return getLanguage(base);
    }
  } catch {
    /* Speicher gesperrt */
  }
  return getLanguage(fallback);
}

/**
 * Client-Wurzel: Sprache, Vapi-Hook und Szene. Texte, Name, Bild und Schalter
 * kommen aus dem Admin; die Sprache aus Link, Speicher oder Browser.
 */
export function CloserApp({ ui }: { ui: PublicUi }) {
  const vapi = useVapi();
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [language, setLanguage] = useState<CloserLanguage>(() => getLanguage(ui.defaultLanguage));
  const [ref, setRef] = useState<string | null>(null);
  const [vid, setVid] = useState('');

  useEffect(() => {
    setLanguage(detectLanguage(ui.defaultLanguage));
    setRef(refUsername());
    setVid(visitorId());
  }, [ui.defaultLanguage]);

  useEffect(() => {
    try {
      // Nur die Sprachkennung; die Schreibrichtung gilt im Chat-Bereich, nicht für die deutschen Admin-Texte.
      document.documentElement.lang = language.bcp47;
    } catch {
      /* ignore */
    }
  }, [language]);

  const changeLanguage = useCallback(
    (l: CloserLanguage) => {
      if (l.lang === language.lang) return;
      try {
        window.localStorage.setItem(LANG_KEY, l.lang);
      } catch {
        /* Speicher gesperrt */
      }
      setLanguage(l);
      if (vapi.isConnected) {
        if (l.voice) vapi.switchLanguage(l.lang);
        else vapi.stop();
      }
    },
    [language.lang, vapi]
  );

  return (
    <PublicUiProvider ui={ui}>
      <LanguageProvider language={language}>
        <CloserScene
          state={vapi.state}
          level={vapi.level}
          messages={vapi.messages}
          partial={vapi.partial}
          isConnected={vapi.isConnected}
          connecting={vapi.connecting}
          isMuted={vapi.isMuted}
          isOnline={vapi.isOnline}
          errorKey={vapi.errorKey}
          transcriptOpen={transcriptOpen}
          onToggleTranscript={() => setTranscriptOpen((v) => !v)}
          onStart={() => void vapi.start({ lang: language.lang })}
          onEnd={vapi.stop}
          onToggleMute={vapi.toggleMute}
          onSendText={vapi.sendText}
          onDismissError={vapi.dismissError}
          onChangeLanguage={changeLanguage}
          refUsername={ref}
          visitorId={vid}
        />
        {ui.loginRequired ? (
          <p className="relative z-0 -mt-6 pb-4 text-center text-sm text-muted">
            Dieser Bereich ist nur für angemeldete Mitglieder. <Link href="/login" className="text-gold-light hover:underline">Anmelden</Link>
          </p>
        ) : null}
      </LanguageProvider>
    </PublicUiProvider>
  );
}
