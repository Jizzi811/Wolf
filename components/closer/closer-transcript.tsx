'use client';

import { useState } from 'react';
import { SendHorizontalIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedMessage,
  useAgent,
  useChat,
  useSessionContext,
  useSessionMessages,
} from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import { Button } from '@/components/ui/button';
import { CLOSER_CONTENT } from '@/lib/closer-content';

interface CloserTranscriptProps {
  open: boolean;
  onClose: () => void;
  /** Ob zusätzlich eine Texteingabe angeboten wird (Sektion 9, optional). */
  supportsChatInput?: boolean;
}

/**
 * Aufklappbares Transkript-Panel (Sektion 6 & 9). Auf Mobilgeräten als
 * Bottom-Sheet, auf Desktop als seitliches Panel. Nutzt die vorhandene
 * `AgentChatTranscript`-Komponente und die echten Session-Nachrichten – die
 * Transkriptlogik bleibt unverändert (Sektion 8).
 */
export function CloserTranscript({
  open,
  onClose,
  supportsChatInput = false,
}: CloserTranscriptProps) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const { send } = useChat();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    try {
      setSending(true);
      await send(text);
      setDraft('');
    } catch (error) {
      console.error('Nachricht konnte nicht gesendet werden:', error);
    } finally {
      setSending(false);
    }
  };

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

          <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
            {messages.length === 0 ? (
              <p className="text-cream-muted px-4 py-6 text-center text-sm">
                {CLOSER_CONTENT.transcript.empty}
              </p>
            ) : (
              <AgentChatTranscript
                agentState={agentState as AgentState}
                messages={messages as ReceivedMessage[]}
                className="[&>div>div]:px-3"
              />
            )}
          </div>

          {supportsChatInput && (
            <div className="border-gold/15 flex items-end gap-2 border-t p-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Schreib CLOSER etwas …"
                aria-label="Nachricht an CLOSER schreiben"
                className="text-cream placeholder:text-cream-muted/70 max-h-24 min-h-9 flex-1 resize-none rounded-md bg-black/30 px-3 py-2 text-sm focus:outline-none"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={sending || draft.trim().length === 0}
                aria-label="Nachricht senden"
                className="shrink-0"
              >
                <SendHorizontalIcon className="size-4" />
              </Button>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
