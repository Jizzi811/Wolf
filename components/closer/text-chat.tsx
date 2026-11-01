'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeBrand } from '@/lib/closer/brand';
import { uiFor } from '@/lib/closer/i18n';
import type { CloserLanguage } from '@/lib/closer/languages';
import { Send } from './control-icons';
import { cn } from '@/lib/utils';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface TextChatProps {
  language: CloserLanguage;
  agentName: string;
  refUsername: string | null;
  visitorId: string;
  /** Verlauf aus einem vorherigen Sprach- oder Textgespräch (bei Sprachwechsel). */
  carryOver?: ChatMsg[];
  onConversation?: (id: string) => void;
}

/**
 * Textmodus: für Sprachen ohne Sprachausgabe und als Rückfall ohne Mikrofon.
 * Antworten kommen von /api/chat; „Vorlesen" nutzt die Browser-Stimme, falls vorhanden.
 */
export function TextChat({ language, agentName, refUsername, visitorId, carryOver, onConversation }: TextChatProps) {
  const t = uiFor(language.lang);
  const [messages, setMessages] = useState<ChatMsg[]>(carryOver ?? []);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeted, setGreeted] = useState(false);
  const conversationId = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    try {
      const pick = () => {
        const voices = window.speechSynthesis?.getVoices?.() ?? [];
        setCanSpeak(voices.some((v) => v.lang.toLowerCase().startsWith(language.bcp47.toLowerCase().split('-')[0])));
      };
      pick();
      window.speechSynthesis?.addEventListener?.('voiceschanged', pick);
      return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', pick);
    } catch {
      setCanSpeak(false);
    }
  }, [language.bcp47]);

  useEffect(() => {
    if (messages.length === 0 && !busy) return;
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, busy]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);
      const next = [...messages, { id: `${Date.now()}-u`, role: 'user' as const, text: trimmed }];
      setMessages(next);
      setValue('');
      setBusy(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang: language.lang,
            ref: refUsername ?? undefined,
            v: visitorId,
            conversationId: conversationId.current ?? undefined,
            messages: next.map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const json = (await res.json().catch(() => ({}))) as { conversationId?: string; reply?: string; greeting?: string; message?: string; error?: string };
        if (!res.ok || !json.reply) {
          setError(json.message || (json.error === 'login_required' ? t.sessionEnded : t.retry));
          return;
        }
        if (json.conversationId) {
          conversationId.current = json.conversationId;
          onConversation?.(json.conversationId);
        }
        const additions: ChatMsg[] = [];
        if (json.greeting && !greeted && messages.length === 0) {
          additions.push({ id: `${Date.now()}-g`, role: 'assistant', text: json.greeting });
          setGreeted(true);
        }
        additions.push({ id: `${Date.now()}-a`, role: 'assistant', text: json.reply });
        setMessages((prev) => {
          // Begrüßung vor die erste Nutzer-Nachricht setzen.
          const g = additions.find((a) => a.id.endsWith('-g'));
          const rest = additions.filter((a) => !a.id.endsWith('-g'));
          return g ? [g, ...prev, ...rest] : [...prev, ...rest];
        });
      } catch {
        setError(navigator.onLine === false ? t.offline : t.retry);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, language.lang, refUsername, visitorId, greeted, onConversation, t]
  );

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language.bcp47;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* keine Browser-Stimme */
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-3" dir={language.rtl ? 'rtl' : undefined}>
      <div className="rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-cream/90">
        <p className="font-semibold text-gold-light">{t.textOnly}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t.textOnlyHint}</p>
      </div>

      <div className="scroll-gold flex max-h-[50svh] min-h-40 flex-col gap-2 overflow-y-auto rounded-2xl border border-gold/15 bg-ink-2/60 p-3" role="log" aria-live="polite">
        {messages.length === 0 && !busy ? <p className="py-8 text-center text-sm text-muted/70">{t.ready}</p> : null}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed', m.role === 'user' ? 'bg-gold/15 text-cream' : 'border border-gold/15 bg-white/[0.03] text-cream/90')}>
              <span className="mb-0.5 block text-[0.62rem] font-semibold uppercase tracking-wider text-gold/60">{m.role === 'user' ? t.you : agentName}</span>
              {normalizeBrand(m.text)}
              {m.role === 'assistant' && canSpeak ? (
                <button type="button" onClick={() => speak(m.text)} className="mt-1 block text-[0.7rem] text-gold-light underline-offset-2 hover:underline">
                  {t.readAloud}
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {busy ? <p className="px-2 text-xs text-muted">{t.thinking} …</p> : null}
        <div ref={endRef} />
      </div>

      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(value);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.typeMessage}
          aria-label={t.typeMessage}
          lang={language.bcp47}
          disabled={busy}
          className="h-12 flex-1 rounded-full border border-gold/25 bg-white/[0.03] px-4 text-sm text-cream placeholder:text-muted/60 focus-visible:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
        <Button type="submit" variant="icon" size="icon" disabled={busy || value.trim().length === 0} aria-label={t.send}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
