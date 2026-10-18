/**
 * Alles, was die öffentliche Seite aus den Einstellungen braucht – serialisierbar,
 * damit es vom Server an die Client-Komponenten übergeben werden kann.
 */

import type { CloserState } from '@/lib/closer-state';
import { uiText } from '@/lib/ui-text';
import type { AllSettings } from '@/lib/admin/settings';

export interface PublicUi {
  name: string;
  tagline: string;
  imageUrl: string;
  eyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  buttonStart: string;
  features: string[];
  privacyNote: string;
  footer: string;
  status: Record<CloserState, string>;
  textInputPlaceholder: string;
  supportsChatInput: boolean;
  showTranscript: boolean;
  /** true, wenn Besucher ohne Login nicht sprechen dürfen. */
  loginRequired: boolean;
  design: { accent: string; accentLight: string; accentDark: string; background: string };
}

export const DEFAULT_PUBLIC_UI: PublicUi = {
  name: uiText.agentName,
  tagline: uiText.agentTagline,
  imageUrl: '/johann-orb.png',
  eyebrow: uiText.eyebrow,
  heroTitleLine1: uiText.heroTitleLine1,
  heroTitleLine2: uiText.heroTitleLine2,
  heroDescription: uiText.heroDescription,
  buttonStart: uiText.buttonStart,
  features: [...uiText.features],
  privacyNote: uiText.privacyNote,
  footer: uiText.footer,
  status: { ...uiText.status },
  textInputPlaceholder: uiText.controls.textInputPlaceholder,
  supportsChatInput: true,
  showTranscript: true,
  loginRequired: false,
  design: { accent: '#d4a63a', accentLight: '#f3d58a', accentDark: '#8a6420', background: '#0a0a0b' },
};

export function publicUiFromSettings(s: AllSettings, loggedIn: boolean): PublicUi {
  const n = s.persona.name;
  return {
    name: n,
    tagline: s.persona.tagline,
    imageUrl: s.persona.imageUrl || '/johann-orb.png',
    eyebrow: s.texts.eyebrow,
    heroTitleLine1: s.texts.heroTitleLine1,
    heroTitleLine2: s.texts.heroTitleLine2,
    heroDescription: s.texts.heroDescription,
    buttonStart: s.texts.buttonStart,
    features: s.texts.features,
    privacyNote: s.texts.privacyNote,
    footer: s.texts.footer,
    status: {
      disconnected: s.texts.statusDisconnected,
      connecting: uiText.status.connecting,
      listening: `${n} hört zu`,
      thinking: `${n} denkt nach`,
      speaking: `${n} spricht`,
    },
    textInputPlaceholder: `Nachricht an ${n} …`,
    supportsChatInput: s.design.supportsChatInput,
    showTranscript: s.design.showTranscript,
    loginRequired: !s.features.publicAccess && !loggedIn,
    design: { accent: s.design.accent, accentLight: s.design.accentLight, accentDark: s.design.accentDark, background: s.design.background },
  };
}
