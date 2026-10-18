/**
 * Wissensbasis: Abschnitte aus der Datenbank (Admin), aus der Plattform-Brücke
 * (automatisch) und als Rückfall aus dem Code (lib/closer/knowledge.ts).
 */

import { asc, eq } from 'drizzle-orm';
import { db, hasDatabase, schema } from '@/lib/db';
import type { KnowledgeSection } from '@/lib/db/schema';
import { KICKSTARTERCASH_SECTIONS, LAST_UPDATED } from '@/lib/closer/knowledge';
import { bridgeSections } from '@/lib/bridge/knowledge-from-bridge';
import { getSettings } from './settings';

import type { PromptSection } from './prompt-types';
export type { PromptSection } from './prompt-types';

/** Alle Abschnitte für den Admin (Datenbank). */
export async function listSections(): Promise<KnowledgeSection[]> {
  const d = await db();
  return d.select().from(schema.knowledgeSections).orderBy(asc(schema.knowledgeSections.sortOrder), asc(schema.knowledgeSections.id));
}

export async function getSection(id: number): Promise<KnowledgeSection | undefined> {
  const d = await db();
  return d.query.knowledgeSections.findFirst({ where: eq(schema.knowledgeSections.id, id) });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'abschnitt';
}

/**
 * Übernimmt die im Code hinterlegten Abschnitte einmalig in die Datenbank,
 * damit sie im Admin editierbar sind. Bereits vorhandene Slugs bleiben unberührt.
 */
export async function seedSectionsIfEmpty(userId?: number): Promise<number> {
  const d = await db();
  const existing = await d.select({ slug: schema.knowledgeSections.slug }).from(schema.knowledgeSections);
  const have = new Set(existing.map((e) => e.slug));
  let n = 0;
  for (const [i, s] of KICKSTARTERCASH_SECTIONS.entries()) {
    if (have.has(s.id)) continue;
    await d.insert(schema.knowledgeSections).values({
      slug: s.id,
      title: s.title,
      content: s.content,
      verified: s.verified,
      enabled: true,
      source: 'seed',
      sortOrder: (i + 1) * 10,
      updatedBy: userId ?? null,
    });
    n++;
  }
  return n;
}

/**
 * Baut die Liste der Abschnitte, die in den Systemprompt wandern:
 * 1. Brücke (Plattform-Daten, falls vorhanden) – ersetzt gleichnamige Seed-Abschnitte
 * 2. Datenbank-Abschnitte (aktiviert)
 * 3. Rückfall: Code-Abschnitte, wenn die Datenbank leer ist oder fehlt
 */
export async function getPromptSections(): Promise<{ sections: PromptSection[]; lastUpdated: string; fromBridge: boolean }> {
  const settings = await getSettings();
  let dbSections: KnowledgeSection[] = [];
  let bridge: { sections: PromptSection[]; fetchedAt: string | null } = { sections: [], fetchedAt: null };

  if (hasDatabase()) {
    try {
      dbSections = await listSections();
      bridge = await bridgeSections();
    } catch {
      dbSections = [];
    }
  }

  const out: PromptSection[] = [];
  const replacedByBridge = new Set<string>();
  for (const b of bridge.sections) {
    out.push(b);
    for (const r of b.replaces ?? []) replacedByBridge.add(r);
  }

  if (dbSections.length > 0) {
    for (const s of dbSections) {
      if (!s.enabled) continue;
      if (replacedByBridge.has(s.slug)) continue;
      out.push({ slug: s.slug, title: s.title, content: s.content, verified: s.verified, source: s.source });
    }
  } else if (settings.features.useSeedKnowledge) {
    for (const s of KICKSTARTERCASH_SECTIONS) {
      if (replacedByBridge.has(s.id)) continue;
      out.push({ slug: s.id, title: s.title, content: s.content, verified: s.verified, source: 'seed' });
    }
  }

  const lastUpdated = bridge.fetchedAt ?? (dbSections.length ? maxDate(dbSections.map((s) => s.updatedAt)) : LAST_UPDATED);
  return { sections: out, lastUpdated, fromBridge: bridge.sections.length > 0 };
}

function maxDate(dates: Date[]): string {
  const m = dates.reduce((a, b) => (a > b ? a : b), new Date(0));
  return m.toISOString().slice(0, 10);
}

/** Baut den Prompt-Block aus den Abschnitten (voice-tauglich). */
export function buildKnowledgePrompt(sections: PromptSection[], lastUpdated: string, personaName = 'CLOSER'): string {
  const lines = sections.map((s) => {
    const status = s.verified ? '' : ' [UNBESTÄTIGT – NICHT ALS FAKT VERWENDEN]';
    const body = s.content.trim().length > 0 ? s.content.trim() : '(keine Angaben hinterlegt)';
    return `## ${s.title}${status}\n${body}`;
  });
  return [
    'FREIGEGEBENE WISSENSBASIS ZU KICKSTARTERCASH.CLUB',
    `Nutze ausschließlich die hier bestätigten Fakten. Für alles andere ehrlich sagen, dass die Daten fehlen oder bestätigt werden müssen. Du bist ${personaName}.`,
    'Nenne im Gespräch nur die Details, nach denen gefragt wird – keine Produktlisten vorlesen. ' +
      'Sprich Zahlen aussprechbar aus (zum Beispiel „dreihundertfünfundachtzig Euro", „null Komma fünf Prozent"). ' +
      'Bei Preis- oder Karteninteresse zuerst klären: privat oder Business, Premium oder Deluxe (mit Exchange und Cashback), ' +
      'und ob die Person bereits Mitglied ist oder einen Empfehler hat.',
    '',
    ...lines,
    '',
    `Stand der Informationen: ${lastUpdated}. Preise, Termine und Konditionen können sich seitdem geändert haben; bei Kaufentscheidungen auf die aktuellen Angaben auf kickstartercash.club und das Team verweisen.`,
  ].join('\n');
}
