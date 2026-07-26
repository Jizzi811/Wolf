/**
 * Zentrale Sammelstelle für alle sichtbaren Oberflächen-Texte.
 *
 * Alle Strings sind hier gebündelt, damit sie ohne Eingriff in die Komponenten
 * geändert oder später lokalisiert werden können. Bitte KEINE Texte fest in den
 * Komponenten verdrahten – immer hier ergänzen.
 */

import type { CloserState } from '@/lib/closer-state';

export const uiText = {
  /** Kleines Label über der Hauptüberschrift. */
  eyebrow: 'KICKSTARTERCASH.CLUB PRESENTS',

  /** Hauptüberschrift, bewusst zweizeilig. */
  heroTitleLine1: 'Triff CLOSER.',
  heroTitleLine2: 'Charme im Anzug. Klartext im Kopf.',

  /** Kurzbeschreibung im Hero-Bereich. */
  heroDescription:
    'Ein Voice Agent für Business, Motivation und Gespräche ohne langweiliges Assistenten-Gelaber. Schlagfertig, psychologisch klug und immer bereit, den entscheidenden Punkt zu finden.',

  /** Buttons rund um die Session. */
  buttonStart: 'Gespräch starten',
  buttonConnecting: 'Verbindung wird aufgebaut …',
  buttonEnd: 'Gespräch beenden',

  /** Drei kurze Merkmale unter dem Startbutton. */
  features: ['Psychologisch klug', 'Trocken im Humor', 'Gefährlich gut im Klartext'] as const,

  /** Dezenter Datenschutzhinweis im Hero. */
  privacyNote:
    'Teile im Gespräch keine Passwörter, PINs oder vollständigen Karten- und Zugangsdaten.',

  /** Name und kurzer Untertitel des Agenten. */
  agentName: 'CLOSER',
  agentTagline: 'Johanns digitaler Gesprächspartner',

  /** Footer-Disclaimer. */
  footer:
    'CLOSER ist ein KI-gestützter Gesprächspartner von KickstarterCash.club und keine reale Person. Finanzielle, rechtliche und steuerliche Entscheidungen sollten eigenständig geprüft werden.',

  /** Bedienhinweise / ARIA-Beschriftungen. */
  controls: {
    micEnable: 'Mikrofon einschalten',
    micDisable: 'Mikrofon stummschalten',
    micOnLabel: 'Mikrofon an',
    micOffLabel: 'Mikrofon aus',
    endCall: 'Gespräch beenden',
    openTranscript: 'Transkript öffnen',
    closeTranscript: 'Transkript schließen',
    transcriptTitle: 'Gesprächsverlauf',
    textInputPlaceholder: 'Nachricht an CLOSER …',
    sendMessage: 'Nachricht senden',
    startAudio: 'Ton aktivieren',
    startAudioHint: 'Tippe hier, um die Audiowiedergabe in deinem Browser zu starten.',
  },

  /** Status-Zeile unter dem Orb, abhängig vom Agentenzustand. */
  status: {
    disconnected: 'Bereit, wenn du es bist.',
    connecting: 'Verbindung wird aufgebaut …',
    listening: 'CLOSER hört zu',
    thinking: 'CLOSER denkt nach',
    speaking: 'CLOSER spricht',
  } satisfies Record<CloserState, string>,

  /** Nutzerfreundliche Fehlermeldungen – niemals technische Rohfehler zeigen. */
  errors: {
    micDenied:
      'Ohne Mikrofon wird das ein sehr einseitiges Gespräch. Bitte erlaube den Mikrofonzugriff in deinem Browser und starte erneut.',
    configMissing:
      'Die Verbindung ist noch nicht eingerichtet. Es fehlt der öffentliche Vapi-Schlüssel.',
    connectionError:
      'Die Verbindung ist fehlgeschlagen. Prüfe deine Internetverbindung und versuche es gleich noch einmal.',
    agentUnreachable:
      'CLOSER ist gerade nicht erreichbar. Bitte versuche es in einem Moment noch einmal.',
    sessionEnded: 'Das Gespräch wurde unerwartet beendet. Du kannst jederzeit neu starten.',
    browserUnsupported:
      'Dein Browser unterstützt die benötigten Audiofunktionen leider nicht. Versuche es mit einem aktuellen Chrome, Edge, Firefox oder Safari.',
    generic: 'Da ist etwas schiefgelaufen. Kein Drama – bitte versuche es einfach noch einmal.',
    dismiss: 'Schließen',
    retry: 'Erneut versuchen',
  },
} as const;

export type UiText = typeof uiText;
