/**
 * Baut serverseitig den transienten Vapi-Assistenten aus den Einstellungen, der
 * Wissensbasis und der gewählten Sprache. Wird von /api/assistant ausgeliefert
 * und vom Browser an vapi.start() übergeben. Der Systemtext wird auch vom
 * Textmodus (/api/chat) genutzt.
 */

import { BRAND, BRAND_PROMPT_RULE, SPOKEN_REPLACEMENTS } from '@/lib/closer/brand';
import { greetingFor } from '@/lib/closer/i18n';
import { getLanguage, type CloserLanguage } from '@/lib/closer/languages';
import { buildKnowledgePrompt, getPromptSections } from './knowledge';
import { getSettings, type AllSettings } from './settings';
import { TOOL_DEFINITIONS } from './tools';

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
    chunkPlan?: { enabled: boolean; formatPlan: { enabled: boolean; replacements: unknown[] } };
  };
  transcriber: { provider: 'deepgram'; model: string; language: string };
  serverMessages?: string[];
  server?: { url: string; secret?: string; timeoutSeconds?: number };
  metadata?: Record<string, string>;
}

export interface AssistantContext {
  conversationId: string;
  refUsername?: string | null;
  origin?: string | null;
  /** Sprachkennung aus lib/closer/languages.ts (z. B. de, tr, zh-CN). */
  lang?: string | null;
  /** Kurze Zusammenfassung des bisherigen Verlaufs bei Sprachwechsel. */
  history?: string | null;
  /** Textmodus (kein Mikrofon, keine Stimme). */
  textMode?: boolean;
}

/** Öffentliche Basis-URL (für Vapi-Webhooks). */
export function siteBase(origin?: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || origin || null;
  if (!base) return null;
  if (base.startsWith('http://localhost') || base.startsWith('http://127.')) return null;
  return base.replace(/\/$/, '');
}

function languageLine(l: CloserLanguage): string {
  return `SPRACHE: Antworte ausschließlich auf ${l.nameDe} (Kennung ${l.lang}). Wechselt die Person dauerhaft die Sprache, wechsle mit. Der Name „CLOSER" und „${BRAND.spoken}" bleiben in jeder Sprache gleich.`;
}

/** Begrüßung für die Sprache: Admin-Text für Deutsch, sonst Übersetzung, Rückfall Englisch. */
export function greetingForLanguage(s: AllSettings, l: CloserLanguage): string {
  if (l.lang === 'de' || l.lang === s.persona.language) return s.persona.greeting;
  return greetingFor(l.lang) ?? greetingFor('en') ?? s.persona.greeting;
}

/** Vollständiger Systemtext (Persona + Wissen + Regeln) – für Sprach- und Textmodus. */
export async function buildSystemContent(ctx: AssistantContext, s?: AllSettings): Promise<{ content: string; settings: AllSettings; language: CloserLanguage; toolsAvailable: boolean }> {
  const settings = s ?? (await getSettings());
  const language = getLanguage(ctx.lang ?? settings.persona.defaultLanguage);
  const { sections, lastUpdated } = await getPromptSections();
  const knowledge = buildKnowledgePrompt(sections, lastUpdated, settings.persona.name);
  const base = siteBase(ctx.origin);
  const toolsAvailable = Boolean(base) || Boolean(ctx.textMode);

  const voiceNote = ctx.textMode
    ? `FORMAT: Du antwortest als Text im Chat. Anrede: ${settings.persona.formOfAddress === 'Sie' ? 'Siezen, höflich und respektvoll' : 'Duzen, locker und direkt'}. Kurz und klar: zwei bis fünf Sätze, einfache Absätze, keine Markdown-Zeichen wie Sternchen oder Rauten, keine Emojis, immer nur eine Rückfrage.`
    : `SPRACHE UND FORMAT: Anrede: ${settings.persona.formOfAddress === 'Sie' ? 'Siezen, höflich und respektvoll' : 'Duzen, locker und direkt'}. ` +
      'Antworte kurz, natürlich und für Sprachausgabe optimiert: ein bis drei Sätze, keine Aufzählungen, keine Markdown-Formatierung, keine Emojis, immer nur eine Frage.';

  const disclosure = settings.privacy.aiDisclosure
    ? `KI-OFFENLEGUNG: Sag spätestens bei der ersten inhaltlichen Frage einmal kurz (in der Sprache des Gesprächs): „${settings.privacy.aiDisclosure}" Danach nicht wiederholen, außer jemand fragt.`
    : '';

  const leadNote = settings.features.leadCapture
    ? `LEAD-ERFASSUNG: Wenn jemand Kontakt wünscht, ein Angebot möchte oder zurückgerufen werden will, frage nach Vorname und E-Mail-Adresse (Nachname und Telefon optional) und gib danach diesen Einwilligungstext sinngemäß in der Sprache des Gesprächs wieder (auf Deutsch wörtlich): „${settings.privacy.consentText}" ` +
      (toolsAvailable
        ? 'Erst nach einem klaren Ja rufst du die Funktion erfasse_lead mit consent=true auf und bestätigst danach kurz. Ohne Ja speicherst du nichts und sagst das auch.'
        : 'Erst nach einem klaren Ja sagst du: „Danke, ich habe es notiert." Ohne Ja speicherst du nichts und sagst das auch.') +
      ` Du behauptest nie, dass bereits jemand informiert wurde.${ctx.refUsername ? ` Die Person kam über den Empfehler mit dem Benutzernamen ${ctx.refUsername}; erwähne das nur, wenn es passt.` : ''}`
    : 'LEAD-ERFASSUNG: Du nimmst keine Kontaktdaten auf. Verweise auf die Webseite, das Webinar oder den persönlichen Empfehler.';

  const openQuestionNote = toolsAvailable
    ? 'OFFENE FRAGEN: Wenn dir zu einer Sachfrage über Kickstartercash.Club die Information fehlt, sag das ehrlich und rufe einmal die Funktion offene_frage mit der Frage auf (ohne Namen oder Kontaktdaten), damit das Team sie nachträgt.'
    : '';

  const historyNote = ctx.history?.trim()
    ? `BISHERIGER VERLAUF (die Person hat gerade die Sprache gewechselt; knüpfe daran an, ohne alles zu wiederholen): ${ctx.history.trim().slice(0, 2500)}`
    : '';

  const content = [
    settings.persona.systemPrompt.replaceAll('CLOSER', settings.persona.name),
    knowledge,
    languageLine(language),
    BRAND_PROMPT_RULE,
    voiceNote,
    disclosure,
    leadNote,
    openQuestionNote,
    historyNote,
  ]
    .filter(Boolean)
    .join('\n\n');
  return { content, settings, language, toolsAvailable };
}

