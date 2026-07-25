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
  companyName: 'CLOSER OS',
  pageTitle: 'CLOSER OS – Deine Welt. Deine KI.',
  pageDescription:
    'Ein sprachgesteuertes persönliches KI-Betriebssystem mit einem männlichen Host: schlagfertig, psychologisch klug, immer Klartext.',

  // Voice-only: Text-Chat bleibt aktiv, Kamera und Screen Sharing sind aus.
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  // Wortmarke wird über die CLOSER-Komponenten gerendert; der Orb dient als Logo.
  logo: '/johann-orb.png',
  logoDark: '/johann-orb.png',

  // Iris/Violett-Akzent passend zur dunklen AI-OS-Ästhetik.
  accent: '#8B6CFF',
  accentDark: '#8B6CFF',

  startButtonText: 'Sprechen',

  // Audio-Visualizer: dezente Balken in Iris/Cyan (reagiert auf die Stimme).
  audioVisualizerType: 'bar',
  audioVisualizerColor: '#8B6CFF',
  audioVisualizerColorDark: '#C9B8FF',
  audioVisualizerBarCount: 5,

  // Agent-Dispatch: Name des LiveKit-Agenten (muss zum Backend passen).
  // Leer lassen für automatischen Dispatch.
  agentName: process.env.AGENT_NAME ?? undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
