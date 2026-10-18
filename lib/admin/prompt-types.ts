export interface PromptSection {
  slug: string;
  title: string;
  content: string;
  verified: boolean;
  source: string;
  /** Slugs von Seed-/DB-Abschnitten, die dieser Abschnitt ersetzt. */
  replaces?: string[];
}
