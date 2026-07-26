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

  accent: '#7B6CF6',
  themeColor: '#0A0B1A',

  startButtonText: 'Sendung starten',

  supportsChatInput: true,

  // Porträt von Reporter Slav. Die Datei muss unter public/slav-agent.png liegen
  // (siehe SETUP-SLAV.md). Solange sie fehlt, zeigt der Orb einen violetten
  // CSS-Fallback.
  orbImageSrc: '/slav-agent.png',
  orbAltText: 'Porträt von Reporter Slav – Brille, markante Haartolle, schwarzes Shirt, blau-violettes Leuchten.',
};
