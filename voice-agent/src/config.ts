/**
 * Zentrale Konfiguration des CLOSER-Voice-Agents (Sektion 12).
 *
 * Alle austauschbaren Bausteine – Pipeline, Modelle, Stimme, Sprache,
 * Begrüßung – werden hier gebündelt. Geheime Schlüssel werden NICHT hier
 * hinterlegt, sondern ausschließlich über Environment-Variablen bereitgestellt
 * (Sektion 13).
 *
 * Zwei Pipelines stehen zur Wahl:
 *  - `inference`  : STT/LLM/TTS laufen über LiveKit Inference (kostet LiveKit).
 *  - `providers`  : eigene Anbieter – Deepgram (STT) + OpenAI (LLM) + TTS
 *                   (OpenAI oder Deepgram). So zahlst du nur bei deinen
 *                   Anbietern; LiveKit dient nur als Audiotransport.
 *
 * Standard: automatisch `providers`, sobald DEEPGRAM_API_KEY UND OPENAI_API_KEY
 * gesetzt sind – sonst `inference`. Über CLOSER_PIPELINE erzwingbar.
 *
 * WICHTIG: Verfügbare Modelle/Stimmen in der jeweiligen Doku prüfen, bevor sie
 * geändert werden. Für deutsche Sprachausgabe eignet sich OpenAI-TTS oder eine
 * mehrsprachige/deutsche Deepgram-Aura-2-Stimme (z. B. "Julius"): dafür die
 * exakte Deepgram-Modell-ID in CLOSER_DEEPGRAM_TTS_MODEL setzen und
 * CLOSER_TTS_PROVIDER=deepgram wählen. Ältere Aura-Stimmen sind nur Englisch.
 */

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function hasEnv(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim().length > 0);
}

export type Pipeline = 'inference' | 'providers';
export type TtsProvider = 'openai' | 'deepgram';

function resolvePipeline(): Pipeline {
  const explicit = env('CLOSER_PIPELINE', '').toLowerCase();
  if (explicit === 'inference' || explicit === 'providers') {
    return explicit;
  }
  // Auto: eigene Anbieter nur, wenn beide Schlüssel vorhanden sind.
  return hasEnv('DEEPGRAM_API_KEY') && hasEnv('OPENAI_API_KEY') ? 'providers' : 'inference';
}

export interface CloserConfig {
  /** Anzeigename / Dispatch-Name des Agenten (muss zum Frontend passen). */
  agentName: string;
  /** Standardsprache; der Agent passt sich der Nutzersprache an. */
  language: string;
  /** Aktive Sprachpipeline. */
  pipeline: Pipeline;

  /** Modelle für die LiveKit-Inference-Pipeline. */
  inference: {
    llm: string;
    stt: string;
    sttLanguage: string;
    tts: string;
    ttsVoice: string;
  };

  /** Modelle/Stimmen für die eigene Anbieter-Pipeline (Deepgram + OpenAI). */
  providers: {
    /** OpenAI-Sprachmodell (das "Gehirn"). */
    llm: string;
    /** Deepgram-STT-Modell (das "Ohr"). */
    stt: string;
    /** Deepgram-Erkennungssprache ("multi" = automatisch mehrsprachig). */
    sttLanguage: string;
    /** Welcher Anbieter die Stimme liefert. */
    ttsProvider: TtsProvider;
    /** OpenAI-TTS-Modell (mehrsprachig, deutschtauglich). */
    openaiTtsModel: string;
    /** OpenAI-TTS-Stimme (KEINE reale Person klonen). */
    openaiTtsVoice: string;
    /** Deepgram-TTS-Modell-ID (Aura/Aura-2; deutsche Stimme via exakter ID). */
    deepgramTtsModel: string;
  };

  /** Vom Agenten beim Verbindungsaufbau gesprochene Standardbegrüßung. */
  greeting: string;
  /** Ausführliche Logausgaben aktivieren. */
  debug: boolean;
}

export const config: CloserConfig = {
  agentName: env('AGENT_NAME', 'CLOSER'),
  language: env('CLOSER_LANGUAGE', 'de'),
  pipeline: resolvePipeline(),

  inference: {
    // Standardwerte aus dem offiziellen LiveKit Node-Starter.
    llm: env('CLOSER_LLM_MODEL', 'google/gemma-4-31b-it'),
    stt: env('CLOSER_STT_MODEL', 'deepgram/nova-3'),
    sttLanguage: env('CLOSER_STT_LANGUAGE', 'multi'),
    tts: env('CLOSER_TTS_MODEL', 'cartesia/sonic-3'),
    ttsVoice: env('VOICE_ID', '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc'),
  },

  providers: {
    // OpenAI GPT als LLM (gut für Deutsch). Modell in der OpenAI-Doku prüfen.
    llm: env('CLOSER_LLM_MODEL', 'gpt-4o-mini'),
    // Deepgram nova-3 versteht u. a. Deutsch.
    stt: env('CLOSER_STT_MODEL', 'nova-3'),
    sttLanguage: env('CLOSER_STT_LANGUAGE', 'multi'),
    // Standardstimme über OpenAI-TTS, da deutschtauglich.
    ttsProvider:
      env('CLOSER_TTS_PROVIDER', 'openai').toLowerCase() === 'deepgram' ? 'deepgram' : 'openai',
    openaiTtsModel: env('CLOSER_OPENAI_TTS_MODEL', 'gpt-4o-mini-tts'),
    // Tiefe, selbstbewusste Stimme passend zum Closer-Charakter.
    openaiTtsVoice: env('CLOSER_TTS_VOICE', 'onyx'),
    // Nur relevant bei CLOSER_TTS_PROVIDER=deepgram. Für eine deutsche Stimme
    // die exakte Deepgram-Modell-ID (z. B. eine Aura-2-"Julius"-Variante) setzen.
    deepgramTtsModel: env('CLOSER_DEEPGRAM_TTS_MODEL', 'aura-2-zeus-en'),
  },

  greeting: env(
    'CLOSER_GREETING',
    'So, da bist du. Ich bin CLOSER, dein sprechender Host im System. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?'
  ),

  debug: env('CLOSER_DEBUG', 'false').toLowerCase() === 'true',
};
