'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentEvents, type AgentLiveClient, DeepgramClient } from '@deepgram/sdk';
import { showCloserError, showMicError } from '@/components/closer/closer-error';
import type { CloserPhase } from '@/hooks/useCloserState';
import { CLOSER_SYSTEM_PROMPT } from '@/lib/closer-system-prompt';
import {
  DG_SAMPLE_RATE,
  type DeepgramAgentConfig,
  buildAgentSettings,
} from '@/lib/deepgram-config';

export interface DeepgramTranscriptMessage {
  role: string;
  content: string;
}

export interface DeepgramCloserState {
  phase: CloserPhase;
  volume: number;
  transcript: DeepgramTranscriptMessage[];
  isConnected: boolean;
  micEnabled: boolean;
  start: () => Promise<void>;
  end: () => void;
  toggleMic: () => void;
}

/**
 * Betreibt CLOSER über die Deepgram Voice Agent API (Engine "deepgram").
 *
 * Kümmert sich um: kurzlebiges Token holen, WebSocket-Client aufbauen,
 * Mikrofon als linear16 streamen, Agent-Audio abspielen und daraus Phase,
 * Lautstärke und Transkript für die Orb-Oberfläche ableiten. Kein LiveKit,
 * kein Dauer-Worker (Sektion 16 & 21).
 */
