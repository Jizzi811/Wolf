/**
 * Sprachliste von CLOSER – EINE Datei, die Nadja später erweitern kann.
 *
 * Quelle der Liste: Plattform /inc/data-languages.php (V4.0, 136 Einträge), dieselbe
 * Liste wie Sprachwechsler/Übersetzer im Header von Kickstartercash.Club.
 *
 * Felder:
 *  - lang        Kennung wie im Plattform-Header (z. B. "de", "zh-CN", "pt-br")
 *  - flag        ISO-Länderkürzel für https://flagcdn.com/w40/<flag>.png
 *  - nameDe      deutscher Name; der Name in der Sprache selbst kommt zur Laufzeit aus Intl.DisplayNames
 *  - bcp47       Kennung für Intl.DisplayNames, html lang und die Browser-Vorlesestimme
 *  - voice       true = Sprachmodus (Stimme + Erkennung), false = nur Textmodus
 *  - deepgram    Sprachcode für die Erkennung (Vapi/Deepgram nova-2), nur bei voice:true
 *  - eleven      Sprachcode für die Stimme (ElevenLabs, ISO 639-1), nur bei voice:true
 *  - neutralFlag true = keine eigene Landesflagge (Esperanto, Latein, Regionalsprachen): neutrales Symbol
 *  - rtl         true = Schreibrichtung rechts nach links
 *
 * Sprachmodus = Schnittmenge aus Deepgram nova-2 (36 Sprachen laut Deepgram-Doku, Codes aus dem
 * Vapi-SDK-Enum für transcriber.language) und ElevenLabs eleven_turbo_v2_5 / eleven_flash_v2_5
 * (32 Sprachen laut ElevenLabs-Doku). Stand der Prüfung: 01.11.2026. Neue Sprache freischalten:
 * voice:true setzen und deepgram/eleven eintragen; sonst bleibt sie im Textmodus.
 */

export interface CloserLanguage {
  lang: string;
  flag: string;
  nameDe: string;
  bcp47: string;
  voice: boolean;
  deepgram?: string;
  eleven?: string;
  neutralFlag?: boolean;
  rtl?: boolean;
}

