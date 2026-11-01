/**
 * Live-Nachschlagen in der Plattform-Brücke (Übergabe v6, 01.11.2026).
 *
 * CLOSER sagt „Einen Moment, ich schaue kurz nach" und ruft dann einen Bereich
 * ohne Zwischenspeicher ab. Zeitlimit 4 Sekunden. Kommt nichts, antwortet er mit
 * den zuletzt gespeicherten Daten und erfindet nichts.
 */

import { callBridge, type BridgeRoute } from './client';
import { getBridgeCache, getCachedArea, saveArea, countEntries } from './sync';

/** Bereiche, die das Werkzeug kcc_nachschlagen live lesen darf. */
export const LOOKUP_AREAS = [
  'catalog', 'webinars', 'overview', 'relocation', 'guides', 'realestate',
  'directory', 'social', 'promo', 'tour', 'content', 'learned',
] as const;
export type LookupArea = (typeof LOOKUP_AREAS)[number];

export const LOOKUP_TIMEOUT_MS = 4000;
const MAX_CHARS = 14000;

export function isLookupArea(a: string): a is LookupArea {
  return (LOOKUP_AREAS as readonly string[]).includes(a);
}

export interface LookupResult {
  area: LookupArea;
  source: 'live' | 'cache' | 'none';
  /** Bereich von der Plattform abgeschaltet (available:false oder 403). */
  disabled?: boolean;
  fetchedAt?: Date | null;
  data: unknown;
  count: number;
}

/** Holt einen Bereich live; bei Fehler oder Zeitüberschreitung den Zwischenspeicher. */
export async function lookupLive(area: LookupArea, opts: { timeoutMs?: number } = {}): Promise<LookupResult> {
  const res = await callBridge(area as BridgeRoute, { timeoutMs: opts.timeoutMs ?? LOOKUP_TIMEOUT_MS });
  if (res.body?.ok) {
    const data = tidy(area, res.body.data);
    // Frische Daten gleich in den Zwischenspeicher übernehmen (kostet nichts extra).
    await saveArea(area, { status: 'ok', data: res.body.data ?? null, hash: res.body.hash ?? null, error: null, fetchedAt: new Date() }).catch(() => null);
    const c = countEntries(data);
    return { area, source: 'live', disabled: !c.available, fetchedAt: new Date(), data, count: c.count };
  }
  if (res.status === 403 || res.status === 404) {
    return { area, source: 'live', disabled: true, data: null, count: 0 };
  }
  const cache = await getBridgeCache().catch(() => ({} as Awaited<ReturnType<typeof getBridgeCache>>));
  const row = cache[area];
  if (row?.status === 'ok' && row.data) {
    const data = tidy(area, row.data);
    const c = countEntries(data);
    return { area, source: 'cache', disabled: !c.available, fetchedAt: row.fetchedAt, data, count: c.count };
  }
  const cached = await getCachedArea(area).catch(() => null);
  return { area, source: 'none', data: cached, count: 0 };
}

/** Bereichsabhängige Bereinigung: nur laufende News, kein HTML, keine Kontaktdaten von Personen. */
export function tidy(area: string, data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const d = structuredClone(data) as Record<string, unknown>;
  const now = Date.now();
  if (area === 'directory' || area === 'content') {
    if (Array.isArray(d.news)) d.news = d.news.filter((n) => isRunning(n as Record<string, unknown>, now));
  }
  if (area === 'directory') {
    for (const key of ['team', 'experts']) {
      if (Array.isArray(d[key])) {
        d[key] = (d[key] as Record<string, unknown>[]).map((p) => {
          const copy = { ...p };
          for (const k of Object.keys(copy)) if (/phone|tel|mail|whatsapp|telegram/i.test(k)) delete copy[k];
          return copy;
        });
      }
    }
  }
  return stripDeep(d);
}

function isRunning(n: Record<string, unknown>, now: number): boolean {
  const from = n.from ? Date.parse(String(n.from)) : NaN;
  const until = n.until ? Date.parse(String(n.until)) : NaN;
  if (Number.isFinite(from) && from > now) return false;
  if (Number.isFinite(until) && until < now) return false;
  return true;
}

function stripDeep(v: unknown): unknown {
  if (typeof v === 'string') return v.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (Array.isArray(v)) return v.map(stripDeep);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, stripDeep(x)]));
  return v;
}

/**
 * Kürzt die Daten für das Sprachmodell: optional nach Stichwort filtern, lange
 * Texte kappen, Listen begrenzen, bis das Ergebnis unter MAX_CHARS liegt.
 */
