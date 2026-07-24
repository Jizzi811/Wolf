'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CloserPhase } from '@/hooks/useCloserState';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

export interface SimpleVoiceAgentState {
  phase: CloserPhase;
  isConnected: boolean;
  volume: number;
  transcript: string;
  messages: Message[];
  micEnabled: boolean;
  startListening: () => Promise<void>;
  stopSession: () => void;
  toggleMic: () => void;
}

export function useSimpleVoiceAgent(): SimpleVoiceAgentState {
  const [phase, setPhase] = useState<CloserPhase>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const isActiveRef = useRef(false);
  const phaseRef = useRef<CloserPhase>('idle');
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const transcriptRef = useRef('');
  const msgIdRef = useRef(0);

  const updatePhase = useCallback((a: CloserPhase) => {
    phaseRef.current = a;
    setPhase(a);
  }, []);

  const pollVolume = useCallback(
    (analyser: AnalyserNode, ctx: AudioContext): (() => void) => {
      const data = new Uint8Array(analyser.fftSize);
      let rafId = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setVolume(Math.min(Math.sqrt(sum / data.length) * 5, 1));
        rafId = requestAnimationFrame(tick);
        animFrameRef.current = rafId;
      };
      rafId = requestAnimationFrame(tick);
      animFrameRef.current = rafId;
      return () => {
        cancelAnimationFrame(rafId);
        ctx.close().catch(() => {});
      };
    },
    []
  );

  const playAudio = useCallback(
    async (buffer: ArrayBuffer): Promise<void> => {
      cancelAnimationFrame(animFrameRef.current);
      return new Promise<void>((resolve, reject) => {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.connect(ctx.destination);

        ctx
          .decodeAudioData(buffer)
          .then((decoded) => {
            const src = ctx.createBufferSource();
            src.buffer = decoded;
            src.connect(analyser);
            const stopPolling = pollVolume(analyser, ctx);
            src.start();
            src.onended = () => {
              stopPolling();
              setVolume(0);
              resolve();
            };
          })
          .catch(reject);
      });
    },
    [pollVolume]
  );

  const playAudioRef = useRef(playAudio);
  playAudioRef.current = playAudio;

  const ask = useCallback(
    async (userText: string): Promise<void> => {
      const uid = String(++msgIdRef.current);
      setMessages((prev) => [...prev, { id: uid, role: 'user', content: userText }]);
      historyRef.current = [...historyRef.current, { role: 'user', content: userText }];

      updatePhase('thinking');

      try {
        const res = await fetch('/api/jordan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: userText, history: historyRef.current.slice(-12) }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`API error ${res.status}: ${err}`);
        }

        const agentTextRaw = res.headers.get('X-Agent-Text') ?? '';
        const agentText = agentTextRaw ? decodeURIComponent(agentTextRaw) : '';
        if (agentText) {
          const aid = String(++msgIdRef.current);
          setMessages((prev) => [
            ...prev,
            { id: aid, role: 'agent', content: agentText },
          ]);
          historyRef.current = [
            ...historyRef.current,
            { role: 'assistant', content: agentText },
          ];
        }

        const audioBuf = await res.arrayBuffer();
        updatePhase('speaking');
        await playAudioRef.current(audioBuf);
      } catch (err) {
        console.error('[Jordan] ask error:', err);
      }

      if (isActiveRef.current) updatePhase('listening');
    },
    [updatePhase]
  );

  const askRef = useRef(ask);
  askRef.current = ask;

  const startCycle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !isActiveRef.current) return;

    transcriptRef.current = '';
    setTranscript('');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognition.onend = async () => {
      const text = transcriptRef.current.trim();
      transcriptRef.current = '';
      setTranscript('');

      if (!isActiveRef.current) return;

      if (text) {
        await askRef.current(text);
      }

      if (isActiveRef.current) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };

    try {
      recognition.start();
      updatePhase('listening');
    } catch {
      /* ignore */
    }
  }, [updatePhase]);

  const startCycleRef = useRef(startCycle);
  startCycleRef.current = startCycle;

  const stopSession = useCallback(() => {
    isActiveRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    updatePhase('idle');
    setIsConnected(false);
    setVolume(0);
    setTranscript('');
    transcriptRef.current = '';
  }, [updatePhase]);

  const toggleMic = useCallback(() => {
    setMicEnabled((prev) => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  }, []);

  const startListening = useCallback(async () => {
    if (isActiveRef.current) return;

    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
        : null;

    if (!SpeechRecognitionCtor) {
      alert('Kein Web Speech API verfügbar. Bitte Chrome oder Edge verwenden.');
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert('Mikrofon-Zugriff wurde verweigert. Bitte Berechtigung erteilen.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'no-speech') return;
      console.error('[Jordan] STT error:', e.error);
    };
    recognitionRef.current = recognition;

    isActiveRef.current = true;
    setIsConnected(true);
    updatePhase('connecting');

    setTimeout(() => {
      if (isActiveRef.current) startCycleRef.current();
    }, 400);
  }, [updatePhase]);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    phase,
    isConnected,
    volume,
    transcript,
    messages,
    micEnabled,
    startListening,
    stopSession,
    toggleMic,
  };
}
