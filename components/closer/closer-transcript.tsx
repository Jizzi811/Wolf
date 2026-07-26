'use client';

import { useEffect, useRef } from 'react';
import { type CloserState } from '@/lib/closer-state';
import { uiText } from '@/lib/ui-text';
import { cn } from '@/lib/utils';
import { type TranscriptMessage } from '@/hooks/use-vapi';

interface CloserTranscriptProps {
  state: CloserState;
  messages: TranscriptMessage[];
  partial: { role: 'user' | 'assistant'; text: string } | null;
  className?: string;
}

/**
 * Live-Transkript. Nachrichten werden als reiner Text gerendert (React escaped
 * automatisch – keine HTML-Injektion über Transkripte).
 */
export function CloserTranscript({ state, messages, partial, className }: CloserTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, partial, state]);

  const empty = messages.length === 0 && !partial;

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className="scroll-gold max-h-64 flex-1 space-y-3 overflow-y-auto pr-1"
        role="log"
        aria-label={uiText.controls.transcriptTitle}
        aria-live="polite"
      >
        {empty ? (
          <p className="py-6 text-center text-sm text-muted/70">
            {state === 'thinking' ? uiText.status.thinking : uiText.status.listening} …
          </p>
        ) : (
          <>
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.text} />
            ))}
            {partial && <Bubble role={partial.role} text={partial.text} muted />}
          </>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Bubble({
  role,
  text,
  muted,
}: {
  role: 'user' | 'assistant';
  text: string;
  muted?: boolean;
}) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
          isUser ? 'bg-gold/15 text-cream' : 'border border-gold/15 bg-white/[0.03] text-cream/90',
          muted && 'opacity-60'
        )}
      >
        <span className="mb-0.5 block text-[0.62rem] font-semibold uppercase tracking-wider text-gold/60">
          {isUser ? 'Du' : uiText.agentName}
        </span>
        {text}
      </div>
    </div>
  );
}
