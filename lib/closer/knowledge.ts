/**
 * Wissensbasis für KickstarterCash.club.
 *
 * ⚠️ PLATZHALTER – NOCH KEINE GEPRÜFTEN DATEN ⚠️
 *
 * Diese Datei enthält bewusst KEINE erfundenen Preise, Leistungen, Partner,
 * Garantien, Renditen oder rechtlichen Aussagen. Sie liefert eine klare,
 * erweiterbare Struktur. Solange ein Feld leer ist bzw. `verified: false` gilt,
 * MUSS CLOSER offen sagen, dass ihm dazu die geprüften Daten fehlen.
 *
 * So wird die Datei später befüllt:
 *  1. Nur vom Team freigegebene, geprüfte Fakten eintragen.
 *  2. `verified` je Abschnitt auf true setzen, wenn geprüft.
 *  3. `lastUpdated` aktualisieren.
 *  4. Für größere Datenmengen später Dokumente/DB anbinden (siehe unten).
 *
 * Ein echtes RAG-System (Vektor-Datenbank o. Ä.) wird bewusst NOCH NICHT gebaut.
 * Der Code ist aber so strukturiert, dass `loadKnowledge()` künftig aus
 * Dokumenten oder einer Datenbank laden kann, ohne die Agenten-Logik zu ändern.
 */

export interface KnowledgeSection {
  /** Menschlich lesbarer Titel des Abschnitts. */
  title: string;
  /** Freigegebener Inhalt. Leer = liegt noch nicht vor. */
  content: string;
  /** true, sobald der Inhalt vom Team geprüft und freigegeben wurde. */
  verified: boolean;
}

export interface CompanyKnowledge {
  company: KnowledgeSection;
  products: KnowledgeSection;
  faq: KnowledgeSection;
  contactAndEscalation: KnowledgeSection;
  forbiddenOrUnclearClaims: KnowledgeSection;
  /** Stand der Informationen (ISO-Datum) oder null, falls unbekannt. */
  lastUpdated: string | null;
}

export const KICKSTARTERCASH_KNOWLEDGE: CompanyKnowledge = {
  company: {
    title: 'Unternehmensbeschreibung',
    content:
      'PLATZHALTER: Kurze, geprüfte Beschreibung von KickstarterCash.club hier eintragen ' +
      '(Was ist es? Für wen? Grundidee?). Noch keine freigegebenen Angaben vorhanden.',
    verified: false,
  },
  products: {
    title: 'Freigegebene Produktinformationen',
    content:
      'PLATZHALTER: Nur geprüfte Produkte/Leistungen, Karten und Abläufe eintragen. ' +
      'KEINE Preise, Gebühren, Renditen oder Garantien erfinden. Noch nichts freigegeben.',
    verified: false,
  },
  faq: {
    title: 'Häufige Fragen',
    content:
      'PLATZHALTER: Häufige Fragen und geprüfte Antworten hier ergänzen. Noch nichts freigegeben.',
    verified: false,
  },
  contactAndEscalation: {
    title: 'Kontakt- und Eskalationswege',
    content:
      'PLATZHALTER: Offizieller Kontaktweg und Eskalation an das menschliche Team eintragen ' +
      '(z. B. E-Mail/Formular). Noch nichts freigegeben.',
    verified: false,
  },
  forbiddenOrUnclearClaims: {
    title: 'Verbotene oder ungeklärte Aussagen',
    content:
      'Ohne geprüfte Daten NICHT behaupten: konkrete Preise, Gebühren, Renditen, Gewinne, ' +
      'Garantien, Partner, Genehmigungen, Verfügbarkeiten, Vertragsbedingungen oder rechtliche ' +
      'Eigenschaften. Im Zweifel ehrlich sagen, dass die Angabe geprüft werden muss.',
    verified: true,
  },
  lastUpdated: null,
};

/**
 * Baut aus der Wissensbasis einen kompakten Textblock, der dem Systemprompt
 * angehängt werden kann. Nicht verifizierte Abschnitte werden klar als
 * „liegt noch nicht vor" markiert, damit CLOSER nichts erfindet.
 */
export function buildKnowledgeContext(k: CompanyKnowledge = KICKSTARTERCASH_KNOWLEDGE): string {
  const sections: KnowledgeSection[] = [
    k.company,
    k.products,
    k.faq,
    k.contactAndEscalation,
    k.forbiddenOrUnclearClaims,
  ];

  const lines = sections.map((s) => {
    const status = s.verified ? '' : ' [UNBESTÄTIGT – NICHT ALS FAKT VERWENDEN]';
    const body = s.content.trim().length > 0 ? s.content.trim() : '(keine Angaben hinterlegt)';
    return `## ${s.title}${status}\n${body}`;
  });

  const stand = k.lastUpdated
    ? `Stand der Informationen: ${k.lastUpdated}.`
    : 'Stand der Informationen: unbekannt – es liegen noch keine geprüften Daten vor.';

  return [
    'FREIGEGEBENE WISSENSBASIS ZU KICKSTARTERCASH.CLUB',
    'Nutze ausschließlich als FAKT bestätigte Abschnitte. Für alles andere ehrlich sagen, dass die Daten fehlen.',
    '',
    ...lines,
    '',
    stand,
  ].join('\n');
}

/**
 * Zukunftssicherer Ladepunkt. Aktuell nur die statische Struktur oben.
 * Später kann hier aus Dokumenten oder einer Datenbank geladen werden,
 * ohne dass die Agenten-Logik angepasst werden muss.
 */
export async function loadKnowledge(): Promise<CompanyKnowledge> {
  // TODO: Bei echter Wissensbasis hier Dokumente/DB einlesen und mappen.
  return KICKSTARTERCASH_KNOWLEDGE;
}
