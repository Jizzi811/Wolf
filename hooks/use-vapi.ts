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

export interface UseVapiReturn {
  state: CloserState;
  /** Lautstärke der Agentenstimme (0..1) für den Visualizer. */
  level: number;
  messages: TranscriptMessage[];
  /** Laufende (noch nicht finale) Äußerung. */
  partial: { role: 'user' | 'assistant'; text: string } | null;
  isConnected: boolean;
  connecting: boolean;
  isMuted: boolean;
  errorKey: CloserErrorKey | null;
  start: () => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
  sendText: (text: string) => void;
  dismissError: () => void;
}

/** Roh-Form einer Vapi-Nachricht, soweit wir sie auswerten. */
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

function visitorId(): string {
  const s = storage();
  const key = 'closer_visitor';
  let v = s?.getItem(key) ?? '';
  if (!v) {
    v = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
    s?.setItem(key, v);
  }
  return v;
}

/** Liest ?ref=<benutzername> aus dem Link und merkt ihn 30 Tage. */
function refUsername(): string | null {
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
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* Statistik darf das Gespräch nie stören */
  }
}

/**
 * Kapselt die gesamte Vapi-Logik an einer Stelle (keine doppelten Abos):
 * Verbindungsaufbau, Ereignis-Verdrahtung, Zustände, Mikrofon, Text und Fehler.
 * Der Assistent (Persona, Wissen, Stimme) kommt vom Server (/api/assistant).
 */
export function useVapi(): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null);
  const userEnded = useRef(false);
  const wasConnected = useRef(false);
  const conversationId = useRef<string | null>(null);
  const startedAt = useRef<number>(0);
  const messagesRef = useRef<TranscriptMessage[]>([]);

  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [level, setLevel] = useState(0);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [partial, setPartial] = useState<{ role: 'user' | 'assistant'; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [errorKey, setErrorKey] = useState<CloserErrorKey | null>(null);

  const state: CloserState = !isConnected
    ? connecting
      ? 'connecting'
      : 'disconnected'
    : speaking
      ? 'speaking'
      : thinking
        ? 'thinking'
        : 'listening';

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
        const unexpected = wasConnected.current && !userEnded.current;
        if (unexpected) setErrorKey('sessionEnded');
        if (conversationId.current && startedAt.current) {
          void track({
            type: 'end',
            conversationId: conversationId.current,
            durationS: Math.round((Date.now() - startedAt.current) / 1000),
            transcript: messagesRef.current.map((m) => ({ role: m.role, text: m.text, at: m.at })),
            endedReason: userEnded.current ? 'nutzer-beendet' : unexpected ? 'unerwartet' : 'assistent-beendet',
          });
        }
        wasConnected.current = false;
        userEnded.current = false;
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
          pushMessage({
            id: `${Date.now()}-${messagesRef.current.length}`,
            role,
            text: msg.transcript as string,
            at: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : undefined,
          });
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

  /** Holt den Assistenten vom Server; fällt bei Problemen auf die eingebaute Konfiguration zurück. */
  const loadAssistant = useCallback(async (): Promise<{ conversationId: string | null; assistant: AssistantArg }> => {
    const params = new URLSearchParams();
    const ref = refUsername();
    if (ref) params.set('ref', ref);
    params.set('v', visitorId());
    try {
      const res = await fetch(`/api/assistant?${params.toString()}`, { cache: 'no-store' });
      if (res.status === 401) throw Object.assign(new Error('login_required'), { code: 'login_required' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { conversationId: string; assistant: AssistantArg };
      return { conversationId: json.conversationId, assistant: json.assistant };
    } catch (e) {
      if ((e as { code?: string }).code === 'login_required') throw e;
      return { conversationId: null, assistant: buildCloserAssistant() as unknown as AssistantArg };
    }
  }, []);

  const start = useCallback(async () => {
    setErrorKey(null);
    if (!PUBLIC_KEY) {
      setErrorKey('configMissing');
      return;
    }
    if (!isVoiceSupported()) {
      setErrorKey('browserUnsupported');
      return;
    }
    setConnecting(true);
    setMessages([]);
    messagesRef.current = [];
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
        conversationId.current = null;
        call = await vapiRef.current.start(ASSISTANT_ID);
      } else {
        const { conversationId: cid, assistant } = await loadAssistant();
        conversationId.current = cid;
        call = await vapiRef.current.start(assistant);
      }
      if (conversationId.current) {
        void track({
          type: 'start',
          conversationId: conversationId.current,
          vapiCallId: call?.id,
          visitorId: visitorId(),
          refUsername: refUsername() ?? undefined,
        });
      }
    } catch (err) {
      if ((err as { code?: string }).code === 'login_required') {
        window.location.href = `/login?next=${encodeURIComponent('/')}`;
        return;
      }
      setErrorKey(classifyError(err));
      setConnecting(false);
    }
  }, [registerEvents, loadAssistant]);

  const stop = useCallback(() => {
    userEnded.current = true;
    try {
      vapiRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

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
      v.send({
        type: 'add-message',
        message: { role: 'user', content: trimmed },
        triggerResponseEnabled: true,
      });
      pushMessage({ id: `${Date.now()}-${messagesRef.current.length}`, role: 'user', text: trimmed, at: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : undefined });
    },
    [pushMessage]
  );

  const dismissError = useCallback(() => setErrorKey(null), []);

  // Seitenaufruf zählen (einmal pro Laden) und Empfehler aus dem Link merken.
  useEffect(() => {
    const ref = refUsername();
    void track({ type: 'event', name: 'page_view', visitorId: visitorId(), path: window.location.pathname, meta: ref ? { ref } : {} });
  }, []);

  // Aufräumen beim Unmount.
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

  return {
    state,
    level,
    messages,
    partial,
    isConnected,
    connecting,
    isMuted,
    errorKey,
    start,
    stop,
    toggleMute,
    sendText,
    dismissError,
  };
}
