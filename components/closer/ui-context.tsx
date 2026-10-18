'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_PUBLIC_UI, type PublicUi } from '@/lib/public-ui';

const Ctx = createContext<PublicUi>(DEFAULT_PUBLIC_UI);

export function PublicUiProvider({ ui, children }: { ui: PublicUi; children: React.ReactNode }) {
  return <Ctx.Provider value={ui}>{children}</Ctx.Provider>;
}

/** Texte, Name, Bild und Schalter der öffentlichen Seite (aus dem Admin). */
export function usePublicUi(): PublicUi {
  return useContext(Ctx);
}
