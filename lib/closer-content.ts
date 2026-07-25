/**
 * Zentrale Textbausteine für die CLOSER-Oberfläche.
 *
 * Alle sichtbaren Texte des Frontends werden hier gebündelt, damit sie an
 * einer einzigen Stelle angepasst werden können, ohne Komponenten anzufassen.
 * Der Systemprompt und die Begrüßung des Agenten leben separat im Backend
 * (siehe `voice-agent/src/prompts/closer-system-prompt.ts`).
 *
 * Aktuelle Ausrichtung: ein sprachgesteuertes „persönliches KI-Betriebssystem"
 * mit einem männlichen Host (CLOSER). Voice-first, dunkel, direkt.
 */
export const CLOSER_CONTENT = {
  eyebrow: 'DEIN PERSÖNLICHES KI-BETRIEBSSYSTEM',

  heading: {
    line1: 'Deine Welt. Deine KI.',
    line2: 'Sprich. Er hört zu, denkt mit, handelt.',
  },

  description:
    'Ein sprachgesteuertes Betriebssystem mit einem Host, der nicht wie ein Assistent klingt. Sag, was du brauchst – er versteht, was du wirklich meinst, findet den entscheidenden Punkt und bringt die Dinge in Bewegung. Schlagfertig, psychologisch klug, immer Klartext.',

  agentName: 'CLOSER',
  agentTagline: 'dein sprechender Host im System',

  buttons: {
    start: 'Sprechen',
    connecting: 'System startet …',
    end: 'Beenden',
    toggleTranscript: 'Verlauf',
  },

  features: ['Voice-first', 'Psychologisch klug', 'Trocken im Humor', 'Immer Klartext'],

  privacyNote:
    'Teile im Gespräch keine Passwörter, PINs oder vollständigen Karten- und Zugangsdaten.',

  footer:
    'CLOSER ist ein KI-gestützter Host und keine reale Person. Er imitiert keine konkrete Persönlichkeit. Finanzielle, rechtliche und steuerliche Entscheidungen sollten eigenständig geprüft werden.',

  /** Statusmeldungen, die zum Agentenzustand passen. */
  status: {
    idle: 'Bereit, wenn du es bist.',
    connecting: 'System startet …',
    listening: 'CLOSER hört zu',
    thinking: 'CLOSER denkt nach',
    speaking: 'CLOSER spricht',
    ending: 'Verbindung wird beendet …',
  },

  transcript: {
    title: 'Verlauf',
    empty: 'Sobald ihr sprecht, erscheint hier das Gesprächsprotokoll.',
    close: 'Verlauf schließen',
  },

  /**
   * Nutzerfreundliche Fehlermeldungen. Es werden bewusst keine technischen
   * Rohfehler oder Stacktraces angezeigt.
   */
  errors: {
    micDenied: {
      title: 'Mikrofon nicht freigegeben',
      description:
        'CLOSER braucht dein Mikrofon, um dich zu hören. Erlaube den Zugriff in den Browser-Einstellungen und starte erneut.',
    },
    micMissing: {
      title: 'Kein Mikrofon gefunden',
      description:
        'Es wurde kein Mikrofon erkannt. Schließe ein Mikrofon an oder wähle ein anderes Gerät aus und versuche es noch einmal.',
    },
    config: {
      title: 'Konfiguration unvollständig',
      description:
        'Die Verbindung zu CLOSER ist noch nicht eingerichtet. Bitte hinterlege die Zugangsdaten und starte erneut.',
    },
    connection: {
      title: 'Verbindung fehlgeschlagen',
      description:
        'Die Verbindung konnte nicht aufgebaut werden. Prüfe deine Internetverbindung und versuche es gleich noch einmal.',
    },
    agentUnreachable: {
      title: 'CLOSER ist gerade nicht erreichbar',
      description:
        'Der Host konnte nicht erreicht werden. Bitte versuche es in einem Moment noch einmal.',
    },
    sessionEnded: {
      title: 'Verbindung unerwartet beendet',
      description: 'Die Verbindung wurde unerwartet getrennt. Du kannst jederzeit neu starten.',
    },
    unsupported: {
      title: 'Browser wird nicht unterstützt',
      description:
        'Dein Browser unterstützt die benötigte Audiofunktion nicht. Versuche es mit einer aktuellen Version von Chrome, Edge, Firefox oder Safari.',
    },
    generic: {
      title: 'Etwas ist schiefgelaufen',
      description: 'Es ist ein unerwartetes Problem aufgetreten. Bitte starte erneut.',
    },
  },

  /** Aktion, mit der die Audiowiedergabe im Browser gestartet wird. */
  startAudioLabel: 'Ton aktivieren',

  /** Kurzer, beschreibender Alt-Text für den Orb (Sektion 19). */
  orbAlt: 'Leuchtender violett-cyanfarbener Orb – die sprechende Präsenz von CLOSER im System.',
} as const;

export type CloserContent = typeof CLOSER_CONTENT;
