/**
 * Funktionen, die der Agent im Gespräch aufrufen kann (Sprach- und Textmodus):
 * erfasse_lead (nur nach Einwilligung) und offene_frage (Lücke melden).
 */

import { getSettings } from './settings';
import { createLead, recordOpenQuestion } from './tracking';
import { pushFeedbackToPlatform, pushLeadToPlatform } from '@/lib/bridge/outbound';

export const TOOL_DEFINITIONS = {
  offene_frage: {
    name: 'offene_frage',
    description: 'Meldet eine Sachfrage, die mit der Wissensbasis nicht sicher beantwortet werden konnte, an das Team (ohne Namen oder persönliche Daten).',
    parameters: {
      type: 'object',
      properties: { frage: { type: 'string', description: 'Die Frage des Nutzers in einem Satz, ohne Namen oder Kontaktdaten.' } },
      required: ['frage'],
    },
  },
  erfasse_lead: {
    name: 'erfasse_lead',
    description: 'Speichert die Kontaktdaten eines Interessenten, nachdem er dem vorgelesenen Einwilligungstext ausdrücklich zugestimmt hat.',
    parameters: {
      type: 'object',
      properties: {
        vorname: { type: 'string' },
        nachname: { type: 'string' },
        email: { type: 'string', description: 'E-Mail-Adresse, Schreibweise bestätigen lassen.' },
        telefon: { type: 'string' },
        anliegen: { type: 'string', description: 'Worum es geht, in einem Satz.' },
        consent: { type: 'boolean', description: 'true nur nach klarem Ja zum Einwilligungstext.' },
      },
      required: ['vorname', 'email', 'consent'],
    },
  },
} as const;

export interface ToolContext {
  conversationId: string | null;
  refUsername: string | null;
  language: string;
}

/** Führt einen Funktionsaufruf aus und liefert den Text, den das Modell zurückbekommt. */
export async function runTool(name: string, args: Record<string, unknown>, ctx: ToolContext): Promise<string> {
  const settings = await getSettings();
  try {
    if (name === 'erfasse_lead') {
      if (!settings.features.leadCapture) return 'Lead-Erfassung ist deaktiviert. Bitte auf die Webseite und das Team verweisen.';
      const consent = args.consent === true || args.consent === 'true';
      const email = String(args.email ?? '').trim().toLowerCase();
      const firstName = String(args.vorname ?? '').trim();
      if (!consent) return 'Nicht gespeichert: Es fehlt die ausdrückliche Zustimmung. Bitte den Einwilligungstext vorlesen und auf ein klares Ja warten.';
      if (!firstName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Nicht gespeichert: Vorname oder E-Mail-Adresse fehlen oder sind ungültig. Bitte noch einmal erfragen.';
      const lead = await createLead({
        conversationId: ctx.conversationId,
        firstName,
        lastName: String(args.nachname ?? '').trim() || null,
        email,
        phone: String(args.telefon ?? '').trim() || null,
        interest: String(args.anliegen ?? '').trim() || null,
        language: ctx.language,
        sponsorUsername: ctx.refUsername,
        consent: true,
        consentText: settings.privacy.consentText,
      });
      if (settings.features.leadsToPlatform) await pushLeadToPlatform(lead).catch(() => null);
      return 'Gespeichert. Sag kurz, dass sich das Team beziehungsweise der Empfehler per E-Mail meldet.';
    }
    if (name === 'offene_frage') {
      const frage = String(args.frage ?? '').trim();
      if (frage) {
        await recordOpenQuestion(frage, ctx.language);
        if (settings.features.feedbackToPlatform) await pushFeedbackToPlatform(frage, ctx.language, ctx.conversationId).catch(() => null);
      }
      return 'Notiert. Sag ehrlich, dass du das nicht sicher weißt, und verweise auf die Webseite, den Support-Kanal oder den Berater.';
    }
    return 'Unbekannte Funktion.';
  } catch (e) {
    console.error('tool', name, e);
    return 'Technischer Fehler beim Speichern. Bitte auf die Webseite verweisen.';
  }
}
