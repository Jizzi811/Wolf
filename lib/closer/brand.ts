/**
 * Markenname von Kickstartercash.Club – eine Stelle für Schreibweise und Aussprache.
 *
 * Geschrieben (Text, Transkript, Überschriften, Meta-Daten): genau „Kickstartercash.Club".
 * Gesprochen (Stimme): „Kickstartercash Club" – ein Wort, dann „Club"; nie „Punkt", nie „dot".
 * Web- und E-Mail-Adressen bleiben technisch klein (kickstartercash.club).
 */

export const BRAND = {
  /** Schreibweise überall im Text. */
  written: 'Kickstartercash.Club',
  /** Aussprache für die Stimme. */
  spoken: 'Kickstartercash Club',
  /** Kurzform. */
  short: 'KCC',
  /** Domain, technisch klein. */
  domain: 'kickstartercash.club',
  siteUrl: 'https://kickstartercash.club',
  portalUrl: 'https://portal.kickstartercash.club',
} as const;

/** Alle Schreibvarianten des Namens (nicht Adressen) als eine Regel. */
export const BRAND_VARIANTS_RE = /kickstarter\s*cash[\s.]*club/gi;

/**
 * Normalisiert jede Schreibvariante im Anzeigetext auf „Kickstartercash.Club".
 * Adressen (…kickstartercash.club/…, @kickstartercash.club, portal.kickstartercash.club) bleiben unverändert.
 */
export function normalizeBrand(text: string): string {
  if (!text) return text;
  return text.replace(/(^|[^\w.@/-])(kickstarter\s*cash[\s.]*club)(?![\w./-])/gi, (m, pre: string) => `${pre}${BRAND.written}`);
}

/** Ersetzungen für die Sprachausgabe (Vapi formatPlan.replacements). */
export const SPOKEN_REPLACEMENTS: { type: 'exact' | 'regex'; key?: string; regex?: string; value: string; replaceAllEnabled?: boolean }[] = [
  { type: 'regex', regex: 'Kickstartercash\\.Club', value: BRAND.spoken },
  { type: 'regex', regex: 'KickstarterCash\\.Club', value: BRAND.spoken },
  { type: 'regex', regex: 'kickstartercash\\.club', value: BRAND.spoken },
  { type: 'regex', regex: 'KICKSTARTERCASH\\.CLUB', value: BRAND.spoken },
  { type: 'regex', regex: 'Kickstarter Cash Club', value: BRAND.spoken },
  { type: 'regex', regex: 'portal\\.kickstartercash\\.club', value: `Portal von ${BRAND.spoken}` },
];

/** Satz für den Systemprompt (Schreib- und Sprechregel). */
export const BRAND_PROMPT_RULE =
  `NAME DER PLATTFORM: Sprich den Namen immer als „${BRAND.spoken}" aus (ein Wort „Kickstartercash", dann „Club"; nie „Punkt", nie „dot", nie drei Wörter). ` +
  `Schreibe ihn immer als „${BRAND.written}". Web-Adressen nennst du als „die Webseite von ${BRAND.spoken}", ohne sie zu buchstabieren.`;
