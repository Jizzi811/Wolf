import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteSectionAction, saveSectionAction, seedSectionsAction, toggleSectionAction } from '@/lib/admin/actions';
import { getSection, listSections } from '@/lib/admin/knowledge';
import { getBridgeCache } from '@/lib/bridge/sync';
import { bridgeSections } from '@/lib/bridge/knowledge-from-bridge';
import { ActionForm, ConfirmButton } from '../action-form';
import { Badge, Card, Field, Input, LinkButton, Notice, PageHeader, Textarea, Toggle, fmtDate } from '../ui';

const SOURCE_LABEL: Record<string, string> = { seed: 'Startwissen', manual: 'manuell', bridge: 'Plattform', document: 'Datei', ai: 'KI-Vorschlag' };

export async function WissenModule({ base }: { base: string }) {
  const [sections, bridge, cache] = await Promise.all([listSections(), bridgeSections().catch(() => ({ sections: [], fetchedAt: null })), getBridgeCache().catch(() => ({}))]);
  const replaced = new Set(bridge.sections.flatMap((b) => b.replaces ?? []));
  const health = (cache as Record<string, { status?: string }>).health;
  return (
    <>
      <PageHeader
        title="Wissen"
        description="Alles, was der Agent über KickstarterCash.club sagen darf. Unbestätigte Abschnitte werden dem Agenten als „nicht als Fakt verwenden“ markiert. Deaktivierte Abschnitte sieht er gar nicht."
        actions={
          <>
            {sections.length === 0 ? <ConfirmButton action={seedSectionsAction} label="Startwissen übernehmen" /> : null}
            <LinkButton href={`${base}/wissen/neu`} variant="primary">Neuer Abschnitt</LinkButton>
          </>
        }
      />
      {bridge.sections.length ? (
        <div className="mb-4">
          <Notice tone="ok">
            Die Plattform-Brücke liefert aktuell {bridge.sections.length} Bereiche (Stand {bridge.fetchedAt ?? '–'}). Diese ersetzen die gleichnamigen manuellen Abschnitte automatisch: {[...replaced].join(', ') || '–'}.
          </Notice>
        </div>
      ) : (
        <div className="mb-4">
          <Notice tone="info">
            Plattform-Brücke: {health?.status ?? 'noch nicht eingerichtet'}. Bis sie läuft, gelten die hier gepflegten Abschnitte. Preise und Termine bitte bei Änderungen von Hand aktualisieren.
          </Notice>
        </div>
      )}
      {bridge.sections.length ? (
        <Card title="Automatisch aus der Plattform" description="Nur lesbar – Quelle ist die Plattform-Datenbank." className="mb-4">
          <ul className="flex flex-col gap-3">
            {bridge.sections.map((b) => (
              <li key={b.slug} className="rounded-xl border border-gold/10 bg-ink/40 p-3">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold text-cream">{b.title}</span><Badge tone="blue">Plattform</Badge>{b.verified ? <Badge tone="green">bestätigt</Badge> : null}</div>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">{b.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <div className="flex flex-col gap-3">
        {sections.length === 0 ? <Card><p className="text-sm text-muted">Noch keine Abschnitte. Übernimm das Startwissen oder lege einen Abschnitt an.</p></Card> : null}
        {sections.map((s) => {
          const overridden = replaced.has(s.slug);
          return (
            <Card key={s.id} className={overridden || !s.enabled ? 'opacity-70' : ''}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`${base}/wissen/${s.id}`} className="text-base font-semibold text-cream hover:text-gold-light">{s.title}</Link>
                    <Badge tone={s.verified ? 'green' : 'red'}>{s.verified ? 'bestätigt' : 'unbestätigt'}</Badge>
                    <Badge tone={s.enabled ? 'gold' : 'neutral'}>{s.enabled ? 'aktiv' : 'aus'}</Badge>
                    <Badge>{SOURCE_LABEL[s.source] ?? s.source}</Badge>
                    {overridden ? <Badge tone="blue">überholt durch Plattform</Badge> : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{s.content || '(leer)'}</p>
                  <p className="mt-1.5 text-xs text-muted/70">{s.slug} · geändert {fmtDate(s.updatedAt)} · Reihenfolge {s.sortOrder}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                  <ConfirmButton action={toggleSectionAction} label={s.verified ? 'Bestätigung aufheben' : 'Bestätigen'} hidden={{ id: s.id, field: 'verified', value: !s.verified }} />
                  <ConfirmButton action={toggleSectionAction} label={s.enabled ? 'Deaktivieren' : 'Aktivieren'} hidden={{ id: s.id, field: 'enabled', value: !s.enabled }} />
                  <LinkButton href={`${base}/wissen/${s.id}`}>Bearbeiten</LinkButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export async function WissenEditModule({ base, id }: { base: string; id: number | 'neu' }) {
  const s = id === 'neu' ? null : await getSection(id);
  if (id !== 'neu' && !s) notFound();
  return (
    <>
      <PageHeader
        title={s ? `Abschnitt: ${s.title}` : 'Neuer Wissensabschnitt'}
        description="Schreibe so, wie der Agent es sagen soll: ganze Sätze, Zahlen ausgeschrieben oder als Zahl, keine Listen, keine Markdown-Zeichen."
        actions={
          <>
            <Link href={`${base}/wissen`} className="text-sm text-muted hover:text-cream">← Zur Übersicht</Link>
            {s ? <ConfirmButton action={deleteSectionAction} label="Löschen" variant="danger" confirm="Diesen Abschnitt endgültig löschen?" hidden={{ id: s.id, base }} /> : null}
          </>
        }
      />
      <Card>
        <ActionForm action={saveSectionAction} hidden={s ? { id: s.id } : {}} submitLabel={s ? 'Speichern' : 'Anlegen'}>
          <Field label="Titel"><Input name="title" defaultValue={s?.title ?? ''} required maxLength={200} /></Field>
          {!s ? <Field label="Kennung (optional)" hint="Kleinbuchstaben und Bindestriche; wird sonst aus dem Titel gebildet."><Input name="slug" placeholder="z-b-preise-pakete" /></Field> : null}
          <Field label="Inhalt"><Textarea name="content" defaultValue={s?.content ?? ''} className="min-h-72 font-mono text-[0.85rem]" /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle name="verified" label="Bestätigt" hint="Der Agent darf diese Angaben als Fakt nennen." defaultChecked={s?.verified ?? false} />
            <Toggle name="enabled" label="Aktiv" hint="Deaktivierte Abschnitte kennt der Agent nicht." defaultChecked={s?.enabled ?? true} />
            <Field label="Reihenfolge" hint="Kleinere Zahl = weiter oben im Prompt."><Input name="sortOrder" type="number" defaultValue={s?.sortOrder ?? 100} /></Field>
          </div>
          {s ? <p className="text-xs text-muted">Quelle: {SOURCE_LABEL[s.source] ?? s.source}{s.documentId ? <> · aus <Link className="text-gold-light hover:underline" href={`${base}/dateien/${s.documentId}`}>Datei {s.documentId}</Link></> : null} · zuletzt geändert {fmtDate(s.updatedAt)}</p> : null}
        </ActionForm>
      </Card>
    </>
  );
}
