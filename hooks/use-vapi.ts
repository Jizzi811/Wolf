'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Vapi from '@vapi-ai/web';
import { buildActiveAssistant } from '@/lib/active-persona';
import { type CloserState } from '@/lib/closer-state';
import { classifyError, isVoiceSupported, type CloserErrorKey } from '@/lib/errors';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
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

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

/**
 * Kapselt die gesamte Vapi-Logik an einer Stelle (keine doppelten Abos):
 * Verbindungsaufbau, Ereignis-Verdrahtung, Zustände, Mikrofon, Text und Fehler.
 */
export function useVapi(): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null);
  const userEnded = useRef(false);
  const wasConnected = useRef(false);

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

  const registerEvents = useCallback((v: Vapi) => {
    v.on('call-start', () => {
      wasConnected.current = true;
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
      if (wasConnected.current && !userEnded.current) {
        setErrorKey('sessionEnded');
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
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-${prev.length}`, role, text: msg.transcript as string },
        ]);
        if (role === 'user') setThinking(true);
      } else {
        setPartial({ role, text: msg.transcript });
      }
    });

    v.on('error', (e: unknown) => {
      setErrorKey(classifyError(e));
      setConnecting(false);
    });
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
      if (ASSISTANT_ID) {
        await vapiRef.current.start(ASSISTANT_ID);
      } else {
        await vapiRef.current.start(buildActiveAssistant());
      }
    } catch (err) {
      setErrorKey(classifyError(err));
      setConnecting(false);
    }
  }, [registerEvents]);

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

  const sendText = useCallback((text: string) => {
    const v = vapiRef.current;
    const trimmed = text.trim();
    if (!v || !trimmed) return;
    v.send({
      type: 'add-message',
      message: { role: 'user', content: trimmed },
      triggerResponseEnabled: true,
    });
    setMessages((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, role: 'user', text: trimmed }]);
  }, []);

  const dismissError = useCallback(() => setErrorKey(null), []);

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
