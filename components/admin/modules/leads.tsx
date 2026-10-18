import { desc } from 'drizzle-orm';
import { deleteLeadAction, pushLeadAction, updateLeadAction } from '@/lib/admin/actions';
import { bridgeConfigured } from '@/lib/bridge/client';
import { db, schema } from '@/lib/db';
import { ActionForm, ConfirmButton } from '../action-form';
import { Badge, Card, Field, Notice, PageHeader, Select, Textarea, fmtDate } from '../ui';

const STATUS = ['neu', 'kontaktiert', 'termin', 'gewonnen', 'verloren'];

export async function LeadsModule() {
  const d = await db();
  const rows = await d.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(300);
  const bridge = bridgeConfigured();
  return (
    <>
      <PageHeader title="Leads" description="Interessenten, die im Gespräch ausdrücklich eingewilligt haben. Mit aktiver Brücke werden sie an die Plattform (CRM) übertragen." />
      {!bridge ? <div className="mb-4"><Notice tone="info">Die Plattform-Brücke ist noch nicht eingerichtet. Leads bleiben hier gespeichert und können später übertragen werden.</Notice></div> : null}
      <div className="flex flex-col gap-4">
        {rows.length === 0 ? <Card><p className="text-sm text-muted">Noch keine Leads.</p></Card> : null}
        {rows.map((l) => (
          <Card key={l.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-cream">{l.firstName} {l.lastName ?? ''}</h3>
                  <Badge tone={l.status === 'gewonnen' ? 'green' : l.status === 'verloren' ? 'red' : 'gold'}>{l.status}</Badge>
                  <Badge tone={l.platformSyncStatus === 'übertragen' ? 'green' : l.platformSyncStatus === 'fehler' ? 'red' : 'neutral'}>Plattform: {l.platformSyncStatus}</Badge>
                </div>
                <p className="mt-1 text-sm text-cream/90">
                  <a href={`mailto:${l.email}`} className="text-gold-light hover:underline">{l.email}</a>
                  {l.phone ? <> · {l.phone}</> : null}
                  {l.sponsorUsername ? <> · Empfehler <span className="font-mono">{l.sponsorUsername}</span></> : null}
                </p>
                <p className="mt-2 text-sm text-muted">{l.interest ?? 'Kein Anliegen notiert.'}</p>
                <p className="mt-2 text-xs text-muted">{fmtDate(l.createdAt)} · Gespräch {l.conversationId ?? '–'} · Einwilligung {l.consent ? 'ja' : 'nein'}{l.platformSyncError ? ` · Fehler: ${l.platformSyncError}` : ''}</p>
              </div>
              <div className="flex flex-col gap-3 lg:w-80">
                <ActionForm action={updateLeadAction} hidden={{ id: l.id }} submitLabel="Speichern">
                  <Field label="Status">
                    <Select name="status" defaultValue={l.status}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Notizen">
                    <Textarea name="notes" defaultValue={l.notes ?? ''} className="min-h-20" />
                  </Field>
                </ActionForm>
                <div className="flex flex-wrap gap-2">
                  {bridge && l.platformSyncStatus !== 'übertragen' ? <ConfirmButton action={pushLeadAction} label="An Plattform senden" hidden={{ id: l.id }} /> : null}
                  <ConfirmButton action={deleteLeadAction} label="Löschen" variant="danger" confirm="Diesen Lead endgültig löschen?" hidden={{ id: l.id }} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
