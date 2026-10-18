import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { answerQuestionAction, resolveQuestionAction } from '@/lib/admin/actions';
import { db, schema } from '@/lib/db';
import { ActionForm, ConfirmButton } from '../action-form';
import { Badge, Card, Field, Input, PageHeader, Textarea, Toggle, fmtDate } from '../ui';

export async function FragenModule({ base }: { base: string }) {
  const d = await db();
  const rows = await d.select().from(schema.openQuestions).orderBy(desc(schema.openQuestions.lastAskedAt)).limit(200);
  const open = rows.filter((r) => r.status === 'offen');
  const rest = rows.filter((r) => r.status !== 'offen');
  return (
    <>
      <PageHeader title="Offene Fragen" description="Fragen, die der Agent nicht aus der Wissensbasis beantworten konnte. Antworte direkt hier – daraus entsteht ein neuer Wissensabschnitt." />
      <div className="flex flex-col gap-4">
        {open.length === 0 ? <Card><p className="text-sm text-muted">Keine offenen Fragen. Sehr gut.</p></Card> : null}
        {open.map((q) => (
          <Card key={q.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-cream">„{q.question}“</p>
                <p className="mt-1 text-xs text-muted">{q.count}× gefragt · zuletzt {fmtDate(q.lastAskedAt)}</p>
              </div>
              <div className="flex gap-2">
                <ConfirmButton action={resolveQuestionAction} label="Ignorieren" hidden={{ id: q.id, status: 'ignoriert' }} />
                <ConfirmButton action={resolveQuestionAction} label="Erledigt" hidden={{ id: q.id, status: 'erledigt' }} />
              </div>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gold-light">Antwort als Wissensabschnitt anlegen</summary>
              <div className="mt-3">
                <ActionForm action={answerQuestionAction} hidden={{ id: q.id }} submitLabel="Abschnitt anlegen">
                  <Field label="Titel des Abschnitts"><Input name="title" defaultValue={q.question.slice(0, 80)} required /></Field>
                  <Field label="Antwort (sprechtauglich, keine Listen)"><Textarea name="content" required /></Field>
                  <Toggle name="verified" label="Als bestätigt freigeben" hint="Nur wenn die Angaben sicher stimmen." />
                </ActionForm>
              </div>
            </details>
          </Card>
        ))}
        {rest.length ? (
          <Card title="Bearbeitet">
            <ul className="flex flex-col gap-2 text-sm">
              {rest.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center gap-2">
                  <Badge tone={q.status === 'beantwortet' ? 'green' : 'neutral'}>{q.status}</Badge>
                  <span className="text-cream/80">{q.question}</span>
                  {q.answerSectionId ? <Link href={`${base}/wissen/${q.answerSectionId}`} className="text-gold-light hover:underline">Abschnitt öffnen</Link> : null}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
