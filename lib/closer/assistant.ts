/**
 * Zentrale Konfiguration des CLOSER-Assistenten für Vapi.
 *
 * Hier werden Persönlichkeit (Systemprompt), Wissensbasis, Begrüßung sowie
 * Modell, Stimme und Transkription gebündelt. Vapi ist gehostet: die Provider-
 * Schlüssel (LLM/Stimme/Transkription) liegen in DEINEM Vapi-Dashboard, NICHT
 * in dieser App. Im Browser wird ausschließlich der öffentliche Vapi-Key genutzt.
 *
 * Modelle/Stimme hier zentral austauschbar. Verfügbare Optionen:
 *   LLM:          https://docs.vapi.ai/customization/provider-keys
 *   Stimmen:      https://docs.vapi.ai/voices (z. B. 11labs für Premium-Deutsch)
 *   Transkription: Deepgram nova-2/nova-3
 * Erfinde keine Modell-/Stimmnamen – nutze real existierende Werte deines Kontos.
 */

import { buildKnowledgeContext } from './knowledge';
import { CLOSER_SYSTEM_PROMPT } from './system-prompt';

/** Standardbegrüßung – wird von Vapi als `firstMessage` automatisch gesprochen. */
export const CLOSER_GREETING =
  'Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. ' +
  'Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?';

/** Standardsprache. Der Agent passt sich der Sprache des Nutzers an. */
export const CLOSER_LANGUAGE = 'de';

/**
 * Minimal typisierte Form eines transienten Vapi-Assistenten. Die Literale
 * (provider/model/voiceId/language) entsprechen der echten Vapi-API, damit der
 * Aufruf `vapi.start(assistant)` ohne Typumweg gültig ist.
 */
export interface CloserAssistant {
  name: string;
  firstMessage: string;
  firstMessageMode: 'assistant-speaks-first';
  model: {
    provider: 'openai';
    model: 'gpt-4o-mini';
    temperature?: number;
    messages: { role: 'system'; content: string }[];
  };
  voice: {
    provider: '11labs';
    /** Vapi-Stimm-Alias ODER rohe ElevenLabs-Voice-ID (siehe Kommentar unten). */
    voiceId: string;
    /** turbo_v2_5 = niedrige Latenz + erlaubt Sprach-Enforcement (language). */
    model: 'eleven_turbo_v2_5';
    language: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
    speed?: number;
  };
  transcriber: { provider: 'deepgram'; model: 'nova-2'; language: 'de' | 'multi' };
}

/** Baut die vollständige System-Instruktion (Prompt + Wissensbasis + Voice-Regeln). */
function buildInstructions(): string {
  const voiceNote =
    'SPRACHE UND FORMAT: Sprich standardmäßig Deutsch und passe dich der Sprache des Nutzers an. ' +
    'Antworte kurz, natürlich und für Sprachausgabe optimiert: ein bis drei Sätze, keine ' +
    'Aufzählungen, keine Markdown-Formatierung, keine Emojis, immer nur eine Frage.';
  return [CLOSER_SYSTEM_PROMPT, buildKnowledgeContext(), voiceNote].join('\n\n');
}

/**
 * Erzeugt den transienten CLOSER-Assistenten. Wird an `vapi.start()` übergeben.
 *
 * Stimme wechseln (Premium-Deutsch, empfohlen): das `voice`-Objekt ersetzen, z. B.
 *   voice: { provider: '11labs', voiceId: '<deine-elevenlabs-stimme>' }
 * (dafür ElevenLabs im Vapi-Dashboard verbinden).
 */
export function buildCloserAssistant(): CloserAssistant {
  return {
    name: 'CLOSER',
    firstMessage: CLOSER_GREETING,
    firstMessageMode: 'assistant-speaks-first',
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [{ role: 'system', content: buildInstructions() }],
    },
    // Hochwertige deutsche Stimme über ElevenLabs (turbo_v2_5, Sprache erzwungen).
    // voiceId = die im Vapi-Dashboard/ElevenLabs gewählte native deutsche Stimme.
    // Zum Wechseln einfach eine andere ElevenLabs-Voice-ID (oder einen Vapi-Alias
    // wie 'joseph', 'paul', 'steve') eintragen.
    voice: {
      provider: '11labs',
      voiceId: 'BDqe1qZiwPi7xspRxTgh',
      model: 'eleven_turbo_v2_5',
      language: 'de',
      stability: 0.45,
      similarityBoost: 0.8,
      style: 0.35,
      useSpeakerBoost: true,
      speed: 1.0,
    },
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'de' },
  };
}
