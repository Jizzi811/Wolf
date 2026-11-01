/**
 * Anrede (Sie/Du) – Zusatzauftrag 01.11.2026.
 *
 * Standard: siezen und ganz am Anfang einmal fragen (Modus „ask"). Steuerung ohne
 * Code über die Umgebungsvariable CLOSER_ADDRESS_MODE in Vercel:
 *   ask = siezen und am Anfang fragen (auch wenn die Variable fehlt)
 *   sie = immer siezen, nie fragen
 *   du  = immer duzen, nie fragen
 * Nach einer Änderung in Vercel ist ein Redeploy nötig.
 */

export type AddressMode = 'ask' | 'sie' | 'du';

export function getAddressMode(): AddressMode {
  const v = (process.env.CLOSER_ADDRESS_MODE ?? '').trim().toLowerCase();
  if (v === 'sie' || v === 'du') return v;
  return 'ask';
}

/**
 * Sprachen (Basis-Code), die eine Höflichkeits- und eine Du-Form unterscheiden.
 * Nur dort wird die Frage gestellt; Englisch, Japanisch, Koreanisch: keine Frage, einfach höflich.
 */
export const TV_LANGUAGES = new Set([
  'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'da', 'sv', 'no', 'fi', 'tr', 'hi', 'id', 'ms', 'zh', 'vi',
  // Textmodus-Sprachen mit Höflichkeitsform (Auswahl):
  'ar', 'fa', 'ur', 'bn', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'ne', 'si', 'th', 'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'tg', 'mn', 'et', 'lv', 'lt', 'sl', 'hr', 'sr', 'bs', 'mk', 'sq', 'be', 'tt', 'eu', 'ca', 'gl', 'lb', 'is', 'he', 'am', 'sw',
]);

export function hasTvDistinction(lang: string): boolean {
  const base = lang.startsWith('zh') ? 'zh' : lang.split(/[-_]/)[0].toLowerCase();
  return TV_LANGUAGES.has(base);
}

/** Regel für den Systemprompt je Modus und Sprache. */
export function addressPromptRule(mode: AddressMode, lang: string, nameDe: string): string {
  const tv = hasTvDistinction(lang);
  if (mode === 'du') return 'ANREDE: Duze die Person durchgehend, locker und direkt. Wechselt sie ausdrücklich zur höflichen Form („bitte Sie"), stelle sofort und ohne Kommentar um.';
  if (mode === 'sie' || !tv) {
    return tv
      ? 'ANREDE: Sieze die Person durchgehend, höflich und respektvoll. Wünscht sie ausdrücklich das Du („duz mich ruhig"), stelle sofort und ohne Kommentar um und bleibe dabei.'
      : `ANREDE: ${nameDe} unterscheidet keine Höflichkeits- und Du-Form. Stelle keine Frage zur Anrede, sprich einfach höflich und respektvoll.`;
  }
  return (
    'ANREDE: Standard ist die höfliche Form (Sie, vous, usted, siz, Вы …). Deine erste Nachricht endet mit genau einer kurzen Frage, selbst in der höflichen Form gestellt, ' +
    'wie die Person angesprochen werden möchte (höflich oder vertraut). Antwortet sie mit „du" (oder dem vertrauten Gegenstück ihrer Sprache), duze ab sofort; ' +
    'bei „Sie", „ist mir egal" oder ohne klare Antwort bleibst du bei der höflichen Form. Die Frage stellst du nur einmal, nie nachbohren. ' +
    'Die Wahl gilt für das ganze Gespräch und für alles, was du sagst oder schreibst. Wechselt die Person später („duz mich ruhig", „bitte wieder Sie"), stelle sofort und ohne Kommentar um.'
  );
}
