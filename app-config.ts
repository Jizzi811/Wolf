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
  companyName: 'KickstarterCash.club',
  productName: 'CLOSER',

  pageTitle: 'CLOSER – Der Voice Agent von KickstarterCash.club',
  pageDescription:
    'Ein charismatischer KI-Gesprächspartner für Business, Motivation und Klartext.',

  accent: '#D4A63A',
  themeColor: '#0A0A0B',

  startButtonText: 'Gespräch starten',

  supportsChatInput: true,

  orbImageSrc: '/johann-orb.png',
  orbAltText: 'Goldener Orb mit Sonnenbrille, Hut und Anzug – die Figur von CLOSER.',
};
