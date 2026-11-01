'use client';

import { useState } from 'react';
import { CloserControls } from './closer-controls';
import { CloserError } from './closer-error';
import { CloserHeroHeadline, CloserHeroPitch } from './closer-hero';
import { CloserOrb } from './closer-orb';
import { CloserStatus } from './closer-status';
import { CloserTranscript } from './closer-transcript';
import { CloserVisualizer } from './closer-visualizer';
import { LanguageBadge } from './language-badge';
import { LanguagePicker } from './language-picker';
import { TextChat } from './text-chat';
import { useLanguage, usePublicUi } from './ui-context';
import { type CloserState } from '@/lib/closer-state';
import { nativeName, type CloserLanguage } from '@/lib/closer/languages';
import { type CloserErrorKey } from '@/lib/errors';
import { uiText } from '@/lib/ui-text';
import { Button } from '@/components/ui/button';
import { type TranscriptMessage } from '@/hooks/use-vapi';

interface CloserSceneProps {
  state: CloserState;
  level: number;
  messages: TranscriptMessage[];
  partial: { role: 'user' | 'assistant'; text: string } | null;
  isConnected: boolean;
  connecting: boolean;
  isMuted: boolean;
  isOnline: boolean;
  errorKey: CloserErrorKey | null;
  transcriptOpen: boolean;
  onToggleTranscript: () => void;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onSendText: (text: string) => void;
  onDismissError: () => void;
  onChangeLanguage: (l: CloserLanguage) => void;
  refUsername: string | null;
  visitorId: string;
}

/** Rein präsentative Haupt-UI. Bekommt allen Zustand als Props vom Vapi-Hook. */
export function CloserScene({
  state,
  level,
  messages,
  partial,
  isConnected,
  connecting,
  isMuted,
  isOnline,
  errorKey,
  transcriptOpen,
  onToggleTranscript,
  onStart,
  onEnd,
  onToggleMute,
  onSendText,
  onDismissError,
  onChangeLanguage,
  refUsername,
  visitorId,
}: CloserSceneProps) {
  const ui = usePublicUi();
  const { language, t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);
  const isDe = language.lang === 'de' || !ui.uiTranslations;
  const textMode = !language.voice;

  const startLabel = isDe ? ui.buttonStart : t.start;
  const connectingLabel = isDe ? uiText.buttonConnecting : t.connecting;

  const startAction = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button size="lg" variant="primary" onClick={onStart} disabled={connecting || !isOnline} aria-busy={connecting} className="w-full sm:w-auto">
        {connecting ? connectingLabel : startLabel}
      </Button>
      <Button size="default" variant="ghost" onClick={() => setPickerOpen(true)} className="w-full sm:w-auto" aria-haspopup="dialog">
        {t.chooseLanguage}: {nativeName(language)}
      </Button>
    </div>
  );

  return (
    <main className="relative z-0 mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-10 overflow-x-hidden px-6 pb-14 pt-20 lg:grid lg:grid-cols-2 lg:content-center lg:gap-x-16 lg:gap-y-8 lg:py-20">
      {/* Flagge der aktiven Sprache: oben links, direkt neben dem Namen */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 sm:left-6">
        <LanguageBadge language={language} onClick={() => setPickerOpen(true)} label={t.switchLanguage} />
        <span className="hidden font-display text-sm font-semibold text-cream/80 sm:inline">{ui.name}</span>
      </div>

      {/* A — Überschrift */}
      <div className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
        <CloserHeroHeadline />
      </div>

      {/* B — Orb-Bühne */}
      <div className="order-2 flex flex-col items-center gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <CloserOrb state={state} />
        {!textMode ? <CloserVisualizer state={state} level={level} /> : null}

        <div className="flex flex-col items-center gap-1">
          {!textMode ? <CloserStatus state={state} /> : null}
          <p className="text-xs text-muted/70">{ui.tagline}</p>
        </div>

        {!isOnline ? (
          <p role="status" className="w-full max-w-md rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold-light">
            {t.offline}
          </p>
        ) : null}

        {textMode ? (
          <TextChat key={language.lang} language={language} agentName={ui.name} refUsername={refUsername} visitorId={visitorId} />
        ) : null}

        {!textMode && isConnected && (
          <>
            <CloserControls
              micEnabled={!isMuted}
              onToggleMic={onToggleMute}
              onEnd={onEnd}
              transcriptOpen={transcriptOpen}
              onToggleTranscript={onToggleTranscript}
              supportsChatInput={ui.supportsChatInput}
              onSendText={onSendText}
            />
            <Button variant="ghost" size="default" onClick={() => setPickerOpen(true)} aria-haspopup="dialog">
              {t.switchLanguage}
            </Button>
          </>
        )}

        {!textMode && isConnected && transcriptOpen && ui.showTranscript && (
          <CloserTranscript state={state} messages={messages} partial={partial} className="w-full max-w-md rounded-2xl border border-gold/15 bg-ink-2/60 p-3 backdrop-blur-sm" />
        )}

        {errorKey && (
          <div className="flex w-full max-w-md flex-col gap-2">
            <CloserError errorKey={errorKey} onRetry={!isConnected ? onStart : undefined} onDismiss={onDismissError} />
            {errorKey === 'micDenied' || errorKey === 'browserUnsupported' ? (
              <p className="text-center text-xs text-muted">
                <button type="button" className="text-gold-light underline-offset-2 hover:underline" onClick={() => setPickerOpen(true)}>
                  {t.chooseLanguage}
                </button>
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* C — Pitch/CTA */}
      <div className="order-3 lg:col-start-1 lg:row-start-2 lg:self-start">
        <CloserHeroPitch action={!isConnected && !textMode ? startAction : textMode ? <Button variant="ghost" onClick={() => setPickerOpen(true)}>{t.chooseLanguage}: {nativeName(language)}</Button> : undefined} />
        {!isDe ? <p className="mt-4 text-xs text-muted/80">{t.aiNote}</p> : null}
      </div>

      <LanguagePicker
        open={pickerOpen}
        value={language}
        onClose={() => setPickerOpen(false)}
        onSelect={(l) => {
          setPickerOpen(false);
          onChangeLanguage(l);
        }}
      />
    </main>
  );
}
