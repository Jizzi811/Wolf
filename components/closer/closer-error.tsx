'use client';

import { type CloserErrorKey } from '@/lib/errors';
import { uiText } from '@/lib/ui-text';
import { cn } from '@/lib/utils';

interface CloserErrorProps {
  errorKey: CloserErrorKey | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Dezente, nutzerfreundliche Fehlermeldung. Zeigt niemals technische
 * Rohfehler. role="alert" sorgt für sofortige Ansage durch Screenreader.
 */
export function CloserError({ errorKey, onRetry, onDismiss, className }: CloserErrorProps) {
  if (!errorKey) return null;
  const message = uiText.errors[errorKey];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/[0.08] px-4 py-3 text-sm text-cream backdrop-blur-sm',
        className
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mt-0.5 flex-none text-danger"
      >
        <path
          d="M12 8v5m0 3h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.42 0Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="flex-1 leading-relaxed">{message}</p>

      <div className="flex flex-none items-center gap-1">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {uiText.errors.retry}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={uiText.errors.dismiss}
            className="rounded-full px-2 py-1 text-xs text-muted hover:bg-white/5 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
