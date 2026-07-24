'use client';

import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { CLOSER_CONTENT } from '@/lib/closer-content';

interface TranscriptMessage {
  role: string;
  content: string;
}

interface CloserTranscriptViewProps {
  open: boolean;
  onClose: () => void;
  messages: TranscriptMessage[];
}

/**
 * Rein präsentationsorientiertes Transkript-Panel (Sektion 9), das eine
 * einfache Nachrichtenliste anzeigt – engine-unabhängig. Transkripttexte
 * werden als reiner Text gerendert (keine HTML-Injektion, Sektion 21).
 */
export function CloserTranscriptView({ open, onClose, messages }: CloserTranscriptViewProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="closer-transcript"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label={CLOSER_CONTENT.transcript.title}
          className="border-gold/20 bg-card/95 fixed inset-x-3 bottom-24 z-40 mx-auto flex max-h-[55svh] max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md md:inset-x-auto md:right-6 md:bottom-28 md:w-[380px]"
        >
          <header className="border-gold/15 flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-cream font-mono text-xs font-bold tracking-wider uppercase">
              {CLOSER_CONTENT.transcript.title}
            </h2>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onClose}
              aria-label={CLOSER_CONTENT.transcript.close}
            >
              <XIcon className="size-4" />
            </Button>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-cream-muted px-1 py-6 text-center text-sm">
                {CLOSER_CONTENT.transcript.empty}
              </p>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <div key={index} className={cnRow(isUser)}>
                    <span className="text-gold-light mb-0.5 block font-mono text-[10px] tracking-wider uppercase">
                      {isUser ? 'Du' : CLOSER_CONTENT.agentName}
                    </span>
                    <span className="text-cream text-sm break-words whitespace-pre-wrap">
                      {message.content}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function cnRow(isUser: boolean): string {
  return [
    'rounded-xl border px-3 py-2',
    isUser ? 'border-gold/20 bg-gold/5 ml-6' : 'border-gold/10 bg-black/20 mr-6',
  ].join(' ');
}
