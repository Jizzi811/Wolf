import { z } from 'zod';
import { tool } from '@livekit/agents';

/**
 * OPTIONALE, STANDARDMÄSSIG DEAKTIVIERTE Lead-Erfassung (Sektion 15).
 *
 * Hier wird ausschließlich die technische Struktur vorbereitet. Es findet
 * KEINE automatische Speicherung personenbezogener Daten statt: Es gibt kein
 * angebundenes Backend. Der Agent darf niemals behaupten, Daten gespeichert zu
 * haben, wenn kein funktionierendes Backend existiert.
 *
 * Zum Aktivieren:
 *  1. Ein echtes, DSGVO-konformes Backend anbinden (siehe `execute`).
 *  2. `LEAD_CAPTURE_ENABLED` auf `true` setzen bzw. Env-Variable `LEAD_CAPTURE_ENABLED=true`.
 *  3. Ausdrückliche Einwilligung des Nutzers voraussetzen, bevor Daten verarbeitet werden.
 *
 * Bewusst NICHT erfasst: Zahlungsdaten, Karten- oder Ausweisdaten, Passwörter.
 */
export const LEAD_CAPTURE_ENABLED =
  (process.env.LEAD_CAPTURE_ENABLED ?? 'false').toLowerCase() === 'true';

/**
 * Beispiel-Tooldefinition (Platzhalter). Wird nur eingebunden, wenn die
 * Lead-Erfassung ausdrücklich aktiviert wurde.
 */
export function createLeadCaptureTool() {
  return tool({
    name: 'captureLead',
    description:
      'Nur nach ausdrücklicher Einwilligung des Nutzers verwenden. Hält freiwillige ' +
      'Kontaktangaben für einen späteren Rückruf fest. Niemals nach Zahlungs-, Karten- ' +
      'oder Ausweisdaten fragen.',
    parameters: z.object({
      name: z.string().describe('Vom Nutzer freiwillig genannter Name.'),
      contact: z
        .string()
        .optional()
        .describe('Freiwillige Kontaktmöglichkeit (z. B. E-Mail oder Telefonnummer).'),
      interest: z.string().describe('Woran der Nutzer interessiert ist.'),
      callbackRequested: z.boolean().describe('Ob der Nutzer ausdrücklich einen Rückruf wünscht.'),
      consentGiven: z
        .boolean()
        .describe('Ob der Nutzer der Speicherung ausdrücklich zugestimmt hat.'),
    }),
    execute: async ({ consentGiven }) => {
      // PLATZHALTER: Es existiert kein Speicher-Backend. Daher wird bewusst
      // nichts gespeichert und dem Nutzer gegenüber nichts Falsches behauptet.
      if (!consentGiven) {
        return 'Ohne ausdrückliche Einwilligung werden keinerlei Angaben festgehalten.';
      }
      return (
        'Die Lead-Erfassung ist in dieser Version noch nicht aktiv. Es wurde nichts ' +
        'gespeichert. Bitte gib die Kontaktangaben nur über einen offiziellen, ' +
        'freigegebenen Weg weiter.'
      );
    },
  });
}
