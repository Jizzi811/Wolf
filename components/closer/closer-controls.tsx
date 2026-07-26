'use client';

import { useState } from 'react';
import { Mic, MicOff, PhoneOff, Send, TextT } from './control-icons';
import { Button } from '@/components/ui/button';
import { uiText } from '@/lib/ui-text';
import { cn } from '@/lib/utils';

interface CloserControlsProps {
  micEnabled: boolean;
  onToggleMic: () => void;
  onEnd: () => void;
  transcriptOpen: boolean;
  onToggleTranscript: () => void;
  supportsChatInput: boolean;
  onSendText: (text: string) => void;
}

/**
 * Kompakte Steuerleiste während einer Session: Mikrofon, Transkript, Beenden
 * und optionale Texteingabe. Kamera/Screenshare gibt es bewusst nicht
 * (Voice-first). Alle Bedienelemente sind >= 44px groß.
 */
export function CloserControls({
  micEnabled,
  onToggleMic,
  onEnd,
  transcriptOpen,
  onToggleTranscript,
  supportsChatInput,
  onSendText,
}: CloserControlsProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-3">
        <Button
          variant={micEnabled ? 'icon' : 'danger'}
          size="icon"
          onClick={onToggleMic}
          aria-pressed={micEnabled}
          aria-label={micEnabled ? uiText.controls.micDisable : uiText.controls.micEnable}
          title={micEnabled ? uiText.controls.micDisable : uiText.controls.micEnable}
        >
          {micEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          variant="icon"
          size="icon"
          onClick={onToggleTranscript}
          aria-pressed={transcriptOpen}
          aria-label={
            transcriptOpen ? uiText.controls.closeTranscript : uiText.controls.openTranscript
          }
          title={transcriptOpen ? uiText.controls.closeTranscript : uiText.controls.openTranscript}
        >
          <TextT />
        </Button>

        <Button variant="danger" size="default" onClick={onEnd} aria-label={uiText.controls.endCall}>
          <PhoneOff />
          <span className="hidden sm:inline">{uiText.buttonEnd}</span>
        </Button>
      </div>

      {supportsChatInput ? <CloserTextInput onSendText={onSendText} /> : null}
    </div>
  );
}

function CloserTextInput({ onSendText }: { onSendText: (text: string) => void }) {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSendText(text);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={uiText.controls.textInputPlaceholder}
        aria-label={uiText.controls.textInputPlaceholder}
        className={cn(
          'h-11 flex-1 rounded-full border border-gold/25 bg-white/[0.03] px-4 text-sm text-cream',
          'placeholder:text-muted/60 focus-visible:border-gold/60 focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-gold'
        )}
      />
      <Button
        type="submit"
        variant="icon"
        size="icon"
        disabled={value.trim().length === 0}
        aria-label={uiText.controls.sendMessage}
      >
        <Send />
      </Button>
    </form>
  );
}
