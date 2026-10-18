/**
 * Baut serverseitig den transienten Vapi-Assistenten aus den Einstellungen und
 * der Wissensbasis. Wird von /api/assistant ausgeliefert und vom Browser an
 * vapi.start() übergeben.
 */

import { buildKnowledgePrompt, getPromptSections } from './knowledge';
import { getSettings } from './settings';

export interface AssistantConfig {
  name: string;
  firstMessage: string;
  firstMessageMode: 'assistant-speaks-first';
  maxDurationSeconds?: number;
  model: {
    provider: 'openai';
    model: string;
    temperature: number;
    messages: { role: 'system'; content: string }[];
    tools?: unknown[];
  };
  voice: {
    provider: '11labs';
    voiceId: string;
    model: string;
    language: string;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
    speed: number;
  };
  transcriber: { provider: 'deepgram'; model: string; language: 'de' | 'multi' };
  serverMessages?: string[];
  server?: { url: string; secret?: string; timeoutSeconds?: number };
  metadata?: Record<string, string>;
}

/** Öffentliche Basis-URL (für Vapi-Webhooks). */
export function siteBase(origin?: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || origin || null;
  if (!base) return null;
  if (base.startsWith('http://localhost') || base.startsWith('http://127.')) return null;
  return base.replace(/\/$/, '');
}

export async function buildAssistantConfig(ctx: { conversationId: string; refUsername?: string | null; origin?: string | null }): Promise<AssistantConfig> {
  const s = await getSettings();
  const { sections, lastUpdated } = await getPromptSections();
  const knowledge = buildKnowledgePrompt(sections, lastUpdated, s.persona.name);
  const base = siteBase(ctx.origin);

  const voiceNote =
    `SPRACHE UND FORMAT: Sprich standardmäßig Deutsch und passe dich der Sprache des Nutzers an. ` +
    `Anrede: ${s.persona.formOfAddress === 'Sie' ? 'Siezen, höflich und respektvoll' : 'Duzen, locker und direkt'}. ` +
    'Antworte kurz, natürlich und für Sprachausgabe optimiert: ein bis drei Sätze, keine ' +
    'Aufzählungen, keine Markdown-Formatierung, keine Emojis, immer nur eine Frage.';

  const disclosure = s.privacy.aiDisclosure
    ? `KI-OFFENLEGUNG: Sag spätestens bei der ersten inhaltlichen Frage einmal kurz: „${s.privacy.aiDisclosure}" Danach nicht wiederholen, außer jemand fragt.`
    : '';

  const toolsAvailable = Boolean(base);
  const leadNote = s.features.leadCapture
    ? `LEAD-ERFASSUNG: Wenn jemand Kontakt wünscht, ein Angebot möchte oder zurückgerufen werden will, frage nach Vorname und E-Mail-Adresse (Nachname und Telefon optional) und lies danach exakt diesen Einwilligungstext vor: „${s.privacy.consentText}" ` +
      (toolsAvailable
        ? 'Erst nach einem klaren Ja rufst du die Funktion erfasse_lead mit consent=true auf und bestätigst danach kurz. Ohne Ja speicherst du nichts und sagst das auch.'
        : 'Erst nach einem klaren Ja sagst du: „Danke, ich habe es notiert." Ohne Ja speicherst du nichts und sagst das auch.') +
      ` Du behauptest nie, dass bereits jemand informiert wurde.${ctx.refUsername ? ` Die Person kam über den Empfehler mit dem Benutzernamen ${ctx.refUsername}; erwähne das nur, wenn es passt.` : ''}`
    : 'LEAD-ERFASSUNG: Du nimmst keine Kontaktdaten auf. Verweise auf die Website, das Webinar oder den persönlichen Empfehler.';

  const openQuestionNote = toolsAvailable
    ? 'OFFENE FRAGEN: Wenn dir zu einer Sachfrage über KickstarterCash.club die Information fehlt, sag das ehrlich und rufe einmal die Funktion offene_frage mit der Frage auf, damit das Team sie nachträgt.'
    : '';

  const systemContent = [s.persona.systemPrompt.replaceAll('CLOSER', s.persona.name), knowledge, voiceNote, disclosure, leadNote, openQuestionNote]
    .filter(Boolean)
    .join('\n\n');

  const cfg: AssistantConfig = {
    name: s.persona.name,
    firstMessage: s.persona.greeting,
    firstMessageMode: 'assistant-speaks-first',
    maxDurationSeconds: 1800,
    model: { provider: 'openai', model: s.model.model, temperature: s.model.temperature, messages: [{ role: 'system', content: systemContent }] },
    voice: {
      provider: '11labs',
      voiceId: s.voice.voiceId,
      model: s.voice.model,
      language: s.persona.language || 'de',
      stability: s.voice.stability,
      similarityBoost: s.voice.similarityBoost,
      style: s.voice.style,
      useSpeakerBoost: s.voice.useSpeakerBoost,
      speed: s.voice.speed,
    },
    transcriber: { provider: 'deepgram', model: s.model.transcriberModel, language: s.model.transcriberLanguage },
    metadata: { conversationId: ctx.conversationId, ...(ctx.refUsername ? { refUsername: ctx.refUsername } : {}) },
  };

  // Webhook (Gesprächsende-Bericht) und Funktionen (Lead, offene Frage).
  if (base) {
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    cfg.serverMessages = ['end-of-call-report', 'tool-calls'];
    cfg.server = { url: `${base}/api/vapi/webhook`, timeoutSeconds: 20, ...(secret ? { secret } : {}) };
    const tools: unknown[] = [
      {
        type: 'function',
        async: false,
        function: {
          name: 'offene_frage',
          description: 'Meldet eine Sachfrage, die mit der Wissensbasis nicht beantwortet werden konnte, an das Team.',
          parameters: {
            type: 'object',
            properties: { frage: { type: 'string', description: 'Die Frage des Nutzers in einem Satz.' } },
            required: ['frage'],
          },
        },
        messages: [{ type: 'request-start', content: 'Ich notiere das für das Team.' }],
      },
    ];
    if (s.features.leadCapture) {
      tools.push({
        type: 'function',
        async: false,
        function: {
          name: 'erfasse_lead',
          description: 'Speichert die Kontaktdaten eines Interessenten, nachdem er dem Einwilligungstext ausdrücklich zugestimmt hat.',
          parameters: {
            type: 'object',
            properties: {
              vorname: { type: 'string' },
              nachname: { type: 'string' },
              email: { type: 'string', description: 'E-Mail-Adresse, buchstabiert bestätigen.' },
              telefon: { type: 'string' },
              anliegen: { type: 'string', description: 'Worum es geht, in einem Satz.' },
              consent: { type: 'boolean', description: 'true nur nach klarem Ja zum Einwilligungstext.' },
            },
            required: ['vorname', 'email', 'consent'],
          },
        },
        messages: [{ type: 'request-start', content: 'Einen Moment, ich speichere das.' }],
      });
    }
    cfg.model.tools = tools;
  }
  return cfg;
}
