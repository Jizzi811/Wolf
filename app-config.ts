export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

/**
 * Zentrale Branding- und Feature-Konfiguration für CLOSER.
 *
 * CLOSER ist primär ein Voice Agent: Kamera und Screen Sharing sind bewusst
 * deaktiviert, damit sie die Oberfläche nicht dominieren. Die zugrunde
 * liegende LiveKit-Funktionalität bleibt erhalten und kann hier wieder
 * aktiviert werden.
 */
export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'KickstarterCash.club',
  pageTitle: 'CLOSER – Der Voice Agent von KickstarterCash.club',
  pageDescription: 'Ein charismatischer KI-Gesprächspartner für Business, Motivation und Klartext.',

  // Voice-only: Text-Chat bleibt aktiv, Kamera und Screen Sharing sind aus.
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  // Wortmarke wird über die CLOSER-Komponenten gerendert; der Orb dient als Logo.
  logo: '/johann-orb.png',
  logoDark: '/johann-orb.png',

  // Gold-Akzent passend zur KickstarterCash-Ästhetik.
  accent: '#D4A63A',
  accentDark: '#D4A63A',

  startButtonText: 'Gespräch starten',

  // Audio-Visualizer: dezente Balken in warmem Gold (reagiert auf die Stimme).
  audioVisualizerType: 'bar',
  audioVisualizerColor: '#D4A63A',
  audioVisualizerColorDark: '#F3D58A',
  audioVisualizerBarCount: 5,

  // Agent-Dispatch: Name des LiveKit-Agenten (muss zum Backend passen).
  // Leer lassen für automatischen Dispatch.
  agentName: process.env.AGENT_NAME ?? undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
