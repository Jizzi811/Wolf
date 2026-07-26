'use client';

import { useState } from 'react';
import { CloserScene } from './closer-scene';
import { useVapi } from '@/hooks/use-vapi';

/**
 * Client-Wurzel: bindet den Vapi-Hook an und reicht den Zustand an die rein
 * präsentative Szene weiter. Keine Engine-Logik hier – die lebt im Hook.
 */
export function CloserApp() {
  const vapi = useVapi();
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  return (
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
  );
}
