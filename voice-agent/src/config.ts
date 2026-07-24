/**
 * Zentrale Konfiguration des CLOSER-Voice-Agents (Sektion 12).
 *
 * Alle austauschbaren Bausteine – Modell, Stimme, Sprache, Begrüßung – werden
 * hier gebündelt. Geheime Schlüssel werden NICHT hier hinterlegt, sondern
 * ausschließlich über Environment-Variablen bereitgestellt (Sektion 13).
 *
 * WICHTIG: Die Standard-Modellnamen entsprechen dem offiziellen LiveKit
 * Node.js Agent-Starter (LiveKit Inference). Verfügbare Modelle und Stimmen
 * bitte in der LiveKit-Dokumentation prüfen, bevor sie geändert werden:
 *   LLM  -> https://docs.livekit.io/agents/models/llm/
 *   STT  -> https://docs.livekit.io/agents/models/stt/
 *   TTS  -> https://docs.livekit.io/agents/models/tts/
 */

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export interface CloserConfig {
  /** Anzeigename / Dispatch-Name des Agenten (muss zum Frontend passen). */
  agentName: string;
  /** Standardsprache; der Agent passt sich der Nutzersprache an. */
  language: string;
  llm: {
    /** LiveKit-Inference-Modellkennung für das Sprachmodell. */
    model: string;
  };
  stt: {
    /** Speech-to-Text-Modell. */
    model: string;
    /** Erkennungssprache ("multi" = automatische Mehrsprachigkeit). */
    language: string;
  };
  tts: {
    /** Text-to-Speech-Modell. */
    model: string;
    /** Stimmen-ID des TTS-Anbieters (KEINE reale Person klonen). */
    voice: string;
  };
  /** Vom Agenten beim Verbindungsaufbau gesprochene Standardbegrüßung. */
  greeting: string;
  /** Ausführliche Logausgaben aktivieren. */
  debug: boolean;
}

export const config: CloserConfig = {
  agentName: env('AGENT_NAME', 'CLOSER'),
  language: env('CLOSER_LANGUAGE', 'de'),

  llm: {
    model: env('CLOSER_LLM_MODEL', 'google/gemma-4-31b-it'),
  },

  stt: {
    model: env('CLOSER_STT_MODEL', 'deepgram/nova-3'),
    language: env('CLOSER_STT_LANGUAGE', 'multi'),
  },

  tts: {
    model: env('CLOSER_TTS_MODEL', 'cartesia/sonic-3'),
    // Neutrale Standardstimme aus dem offiziellen Starter – über VOICE_ID
    // austauschbar. Niemals die Stimme einer realen Person klonen (Sektion 0).
    voice: env('VOICE_ID', '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc'),
  },

  greeting: env(
    'CLOSER_GREETING',
    'Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?'
  ),

  debug: env('CLOSER_DEBUG', 'false').toLowerCase() === 'true',
};
