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
 * Ordnet einen Verbindungsfehler beim Start einer verständlichen Meldung zu.
 */
export function showConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    message.includes('livekit_url') ||
    message.includes('api_key') ||
    message.includes('api_secret') ||
    message.includes('not defined') ||
    message.includes('insecure')
  ) {
    showCloserError('config');
    return;
  }

  if (
    typeof navigator !== 'undefined' &&
    (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')
  ) {
    showCloserError('unsupported');
    return;
  }

  showCloserError('connection');
}
