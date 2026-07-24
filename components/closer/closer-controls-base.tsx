'use client';

import { MessageSquareTextIcon, MicIcon, MicOffIcon, PhoneOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserControlsBaseProps {
  micOn: boolean;
  onToggleMic: () => void;
  onEnd: () => void;
  chatOpen: boolean;
  onToggleChat: () => void;
  supportsTranscript?: boolean;
  className?: string;
}

/**
 * Rein präsentationsorientierte Steuerleiste (Sektion 9), unabhängig von der
 * Voice-Engine. Bekommt alle Aktionen als Callbacks. Große Touch-Flächen
 * (≥44 px), Gold-Styling, keine Kamera/Screen-Share.
 */
export function CloserControlsBase({
  micOn,
  onToggleMic,
  onEnd,
  chatOpen,
  onToggleChat,
  supportsTranscript = true,
  className,
}: CloserControlsBaseProps) {
  return (
    <div
      aria-label="Gesprächssteuerung"
      className={cn(
        'border-gold/20 flex items-center gap-2 rounded-full border bg-black/40 p-2 backdrop-blur-md',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onToggleMic}
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

      {supportsTranscript && (
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

      <Button
        type="button"
        variant="ghost"
        onClick={onEnd}
        className="text-destructive bg-destructive/10 hover:bg-destructive/20 h-11 gap-2 rounded-full px-5 font-mono text-xs font-bold tracking-wider uppercase"
      >
        <PhoneOffIcon className="size-4" />
        <span className="hidden sm:inline">{CLOSER_CONTENT.buttons.end}</span>
      </Button>
    </div>
  );
}
