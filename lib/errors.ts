/**
 * Fehler-Klassifizierung für nutzerfreundliche Meldungen.
 *
 * Rohe/technische Fehler werden NIE direkt im UI gezeigt. Stattdessen bilden
 * wir sie auf verständliche Schlüssel ab, deren Texte in `ui-text.ts` liegen.
 */

export type CloserErrorKey =
  | 'micDenied'
  | 'configMissing'
  | 'connectionError'
  | 'agentUnreachable'
  | 'sessionEnded'
  | 'browserUnsupported'
  | 'generic';

/** Prüft, ob der Browser die für Voice nötigen APIs überhaupt bereitstellt. */
export function isVoiceSupported(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const hasMedia = !!navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
  const hasWebRTC = typeof window.RTCPeerConnection !== 'undefined';
  return hasMedia && hasWebRTC;
}

/**
 * Ordnet einen unbekannten Fehler einem verständlichen Schlüssel zu.
 */
export function classifyError(err: unknown): CloserErrorKey {
  if (!err) return 'generic';

  const name = (err as { name?: string })?.name ?? '';
  const rawMessage = (err as { message?: string })?.message ?? '';
  const message = `${name} ${rawMessage}`.toLowerCase();

  // Mikrofon-/Geräteprobleme
  if (
    name === 'NotAllowedError' ||
    name === 'SecurityError' ||
    message.includes('permission') ||
    message.includes('denied') ||
    message.includes('not allowed')
  ) {
    return 'micDenied';
  }
  if (
    name === 'NotFoundError' ||
    name === 'NotReadableError' ||
    name === 'OverconstrainedError' ||
    message.includes('microphone') ||
    message.includes('audio input')
  ) {
    return 'micDenied';
  }

  // Fehlende Server-Konfiguration (Token-Route liefert CONFIG_MISSING / 503)
  if (message.includes('config_missing') || message.includes('nicht konfiguriert') || message.includes('503')) {
    return 'configMissing';
  }

  // Browser unterstützt die nötigen Funktionen nicht
  if (name === 'NotSupportedError' || message.includes('not supported') || message.includes('getusermedia')) {
    return 'browserUnsupported';
  }

  // Verbindungsprobleme
  if (
    message.includes('connect') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('websocket') ||
    message.includes('token')
  ) {
    return 'connectionError';
  }

  return 'generic';
}