export function compactForModel(data: unknown, keyword?: string | null, maxChars = MAX_CHARS): string {
  let d = data;
  const kw = (keyword ?? '').trim().toLowerCase();
  if (kw && d && typeof d === 'object' && !Array.isArray(d)) {
    const obj = { ...(d as Record<string, unknown>) };
    let hits = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (!Array.isArray(v)) continue;
      const filtered = v.filter((item) => JSON.stringify(item).toLowerCase().includes(kw));
      if (filtered.length) {
        obj[k] = filtered;
        hits += filtered.length;
      }
    }
    if (hits) d = obj;
  }
  for (const [strMax, listMax] of [[600, 80], [300, 40], [160, 20], [100, 10]] as const) {
    const s = JSON.stringify(shrink(d, strMax, listMax));
    if (s.length <= maxChars) return s;
  }
  return JSON.stringify(shrink(d, 80, 6)).slice(0, maxChars);
}

function shrink(v: unknown, strMax: number, listMax: number): unknown {
  if (typeof v === 'string') return v.length > strMax ? v.slice(0, strMax - 1) + '…' : v;
  if (Array.isArray(v)) return v.slice(0, listMax).map((x) => shrink(x, strMax, listMax));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, shrink(x, strMax, listMax)]));
  return v;
}

/** Hinweise je Bereich, die das Modell mit den Daten bekommt. */
export const AREA_HINTS: Record<LookupArea, string> = {
  catalog: 'Pakete, Karten (kind: private/business), Bankkonten, Health Box, Shop, Fanshop, Ränge, Provisionen. Keine feste Anzahl nennen, nur was in den Listen steht; Preise nur aus diesen Daten. Keine Einkommensversprechen.',
  webinars: 'Termine immer mit Zeitzone nennen (Feld timezone) und auf Wunsch in die Ortszeit der Person umrechnen.',
  overview: 'Menü der Webseite. Links nur aus dem Feld url, nie selbst bauen. Bereich user = Mitgliederbereich: Links nur mit dem Hinweis „nach der Anmeldung". Zahl der Hauptkategorien = Länge von categories.',
  relocation: 'Länder und Seiten zum Auswandern. Solange kein öffentliches Paket aktiv ist: keine Pakete, keine Preise.',
  guides: 'Handbuch und Anleitungen. Schritte in Reihenfolge wiedergeben, Details auf die Handbuch-Seite verweisen.',
  realestate: 'Immobilien ohne Straße, Koordinaten oder Maklernamen.',
  directory: 'legal: Rechtstexte (Titel und Link nennen, nicht auslegen). team/experts: Name, Rolle, Sprachen; Kontakt nur über „Termin buchen" oder Support, keine Telefonnummern oder E-Mail-Adressen. services/partners/print_partners/charity: leer = nicht erwähnen; keine Rabattcodes. news: nur laufende Mitteilungen.',
  social: 'Öffentliche Social-Kanäle. Links nicht buchstabieren.',
  promo: 'Werbemittel: nur Arten und Anzahl nennen, nie Download-Adressen.',
  tour: 'Folien der System-Tour (Überblick).',
  content: 'Texte und laufende Neuigkeiten der Plattform.',
  learned: 'Vom Team freigegebene Antworten: gelten vor allem anderen Wissen.',
};

/** Fertiger Text für das Modell (Werkzeug-Ergebnis). */
export function lookupResultText(r: LookupResult, keyword?: string | null): string {
  const hint = AREA_HINTS[r.area];
  if (r.disabled) {
    return `Bereich ${r.area}: von der Plattform derzeit nicht freigegeben. Sag ehrlich, dass du dazu gerade keine Angaben hast, und verweise auf die Webseite oder den Support. Nichts erfinden.`;
  }
  if (r.source === 'none' || r.data == null) {
    return `Bereich ${r.area}: Die Plattform war gerade nicht erreichbar und es liegen keine gespeicherten Daten vor. Zeig der Person keine Fehlermeldung. Sag, dass du dazu gleich noch einmal nachschaust, und frag kurz, worum es ihr genau geht, oder verweise auf Termin oder Support. Nichts erfinden.`;
  }
  const stand =
    r.source === 'live'
      ? 'Quelle: Plattform, Stand jetzt.'
      : `Quelle: Zwischenspeicher${r.fetchedAt ? ` vom ${new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(r.fetchedAt)}` : ''}; die Plattform war gerade nicht erreichbar. Nenne die Angaben als letzten bekannten Stand, zeig keine Fehlermeldung, erfinde nichts.`;
  return `Bereich ${r.area}. ${stand} Hinweise: ${hint}\nDaten (JSON): ${compactForModel(r.data, keyword)}`;
}
