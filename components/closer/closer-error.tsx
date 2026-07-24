'use client';

import { type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { WarningIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CLOSER_CONTENT } from '@/lib/closer-content';

export type CloserErrorKind = keyof typeof CLOSER_CONTENT.errors;

interface ToastContent {
  title: ReactNode;
  description: ReactNode;
}

function toastAlert({ title, description }: ToastContent) {
  return sonnerToast.custom(
    (id) => (
      <Alert
        onClick={() => sonnerToast.dismiss(id)}
        className="border-gold/30 bg-card w-full md:w-[380px]"
      >
        <WarningIcon weight="bold" className="text-gold" />
        <AlertTitle className="text-cream">{title}</AlertTitle>
        {description && (
          <AlertDescription className="text-cream-muted">{description}</AlertDescription>
        )}
      </Alert>
    ),
    { duration: 8_000 }
  );
}

/**
 * Zeigt eine nutzerfreundliche Fehlermeldung (Sektion 8). Es werden bewusst
 * nur die vorbereiteten, verständlichen Texte angezeigt – niemals technische
 * Rohfehler oder Stacktraces.
 */
export function showCloserError(kind: CloserErrorKind) {
  const entry = CLOSER_CONTENT.errors[kind];
  toastAlert({ title: entry.title, description: entry.description });
}

/**
 * Ordnet einen Geräte-/Mikrofonfehler einer verständlichen Meldung zu.
 */
export function showMicError(error: Error) {
  const name = error?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    showCloserError('micDenied');
  } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    showCloserError('micMissing');
  } else if (name === 'NotSupportedError') {
    showCloserError('unsupported');
  } else {
    showCloserError('micDenied');
  }
}

/**
 * Fragt die Token-Route, ob die LiveKit-Zugangsdaten serverseitig gesetzt sind.
 * Es werden dabei keine Geheimnisse übertragen – nur ein Ja/Nein.
 * Bei Unerreichbarkeit wird `true` angenommen, damit nicht fälschlich ein
 * Konfigurationsfehler statt eines Verbindungsfehlers angezeigt wird.
 */
async function isTokenEndpointConfigured(): Promise<boolean> {
  try {
    const res = await fetch('/api/token', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return true;
    const data = (await res.json()) as { configured?: boolean };
    return data.configured !== false;
  } catch {
    return true;
  }
}

/**
 * Ordnet einen Verbindungsfehler beim Start einer verständlichen Meldung zu
 * (Sektion 8). Prüft zunächst, ob die LiveKit-Konfiguration überhaupt gesetzt
 * ist, und zeigt dann die passende Meldung: fehlende Konfiguration,
 * nicht unterstützter Browser oder allgemeiner Verbindungsfehler.
 */
export async function showConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    typeof navigator !== 'undefined' &&
    (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')
  ) {
    showCloserError('unsupported');
    return;
  }

  if (
    message.includes('config') ||
    message.includes('livekit_url') ||
    message.includes('api_key') ||
    message.includes('api_secret') ||
    message.includes('not defined')
  ) {
    showCloserError('config');
    return;
  }

  // Präzise unterscheiden: fehlt die Konfiguration oder ist LiveKit unerreichbar?
  const configured = await isTokenEndpointConfigured();
  showCloserError(configured ? 'connection' : 'config');
}
