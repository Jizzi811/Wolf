/**
 * Typisierte Einstellungen mit Standardwerten. Alles, was im Admin editierbar
 * ist, liegt hier: Persona, Stimme, Modell, Texte der öffentlichen Seite,
 * Design, Datenschutz-Texte und Schalter.
 */

import { eq } from 'drizzle-orm';
import { db, hasDatabase, schema } from '@/lib/db';
import { uiText } from '@/lib/ui-text';
import { CLOSER_SYSTEM_PROMPT } from '@/lib/closer/system-prompt';

export interface PersonaSettings {
  name: string;
  tagline: string;
  greeting: string;
  /** Vollständiger Charakter-/Regel-Prompt (ohne Wissensbasis). */
  systemPrompt: string;
  imageUrl: string;
  language: string;
  /** Anrede: du oder Sie. */
  formOfAddress: 'du' | 'Sie';
}

export interface VoiceSettings {
  provider: '11labs';
  voiceId: string;
  voiceName: string;
  model: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2' | 'eleven_flash_v2_5';
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  speed: number;
}

export interface ModelSettings {
  provider: 'openai';
  model: string;
  temperature: number;
  transcriberModel: 'nova-2' | 'nova-3';
  transcriberLanguage: 'de' | 'multi';
}

export interface SiteTexts {
  eyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  buttonStart: string;
  features: string[];
  privacyNote: string;
  footer: string;
  pageTitle: string;
  pageDescription: string;
  statusDisconnected: string;
}

export interface DesignSettings {
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  showTranscript: boolean;
  supportsChatInput: boolean;
}

export interface FeatureSettings {
  /** Interessenten dürfen im Gespräch Kontaktdaten hinterlassen. */
  leadCapture: boolean;
  /** Leads automatisch an die Plattform-Brücke senden (Route lead). */
  leadsToPlatform: boolean;
  /** Gesprächszusammenfassungen an die Plattform senden (Route conversation). */
  conversationsToPlatform: boolean;
  /** Offene Fragen an die Plattform senden (Route feedback). */
  feedbackToPlatform: boolean;
  /** Transkripte speichern (für Gesprächsprotokolle und Statistik). */
  storeTranscripts: boolean;
  /** Mitglieder dürfen sich selbst registrieren. */
  selfRegistration: boolean;
  /** Öffentlicher Zugang ohne Login. */
  publicAccess: boolean;
  /** Brücke stündlich automatisch abgleichen. */
  bridgeAutoSync: boolean;
  /** Vorhandene Wissensbasis aus dem Code als Rückfall nutzen. */
  useSeedKnowledge: boolean;
}

export interface PrivacySettings {
  consentText: string;
  aiDisclosure: string;
}

export interface AllSettings {
  persona: PersonaSettings;
  voice: VoiceSettings;
  model: ModelSettings;
  texts: SiteTexts;
  design: DesignSettings;
  features: FeatureSettings;
  privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: AllSettings = {
  persona: {
    name: 'CLOSER',
    tagline: uiText.agentTagline,
    greeting:
      'Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?',
    systemPrompt: CLOSER_SYSTEM_PROMPT,
    imageUrl: '/johann-orb.png',
    language: 'de',
    formOfAddress: 'du',
  },
  voice: {
    provider: '11labs',
    voiceId: 'BDqe1qZiwPi7xspRxTgh',
    voiceName: 'Standardstimme (ElevenLabs)',
    model: 'eleven_turbo_v2_5',
    stability: 0.45,
    similarityBoost: 0.8,
    style: 0.35,
    useSpeakerBoost: true,
    speed: 1.0,
  },
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.8,
    transcriberModel: 'nova-2',
    transcriberLanguage: 'de',
  },
  texts: {
    eyebrow: uiText.eyebrow,
    heroTitleLine1: uiText.heroTitleLine1,
    heroTitleLine2: uiText.heroTitleLine2,
    heroDescription: uiText.heroDescription,
    buttonStart: uiText.buttonStart,
    features: [...uiText.features],
    privacyNote: uiText.privacyNote,
    footer: uiText.footer,
    pageTitle: 'CLOSER – Der Voice Agent von KickstarterCash.club',
    pageDescription: 'Ein charismatischer KI-Gesprächspartner für Business, Motivation und Klartext.',
    statusDisconnected: uiText.status.disconnected,
  },
  design: {
    accent: '#d4a63a',
    accentLight: '#f3d58a',
    accentDark: '#8a6420',
    background: '#0a0a0b',
    showTranscript: true,
    supportsChatInput: true,
  },
  features: {
    leadCapture: true,
    leadsToPlatform: false,
    conversationsToPlatform: false,
    feedbackToPlatform: false,
    storeTranscripts: true,
    selfRegistration: false,
    publicAccess: true,
    bridgeAutoSync: true,
    useSeedKnowledge: true,
  },
  privacy: {
    consentText:
      'Damit sich jemand bei dir melden kann, speichere ich deinen Namen, deine E-Mail-Adresse und dein Anliegen und gebe sie an Kickstartercash.Club und an den Partner weiter, der dich empfohlen hat. Du kannst das jederzeit widerrufen. Die Datenschutzerklärung findest du auf kickstartercash.club. Bist du damit einverstanden?',
    aiDisclosure: 'Nur damit du es weißt: Ich bin ein KI-Assistent, keine reale Person.',
  },
};

export type SettingsKey = keyof AllSettings;

function merge<T extends object>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (!(k in out)) continue;
    const cur = out[k];
    if (cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = merge(cur as object, v);
    } else if (v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out as T;
}

/** Liest alle Einstellungen (Standardwerte + gespeicherte Überschreibungen). */
export async function getSettings(): Promise<AllSettings> {
  if (!hasDatabase()) return DEFAULT_SETTINGS;
  try {
    const d = await db();
    const rows = await d.select().from(schema.settings);
    const out: AllSettings = structuredClone(DEFAULT_SETTINGS);
    for (const row of rows) {
      const key = row.key as SettingsKey;
      if (key in out) {
        (out as unknown as Record<string, object>)[key] = merge(
          (out as unknown as Record<string, object>)[key],
          row.value
        );
      }
    }
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getSetting<K extends SettingsKey>(key: K): Promise<AllSettings[K]> {
  const all = await getSettings();
  return all[key];
}

/** Speichert einen Bereich (vollständig, nach Merge mit dem bisherigen Stand). */
export async function saveSetting<K extends SettingsKey>(
  key: K,
  patch: Partial<AllSettings[K]>,
  userId?: number
): Promise<AllSettings[K]> {
  const d = await db();
  const current = await getSetting(key);
  const next = merge(current as object, patch) as AllSettings[K];
  await d
    .insert(schema.settings)
    .values({ key, value: next, updatedBy: userId ?? null })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: next, updatedAt: new Date(), updatedBy: userId ?? null } });
  return next;
}

/** Kleine Schlüssel außerhalb der typisierten Bereiche (z. B. Brückenstatus). */
export async function getRawSetting<T = unknown>(key: string): Promise<T | null> {
  const d = await db();
  const row = await d.query.settings.findFirst({ where: eq(schema.settings.key, key) });
  return (row?.value as T) ?? null;
}

export async function setRawSetting(key: string, value: unknown, userId?: number) {
  const d = await db();
  await d
    .insert(schema.settings)
    .values({ key, value: value as object, updatedBy: userId ?? null })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: value as object, updatedAt: new Date(), updatedBy: userId ?? null } });
}
