import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { ServerOptions, cli, defineAgent, inference, voice } from '@livekit/agents';
import { createAgent } from './agent.ts';
import { config } from './config.ts';
import { buildSTT, buildTTS } from './pipeline.ts';

// Environment-Variablen laden. Erwartet werden LIVEKIT_URL, LIVEKIT_API_KEY
// und LIVEKIT_API_SECRET (siehe .env.example). Niemals Secrets committen.
dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx) => {
    // Klassische Sprachpipeline: STT -> LLM -> TTS (Sektion 12). Stimme,
    // Intelligenz und Anbieter sind so getrennt konfigurierbar. Das LLM sitzt
    // am Agenten (siehe agent.ts).
    const session = new voice.AgentSession({
      // STT (Ohr) und TTS (Stimme) je nach Pipeline (siehe config.ts/pipeline.ts).
      stt: buildSTT(),
      tts: buildTTS(),

      // Turn-Erkennung: bestimmt, wann der Nutzer fertig gesprochen hat.
      // VAD und Turn-Detection stellt die AgentSession lokal bereit (kostenlos).
      turnHandling: {
        turnDetection: new inference.TurnDetector(),
        // Antwort schon während des Wartens auf das Turn-Ende vorbereiten.
        preemptiveGeneration: { enabled: true },
      },
    });

    // Session starten: initialisiert die Pipeline und wärmt die Modelle vor.
    await session.start({
      agent: createAgent(),
      room: ctx.room,
    });

    // Mit dem Raum verbinden und auf den Nutzer treffen.
    await ctx.connect();

    // Begrüßung genau einmal nach dem Verbindungsaufbau (Sektion 11).
    // `entry` läuft pro Job nur einmal, daher entstehen keine doppelten
    // Begrüßungen bei Reconnects oder React-Strict-Mode-Effekten des Frontends.
    await session.say(config.greeting);

    if (config.debug) {
      const llmModel =
        config.pipeline === 'providers' ? config.providers.llm : config.inference.llm;
      console.log(
        `[CLOSER] Agent "${config.agentName}" bereit. Pipeline=${config.pipeline} LLM=${llmModel}`
      );
    }
  },
});

// Agent-Server starten. Der agentName steuert den expliziten Dispatch und muss
// zum Frontend (AGENT_NAME) passen.
cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: config.agentName,
  })
);
