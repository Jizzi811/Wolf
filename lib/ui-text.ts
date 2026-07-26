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
  eyebrow: 'LIVE AUS RHEINLAND-PFLANZ',

  /** Hauptüberschrift, bewusst zweizeilig. */
  heroTitleLine1: 'Triff Slav.',
  heroTitleLine2: 'Verklatscht im Kopf. Toast in der Hand.',

  /** Kurzbeschreibung im Hero-Bereich. */
  heroDescription:
    'Ein alberner Voice Agent: Reporter Slav aus Rheinland-Pflanz berichtet live von seiner riesengroßen Toastmaschine, tratscht harmlos vor sich hin und hat ab und zu charmante Wortfindungsschwierigkeiten.',

  /** Buttons rund um die Session. */
  buttonStart: 'Sendung starten',
  buttonConnecting: 'Toaster wird angeworfen …',
  buttonEnd: 'Sendung beenden',

  /** Drei kurze Merkmale unter dem Startbutton. */
  features: ['Total verklatscht', 'Reporter mit Herz', 'Toastmaschine inklusive'] as const,

  /** Dezenter Datenschutzhinweis im Hero. */
  privacyNote:
    'Teile im Gespräch keine Passwörter, PINs oder vollständigen Karten- und Zugangsdaten.',

  /** Name und kurzer Untertitel des Agenten. */
  agentName: 'SLAV',
  agentTagline: 'Reporter aus Rheinland-Pflanz',

  /** Footer-Disclaimer. */
  footer:
    'SLAV ist eine fiktive KI-Comedy-Figur und keine reale Person. Sein „Klatsch" ist frei erfunden und bezieht sich nicht auf echte Menschen oder Ereignisse.',

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
    textInputPlaceholder: 'Nachricht an Slav …',
    sendMessage: 'Nachricht senden',
    startAudio: 'Ton aktivieren',
    startAudioHint: 'Tippe hier, um die Audiowiedergabe in deinem Browser zu starten.',
  },

  /** Status-Zeile unter dem Orb, abhängig vom Agentenzustand. */
  status: {
    disconnected: 'Bereit, wenn du es bist.',
    connecting: 'Toaster wird angeworfen …',
    listening: 'Slav hört zu',
    thinking: 'Slav sucht das Wort …',
    speaking: 'Slav berichtet',
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
      'Slav ist gerade nicht am Mikrofon. Bitte versuche es in einem Moment noch einmal.',
    sessionEnded: 'Das Gespräch wurde unerwartet beendet. Du kannst jederzeit neu starten.',
    browserUnsupported:
      'Dein Browser unterstützt die benötigten Audiofunktionen leider nicht. Versuche es mit einem aktuellen Chrome, Edge, Firefox oder Safari.',
    generic: 'Da ist etwas schiefgelaufen. Kein Drama – bitte versuche es einfach noch einmal.',
    dismiss: 'Schließen',
    retry: 'Erneut versuchen',
  },
} as const;

export type UiText = typeof uiText;
