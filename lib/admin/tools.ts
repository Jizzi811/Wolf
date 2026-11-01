/**
 * Funktionen, die der Agent im Gespräch aufrufen kann (Sprach- und Textmodus):
 * erfasse_lead (nur nach Einwilligung), offene_frage (Lücke melden) und
 * kcc_nachschlagen (live in der Plattform nachsehen, Übergabe v6).
 */

import { getSettings } from './settings';
import { createLead, recordOpenQuestion } from './tracking';
import { pushFeedbackToPlatform, pushLeadToPlatform } from '@/lib/bridge/outbound';
import { bridgeConfigured } from '@/lib/bridge/client';
import { LOOKUP_AREAS, isLookupArea, lookupLive, lookupResultText } from '@/lib/bridge/lookup';

export const TOOL_DEFINITIONS = {
  kcc_nachschlagen: {
    name: 'kcc_nachschlagen',
    description:
      'Schlägt live in der Plattform Kickstartercash.Club nach und liefert aktuelle Daten eines Bereichs. Immer nutzen bei Webinar-Terminen, Preisen, Paketen, Karten, Bankkonten, Auswandern, Health Box, Shop, Mitteilungen/News, Team, Services, Partnern, Charity, Rechtlichem sowie bei Fragen nach Menüpunkten oder Links. Vorher kurz ankündigen („Einen Moment, ich schaue kurz nach.").',
    parameters: {
      type: 'object',
      properties: {
        bereich: {
          type: 'string',
          enum: [...LOOKUP_AREAS],
          description:
            'catalog = Pakete, Karten, Bankkonten, Health Box, Shop, Fanshop, Ränge, Provisionen; webinars = Termine; overview = Menü und Links der Webseite und des Mitgliederbereichs; relocation = Auswandern; guides = Handbuch; realestate = Immobilien; directory = Rechtstexte, Team, Services, Partner, News, Charity; social = Social-Kanäle; promo = Werbemittel; tour = System-Tour; content = Texte und Neuigkeiten; learned = freigegebene Antworten.',
        },
        stichwort: { type: 'string', description: 'Optional: Suchwort, um nur passende Einträge zu bekommen (z. B. „Charity", „Black Card", „Impressum").' },
      },
      required: ['bereich'],
    },
  },
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
    if (name === 'kcc_nachschlagen') {
      const area = String(args.bereich ?? '').trim().toLowerCase();
      if (!isLookupArea(area)) return `Unbekannter Bereich. Erlaubt sind: ${LOOKUP_AREAS.join(', ')}.`;
      if (!bridgeConfigured()) return 'Die Plattform-Anbindung ist nicht eingerichtet. Antworte aus der Wissensbasis, erfinde nichts und verweise auf die Webseite.';
      const r = await lookupLive(area);
      return lookupResultText(r, typeof args.stichwort === 'string' ? args.stichwort : null);
    }
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
    return name === 'kcc_nachschlagen'
      ? 'Die Plattform hat gerade nicht geantwortet. Zeig keine Fehlermeldung, erfinde nichts; sag, dass du gleich noch einmal nachschaust, oder verweise auf Termin und Support.'
      : 'Technischer Fehler beim Speichern. Bitte auf die Webseite verweisen.';
  }
}
