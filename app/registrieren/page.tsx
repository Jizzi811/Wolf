import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { AuthCard } from '@/components/admin/auth-card';
import { Field, Input, Notice } from '@/components/admin/ui';
import { registerAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { getCurrentUser } from '@/lib/auth/session';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const settings = await getSettings();
  if (hasDatabase()) {
    const user = await getCurrentUser().catch(() => null);
    if (user) redirect('/mein');
  }
  if (!settings.features.selfRegistration || !hasDatabase()) {
    return (
      <AuthCard title="Registrierung" personaName={settings.persona.name}>
        <Notice tone="info">Die Registrierung ist derzeit geschlossen. <Link href="/login" className="underline">Zum Login</Link></Notice>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Konto anlegen" description="Mit einem Konto siehst du deine eigenen Gespräche und Statistiken." personaName={settings.persona.name}>
      <ActionForm action={registerAction} submitLabel="Registrieren">
        <Field label="Name"><Input name="name" required autoFocus /></Field>
        <Field label="E-Mail"><Input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Passwort" hint="Mindestens 10 Zeichen."><Input name="password" type="password" autoComplete="new-password" required /></Field>
      </ActionForm>
      <p className="mt-5 text-sm text-muted">Schon registriert? <Link href="/login" className="text-gold-light hover:underline">Anmelden</Link></p>
    </AuthCard>
  );
}
