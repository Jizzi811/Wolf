'use client';

import { ConnectionState } from 'livekit-client';
import {
  type TrackReference,
  useSessionContext,
  useTrackVolume,
  useVoiceAssistant,
} from '@livekit/components-react';

/**
 * Die visuellen Phasen des Orbs. Sie werden aus den echten LiveKit-Zuständen
 * abgeleitet – es werden keine Zustände erfunden (Sektion 5).
 */
export type CloserPhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';

export interface CloserState {
  /** Abgeleitete Phase für Orb-Animation und Statustext. */
  phase: CloserPhase;
  /** Ob eine Session aktiv verbunden ist. */
  isConnected: boolean;
  /** Audiopegel des Agenten (0–1), treibt die Sprech-Reaktion des Orbs. */
  volume: number;
  /** Der Audiotrack des Agenten für den Visualizer. */
  audioTrack: TrackReference | undefined;
}

/**
 * Leitet aus Session- und Agentenzustand die aktuelle Orb-Phase ab und liefert
 * den Audiopegel für die audioreaktive Darstellung. Zentralisiert die Logik,
 * damit sie nicht in mehreren Komponenten dupliziert wird (Sektion 16).
 */
export function useCloserState(): CloserState {
  const session = useSessionContext();
  const { state: agentState, audioTrack } = useVoiceAssistant();
  const volume = useTrackVolume(audioTrack);

  let phase: CloserPhase = 'idle';

  if (session.connectionState === ConnectionState.Connecting) {
    phase = 'connecting';
  } else if (!session.isConnected) {
    phase = 'idle';
  } else {
    switch (agentState) {
      case 'connecting':
      case 'initializing':
      case 'pre-connect-buffering':
        phase = 'connecting';
        break;
      case 'thinking':
        phase = 'thinking';
        break;
      case 'speaking':
        phase = 'speaking';
        break;
      case 'listening':
      case 'idle':
      default:
        phase = 'listening';
        break;
    }
  }

  return {
    phase,
    isConnected: session.isConnected,
    volume: Number.isFinite(volume) ? volume : 0,
    audioTrack,
  };
}
