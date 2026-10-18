import { redirect } from 'next/navigation';
import { ActionForm } from '@/components/admin/action-form';
import { AuthCard } from '@/components/admin/auth-card';
import { Field, Input, Notice } from '@/components/admin/ui';
import { setupAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { countUsers } from '@/lib/admin/users';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const settings = await getSettings();
  if (!hasDatabase()) {
    return (
      <AuthCard title="Einrichtung" personaName={settings.persona.name}>
        <Notice tone="warn">
          Keine Datenbank verbunden. In Vercel: Storage → Neon (Postgres) → „Connect Project“ für das Projekt closer. Dadurch wird DATABASE_URL gesetzt. Danach Redeploy und diese Seite neu laden.
        </Notice>
      </AuthCard>
    );
  }
  let n = 0;
  let dbError: string | null = null;
  try {
    n = await countUsers();
  } catch (e) {
    dbError = (e as Error).message;
  }
  if (dbError) {
    return (
      <AuthCard title="Einrichtung" personaName={settings.persona.name}>
        <Notice tone="error">Die Datenbank antwortet nicht: {dbError}</Notice>
      </AuthCard>
    );
  }
  if (n > 0) redirect('/login');
  return (
    <AuthCard title="Erstes Admin-Konto" description="Einmalig: Lege das Hauptkonto an. Danach ist diese Seite gesperrt. Das Startwissen wird dabei in die Datenbank übernommen." personaName={settings.persona.name}>
      <ActionForm action={setupAction} submitLabel="Admin anlegen und starten">
        <Field label="Name"><Input name="name" required autoFocus /></Field>
        <Field label="E-Mail"><Input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Passwort" hint="Mindestens 10 Zeichen."><Input name="password" type="password" autoComplete="new-password" required /></Field>
        <Field label="Passwort wiederholen"><Input name="password2" type="password" autoComplete="new-password" required /></Field>
      </ActionForm>
    </AuthCard>
  );
}
