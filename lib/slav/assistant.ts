/**
 * Zentrale Konfiguration des SLAV-Assistenten für Vapi.
 *
 * Hier werden Persönlichkeit (Systemprompt), fiktive Lore, Begrüßung sowie
 * Modell, Stimme und Transkription gebündelt. Vapi ist gehostet: die Provider-
 * Schlüssel (LLM/Stimme/Transkription) liegen in DEINEM Vapi-Dashboard, NICHT
 * in dieser App. Im Browser wird ausschließlich der öffentliche Vapi-Key genutzt.
 *
 * Diese Datei ist ein „Klon" von lib/closer/assistant.ts mit derselben Struktur,
 * damit Personas beliebig ausgetauscht werden können (siehe lib/active-persona.ts).
 *
 * Modelle/Stimme hier zentral austauschbar. Verfügbare Optionen:
 *   LLM:          https://docs.vapi.ai/customization/provider-keys
 *   Stimmen:      https://docs.vapi.ai/voices (z. B. 11labs für Premium-Deutsch)
 *   Transkription: Deepgram nova-2/nova-3
 * Erfinde keine Modell-/Stimmnamen – nutze real existierende Werte deines Kontos.
 */

import { buildSlavLore } from './knowledge';
import { SLAV_SYSTEM_PROMPT } from './system-prompt';

/** Standardbegrüßung – wird von Vapi als `firstMessage` automatisch gesprochen. */
export const SLAV_GREETING = 'Hallo Gebrüder Slav, was wollen wir heute Schönes anstellen?';

/** Standardsprache. Der Agent passt sich der Sprache des Nutzers an. */
export const SLAV_LANGUAGE = 'de';

/**
 * Minimal typisierte Form eines transienten Vapi-Assistenten (identisch zur
 * CLOSER-Struktur), damit `vapi.start(assistant)` ohne Typumweg gültig ist.
 */
export interface SlavAssistant {
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

/** Baut die vollständige System-Instruktion (Prompt + Lore + Voice-Regeln). */
function buildInstructions(): string {
  const voiceNote =
    'SPRACHE UND FORMAT: Sprich standardmäßig Deutsch, locker und albern, und passe ' +
    'dich der Sprache des Nutzers an. Antworte kurz, natürlich und für Sprachausgabe ' +
    'optimiert: ein bis drei Sätze, keine Aufzählungen, keine Markdown-Formatierung, ' +
    'keine Emojis, immer nur eine Frage. Baue Wortfindungspausen höchstens ein- bis ' +
    'zweimal ein und bleibe dabei immer verständlich.';
  return [SLAV_SYSTEM_PROMPT, buildSlavLore(), voiceNote].join('\n\n');
}

/**
 * Erzeugt den transienten SLAV-Assistenten. Wird an `vapi.start()` übergeben.
 *
 * Stimme wechseln (empfohlen eine verspielte, warme deutsche Männerstimme):
 * das `voice`-Objekt anpassen, z. B.
 *   voice: { provider: '11labs', voiceId: '<deine-elevenlabs-stimme>' }
 * (dafür ElevenLabs im Vapi-Dashboard verbinden). Die voiceId unten ist nur ein
 * funktionierender Platzhalter – für Slav am besten eine lebhaftere Stimme wählen.
 */
export function buildSlavAssistant(): SlavAssistant {
  return {
    name: 'SLAV',
    firstMessage: SLAV_GREETING,
    firstMessageMode: 'assistant-speaks-first',
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      // Etwas höhere Temperatur für mehr spielerische, alberne Varianz.
      temperature: 0.95,
      messages: [{ role: 'system', content: buildInstructions() }],
    },
    // Slav-Stimme (ElevenLabs). Zum Wechseln einfach eine andere ElevenLabs-
    // Voice-ID (oder einen Vapi-Alias) eintragen; ElevenLabs muss dafür im
    // Vapi-Dashboard verbunden sein.
    voice: {
      provider: '11labs',
      voiceId: 'ygoBNrnmTEdu5NtDTmAY',
      model: 'eleven_turbo_v2_5',
      language: 'de',
      // Etwas mehr Ausdruck/Bewegung als beim seriösen CLOSER.
      stability: 0.35,
      similarityBoost: 0.75,
      style: 0.6,
      useSpeakerBoost: true,
      speed: 1.03,
    },
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'de' },
  };
}
