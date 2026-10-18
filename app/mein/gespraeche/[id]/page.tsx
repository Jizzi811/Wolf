import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageHeader, fmtDate, fmtDuration } from '@/components/admin/ui';
import { getConversation } from '@/lib/admin/tracking';
import { requireUser } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function MeinGespraechPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser('/mein');
  const { id } = await params;
  const c = await getConversation(Number.parseInt(id, 10) || 0);
  if (!c || c.userId !== user.id) notFound();
  return (
    <>
      <PageHeader title={`Gespräch vom ${fmtDate(c.startedAt)}`} description={`Dauer ${fmtDuration(c.durationS)} · ${c.messagesCount} Nachrichten`} actions={<Link href="/mein" className="text-sm text-muted hover:text-cream">← Zurück</Link>} />
      {c.topics.length ? <div className="mb-4 flex flex-wrap gap-1.5">{c.topics.map((t) => <Badge key={t} tone="gold">{t}</Badge>)}</div> : null}
      {c.summary ? <Card title="Zusammenfassung" className="mb-4"><p className="text-sm leading-relaxed">{c.summary}</p></Card> : null}
      <Card title="Verlauf">
        {c.transcript.length === 0 ? <p className="text-sm text-muted">Kein Transkript gespeichert.</p> : (
          <ol className="flex flex-col gap-2">
            {c.transcript.map((t, i) => (
              <li key={i} className={`max-w-3xl rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${t.role === 'assistant' ? 'self-start border border-gold/20 bg-gold/5' : 'self-end bg-ink-3'}`}>{t.text}</li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
