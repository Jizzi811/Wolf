/**
 * Zentrale Definition der visuellen Zustände von CLOSER.
 *
 * Framework-agnostisch (kein Engine-Import), damit Orb- und Status-Komponenten
 * rein präsentativ bleiben. Die Ableitung aus den echten Vapi-Ereignissen
 * passiert im Hook `use-vapi.ts`.
 */

export type CloserState = 'disconnected' | 'connecting' | 'listening' | 'thinking' | 'speaking';

/** Kompakte Beschreibung für Screenreader – pro Zustand eine Zeile. */
export const closerStateAria: Record<CloserState, string> = {
  disconnected: 'CLOSER ist bereit. Noch keine aktive Verbindung.',
  connecting: 'Verbindung zu CLOSER wird aufgebaut.',
  listening: 'CLOSER hört zu.',
  thinking: 'CLOSER denkt nach.',
  speaking: 'CLOSER spricht.',
};
