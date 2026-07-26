/**
 * Zentrale Branding- und Feature-Konfiguration der CLOSER-Anwendung.
 *
 * Farben werden hier nur als Referenz/Theme-Color geführt. Die eigentlichen
 * Design-Tokens (Gold, Anthrazit usw.) leben als CSS-Variablen in
 * `app/globals.css`. Die Sprach-Engine (Vapi-Assistent, Modelle, Stimme,
 * Begrüßung) wird in `lib/closer/assistant.ts` konfiguriert.
 */

export interface AppConfig {
  companyName: string;
  productName: string;

  pageTitle: string;
  pageDescription: string;

  /** Primärer Goldton (Akzent) – passend zu den CSS-Variablen. */
  accent: `#${string}`;
  /** Theme-Color für Browser-UI. */
  themeColor: `#${string}`;

  startButtonText: string;

  /** Optionale Texteingabe an CLOSER zusätzlich zur Stimme. */
  supportsChatInput: boolean;

  /** Pfad zum zentralen Orb-Bild (siehe SETUP-CLOSER.md). */
  orbImageSrc: string;
  orbAltText: string;
}

export const APP_CONFIG: AppConfig = {
  companyName: 'Rheinland-Pflanz',
  productName: 'SLAV',

  pageTitle: 'SLAV – Der total verklatschte Reporter aus Rheinland-Pflanz',
  pageDescription:
    'Ein alberner Voice Agent: Reporter Slav berichtet live von seiner riesengroßen Toastmaschine.',

  accent: '#E8A54B',
  themeColor: '#0A0A0B',

  startButtonText: 'Sendung starten',

  supportsChatInput: true,

  // Platzhalter-Orb. Für Slav am besten das Porträt aus dem Upload als Bild
  // unter public/ ablegen und diesen Pfad darauf zeigen lassen.
  orbImageSrc: '/johann-orb.png',
  orbAltText: 'Orb mit dem Porträt von Reporter Slav – der alberne Reporter aus Rheinland-Pflanz.',
};
