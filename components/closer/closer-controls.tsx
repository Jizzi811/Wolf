'use client';

import { Track } from 'livekit-client';
import { MessageSquareTextIcon, MicIcon, MicOffIcon, PhoneOffIcon } from 'lucide-react';
import { useSessionContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { useInputControls } from '@/hooks/agents-ui/use-agent-control-bar';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserControlsProps {
  chatOpen: boolean;
  onToggleChat: () => void;
  supportsChatInput: boolean;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  className?: string;
}

/**
 * Schlanke Steuerleiste während des Gesprächs (Sektion 9):
 * Mikrofon an/aus, Transkript öffnen und Gespräch beenden. Kamera und
 * Screen Sharing werden bewusst nicht angeboten. Alle Flächen sind mindestens
 * 44 px groß (Sektion 6). Die Mikrofonlogik nutzt den vorhandenen
 * `useInputControls`-Hook, es wird keine Session-Logik dupliziert.
 */
export function CloserControls({
  chatOpen,
  onToggleChat,
  supportsChatInput,
  onDeviceError,
  className,
}: CloserControlsProps) {
  const session = useSessionContext();
  const { microphoneToggle } = useInputControls({ onDeviceError });
  const micOn = microphoneToggle.enabled;

  return (
    <div
      aria-label="Gesprächssteuerung"
      className={cn(
        'border-gold/20 flex items-center gap-2 rounded-full border bg-black/40 p-2 backdrop-blur-md',
        className
      )}
    >
      {/* Mikrofon an/aus */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => microphoneToggle.toggle()}
        disabled={microphoneToggle.pending}
        aria-pressed={micOn}
        aria-label={micOn ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
        className={cn(
          'size-11 rounded-full transition-colors',
          micOn
            ? 'text-cream hover:bg-gold/15'
            : 'text-destructive bg-destructive/10 hover:bg-destructive/20'
        )}
      >
        {micOn ? <MicIcon className="size-5" /> : <MicOffIcon className="size-5" />}
      </Button>

      {/* Transkript öffnen/schließen */}
      {supportsChatInput && (
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleChat}
          aria-pressed={chatOpen}
          aria-label={
            chatOpen ? CLOSER_CONTENT.transcript.close : CLOSER_CONTENT.buttons.toggleTranscript
          }
          className={cn(
            'size-11 rounded-full transition-colors',
            chatOpen ? 'bg-gold/20 text-gold-light' : 'text-cream hover:bg-gold/15'
          )}
        >
          <MessageSquareTextIcon className="size-5" />
        </Button>
      )}

      {/* Gespräch beenden */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => session.end()}
        disabled={!session.isConnected}
        className="text-destructive bg-destructive/10 hover:bg-destructive/20 h-11 gap-2 rounded-full px-5 font-mono text-xs font-bold tracking-wider uppercase"
      >
        <PhoneOffIcon className="size-4" />
        <span className="hidden sm:inline">{CLOSER_CONTENT.buttons.end}</span>
      </Button>
    </div>
  );
}
