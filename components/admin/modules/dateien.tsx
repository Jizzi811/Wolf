import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { createTextDocumentAction, deleteDocumentAction, processDocumentAction, saveDocumentTextAction } from '@/lib/admin/actions';
import { aiAvailable, getDocument, kindOf, listDocuments } from '@/lib/admin/documents';
import { db, schema } from '@/lib/db';
import { ActionForm, ConfirmButton } from '../action-form';
import { SuggestSections } from '../suggest';
import { DocumentUpload } from '../upload';
import { Badge, Card, Field, Input, LinkButton, Notice, PageHeader, Table, Td, Textarea, fmtBytes, fmtDate } from '../ui';

const STATUS_TONE: Record<string, 'neutral' | 'gold' | 'green' | 'red' | 'blue'> = { uploaded: 'neutral', processing: 'gold', done: 'green', error: 'red', manual: 'blue' };
const STATUS_LABEL: Record<string, string> = { uploaded: 'hochgeladen', processing: 'wird gelesen', done: 'Text vorhanden', error: 'Fehler', manual: 'manuell' };

export async function DateienModule({ base }: { base: string }) {
  const docs = await listDocuments();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const ai = aiAvailable();
  return (
    <>
      <PageHeader title="Dateien" description="Lade Unterlagen hoch – der Text wird ausgelesen (Audio und Video werden transkribiert). Danach lässt du dir Wissensabschnitte vorschlagen oder legst sie von Hand an. Videos selbst werden nicht dauerhaft gebraucht; nur der Text zählt." />
      {!ai ? <div className="mb-4"><Notice tone="warn">Ohne OPENAI_API_KEY in Vercel gibt es keine Transkription von Audio/Video und keine KI-Vorschläge. PDF, Word und Text funktionieren trotzdem.</Notice></div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Hochladen"><DocumentUpload blobReady={blobReady} /></Card>
        <Card title="Text einfügen" description="Für Texte aus E-Mails, Webseiten oder Notizen.">
          <ActionForm action={createTextDocumentAction} hidden={{ base }} submitLabel="Text speichern">
            <Field label="Titel"><Input name="title" placeholder="z. B. Webinar-Skript Oktober" /></Field>
            <Field label="Text"><Textarea name="text" required className="min-h-40" /></Field>
          </ActionForm>
        </Card>
      </div>
      <Card title="Alle Dateien" className="mt-4">
        <Table head={['Datei', 'Typ', 'Größe', 'Status', 'Zeichen', 'Hochgeladen', '']}>
          {docs.map((d) => (
            <tr key={d.id}>
              <Td><Link href={`${base}/dateien/${d.id}`} className="text-gold-light hover:underline">{d.filename}</Link></Td>
              <Td>{kindOf(d.mime, d.filename)}</Td>
              <Td>{fmtBytes(d.size)}</Td>
              <Td><Badge tone={STATUS_TONE[d.status] ?? 'neutral'}>{STATUS_LABEL[d.status] ?? d.status}</Badge></Td>
              <Td>{d.charCount.toLocaleString('de-DE')}</Td>
              <Td>{fmtDate(d.createdAt)}</Td>
              <Td><Link href={`${base}/dateien/${d.id}`} className="text-gold-light hover:underline">Öffnen</Link></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export async function DateiDetailModule({ base, id }: { base: string; id: number }) {
  const doc = await getDocument(id);
  if (!doc) notFound();
  const d = await db();
  const sections = await d.select({ id: schema.knowledgeSections.id, title: schema.knowledgeSections.title, verified: schema.knowledgeSections.verified }).from(schema.knowledgeSections).where(eq(schema.knowledgeSections.documentId, id));
  const kind = kindOf(doc.mime, doc.filename);
  return (
    <>
      <PageHeader
        title={doc.filename}
        description={`${kind} · ${fmtBytes(doc.size)} · ${fmtDate(doc.createdAt)} · Status ${STATUS_LABEL[doc.status] ?? doc.status}`}
        actions={
          <>
            <Link href={`${base}/dateien`} className="text-sm text-muted hover:text-cream">← Alle Dateien</Link>
            {doc.blobUrl ? <a href={doc.blobUrl} target="_blank" rel="noreferrer" className="text-sm text-gold-light hover:underline">Original öffnen</a> : null}
            {doc.blobUrl ? <ConfirmButton action={processDocumentAction} label="Erneut auslesen" hidden={{ id: doc.id }} /> : null}
            <ConfirmButton action={deleteDocumentAction} label="Löschen" variant="danger" confirm="Datei und Original löschen? Daraus erzeugte Wissensabschnitte bleiben erhalten." hidden={{ id: doc.id, base }} />
          </>
        }
      />
      {doc.error ? <div className="mb-4"><Notice tone="error">{doc.error}</Notice></div> : null}
      {kind === 'image' && doc.blobUrl ? (
        <Card className="mb-4" title="Bild">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={doc.blobUrl} alt={doc.filename} className="max-h-80 rounded-xl" />
          <p className="mt-2 text-xs text-muted">Bilder werden nicht automatisch ausgelesen. Beschreibe den Inhalt unten als Text, dann kann er ins Wissen übernommen werden.</p>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Ausgelesener Text" description="Kann hier korrigiert werden, bevor Abschnitte daraus entstehen.">
          <ActionForm action={saveDocumentTextAction} hidden={{ id: doc.id }} submitLabel="Text speichern">
            <Textarea name="text" defaultValue={doc.extractedText ?? ''} className="min-h-[28rem] font-mono text-[0.8rem]" />
          </ActionForm>
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Wissensabschnitte vorschlagen" description="Die KI zerlegt den Text in sprechtaugliche Abschnitte. Übernommene Abschnitte sind zunächst unbestätigt.">
            <SuggestSections documentId={doc.id} aiReady={aiAvailable() && Boolean(doc.extractedText)} />
          </Card>
          <Card title="Abschnitte aus dieser Datei">
            {sections.length === 0 ? <p className="text-sm text-muted">Noch keine.</p> : (
              <ul className="flex flex-col gap-2 text-sm">
                {sections.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <Badge tone={s.verified ? 'green' : 'red'}>{s.verified ? 'bestätigt' : 'unbestätigt'}</Badge>
                    <Link href={`${base}/wissen/${s.id}`} className="text-gold-light hover:underline">{s.title}</Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3"><LinkButton href={`${base}/wissen/neu?documentId=${doc.id}`}>Abschnitt von Hand anlegen</LinkButton></div>
          </Card>
        </div>
      </div>
    </>
  );
}
