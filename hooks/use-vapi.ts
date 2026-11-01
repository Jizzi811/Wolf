'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Vapi from '@vapi-ai/web';
import { buildCloserAssistant } from '@/lib/closer/assistant';
import { type CloserState } from '@/lib/closer-state';
import { classifyError, isVoiceSupported, type CloserErrorKey } from '@/lib/errors';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Sekunden seit Gesprächsbeginn. */
  at?: number;
}

export interface StartOptions {
  /** Sprachkennung aus lib/closer/languages.ts. */
  lang: string;
  /** Zusammenfassung des bisherigen Verlaufs (Sprachwechsel). */
  history?: string;
}

export interface UseVapiReturn {
  state: CloserState;
  level: number;
  messages: TranscriptMessage[];
  partial: { role: 'user' | 'assistant'; text: string } | null;
  isConnected: boolean;
  connecting: boolean;
  isMuted: boolean;
  isOnline: boolean;
  errorKey: CloserErrorKey | null;
  start: (opts: StartOptions) => Promise<void>;
  stop: () => void;
  /** Beendet sauber und startet mit neuer Sprache neu; der Verlauf wird mitgegeben. */
  switchLanguage: (lang: string) => void;
  toggleMute: () => void;
  sendText: (text: string) => void;
  dismissError: () => void;
  conversationId: string | null;
}

interface VapiMessage {
  type?: string;
  role?: 'user' | 'assistant' | 'system' | string;
  transcript?: string;
  transcriptType?: 'partial' | 'final' | string;
}

type AssistantArg = Parameters<Vapi['start']>[0];

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* ---------- Besucher-Kennung und Empfehler (nur im Browser-Speicher) ---------- */

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function visitorId(): string {
  const s = storage();
  const key = 'closer_visitor';
  let v = s?.getItem(key) ?? '';
  if (!v) {
    v = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
    try {
      s?.setItem(key, v);
    } catch {
      /* Speicher voll oder gesperrt */
    }
  }
  return v;
}

/** Liest ?ref=<benutzername> aus dem Link und merkt ihn 30 Tage. */
export function refUsername(): string | null {
  const s = storage();
  const key = 'closer_ref';
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ref');
    if (fromUrl && /^[a-zA-Z0-9._-]{2,64}$/.test(fromUrl)) {
      s?.setItem(key, JSON.stringify({ ref: fromUrl, until: Date.now() + REF_TTL_MS }));
      return fromUrl;
    }
    const raw = s?.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { ref?: string; until?: number };
      if (parsed.ref && parsed.until && parsed.until > Date.now()) return parsed.ref;
      s?.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function track(body: Record<string, unknown>) {
  try {
    await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true });
  } catch {
    /* Statistik darf das Gespräch nie stören */
  }
}

/** Kurze Zusammenfassung des Verlaufs für den Neustart in anderer Sprache. */
export function summarizeForHandover(messages: TranscriptMessage[]): string {
  return messages
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Nutzer' : 'Agent'}: ${m.text}`)
    .join('\n')
    .slice(0, 3500);
}

/**
 * Kapselt die gesamte Vapi-Logik: Verbindungsaufbau, Ereignisse, Zustände,
 * Mikrofon, Text, Fehler, Sprachwechsel. Der Assistent kommt vom Server.
 */
