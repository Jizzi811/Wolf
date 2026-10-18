import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { deleteConversationAction } from '@/lib/admin/actions';
import { getConversation, listConversations } from '@/lib/admin/tracking';
import { db, schema } from '@/lib/db';
import { ConfirmButton } from '../action-form';
import { Badge, Card, PageHeader, Table, Td, fmtDate, fmtDuration } from '../ui';

const OUTCOME_LABEL: Record<string, string> = { info: 'Information', lead: 'Lead', abbruch: 'Abbruch' };

export async function GespraecheModule({ base }: { base: string }) {
  const rows = await listConversations({ limit: 200 });
  const userIds = [...new Set(rows.map((r) => r.userId).filter((x): x is number => x != null))];
  const d = await db();
  const users = userIds.length ? await d.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users) : [];
  const userMap = new Map(users.map((u) => [u.id, u]));
  return (
    <>
      <PageHeader title="Gespräche" description="Jedes Gespräch mit Zeitpunkt, Dauer, Nachrichten, Themen, Ergebnis und – falls angemeldet – dem Nutzer. Transkripte werden nur gespeichert, wenn der Schalter in den Einstellungen aktiv ist." />
      <Card>
        <Table head={['Zeit', 'Dauer', 'Nachr.', 'Nutzer', 'Empfehler', 'Themen', 'Ergebnis', 'Ende', '']}>
          {rows.map((c) => {
            const u = c.userId ? userMap.get(c.userId) : null;
            return (
              <tr key={c.id}>
                <Td>{fmtDate(c.startedAt)}</Td>
                <Td>{fmtDuration(c.durationS)}</Td>
                <Td>{c.messagesCount}</Td>
                <Td>{u ? u.name || u.email : c.visitorId ? <span className="font-mono text-xs text-muted">Besucher {c.visitorId.slice(0, 6)}</span> : 'anonym'}</Td>
                <Td>{c.refUsername ?? '–'}</Td>
                <Td>{c.topics.slice(0, 3).join(', ') || '–'}</Td>
                <Td><Badge tone={c.outcome === 'lead' ? 'green' : 'neutral'}>{OUTCOME_LABEL[c.outcome] ?? c.outcome}</Badge></Td>
                <Td className="text-xs text-muted">{c.endedReason ?? (c.endedAt ? 'beendet' : 'läuft')}</Td>
                <Td><Link href={`${base}/gespraeche/${c.id}`} className="text-gold-light hover:underline">Öffnen</Link></Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}

export async function GespraechDetailModule({ base, id, canDelete }: { base: string; id: number; canDelete: boolean }) {
  const c = await getConversation(id);
  if (!c) notFound();
  const d = await db();
  const user = c.userId ? await d.query.users.findFirst({ where: eq(schema.users.id, c.userId) }) : null;
  const lead = c.leadId ? await d.query.leads.findFirst({ where: eq(schema.leads.id, c.leadId) }) : null;
  return (
    <>
      <PageHeader
        title={`Gespräch vom ${fmtDate(c.startedAt)}`}
        description={`Kennung ${c.conversationId}${c.vapiCallId ? ` · Vapi ${c.vapiCallId}` : ''}`}
        actions={
          <>
            <Link href={`${base}/gespraeche`} className="text-sm text-muted hover:text-cream">← Zurück</Link>
            {canDelete ? <ConfirmButton action={deleteConversationAction} label="Löschen" variant="danger" confirm="Dieses Gespräch endgültig löschen?" hidden={{ id: c.id, base }} /> : null}
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Eckdaten">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Dauer</dt><dd>{fmtDuration(c.durationS)}</dd>
            <dt className="text-muted">Nachrichten</dt><dd>{c.messagesCount}</dd>
            <dt className="text-muted">Ergebnis</dt><dd>{OUTCOME_LABEL[c.outcome] ?? c.outcome}</dd>
            <dt className="text-muted">Ende</dt><dd>{c.endedReason ?? '–'}</dd>
            <dt className="text-muted">Sprache</dt><dd>{c.language}</dd>
            <dt className="text-muted">Kanal</dt><dd>{c.channel}</dd>
            <dt className="text-muted">Nutzer</dt><dd>{user ? `${user.name} (${user.email})` : c.visitorId ? `Besucher ${c.visitorId.slice(0, 8)}` : 'anonym'}</dd>
            <dt className="text-muted">Empfehler</dt><dd>{c.refUsername ?? '–'}</dd>
            <dt className="text-muted">Kosten</dt><dd>{c.costUsd ? `${Number(c.costUsd).toFixed(3)} USD` : '–'}</dd>
            <dt className="text-muted">Browser</dt><dd className="break-all text-xs text-muted">{c.userAgent ?? '–'}</dd>
          </dl>
          {c.topics.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.topics.map((t) => <Badge key={t} tone="gold">{t}</Badge>)}
            </div>
          ) : null}
        </Card>
        <Card title="Zusammenfassung" className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-cream/90">{c.summary ?? 'Keine Zusammenfassung vorhanden (entsteht automatisch über den Vapi-Webhook, wenn OPENAI_API_KEY oder Vapi-Zusammenfassung verfügbar ist).'}</p>
          {lead ? (
            <p className="mt-4 text-sm">
              Lead: <Link href={`${base}/leads`} className="text-gold-light hover:underline">{lead.firstName} {lead.lastName ?? ''} · {lead.email}</Link>
            </p>
          ) : null}
        </Card>
        <Card title="Transkript" className="lg:col-span-3">
          {c.transcript.length === 0 ? (
            <p className="text-sm text-muted">Kein Transkript gespeichert.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {c.transcript.map((t, i) => (
                <li key={i} className={`max-w-3xl rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${t.role === 'assistant' ? 'self-start border border-gold/20 bg-gold/5 text-cream' : 'self-end bg-ink-3 text-cream/90'}`}>
                  <span className="mr-2 text-[0.65rem] uppercase tracking-wider text-muted">{t.role === 'assistant' ? 'Agent' : 'Nutzer'}{t.at != null ? ` · ${fmtDuration(t.at)}` : ''}</span>
                  {t.text}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
