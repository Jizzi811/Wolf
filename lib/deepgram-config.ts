import type { AgentLiveSchema } from '@deepgram/sdk';

/**
 * Nicht geheime Agent-Konfiguration, die die Token-Route (`/api/dg-token`)
 * aus Server-Environment-Variablen liefert. Enthält KEINE Secrets.
 */
export interface DeepgramAgentConfig {
  language: string;
  listenModel: string;
  thinkProvider: string;
  thinkModel: string;
  speakModel: string;
  /** Optionaler eigener LLM-Endpunkt (z. B. Groq-Proxy). Leer = Deepgram-verwaltet. */
  thinkEndpointUrl?: string;
  /** Optionale Header für den eigenen LLM-Endpunkt (z. B. Proxy-Schutz). */
  thinkEndpointHeaders?: Record<string, string>;
}

/** Audio-Abtastrate für Ein- und Ausgabe (linear16). */
export const DG_SAMPLE_RATE = 24000;

/** Standardbegrüßung (identisch zum LiveKit-Backend, Sektion 11). */
export const CLOSER_GREETING =
  'So, da bist du. Ich bin CLOSER, dein sprechender Host im System. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?';

/**
 * Baut die Settings für den Deepgram Voice Agent (Sektion 12).
 *
 * Der Systemprompt landet in `agent.think.prompt`. Das LLM läuft über den von
 * Deepgram verwalteten Anbieter (z. B. OpenAI) – es wird KEIN Provider-Schlüssel
 * im Browser gesetzt (Sektion 21). Die Stimme ist eine deutsche Deepgram-Stimme.
 */
export function buildAgentSettings(config: DeepgramAgentConfig, prompt: string): AgentLiveSchema {
  const think: NonNullable<AgentLiveSchema['agent']['think']> = {
    provider: { type: config.thinkProvider, model: config.thinkModel },
    prompt,
  };

  // Eigener LLM-Endpunkt (z. B. Groq via Server-Proxy) – nur wenn gesetzt.
  if (config.thinkEndpointUrl) {
    think.endpoint = {
      url: config.thinkEndpointUrl,
      ...(config.thinkEndpointHeaders ? { headers: config.thinkEndpointHeaders } : {}),
    };
  }

  return {
    audio: {
      input: { encoding: 'linear16', sample_rate: DG_SAMPLE_RATE },
      output: { encoding: 'linear16', sample_rate: DG_SAMPLE_RATE, container: 'none' },
    },
    agent: {
      language: config.language,
      listen: { provider: { type: 'deepgram', model: config.listenModel } },
      think,
      speak: { provider: { type: 'deepgram', model: config.speakModel } },
      greeting: CLOSER_GREETING,
    },
  };
}
