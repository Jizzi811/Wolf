/**
 * Zentrale Sprachliste für den Übersetzer (Anzeigename -> ISO-Code).
 * Wird sowohl vom UI-Widget als auch von der Übersetzer-API genutzt.
 */
export const LANGUAGES: Record<string, string> = {
  Deutsch: 'de',
  Englisch: 'en',
  Französisch: 'fr',
  Spanisch: 'es',
  Italienisch: 'it',
  Türkisch: 'tr',
  Polnisch: 'pl',
  Russisch: 'ru',
  Arabisch: 'ar',
  Chinesisch: 'zh',
};

export const LANGUAGE_CODES = new Set(Object.values(LANGUAGES));