function toolList(settings: AllSettings): unknown[] {
  const tools: unknown[] = [
    { type: 'function', async: false, function: TOOL_DEFINITIONS.offene_frage, messages: [{ type: 'request-start', content: 'Ich notiere das für das Team.' }] },
  ];
  if (settings.features.leadCapture) {
    tools.push({ type: 'function', async: false, function: TOOL_DEFINITIONS.erfasse_lead, messages: [{ type: 'request-start', content: 'Einen Moment, ich speichere das.' }] });
  }
  return tools;
}

export async function buildAssistantConfig(ctx: AssistantContext): Promise<AssistantConfig> {
  const { content, settings: s, language } = await buildSystemContent({ ...ctx, textMode: false });
  const base = siteBase(ctx.origin);
  if (!language.voice) {
    throw new Error(`Sprache ${language.lang} hat keinen Sprachmodus; bitte den Textmodus nutzen.`);
  }

  const cfg: AssistantConfig = {
    name: s.persona.name,
    firstMessage: greetingForLanguage(s, language),
    firstMessageMode: 'assistant-speaks-first',
    maxDurationSeconds: 1800,
    model: { provider: 'openai', model: s.model.model, temperature: s.model.temperature, messages: [{ role: 'system', content }] },
    voice: {
      provider: '11labs',
      voiceId: s.voice.voiceId,
      // Mehrsprachige Modelle: turbo_v2_5 / flash_v2_5 können alle Sprachmodus-Sprachen.
      model: s.voice.model,
      language: language.eleven ?? 'de',
      stability: s.voice.stability,
      similarityBoost: s.voice.similarityBoost,
      style: s.voice.style,
      useSpeakerBoost: s.voice.useSpeakerBoost,
      speed: s.voice.speed,
      // Aussprache des Markennamens: „Kickstartercash.Club" → „Kickstartercash Club".
      chunkPlan: { enabled: true, formatPlan: { enabled: true, replacements: SPOKEN_REPLACEMENTS } },
    },
    transcriber: { provider: 'deepgram', model: s.model.transcriberModel, language: language.deepgram ?? 'de' },
    metadata: { conversationId: ctx.conversationId, language: language.lang, ...(ctx.refUsername ? { refUsername: ctx.refUsername } : {}) },
  };

  // Webhook (Gesprächsende-Bericht) und Funktionen (Lead, offene Frage).
  if (base) {
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    cfg.serverMessages = ['end-of-call-report', 'tool-calls'];
    cfg.server = { url: `${base}/api/vapi/webhook`, timeoutSeconds: 20, ...(secret ? { secret } : {}) };
    cfg.model.tools = toolList(s);
  }
  return cfg;
}