export function useVapi(): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null);
  const userEnded = useRef(false);
  const wasConnected = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const startedAt = useRef<number>(0);
  const messagesRef = useRef<TranscriptMessage[]>([]);
  const pendingRestart = useRef<StartOptions | null>(null);
  const startRef = useRef<(opts: StartOptions) => Promise<void>>(async () => {});

  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [level, setLevel] = useState(0);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [partial, setPartial] = useState<{ role: 'user' | 'assistant'; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [errorKey, setErrorKey] = useState<CloserErrorKey | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const state: CloserState = !isConnected ? (connecting ? 'connecting' : 'disconnected') : speaking ? 'speaking' : thinking ? 'thinking' : 'listening';

  // Lange Gespräche: alle 5 Minuten die Plattform nach Änderungen fragen lassen (Server lädt nur Geändertes).
  useEffect(() => {
    if (!isConnected) return;
    const id = window.setInterval(() => {
      fetch('/api/bridge/refresh', { method: 'POST', keepalive: true }).catch(() => null);
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [isConnected]);

  const pushMessage = useCallback((m: TranscriptMessage) => {
    setMessages((prev) => {
      const next = [...prev, m];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const registerEvents = useCallback(
    (v: Vapi) => {
      v.on('call-start', () => {
        wasConnected.current = true;
        startedAt.current = Date.now();
        setIsConnected(true);
        setConnecting(false);
        setSpeaking(false);
        setThinking(false);
      });

      v.on('call-end', () => {
        setIsConnected(false);
        setConnecting(false);
        setSpeaking(false);
        setThinking(false);
        setLevel(0);
        setPartial(null);
        const restart = pendingRestart.current;
        const unexpected = wasConnected.current && !userEnded.current && !restart;
        if (unexpected) setErrorKey(navigator.onLine === false ? 'connectionError' : 'sessionEnded');
        if (conversationIdRef.current && startedAt.current) {
          void track({
            type: 'end',
            conversationId: conversationIdRef.current,
            durationS: Math.round((Date.now() - startedAt.current) / 1000),
            transcript: messagesRef.current.map((m) => ({ role: m.role, text: m.text, at: m.at })),
            endedReason: restart ? 'sprachwechsel' : userEnded.current ? 'nutzer-beendet' : unexpected ? 'unerwartet' : 'assistent-beendet',
          });
        }
        wasConnected.current = false;
        userEnded.current = false;
        if (restart) {
          pendingRestart.current = null;
          window.setTimeout(() => void startRef.current(restart), 250);
        }
      });

      v.on('speech-start', () => {
        setSpeaking(true);
        setThinking(false);
      });
      v.on('speech-end', () => setSpeaking(false));
      v.on('volume-level', (volume: number) => setLevel(volume));

      v.on('message', (msg: VapiMessage) => {
        if (msg?.type !== 'transcript' || !msg.transcript) return;
        const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
        if (msg.transcriptType === 'final') {
          setPartial(null);
          pushMessage({ id: `${Date.now()}-${messagesRef.current.length}`, role, text: msg.transcript as string, at: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : undefined });
          if (role === 'user') setThinking(true);
        } else {
          setPartial({ role, text: msg.transcript });
        }
      });

      v.on('error', (e: unknown) => {
        setErrorKey(classifyError(e));
        setConnecting(false);
      });
    },
    [pushMessage]
  );

  /** Holt den Assistenten vom Server; fällt bei Netzproblemen auf die eingebaute Konfiguration zurück. */
  const loadAssistant = useCallback(async (opts: StartOptions): Promise<{ conversationId: string | null; assistant: AssistantArg }> => {
    const ref = refUsername();
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ lang: opts.lang, ref: ref ?? undefined, v: visitorId(), history: opts.history }),
      });
      if (res.status === 401) throw Object.assign(new Error('login_required'), { code: 'login_required' });
      if (res.status === 409) throw Object.assign(new Error('text_only'), { code: 'text_only' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { conversationId: string; assistant: AssistantArg };
      return { conversationId: json.conversationId, assistant: json.assistant };
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'login_required' || code === 'text_only') throw e;
      if (opts.lang !== 'de') throw e;
      return { conversationId: null, assistant: buildCloserAssistant() as unknown as AssistantArg };
    }
  }, []);

  const start = useCallback(
    async (opts: StartOptions) => {
      setErrorKey(null);
      if (!PUBLIC_KEY) {
        setErrorKey('configMissing');
        return;
      }
      if (!isVoiceSupported()) {
        setErrorKey('browserUnsupported');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setErrorKey('connectionError');
        return;
      }
      setConnecting(true);
      if (!opts.history) {
        setMessages([]);
        messagesRef.current = [];
      }
      setPartial(null);
      try {
        if (!vapiRef.current) {
          const VapiCtor = (await import('@vapi-ai/web')).default;
          const v = new VapiCtor(PUBLIC_KEY);
          registerEvents(v);
          vapiRef.current = v;
        }
        userEnded.current = false;
        setIsMuted(false);
        let call: Awaited<ReturnType<Vapi['start']>> = null;
        if (ASSISTANT_ID) {
          conversationIdRef.current = null;
          call = await vapiRef.current.start(ASSISTANT_ID);
        } else {
          const { conversationId: cid, assistant } = await loadAssistant(opts);
          conversationIdRef.current = cid;
          setConversationId(cid);
          call = await vapiRef.current.start(assistant);
        }
        if (conversationIdRef.current) {
          void track({ type: 'start', conversationId: conversationIdRef.current, vapiCallId: call?.id, visitorId: visitorId(), refUsername: refUsername() ?? undefined });
        }
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === 'login_required') {
          window.location.href = `/login?next=${encodeURIComponent('/')}`;
          return;
        }
        setErrorKey(code === 'text_only' ? 'generic' : classifyError(err));
        setConnecting(false);
      }
    },
    [registerEvents, loadAssistant]
  );
  startRef.current = start;

  const stop = useCallback(() => {
    userEnded.current = true;
    try {
      vapiRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const switchLanguage = useCallback(
    (lang: string) => {
      const v = vapiRef.current;
      if (!v || !wasConnected.current) return;
      pendingRestart.current = { lang, history: summarizeForHandover(messagesRef.current) };
      try {
        v.stop();
      } catch {
        pendingRestart.current = null;
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    const v = vapiRef.current;
    if (!v) return;
    const next = !v.isMuted();
    v.setMuted(next);
    setIsMuted(next);
  }, []);

  const sendText = useCallback(
    (text: string) => {
      const v = vapiRef.current;
      const trimmed = text.trim();
      if (!v || !trimmed) return;
      v.send({ type: 'add-message', message: { role: 'user', content: trimmed }, triggerResponseEnabled: true });
      pushMessage({ id: `${Date.now()}-${messagesRef.current.length}`, role: 'user', text: trimmed, at: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : undefined });
    },
    [pushMessage]
  );

  const dismissError = useCallback(() => setErrorKey(null), []);

  // Netzstatus, Seitenaufruf, Empfehler.
  useEffect(() => {
    setIsOnline(navigator.onLine !== false);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const ref = refUsername();
    void track({ type: 'event', name: 'page_view', visitorId: visitorId(), path: window.location.pathname, meta: ref ? { ref } : {} });
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    return () => {
      try {
        vapiRef.current?.stop();
      } catch {
        /* ignore */
      }
      vapiRef.current?.removeAllListeners?.();
    };
  }, []);

  return { state, level, messages, partial, isConnected, connecting, isMuted, isOnline, errorKey, start, stop, switchLanguage, toggleMute, sendText, dismissError, conversationId };
}