export const LANGUAGES: CloserLanguage[] = [
  { lang: 'de', flag: 'de', nameDe: 'Deutsch', bcp47: 'de', voice: true, deepgram: 'de', eleven: 'de' },
  { lang: 'en', flag: 'gb', nameDe: 'Englisch', bcp47: 'en', voice: true, deepgram: 'en-GB', eleven: 'en' },
  { lang: 'af', flag: 'za', nameDe: 'Afrikaans', bcp47: 'af', voice: false },
  { lang: 'sq', flag: 'al', nameDe: 'Albanisch', bcp47: 'sq', voice: false },
  { lang: 'am', flag: 'et', nameDe: 'Amharisch', bcp47: 'am', voice: false },
  { lang: 'ar', flag: 'ae', nameDe: 'Arabisch', bcp47: 'ar', voice: false, rtl: true },
  { lang: 'hy', flag: 'am', nameDe: 'Armenisch', bcp47: 'hy', voice: false },
  { lang: 'az', flag: 'az', nameDe: 'Aserbaidschanisch', bcp47: 'az', voice: false },
  { lang: 'eu', flag: 'es', nameDe: 'Baskisch', bcp47: 'eu', voice: false, neutralFlag: true },
  { lang: 'be', flag: 'by', nameDe: 'Belarusisch', bcp47: 'be', voice: false },
  { lang: 'bn', flag: 'bd', nameDe: 'Bengalisch', bcp47: 'bn', voice: false },
  { lang: 'bs', flag: 'ba', nameDe: 'Bosnisch', bcp47: 'bs', voice: false },
  { lang: 'bg', flag: 'bg', nameDe: 'Bulgarisch', bcp47: 'bg', voice: true, deepgram: 'bg', eleven: 'bg' },
  { lang: 'my', flag: 'mm', nameDe: 'Burmesisch', bcp47: 'my', voice: false },
  { lang: 'ceb', flag: 'ph', nameDe: 'Cebuano', bcp47: 'ceb', voice: false, neutralFlag: true },
  { lang: 'ny', flag: 'mw', nameDe: 'Chichewa', bcp47: 'ny', voice: false, neutralFlag: true },
  { lang: 'zh-CN', flag: 'cn', nameDe: 'Chinesisch (Vereinfacht)', bcp47: 'zh-Hans', voice: true, deepgram: 'zh-CN', eleven: 'zh' },
  { lang: 'zh-TW', flag: 'tw', nameDe: 'Chinesisch (Traditionell)', bcp47: 'zh-Hant', voice: true, deepgram: 'zh-TW', eleven: 'zh' },
  { lang: 'da', flag: 'dk', nameDe: 'Dänisch', bcp47: 'da', voice: true, deepgram: 'da', eleven: 'da' },
  { lang: 'en-au', flag: 'au', nameDe: 'Englisch (Australien)', bcp47: 'en-AU', voice: true, deepgram: 'en-AU', eleven: 'en' },
  { lang: 'en-ca', flag: 'ca', nameDe: 'Englisch (Kanada)', bcp47: 'en-CA', voice: true, deepgram: 'en-CA', eleven: 'en' },
  { lang: 'en-us', flag: 'us', nameDe: 'Englisch (USA)', bcp47: 'en-US', voice: true, deepgram: 'en-US', eleven: 'en' },
  { lang: 'eo', flag: 'un', nameDe: 'Esperanto', bcp47: 'eo', voice: false, neutralFlag: true },
  { lang: 'et', flag: 'ee', nameDe: 'Estnisch', bcp47: 'et', voice: false },
  { lang: 'fi', flag: 'fi', nameDe: 'Finnisch', bcp47: 'fi', voice: true, deepgram: 'fi', eleven: 'fi' },
  { lang: 'fr', flag: 'fr', nameDe: 'Französisch', bcp47: 'fr', voice: true, deepgram: 'fr', eleven: 'fr' },
  { lang: 'fr-ca', flag: 'ca', nameDe: 'Französisch (Kanada)', bcp47: 'fr-CA', voice: true, deepgram: 'fr-CA', eleven: 'fr' },
  { lang: 'fy', flag: 'nl', nameDe: 'Friesisch', bcp47: 'fy', voice: false, neutralFlag: true },
  { lang: 'gl', flag: 'es', nameDe: 'Galizisch', bcp47: 'gl', voice: false, neutralFlag: true },
  { lang: 'ka', flag: 'ge', nameDe: 'Georgisch', bcp47: 'ka', voice: false },
  { lang: 'el', flag: 'gr', nameDe: 'Griechisch', bcp47: 'el', voice: true, deepgram: 'el', eleven: 'el' },
  { lang: 'gu', flag: 'in', nameDe: 'Gujarati', bcp47: 'gu', voice: false, neutralFlag: true },
  { lang: 'ht', flag: 'ht', nameDe: 'Haitianisch', bcp47: 'ht', voice: false },
  { lang: 'ha', flag: 'ng', nameDe: 'Hausa', bcp47: 'ha', voice: false, neutralFlag: true },
  { lang: 'haw', flag: 'us', nameDe: 'Hawaiisch', bcp47: 'haw', voice: false, neutralFlag: true },
  { lang: 'he', flag: 'il', nameDe: 'Hebräisch', bcp47: 'he', voice: false, rtl: true },
  { lang: 'hi', flag: 'in', nameDe: 'Hindi', bcp47: 'hi', voice: true, deepgram: 'hi', eleven: 'hi' },
  { lang: 'hmn', flag: 'cn', nameDe: 'Hmong', bcp47: 'hmn', voice: false, neutralFlag: true },
  { lang: 'ig', flag: 'ng', nameDe: 'Igbo', bcp47: 'ig', voice: false, neutralFlag: true },
  { lang: 'id', flag: 'id', nameDe: 'Indonesisch', bcp47: 'id', voice: true, deepgram: 'id', eleven: 'id' },
  { lang: 'ga', flag: 'ie', nameDe: 'Irisch', bcp47: 'ga', voice: false },
  { lang: 'is', flag: 'is', nameDe: 'Isländisch', bcp47: 'is', voice: false },
  { lang: 'it', flag: 'it', nameDe: 'Italienisch', bcp47: 'it', voice: true, deepgram: 'it', eleven: 'it' },
  { lang: 'ja', flag: 'jp', nameDe: 'Japanisch', bcp47: 'ja', voice: true, deepgram: 'ja', eleven: 'ja' },
  { lang: 'jv', flag: 'id', nameDe: 'Javanisch', bcp47: 'jv', voice: false, neutralFlag: true },
  { lang: 'yi', flag: 'il', nameDe: 'Jiddisch', bcp47: 'yi', voice: false, neutralFlag: true, rtl: true },
  { lang: 'kn', flag: 'in', nameDe: 'Kannada', bcp47: 'kn', voice: false, neutralFlag: true },
  { lang: 'kk', flag: 'kz', nameDe: 'Kasachisch', bcp47: 'kk', voice: false },
  { lang: 'ca', flag: 'es', nameDe: 'Katalanisch', bcp47: 'ca', voice: false, neutralFlag: true },
  { lang: 'km', flag: 'kh', nameDe: 'Khmer', bcp47: 'km', voice: false },
  { lang: 'ky', flag: 'kg', nameDe: 'Kirgisisch', bcp47: 'ky', voice: false },
  { lang: 'ko', flag: 'kr', nameDe: 'Koreanisch', bcp47: 'ko', voice: true, deepgram: 'ko', eleven: 'ko' },
  { lang: 'co', flag: 'fr', nameDe: 'Korsisch', bcp47: 'co', voice: false, neutralFlag: true },
  { lang: 'hr', flag: 'hr', nameDe: 'Kroatisch', bcp47: 'hr', voice: false },
  { lang: 'ku', flag: 'iq', nameDe: 'Kurdisch', bcp47: 'ku', voice: false, neutralFlag: true },
  { lang: 'lo', flag: 'la', nameDe: 'Laotisch', bcp47: 'lo', voice: false },
  { lang: 'la', flag: 'va', nameDe: 'Latein', bcp47: 'la', voice: false, neutralFlag: true },
  { lang: 'lv', flag: 'lv', nameDe: 'Lettisch', bcp47: 'lv', voice: false },
  { lang: 'lt', flag: 'lt', nameDe: 'Litauisch', bcp47: 'lt', voice: false },
  { lang: 'lb', flag: 'lu', nameDe: 'Luxemburgisch', bcp47: 'lb', voice: false },
  { lang: 'mg', flag: 'mg', nameDe: 'Madagassisch', bcp47: 'mg', voice: false },
  { lang: 'ms', flag: 'my', nameDe: 'Malaiisch', bcp47: 'ms', voice: true, deepgram: 'ms', eleven: 'ms' },
  { lang: 'ml', flag: 'in', nameDe: 'Malayalam', bcp47: 'ml', voice: false, neutralFlag: true },
  { lang: 'mt', flag: 'mt', nameDe: 'Maltesisch', bcp47: 'mt', voice: false },
  { lang: 'mi', flag: 'nz', nameDe: 'Maori', bcp47: 'mi', voice: false },
  { lang: 'mr', flag: 'in', nameDe: 'Marathi', bcp47: 'mr', voice: false, neutralFlag: true },
  { lang: 'mk', flag: 'mk', nameDe: 'Mazedonisch', bcp47: 'mk', voice: false },
  { lang: 'mn', flag: 'mn', nameDe: 'Mongolisch', bcp47: 'mn', voice: false },
  { lang: 'ne', flag: 'np', nameDe: 'Nepalesisch', bcp47: 'ne', voice: false },
  { lang: 'nl', flag: 'nl', nameDe: 'Niederländisch', bcp47: 'nl', voice: true, deepgram: 'nl', eleven: 'nl' },
  { lang: 'no', flag: 'no', nameDe: 'Norwegisch', bcp47: 'no', voice: true, deepgram: 'no', eleven: 'no' },
  { lang: 'ps', flag: 'af', nameDe: 'Paschtu', bcp47: 'ps', voice: false, rtl: true },
  { lang: 'fa', flag: 'ir', nameDe: 'Persisch', bcp47: 'fa', voice: false, rtl: true },
  { lang: 'pl', flag: 'pl', nameDe: 'Polnisch', bcp47: 'pl', voice: true, deepgram: 'pl', eleven: 'pl' },
  { lang: 'pt', flag: 'pt', nameDe: 'Portugiesisch', bcp47: 'pt', voice: true, deepgram: 'pt-PT', eleven: 'pt' },
  { lang: 'pt-br', flag: 'br', nameDe: 'Portugiesisch (Brasilien)', bcp47: 'pt-BR', voice: true, deepgram: 'pt-BR', eleven: 'pt' },
  { lang: 'pa', flag: 'in', nameDe: 'Punjabi', bcp47: 'pa', voice: false, neutralFlag: true },
  { lang: 'ro', flag: 'ro', nameDe: 'Rumänisch', bcp47: 'ro', voice: true, deepgram: 'ro', eleven: 'ro' },
  { lang: 'ru', flag: 'ru', nameDe: 'Russisch', bcp47: 'ru', voice: true, deepgram: 'ru', eleven: 'ru' },
  { lang: 'sm', flag: 'ws', nameDe: 'Samoanisch', bcp47: 'sm', voice: false },
  { lang: 'gd', flag: 'gb', nameDe: 'Schottisch-Gälisch', bcp47: 'gd', voice: false, neutralFlag: true },
  { lang: 'sv', flag: 'se', nameDe: 'Schwedisch', bcp47: 'sv', voice: true, deepgram: 'sv', eleven: 'sv' },
  { lang: 'sr', flag: 'rs', nameDe: 'Serbisch', bcp47: 'sr', voice: false },
  { lang: 'st', flag: 'za', nameDe: 'Sesotho', bcp47: 'st', voice: false, neutralFlag: true },
  { lang: 'sn', flag: 'zw', nameDe: 'Shona', bcp47: 'sn', voice: false },
  { lang: 'sd', flag: 'pk', nameDe: 'Sindhi', bcp47: 'sd', voice: false, neutralFlag: true, rtl: true },
  { lang: 'si', flag: 'lk', nameDe: 'Singhalesisch', bcp47: 'si', voice: false },
  { lang: 'sk', flag: 'sk', nameDe: 'Slowakisch', bcp47: 'sk', voice: true, deepgram: 'sk', eleven: 'sk' },
  { lang: 'sl', flag: 'si', nameDe: 'Slowenisch', bcp47: 'sl', voice: false },
  { lang: 'so', flag: 'so', nameDe: 'Somali', bcp47: 'so', voice: false },
  { lang: 'es', flag: 'es', nameDe: 'Spanisch', bcp47: 'es', voice: true, deepgram: 'es', eleven: 'es' },
  { lang: 'es-mx', flag: 'mx', nameDe: 'Spanisch (Mexiko)', bcp47: 'es-MX', voice: true, deepgram: 'es-419', eleven: 'es' },
  { lang: 'es-ar', flag: 'ar', nameDe: 'Spanisch (Argentinien)', bcp47: 'es-AR', voice: true, deepgram: 'es-419', eleven: 'es' },
  { lang: 'su', flag: 'id', nameDe: 'Sundanesisch', bcp47: 'su', voice: false, neutralFlag: true },
  { lang: 'sw', flag: 'tz', nameDe: 'Swahili', bcp47: 'sw', voice: false },
  { lang: 'tg', flag: 'tj', nameDe: 'Tadschikisch', bcp47: 'tg', voice: false },
  { lang: 'tl', flag: 'ph', nameDe: 'Tagalog', bcp47: 'tl', voice: false },
  { lang: 'ta', flag: 'in', nameDe: 'Tamil', bcp47: 'ta', voice: false, neutralFlag: true },
  { lang: 'te', flag: 'in', nameDe: 'Telugu', bcp47: 'te', voice: false, neutralFlag: true },
  { lang: 'th', flag: 'th', nameDe: 'Thailändisch', bcp47: 'th', voice: false },
  { lang: 'cs', flag: 'cz', nameDe: 'Tschechisch', bcp47: 'cs', voice: true, deepgram: 'cs', eleven: 'cs' },
  { lang: 'tr', flag: 'tr', nameDe: 'Türkisch', bcp47: 'tr', voice: true, deepgram: 'tr', eleven: 'tr' },
  { lang: 'tk', flag: 'tm', nameDe: 'Turkmenisch', bcp47: 'tk', voice: false },
  { lang: 'uk', flag: 'ua', nameDe: 'Ukrainisch', bcp47: 'uk', voice: true, deepgram: 'uk', eleven: 'uk' },
  { lang: 'hu', flag: 'hu', nameDe: 'Ungarisch', bcp47: 'hu', voice: true, deepgram: 'hu', eleven: 'hu' },
  { lang: 'ur', flag: 'pk', nameDe: 'Urdu', bcp47: 'ur', voice: false, rtl: true },
  { lang: 'uz', flag: 'uz', nameDe: 'Usbekisch', bcp47: 'uz', voice: false },
  { lang: 'vi', flag: 'vn', nameDe: 'Vietnamesisch', bcp47: 'vi', voice: true, deepgram: 'vi', eleven: 'vi' },
  { lang: 'cy', flag: 'gb', nameDe: 'Walisisch', bcp47: 'cy', voice: false, neutralFlag: true },
  { lang: 'xh', flag: 'za', nameDe: 'Xhosa', bcp47: 'xh', voice: false, neutralFlag: true },
  { lang: 'yo', flag: 'ng', nameDe: 'Yoruba', bcp47: 'yo', voice: false, neutralFlag: true },
  { lang: 'zu', flag: 'za', nameDe: 'Zulu', bcp47: 'zu', voice: false, neutralFlag: true },
  { lang: 'as', flag: 'in', nameDe: 'Assamesisch', bcp47: 'as', voice: false, neutralFlag: true },
  { lang: 'ay', flag: 'bo', nameDe: 'Aymara', bcp47: 'ay', voice: false },
  { lang: 'bm', flag: 'ml', nameDe: 'Bambara', bcp47: 'bm', voice: false },
  { lang: 'dv', flag: 'mv', nameDe: 'Dhivehi', bcp47: 'dv', voice: false, rtl: true },
  { lang: 'doi', flag: 'in', nameDe: 'Dogri', bcp47: 'doi', voice: false, neutralFlag: true },
  { lang: 'ee', flag: 'gh', nameDe: 'Ewe', bcp47: 'ee', voice: false, neutralFlag: true },
  { lang: 'gn', flag: 'py', nameDe: 'Guarani', bcp47: 'gn', voice: false },
  { lang: 'ilo', flag: 'ph', nameDe: 'Ilokano', bcp47: 'ilo', voice: false, neutralFlag: true },
  { lang: 'gom', flag: 'in', nameDe: 'Konkani', bcp47: 'gom', voice: false, neutralFlag: true },
  { lang: 'kri', flag: 'sl', nameDe: 'Krio', bcp47: 'kri', voice: false },
  { lang: 'ckb', flag: 'iq', nameDe: 'Kurdisch (Sorani)', bcp47: 'ckb', voice: false, neutralFlag: true, rtl: true },
  { lang: 'ln', flag: 'cd', nameDe: 'Lingala', bcp47: 'ln', voice: false },
  { lang: 'lg', flag: 'ug', nameDe: 'Luganda', bcp47: 'lg', voice: false },
  { lang: 'mai', flag: 'in', nameDe: 'Maithili', bcp47: 'mai', voice: false, neutralFlag: true },
  { lang: 'lus', flag: 'in', nameDe: 'Mizo', bcp47: 'lus', voice: false, neutralFlag: true },
  { lang: 'om', flag: 'et', nameDe: 'Oromo', bcp47: 'om', voice: false, neutralFlag: true },
  { lang: 'qu', flag: 'pe', nameDe: 'Quechua', bcp47: 'qu', voice: false },
  { lang: 'sa', flag: 'in', nameDe: 'Sanskrit', bcp47: 'sa', voice: false, neutralFlag: true },
  { lang: 'nso', flag: 'za', nameDe: 'Sepedi', bcp47: 'nso', voice: false, neutralFlag: true },
  { lang: 'tt', flag: 'ru', nameDe: 'Tatarisch', bcp47: 'tt', voice: false, neutralFlag: true },
  { lang: 'ti', flag: 'er', nameDe: 'Tigrinya', bcp47: 'ti', voice: false, neutralFlag: true },
  { lang: 'ts', flag: 'za', nameDe: 'Tsonga', bcp47: 'ts', voice: false, neutralFlag: true },
  { lang: 'ak', flag: 'gh', nameDe: 'Twi', bcp47: 'ak', voice: false, neutralFlag: true },
  { lang: 'ug', flag: 'cn', nameDe: 'Uigurisch', bcp47: 'ug', voice: false, neutralFlag: true, rtl: true },
];

