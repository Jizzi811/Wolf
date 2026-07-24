/**
 * Wissensbasis für KickstarterCash.club (Sektion 14).
 *
 * ACHTUNG – PLATZHALTER:
 * Diese Datei enthält bewusst KEINE erfundenen Preise, Leistungen, Partner,
 * Garantien oder rechtlichen Aussagen. Sie liefert nur eine klar erkennbare
 * Struktur, die später mit geprüften, offiziell freigegebenen Informationen
 * gefüllt werden kann.
 *
 * Solange ein Feld leer ist, soll CLOSER ehrlich mitteilen, dass ihm die
 * konkrete Information fehlt, und die Frage an das Team verweisen.
 *
 * Die Struktur ist so angelegt, dass später Dokumente oder eine Datenbank
 * angebunden werden können (z. B. RAG). Ein vollständiges RAG-System wird
 * bewusst noch nicht implementiert.
 */

export interface KnowledgeSection {
  /** Menschlich lesbarer Titel des Abschnitts. */
  title: string;
  /** Geprüfte Inhalte. Leer = noch keine freigegebenen Daten vorhanden. */
  entries: string[];
}

export interface KickstarterCashKnowledge {
  /** Kurze Beschreibung des Unternehmens (geprüft). */
  companyDescription: KnowledgeSection;
  /** Freigegebene Produkt-/Leistungsinformationen. */
  products: KnowledgeSection;
  /** Häufige Fragen und geprüfte Antworten. */
  faq: KnowledgeSection;
  /** Kontakt- und Eskalationswege an das Team. */
  contactAndEscalation: KnowledgeSection;
  /** Aussagen, die ohne Prüfung NICHT getroffen werden dürfen. */
  forbiddenOrUnclear: KnowledgeSection;
  /** Stand der hinterlegten Informationen. */
  lastUpdated: string;
}

export const KICKSTARTERCASH_KNOWLEDGE: KickstarterCashKnowledge = {
  companyDescription: {
    title: 'Unternehmensbeschreibung',
    // TODO: Geprüfte Kurzbeschreibung von KickstarterCash.club eintragen.
    entries: [],
  },
  products: {
    title: 'Freigegebene Produktinformationen',
    // TODO: Nur offiziell freigegebene Leistungen/Karten/Abläufe eintragen.
    entries: [],
  },
  faq: {
    title: 'Häufige Fragen',
    // TODO: Geprüfte Frage-Antwort-Paare eintragen.
    entries: [],
  },
  contactAndEscalation: {
    title: 'Kontakt- und Eskalationswege',
    // TODO: Offiziellen Kontakt-/Eskalationsweg eintragen (z. B. Support-Adresse).
    entries: [],
  },
  forbiddenOrUnclear: {
    title: 'Verbotene oder ungeklärte Aussagen',
    entries: [
      'Keine Preise, Gebühren, Renditen oder Garantien nennen, die nicht offiziell hinterlegt sind.',
      'Keine rechtlichen, steuerlichen oder aufsichtsrechtlichen Aussagen ohne verifizierte Quelle.',
      'Keine Aussagen über Partner, Genehmigungen oder Verfügbarkeiten erfinden.',
    ],
  },
  lastUpdated: 'Platzhalter – noch keine geprüften Daten hinterlegt.',
};

/**
 * Formatiert die freigegebene Wissensbasis als knappen Text für den
 * Systemkontext des Agenten. Leere Abschnitte werden ausgelassen; gibt es gar
 * keine geprüften Daten, wird eine ehrliche Hinweiszeile zurückgegeben.
 */
export function formatKnowledgeForPrompt(
  knowledge: KickstarterCashKnowledge = KICKSTARTERCASH_KNOWLEDGE
): string {
  const sections: KnowledgeSection[] = [
    knowledge.companyDescription,
    knowledge.products,
    knowledge.faq,
    knowledge.contactAndEscalation,
  ];

  const filled = sections.filter((section) => section.entries.length > 0);

  if (filled.length === 0) {
    return [
      'FREIGEGEBENE WISSENSBASIS (KickstarterCash.club):',
      'Es sind derzeit KEINE geprüften Produkt- oder Firmendaten hinterlegt.',
      'Wenn nach konkreten Angeboten, Preisen, Leistungen oder Bedingungen gefragt wird,',
      'teile ehrlich mit, dass dir die aktuellen Daten fehlen, und verweise an das Team.',
      'Erfinde niemals Details.',
    ].join('\n');
  }

  const body = filled
    .map((section) => `${section.title}:\n- ${section.entries.join('\n- ')}`)
    .join('\n\n');

  return [
    'FREIGEGEBENE WISSENSBASIS (KickstarterCash.club):',
    body,
    `\nStand: ${knowledge.lastUpdated}`,
    'Nutze ausschließlich diese Angaben. Fehlt etwas, sage es ehrlich und verweise an das Team.',
  ].join('\n');
}
