import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { AuthCard } from '@/components/admin/auth-card';
import { Field, Input, Notice } from '@/components/admin/ui';
import { loginAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { countUsers } from '@/lib/admin/users';
import { homeFor } from '@/lib/auth/guards';
import { getCurrentUser } from '@/lib/auth/session';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const settings = await getSettings();
  if (!hasDatabase()) {
    return (
      <AuthCard title="Anmelden" personaName={settings.persona.name}>
        <Notice tone="warn">Es ist noch keine Datenbank verbunden. In Vercel: Storage → Neon (Postgres) → „Connect Project“ für das Projekt closer, danach Redeploy.</Notice>
      </AuthCard>
    );
  }
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(next && next.startsWith('/') ? next : homeFor(user.role));
  if ((await countUsers()) === 0) redirect('/setup');
  return (
    <AuthCard title="Anmelden" description="Admin, Team oder Mitglied." personaName={settings.persona.name}>
      <ActionForm action={loginAction} hidden={{ next: next ?? '' }} submitLabel="Anmelden">
        <Field label="E-Mail"><Input name="email" type="email" autoComplete="email" required autoFocus /></Field>
        <Field label="Passwort"><Input name="password" type="password" autoComplete="current-password" required /></Field>
      </ActionForm>
      {settings.features.selfRegistration ? (
        <p className="mt-5 text-sm text-muted">Noch kein Konto? <Link href="/registrieren" className="text-gold-light hover:underline">Jetzt registrieren</Link></p>
      ) : null}
    </AuthCard>
  );
}
