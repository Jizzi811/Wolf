import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-cream sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, description, children, className, footer }: { title?: string; description?: string; children: React.ReactNode; className?: string; footer?: React.ReactNode }) {
  return (
    <section className={cn('rounded-2xl border border-gold/15 bg-ink-2/70 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-6', className)}>
      {title ? (
        <header className="mb-4">
          <h2 className="font-sans text-base font-semibold text-cream">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </header>
      ) : null}
      {children}
      {footer ? <footer className="mt-5 border-t border-gold/10 pt-4">{footer}</footer> : null}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted/80">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  'w-full rounded-xl border border-gold/20 bg-ink/70 px-3.5 py-2.5 text-sm text-cream placeholder:text-muted/60 ' +
  'focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-60';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'min-h-28 leading-relaxed', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, 'appearance-none', props.className)} />;
}

export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold/10 bg-ink/40 p-3 hover:border-gold/30">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-cream">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'gold' | 'green' | 'red' | 'blue'; className?: string }) {
  const tones = {
    neutral: 'border-gold/15 bg-ink-3 text-muted',
    gold: 'border-gold/40 bg-gold/10 text-gold-light',
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    red: 'border-danger/40 bg-danger/10 text-danger',
    blue: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  };
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide', tones[tone], className)}>{children}</span>;
}

export function StatCard({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: 'gold' | 'neutral' }) {
  return (
    <div className={cn('rounded-2xl border p-4', tone === 'gold' ? 'border-gold/30 bg-gradient-to-br from-gold/15 to-transparent' : 'border-gold/15 bg-ink-2/70')}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-cream">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const rows = React.Children.count(children);
  return (
    <div className="overflow-x-auto rounded-xl border border-gold/10">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-ink-3/60 text-xs uppercase tracking-wider text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gold/10">
          {rows === 0 ? (
            <tr>
              <td colSpan={head.length} className="px-3 py-6 text-center text-muted">{empty ?? 'Noch keine Einträge.'}</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-3 py-2.5 align-top text-cream/90', className)}>{children}</td>;
}

export function LinkButton({ href, children, variant = 'ghost' }: { href: string; children: React.ReactNode; variant?: 'ghost' | 'primary' }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition',
        variant === 'primary'
          ? 'bg-gradient-to-b from-gold-light to-gold text-ink font-semibold hover:brightness-105'
          : 'border border-gold/30 text-cream hover:border-gold/60 hover:bg-gold/10'
      )}
    >
      {children}
    </Link>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok' | 'error'; children: React.ReactNode }) {
  const tones = {
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
    warn: 'border-gold/40 bg-gold/10 text-gold-light',
    ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    error: 'border-danger/40 bg-danger/10 text-danger',
  };
  return <div className={cn('rounded-xl border px-4 py-3 text-sm leading-relaxed', tones[tone])}>{children}</div>;
}

export function fmtDate(d: Date | string | null | undefined, withTime = true): string {
  if (!d) return '–';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function fmtDuration(s: number): string {
  if (!s) return '0:00';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
