/**
 * ZENTRALER PERSONA-SCHALTER.
 *
 * Dieses Projekt kann mehrere Voice-Agent-Personas hosten (z. B. CLOSER, SLAV).
 * Jede Persona lebt in ihrem eigenen Ordner unter `lib/<persona>/` und stellt
 * eine `build…Assistant()`-Funktion, eine Begrüßung und eine Sprache bereit.
 *
 * Um die App auf eine andere Persona umzustellen (auch für weitere Voice-Agent-
 * Oberflächen), muss NUR dieser eine Import unten geändert werden. Der Rest der
 * App (Hook `use-vapi`) nutzt ausschließlich `buildActiveAssistant`.
 *
 * Verfügbare Personas:
 *   - CLOSER: import { buildCloserAssistant } from './closer/assistant'
 *   - SLAV:   import { buildSlavAssistant }   from './slav/assistant'
 *
 * Hinweis: Passe zusätzlich das Branding in `app-config.ts` und die sichtbaren
 * Texte in `lib/ui-text.ts` an die aktive Persona an.
 */

import { buildSlavAssistant, SLAV_GREETING, SLAV_LANGUAGE } from './slav/assistant';

/** Baut den aktuell aktiven Vapi-Assistenten. Wird an `vapi.start()` übergeben. */
export const buildActiveAssistant = buildSlavAssistant;

/** Begrüßung der aktiven Persona (falls an anderer Stelle gebraucht). */
export const ACTIVE_GREETING = SLAV_GREETING;

/** Standardsprache der aktiven Persona. */
export const ACTIVE_LANGUAGE = SLAV_LANGUAGE;
