'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CloserScene } from './closer-scene';
import { PublicUiProvider } from './ui-context';
import { useVapi } from '@/hooks/use-vapi';
import type { PublicUi } from '@/lib/public-ui';

/**
 * Client-Wurzel: bindet den Vapi-Hook an und reicht den Zustand an die rein
 * präsentative Szene weiter. Texte, Name, Bild und Schalter kommen aus dem Admin.
 */
export function CloserApp({ ui }: { ui: PublicUi }) {
  const vapi = useVapi();
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  return (
    <PublicUiProvider ui={ui}>
      <CloserScene
        state={vapi.state}
        level={vapi.level}
        messages={vapi.messages}
        partial={vapi.partial}
        isConnected={vapi.isConnected}
        connecting={vapi.connecting}
        isMuted={vapi.isMuted}
        errorKey={vapi.errorKey}
        transcriptOpen={transcriptOpen}
        onToggleTranscript={() => setTranscriptOpen((v) => !v)}
        onStart={vapi.start}
        onEnd={vapi.stop}
        onToggleMute={vapi.toggleMute}
        onSendText={vapi.sendText}
        onDismissError={vapi.dismissError}
      />
      {ui.loginRequired ? (
        <p className="relative z-0 -mt-6 pb-4 text-center text-sm text-muted">
          Dieser Bereich ist nur für angemeldete Mitglieder. <Link href="/login" className="text-gold-light hover:underline">Anmelden</Link>
        </p>
      ) : null}
    </PublicUiProvider>
  );
}
