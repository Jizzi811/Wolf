'use client';

import { CloserControls } from './closer-controls';
import { CloserError } from './closer-error';
import { CloserHeroHeadline, CloserHeroPitch } from './closer-hero';
import { CloserOrb } from './closer-orb';
import { CloserStatus } from './closer-status';
import { CloserTranscript } from './closer-transcript';
import { CloserVisualizer } from './closer-visualizer';
import { APP_CONFIG } from '@/app-config';
import { type CloserState } from '@/lib/closer-state';
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
  errorKey: CloserErrorKey | null;
  transcriptOpen: boolean;
  onToggleTranscript: () => void;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onSendText: (text: string) => void;
  onDismissError: () => void;
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
  errorKey,
  transcriptOpen,
  onToggleTranscript,
  onStart,
  onEnd,
  onToggleMute,
  onSendText,
  onDismissError,
}: CloserSceneProps) {
  const startAction = (
    <Button
      size="lg"
      variant="primary"
      onClick={onStart}
      disabled={connecting}
      aria-busy={connecting}
      className="w-full sm:w-auto"
    >
      {connecting ? uiText.buttonConnecting : uiText.buttonStart}
    </Button>
  );

  return (
    <main className="relative z-0 mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-10 px-6 py-14 lg:grid lg:grid-cols-2 lg:content-center lg:gap-x-16 lg:gap-y-8 lg:py-20">
      {/* A — Überschrift */}
      <div className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
        <CloserHeroHeadline />
      </div>

      {/* B — Orb-Bühne */}
      <div className="order-2 flex flex-col items-center gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <CloserOrb state={state} />
        <CloserVisualizer state={state} level={level} />

        <div className="flex flex-col items-center gap-1">
          <CloserStatus state={state} />
          <p className="text-xs text-muted/70">{uiText.agentTagline}</p>
        </div>

        {isConnected && (
          <CloserControls
            micEnabled={!isMuted}
            onToggleMic={onToggleMute}
            onEnd={onEnd}
            transcriptOpen={transcriptOpen}
            onToggleTranscript={onToggleTranscript}
            supportsChatInput={APP_CONFIG.supportsChatInput}
            onSendText={onSendText}
          />
        )}

        {isConnected && transcriptOpen && (
          <CloserTranscript
            state={state}
            messages={messages}
            partial={partial}
            className="w-full max-w-md rounded-2xl border border-gold/15 bg-ink-2/60 p-3 backdrop-blur-sm"
          />
        )}

        {errorKey && (
          <CloserError
            errorKey={errorKey}
            onRetry={!isConnected ? onStart : undefined}
            onDismiss={onDismissError}
            className="w-full max-w-md"
          />
        )}
      </div>

      {/* C — Pitch/CTA */}
      <div className="order-3 lg:col-start-1 lg:row-start-2 lg:self-start">
        <CloserHeroPitch action={!isConnected ? startAction : undefined} />
      </div>
    </main>
  );
}
