'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { ActionResult } from '@/lib/admin/actions';
import { cn } from '@/lib/utils';

type Action = (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;

/**
 * Formular mit Server-Aktion, Ladezustand und Rückmeldung. Kinder sind die
 * Felder; der Speichern-Knopf wird automatisch ergänzt.
 */
export function ActionForm({
  action,
  children,
  submitLabel = 'Speichern',
  className,
  hidden,
  onSuccess,
  secondary,
  variant = 'primary',
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  hidden?: Record<string, string | number>;
  onSuccess?: (r: ActionResult) => void;
  secondary?: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const [state, formAction] = useActionState(action, null);
  React.useEffect(() => {
    if (state?.ok && onSuccess) onSuccess(state);
  }, [state, onSuccess]);
  return (
    <form action={formAction} className={cn('flex flex-col gap-4', className)}>
      {hidden
        ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)
        : null}
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} variant={variant} />
        {secondary}
        {state ? (
          <p role="status" className={cn('text-sm', state.ok ? 'text-emerald-300' : 'text-danger')}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function SubmitButton({ label, variant = 'primary', size = 'default', className }: { label: string; variant?: 'primary' | 'ghost' | 'danger'; size?: 'default' | 'lg'; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} aria-busy={pending} className={className}>
      {pending ? 'Bitte warten …' : label}
    </Button>
  );
}

/** Knopf, der eine einfache Server-Aktion (ohne Rückgabe) auslöst, optional mit Bestätigung. */
export function ConfirmButton({
  action,
  label,
  confirm,
  hidden,
  variant = 'ghost',
  className,
}: {
  action: (fd: FormData) => Promise<void>;
  label: string;
  confirm?: string;
  hidden?: Record<string, string | number | boolean>;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline"
    >
      {hidden
        ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)
        : null}
      <SubmitButton label={label} variant={variant} className={className} />
    </form>
  );
}