export const DEFAULT_LANGUAGE = 'de';

export const VOICE_LANGUAGES = LANGUAGES.filter((l) => l.voice);
export const TEXT_ONLY_LANGUAGES = LANGUAGES.filter((l) => !l.voice);

export function getLanguage(code: string | null | undefined): CloserLanguage {
  if (!code) return LANGUAGES[0];
  const c = code.trim();
  const exact = LANGUAGES.find((l) => l.lang.toLowerCase() === c.toLowerCase());
  if (exact) return exact;
  const base = c.split(/[-_]/)[0].toLowerCase();
  if (base === 'zh') return LANGUAGES.find((l) => l.lang === (/tw|hant|hk/i.test(c) ? 'zh-TW' : 'zh-CN')) ?? LANGUAGES[0];
  return LANGUAGES.find((l) => l.lang.toLowerCase() === base) ?? LANGUAGES[0];
}

export function isKnownLanguage(code: string | null | undefined): boolean {
  if (!code) return false;
  return LANGUAGES.some((l) => l.lang.toLowerCase() === code.trim().toLowerCase());
}

/** Basis-Code (de, en, pt, zh …) für Übersetzungstabellen. */
export function baseCode(lang: string): string {
  if (lang.startsWith('zh')) return 'zh';
  return lang.split(/[-_]/)[0].toLowerCase();
}

/** Name in der Sprache selbst (z. B. „Deutsch", „Türkçe"); Rückfall: deutscher Name. */
export function nativeName(l: CloserLanguage): string {
  try {
    const dn = new Intl.DisplayNames([l.bcp47], { type: 'language' });
    const n = dn.of(l.bcp47);
    if (n && n.toLowerCase() !== l.bcp47.toLowerCase()) return n.charAt(0).toUpperCase() + n.slice(1);
  } catch {
    /* Browser kennt die Sprache nicht */
  }
  return l.nameDe;
}

/** Kurzes Kürzel für die Flaggen-Anzeige (DE, TR, ZH-CN …). */
export function shortCode(l: CloserLanguage): string {
  return l.lang.toUpperCase();
}

export function flagUrl(l: CloserLanguage): string | null {
  if (l.neutralFlag || !l.flag || l.flag === 'un') return null;
  return `https://flagcdn.com/w40/${l.flag}.png`;
}
