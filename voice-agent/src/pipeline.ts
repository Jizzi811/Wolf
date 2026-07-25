import {
  inference,
  type llm as llmTypes,
  type stt as sttTypes,
  type tts as ttsTypes,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as openai from '@livekit/agents-plugin-openai';
import { config } from './config.ts';

/**
 * Baut die einzelnen Bausteine der Sprachpipeline abhängig von `config.pipeline`
 * (Sektion 12). So bleiben Anbieter und Modelle zentral austauschbar:
 *
 *  - `providers` : Deepgram (STT) + OpenAI (LLM) + OpenAI/Deepgram (TTS)
 *  - `inference` : alles über LiveKit Inference
 *
 * VAD und Turn-Detection stellt die AgentSession lokal bereit (kostenlos),
 * unabhängig von der gewählten Pipeline.
 */

export function buildLLM(): llmTypes.LLM {
  if (config.pipeline === 'providers') {
    // Liest OPENAI_API_KEY aus der Umgebung.
    return new openai.LLM({ model: config.providers.llm });
  }
  return new inference.LLM({ model: config.inference.llm });
}

export function buildSTT(): sttTypes.STT {
  if (config.pipeline === 'providers') {
    // Liest DEEPGRAM_API_KEY aus der Umgebung.
    return new deepgram.STT({
      model: config.providers.stt,
      language: config.providers.sttLanguage,
    });
  }
  return new inference.STT({
    model: config.inference.stt,
    language: config.inference.sttLanguage,
  });
}

export function buildTTS(): ttsTypes.TTS {
  if (config.pipeline === 'providers') {
    if (config.providers.ttsProvider === 'deepgram') {
      // Deepgram-Stimme (englische Aura-Stimmen oder – per exakter Modell-ID –
      // mehrsprachige Aura-2-Stimmen wie eine deutsche Stimme).
      return new deepgram.TTS({ model: config.providers.deepgramTtsModel });
    }
    // OpenAI-TTS ist mehrsprachig und für deutsche Sprachausgabe geeignet.
    return new openai.TTS({
      model: config.providers.openaiTtsModel,
      // Die Stimme kommt aus der Umgebung; auf den bekannten Stimmen-Typ casten.
      voice: config.providers.openaiTtsVoice as openai.TTSVoices,
    });
  }
  return new inference.TTS({
    model: config.inference.tts,
    voice: config.inference.ttsVoice,
  });
}
