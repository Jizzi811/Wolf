import Link from 'next/link';
import { ActionForm } from '@/components/admin/action-form';
import { Card, Field, Input, PageHeader, StatCard, Table, Td, fmtDate, fmtDuration } from '@/components/admin/ui';
import { changePasswordAction, updateProfileAction } from '@/lib/admin/actions';
import { getUserStats } from '@/lib/admin/stats';
import { listConversations } from '@/lib/admin/tracking';
import { requireUser } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function MeinPage() {
  const user = await requireUser('/mein');
  const [stats, conversations] = await Promise.all([getUserStats(user.id), listConversations({ userId: user.id, limit: 100 })]);
  return (
    <>
      <PageHeader title={`Hallo ${user.name || user.email}`} description="Deine Gespräche, deine Zahlen, dein Konto. Gespräche werden deinem Konto zugeordnet, solange du angemeldet bist." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Gespräche" value={stats.conversations} tone="gold" />
        <StatCard label="Minuten" value={stats.minutes} />
        <StatCard label="Konto seit" value={fmtDate(user.createdAt, false)} />
      </div>
      <Card title="Meine Gespräche" className="mt-4">
        <Table head={['Zeit', 'Dauer', 'Themen', 'Zusammenfassung', '']} empty="Noch keine Gespräche. Starte eines auf der Startseite.">
          {conversations.map((c) => (
            <tr key={c.id}>
              <Td>{fmtDate(c.startedAt)}</Td>
              <Td>{fmtDuration(c.durationS)}</Td>
              <Td>{c.topics.slice(0, 3).join(', ') || '–'}</Td>
              <Td className="max-w-md text-xs text-muted">{c.summary ?? '–'}</Td>
              <Td><Link href={`/mein/gespraeche/${c.id}`} className="text-gold-light hover:underline">Öffnen</Link></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Profil">
          <ActionForm action={updateProfileAction} submitLabel="Speichern">
            <Field label="Name"><Input name="name" defaultValue={user.name} required /></Field>
            <Field label="E-Mail"><Input value={user.email} disabled /></Field>
          </ActionForm>
        </Card>
        <Card title="Passwort ändern">
          <ActionForm action={changePasswordAction} submitLabel="Passwort ändern">
            <Field label="Aktuelles Passwort"><Input name="current" type="password" autoComplete="current-password" required /></Field>
            <Field label="Neues Passwort" hint="Mindestens 10 Zeichen."><Input name="password" type="password" autoComplete="new-password" required /></Field>
            <Field label="Neues Passwort wiederholen"><Input name="password2" type="password" autoComplete="new-password" required /></Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