export function useDeepgramCloser(): DeepgramCloserState {
  const [phase, setPhase] = useState<CloserPhase>('idle');
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState<DeepgramTranscriptMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);

  const clientRef = useRef<AgentLiveClient | null>(null);
  const startingRef = useRef(false);
  const micEnabledRef = useRef(true);

  // Wiedergabe (Agent -> Lautsprecher)
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const nextStartTimeRef = useRef(0);

  // Aufnahme (Mikrofon -> Agent)
  const micStreamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeThrottleRef = useRef(0);
  const speakingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    processorRef.current?.disconnect();
    processorRef.current = null;
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    if (micCtxRef.current) {
      micCtxRef.current.close().catch(() => {});
      micCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      playbackCtxRef.current.close().catch(() => {});
      playbackCtxRef.current = null;
    }
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;
    speakingRef.current = false;
    try {
      clientRef.current?.disconnect();
    } catch {
      // Verbindung war evtl. schon geschlossen.
    }
    clientRef.current = null;
  }, []);

  const end = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setPhase('idle');
    setVolume(0);
    setTranscript([]);
  }, [cleanup]);

  // --- Mikrofonaufnahme starten (linear16 @ 24 kHz) ---
  const startMicrophone = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    micStreamRef.current = stream;

    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: DG_SAMPLE_RATE });
    micCtxRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    micSourceRef.current = source;
    const processor = ctx.createScriptProcessor(2048, 1, 1);
    processorRef.current = processor;

    const inRate = ctx.sampleRate;
    processor.onaudioprocess = (e) => {
      const client = clientRef.current;
      if (!client || !micEnabledRef.current) return;
      const input = e.inputBuffer.getChannelData(0);

      // Falls der Browser die gewünschte Rate ignoriert: einfach dezimieren.
      let data = input;
      if (inRate !== DG_SAMPLE_RATE && inRate === DG_SAMPLE_RATE * 2) {
        const half = Math.floor(input.length / 2);
        data = new Float32Array(half);
        for (let i = 0; i < half; i++) data[i] = input[i * 2];
      }

      const pcm = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        pcm[i] = Math.round(s * 0x7fff);
      }
      try {
        client.send(pcm.buffer);
      } catch {
        // Senden schlug fehl – wird über die Agent-Events behandelt.
      }
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }, []);

  // --- Agent-Audio in die Warteschlange spielen ---
  const enqueueAudio = useCallback((chunk: Int16Array) => {
    const ctx = playbackCtxRef.current;
    if (!ctx || chunk.length === 0) return;

    // Lautstärke (RMS) gedrosselt an den Orb geben.
    const now = performance.now();
    if (now - volumeThrottleRef.current > 80) {
      volumeThrottleRef.current = now;
      let sum = 0;
      for (let i = 0; i < chunk.length; i++) {
        const v = chunk[i] / 0x7fff;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / chunk.length);
      setVolume(Math.min(1, rms * 2.2));
    }

    const buffer = ctx.createBuffer(1, chunk.length, DG_SAMPLE_RATE);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < chunk.length; i++) channel[i] = chunk[i] / 0x7fff;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const current = ctx.currentTime;
    if (nextStartTimeRef.current < current) nextStartTimeRef.current = current;
    src.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    speakingRef.current = true;
    setPhase('speaking');

    src.onended = () => {
      if (
        audioQueueRef.current.length === 0 &&
        ctx.currentTime >= nextStartTimeRef.current - 0.12
      ) {
        speakingRef.current = false;
        setVolume(0);
        setPhase('listening');
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current || clientRef.current) return;
    startingRef.current = true;
    setPhase('connecting');
    setTranscript([]);

    // 1) Kurzlebiges Token + Konfiguration holen.
    let token: string;
    let config: DeepgramAgentConfig;
    try {
      const res = await fetch('/api/dg-token', { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        showCloserError(body.error === 'config' ? 'config' : 'connection');
        setPhase('idle');
        startingRef.current = false;
        return;
      }
      const data = (await res.json()) as { token: string; config: DeepgramAgentConfig };
      token = data.token;
      config = data.config;
    } catch {
      showCloserError('connection');
      setPhase('idle');
      startingRef.current = false;
      return;
    }

    // 2) Mikrofonfreigabe zuerst einholen (klare Fehlermeldung bei Ablehnung).
    try {
      await startMicrophone();
    } catch (error) {
      showMicError(error instanceof Error ? error : new Error('mic'));
      cleanup();
      setPhase('idle');
      startingRef.current = false;
      return;
    }

    // 3) Wiedergabe-AudioContext (durch die Nutzergeste erlaubt).
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const playbackCtx = new AudioCtx({ sampleRate: DG_SAMPLE_RATE });
    if (playbackCtx.state === 'suspended') await playbackCtx.resume();
    playbackCtxRef.current = playbackCtx;

    // 4) Voice-Agent-Client aufbauen und verdrahten.
    const client = new DeepgramClient({ accessToken: token }).agent();
    clientRef.current = client;

    client.once(AgentEvents.Welcome, () => {
      client.configure(buildAgentSettings(config, CLOSER_SYSTEM_PROMPT));
    });

    client.once(AgentEvents.SettingsApplied, () => {
      setIsConnected(true);
      setPhase('listening');
      startingRef.current = false;
      client.keepAlive();
      keepAliveRef.current = setInterval(() => {
        try {
          clientRef.current?.keepAlive();
        } catch {
          // ignorieren
        }
      }, 6000);
    });

    client.on(AgentEvents.UserStartedSpeaking, () => {
      // Nutzer unterbricht -> Wiedergabe verwerfen.
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
      speakingRef.current = false;
      setVolume(0);
      setPhase('listening');
    });

    client.on(AgentEvents.AgentThinking, () => {
      if (!speakingRef.current) setPhase('thinking');
    });

    client.on(AgentEvents.Audio, (payload: unknown) => {
      const chunk = toInt16(payload);
      if (!chunk) return;
      audioQueueRef.current.push(chunk);
      const next = audioQueueRef.current.shift();
      if (next) enqueueAudio(next);
    });

    client.on(AgentEvents.AgentAudioDone, () => {
      if (audioQueueRef.current.length === 0) {
        speakingRef.current = false;
        setVolume(0);
        setPhase('listening');
      }
    });

    client.on(AgentEvents.ConversationText, (msg: { role?: string; content?: string }) => {
      if (!msg?.content) return;
      setTranscript((prev) => [...prev, { role: msg.role ?? 'assistant', content: msg.content! }]);
    });

    client.on(AgentEvents.Error, () => {
      showCloserError('agentUnreachable');
      end();
    });

    client.on(AgentEvents.Close, () => {
      if (clientRef.current) end();
    });
  }, [cleanup, enqueueAudio, end, startMicrophone]);

  const toggleMic = useCallback(() => {
    micEnabledRef.current = !micEnabledRef.current;
    setMicEnabled(micEnabledRef.current);
  }, []);

  // Aufräumen beim Unmount.
  useEffect(() => cleanup, [cleanup]);

  return { phase, volume, transcript, isConnected, micEnabled, start, end, toggleMic };
}

/**
 * Wandelt die verschiedenen möglichen Audio-Payloads (ArrayBuffer, Uint8Array,
 * Int16Array) sicher in ein Int16Array um.
 */
function toInt16(payload: unknown): Int16Array | null {
  if (payload instanceof Int16Array) return payload;
  if (payload instanceof ArrayBuffer) return new Int16Array(payload);
  if (ArrayBuffer.isView(payload)) {
    const view = payload as ArrayBufferView;
    return new Int16Array(view.buffer, view.byteOffset, Math.floor(view.byteLength / 2));
  }
  return null;
}
