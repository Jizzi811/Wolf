/**
 * Zentrale Textbausteine für die CLOSER-Oberfläche.
 *
 * Alle sichtbaren Texte des Frontends werden hier gebündelt, damit sie an
 * einer einzigen Stelle angepasst werden können, ohne Komponenten anzufassen.
 * Der Systemprompt und die Begrüßung des Agenten leben separat im Backend
 * (siehe `voice-agent/src/prompts/closer-system-prompt.ts`).
 */
export const CLOSER_CONTENT = {
  eyebrow: 'KICKSTARTERCASH.CLUB PRESENTS',

  heading: {
    line1: 'Triff CLOSER.',
    line2: 'Charme im Anzug. Klartext im Kopf.',
  },

  description:
    'Ein Voice Agent für Business, Motivation und Gespräche ohne langweiliges Assistenten-Gelaber. Schlagfertig, psychologisch klug und immer bereit, den entscheidenden Punkt zu finden.',

  agentName: 'CLOSER',
  agentTagline: 'Johanns digitaler Gesprächspartner',

  buttons: {
    start: 'Gespräch starten',
    connecting: 'Verbindung wird aufgebaut …',
    end: 'Gespräch beenden',
    toggleTranscript: 'Transkript',
  },

  features: ['Psychologisch klug', 'Trocken im Humor', 'Gefährlich gut im Klartext'],

  privacyNote:
    'Teile im Gespräch keine Passwörter, PINs oder vollständigen Karten- und Zugangsdaten.',

  footer:
    'CLOSER ist ein KI-gestützter Gesprächspartner von KickstarterCash.club und keine reale Person. Finanzielle, rechtliche und steuerliche Entscheidungen sollten eigenständig geprüft werden.',

  /** Statusmeldungen, die zum Agentenzustand passen. */
  status: {
    idle: 'Bereit, wenn du es bist.',
    connecting: 'Verbindung wird aufgebaut …',
    listening: 'CLOSER hört zu',
    thinking: 'CLOSER denkt nach',
    speaking: 'CLOSER spricht',
    ending: 'Gespräch wird beendet …',
  },

  transcript: {
    title: 'Transkript',
    empty: 'Sobald ihr sprecht, erscheint hier das Gesprächsprotokoll.',
    close: 'Transkript schließen',
  },

  /**
   * Nutzerfreundliche Fehlermeldungen. Es werden bewusst keine technischen
   * Rohfehler oder Stacktraces angezeigt.
   */
  errors: {
    micDenied: {
      title: 'Mikrofon nicht freigegeben',
      description:
        'CLOSER braucht dein Mikrofon, um dich zu hören. Erlaube den Zugriff in den Browser-Einstellungen und starte das Gespräch erneut.',
    },
    micMissing: {
      title: 'Kein Mikrofon gefunden',
      description:
        'Es wurde kein Mikrofon erkannt. Schließe ein Mikrofon an oder wähle ein anderes Gerät aus und versuche es noch einmal.',
    },
    config: {
      title: 'Konfiguration unvollständig',
      description:
        'Die Verbindung zu CLOSER ist noch nicht eingerichtet. Bitte hinterlege die LiveKit-Zugangsdaten und starte erneut.',
    },
    connection: {
      title: 'Verbindung fehlgeschlagen',
      description:
        'Die Verbindung konnte nicht aufgebaut werden. Prüfe deine Internetverbindung und versuche es gleich noch einmal.',
    },
    agentUnreachable: {
      title: 'CLOSER ist gerade nicht erreichbar',
      description:
        'Der Gesprächspartner konnte nicht erreicht werden. Bitte versuche es in einem Moment noch einmal.',
    },
    sessionEnded: {
      title: 'Gespräch unerwartet beendet',
      description: 'Das Gespräch wurde unerwartet getrennt. Du kannst jederzeit ein neues starten.',
    },
    unsupported: {
      title: 'Browser wird nicht unterstützt',
      description:
        'Dein Browser unterstützt die benötigte Audiofunktion nicht. Versuche es mit einer aktuellen Version von Chrome, Edge, Firefox oder Safari.',
    },
    generic: {
      title: 'Etwas ist schiefgelaufen',
      description: 'Es ist ein unerwartetes Problem aufgetreten. Bitte starte das Gespräch neu.',
    },
  },

  /** Aktion, mit der die Audiowiedergabe im Browser gestartet wird. */
  startAudioLabel: 'Ton aktivieren',

  /** Kurzer, beschreibender Alt-Text für den Orb (Sektion 19). */
  orbAlt: 'Goldener Orb mit Hut und Sonnenbrille – die Bühnenfigur von CLOSER.',
} as const;

export type CloserContent = typeof CLOSER_CONTENT;
