/**
 * OPTIONALE LEAD-ERFASSUNG – PLATZHALTER, STANDARDMÄSSIG DEAKTIVIERT.
 *
 * Diese Datei bereitet NUR die technische Struktur für eine spätere
 * Lead-Erfassung vor. Es findet KEINE automatische Speicherung
 * personenbezogener Daten statt.
 *
 * Regeln (bitte beim Aktivieren strikt einhalten):
 *  - Standardmäßig deaktiviert (LEAD_CAPTURE_ENABLED = false).
 *  - Nur: Name, freiwillige Kontaktmöglichkeit, Interesse, gewünschter Rückruf.
 *  - Ausdrückliche Einwilligung ist Voraussetzung (consent === true).
 *  - NIEMALS Zahlungsdaten, Kartendaten oder Ausweisdaten erfassen.
 *  - CLOSER darf NIEMALS behaupten, Daten gespeichert zu haben, solange kein
 *    funktionierendes Backend (persistLead) angebunden ist.
 */

/** Zentraler Schalter. Erst auf true setzen, wenn ein Speicher-Backend existiert. */
export const LEAD_CAPTURE_ENABLED = false;

/** Vom Agenten einzusammelnde Felder (bewusst minimal, keine sensiblen Daten). */
export interface LeadInput {
  /** Vorname oder wie die Person genannt werden möchte. */
  name: string;
  /** Freiwillige Kontaktmöglichkeit (E-Mail ODER Telefon), optional. */
  contact?: string;
  /** Worum geht es? Kurzes Interesse/Anliegen. */
  interest?: string;
  /** Wünscht die Person einen Rückruf/Kontakt durch das Team? */
  wantsCallback?: boolean;
  /** MUSS true sein: ausdrückliche Einwilligung zur Kontaktaufnahme. */
  consent: boolean;
}

export interface LeadResult {
  ok: boolean;
  stored: boolean;
  message: string;
}

/**
 * Beschreibung des Tools für das LLM (Provider-agnostisch gehalten).
 * Beim tatsächlichen Aktivieren in agent.ts in die SDK-Tool-Definition
 * (z. B. mit zod-Parametern) überführen.
 */
export const leadCaptureToolSpec = {
  name: 'erfasse_lead',
  description:
    'PLATZHALTER, standardmäßig deaktiviert. Nimmt freiwillige Kontaktdaten NUR mit ' +
    'ausdrücklicher Einwilligung auf: Name, optionale Kontaktmöglichkeit, Interesse, ' +
    'Rückrufwunsch. Niemals Zahlungs-, Karten- oder Ausweisdaten.',
  parameters: {
    name: 'string – Name/Rufname der Person',
    contact: 'string (optional) – freiwillige E-Mail oder Telefonnummer',
    interest: 'string (optional) – kurzes Anliegen/Interesse',
    wantsCallback: 'boolean (optional) – Rückruf gewünscht?',
    consent: 'boolean – MUSS true sein (ausdrückliche Einwilligung)',
  },
} as const;

/**
 * Persistenz-Haken. Aktuell NICHT implementiert (kein Backend).
 * Gibt bewusst `stored: false` zurück, damit niemals eine Speicherung
 * vorgetäuscht wird. Später hier echte Speicherung (DB/CRM) anbinden.
 */
async function persistLead(lead: LeadInput): Promise<boolean> {
  // TODO: Echte Speicherung (z. B. CRM/DB) implementieren und true zurückgeben.
  void lead;
  return false;
}

/**
 * Verarbeitet einen Lead unter strengen Sicherheitsregeln.
 * Solange LEAD_CAPTURE_ENABLED false ist oder kein Backend speichert,
 * wird ehrlich signalisiert, dass NICHTS gespeichert wurde.
 */
export async function handleLead(input: LeadInput): Promise<LeadResult> {
  if (!LEAD_CAPTURE_ENABLED) {
    return {
      ok: false,
      stored: false,
      message:
        'Lead-Erfassung ist derzeit deaktiviert. Es wurde nichts gespeichert. ' +
        'Bitte dem Nutzer keine Speicherung bestätigen.',
    };
  }

  if (!input.consent) {
    return {
      ok: false,
      stored: false,
      message: 'Ohne ausdrückliche Einwilligung wird nichts erfasst.',
    };
  }

  const stored = await persistLead(input);
  return {
    ok: stored,
    stored,
    message: stored
      ? 'Kontaktwunsch wurde weitergeleitet.'
      : 'Speicherung ist noch nicht eingerichtet – es wurde nichts gespeichert.',
  };
}
