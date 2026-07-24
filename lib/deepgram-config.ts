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
}

/** Audio-Abtastrate für Ein- und Ausgabe (linear16). */
export const DG_SAMPLE_RATE = 24000;

/** Standardbegrüßung (identisch zum LiveKit-Backend, Sektion 11). */
export const CLOSER_GREETING =
  'Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?';

/**
 * Baut die Settings für den Deepgram Voice Agent (Sektion 12).
 *
 * Der Systemprompt landet in `agent.think.prompt`. Das LLM läuft über den von
 * Deepgram verwalteten Anbieter (z. B. OpenAI) – es wird KEIN Provider-Schlüssel
 * im Browser gesetzt (Sektion 21). Die Stimme ist eine deutsche Deepgram-Stimme.
 */
export function buildAgentSettings(config: DeepgramAgentConfig, prompt: string): AgentLiveSchema {
  return {
    audio: {
      input: { encoding: 'linear16', sample_rate: DG_SAMPLE_RATE },
      output: { encoding: 'linear16', sample_rate: DG_SAMPLE_RATE, container: 'none' },
    },
    agent: {
      language: config.language,
      listen: { provider: { type: 'deepgram', model: config.listenModel } },
      think: {
        provider: { type: config.thinkProvider, model: config.thinkModel },
        prompt,
      },
      speak: { provider: { type: 'deepgram', model: config.speakModel } },
      greeting: CLOSER_GREETING,
    },
  };
}
