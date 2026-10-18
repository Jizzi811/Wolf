import { syncBridgeAction } from '@/lib/admin/actions';
import { bridgeConfigured } from '@/lib/bridge/client';
import { getBridgeCache, READ_AREAS } from '@/lib/bridge/sync';
import { ConfirmButton } from '../action-form';
import { Badge, Card, Notice, PageHeader, Table, Td, fmtDate } from '../ui';

const AREA_LABEL: Record<string, string> = { health: 'Status', catalog: 'Katalog (Pakete, Karten, Ränge, Provisionen)', webinars: 'Webinare', channels: 'Support-Kanäle', content: 'Inhalte & Texte', knowledge: 'Wissensdatenbank (Kash)' };

export async function AnbindungModule() {
  const configured = bridgeConfigured();
  const cache = await getBridgeCache().catch(() => ({} as Awaited<ReturnType<typeof getBridgeCache>>));
  const health = cache.health;
  const healthData = (health?.data ?? null) as { version?: string; routes?: Record<string, boolean>; server_time?: string; knowledge_updated_at?: string } | null;
  return (
    <>
      <PageHeader
        title="Plattform-Anbindung"
        description="Signierte Brücke zu portal.kickstartercash.club (Paket P18). Daraus liest der Agent Preise, Pakete, Karten, Webinare, Kanäle und Texte automatisch; Leads gehen zurück ins CRM."
        actions={configured ? <><ConfirmButton action={syncBridgeAction} label="Jetzt abgleichen" hidden={{ force: false }} /><ConfirmButton action={syncBridgeAction} label="Alles neu laden" variant="primary" hidden={{ force: true }} /></> : undefined}
      />
      {!configured ? (
        <div className="mb-4">
          <Notice tone="warn">
            Noch nicht verbunden. Schritte: 1) Plattform-Admin → „CLOSER-Anbindung“ → „Schlüssel erzeugen“. 2) In Vercel (Projekt closer → Settings → Environment Variables) eintragen: <code>KCC_BRIDGE_URL</code> = https://portal.kickstartercash.club/api/closer/index.php und <code>KCC_BRIDGE_SECRET</code> = der erzeugte Schlüssel. 3) Neu deployen (Redeploy). 4) Hier „Alles neu laden“.
          </Notice>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Status">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Konfiguriert</dt><dd>{configured ? 'ja' : 'nein'}</dd>
            <dt className="text-muted">Adresse</dt><dd className="break-all text-xs">{process.env.KCC_BRIDGE_URL ?? '–'}</dd>
            <dt className="text-muted">Letzter Abgleich</dt><dd>{health?.fetchedAt ? fmtDate(health.fetchedAt) : '–'}</dd>
            <dt className="text-muted">Ergebnis</dt><dd><Badge tone={health?.status === 'ok' ? 'green' : health?.status ? 'red' : 'neutral'}>{health?.status ?? 'noch nie'}</Badge></dd>
            {health?.error ? <><dt className="text-muted">Fehler</dt><dd className="text-danger">{health.error}</dd></> : null}
            {healthData?.version ? <><dt className="text-muted">Version</dt><dd>{healthData.version}</dd></> : null}
            {healthData?.knowledge_updated_at ? <><dt className="text-muted">Wissen zuletzt</dt><dd>{healthData.knowledge_updated_at}</dd></> : null}
          </dl>
          <p className="mt-4 text-xs text-muted">Automatischer Abgleich: täglich per Vercel-Cron und zusätzlich bei Gesprächsstart, wenn der letzte Abgleich älter als eine Stunde ist.</p>
        </Card>
        <Card title="Bereiche" className="lg:col-span-2">
          <Table head={['Bereich', 'Status', 'Stand', 'Hash / Fehler']}>
            {READ_AREAS.map((a) => {
              const r = cache[a];
              return (
                <tr key={a}>
                  <Td>{AREA_LABEL[a] ?? a}</Td>
                  <Td><Badge tone={r?.status === 'ok' ? 'green' : r?.status === 'fehler' ? 'red' : 'neutral'}>{r?.status ?? 'leer'}</Badge></Td>
                  <Td>{r?.fetchedAt ? fmtDate(r.fetchedAt) : '–'}</Td>
                  <Td className="font-mono text-xs text-muted">{r?.error ?? (r?.hash ? r.hash.slice(0, 16) + '…' : '–')}</Td>
                </tr>
              );
            })}
          </Table>
          {healthData?.routes ? (
            <p className="mt-3 text-xs text-muted">Von der Plattform freigeschaltete Routen: {Object.entries(healthData.routes).filter(([, v]) => v).map(([k]) => k).join(', ') || 'keine'}.</p>
          ) : null}
        </Card>
      </div>
      {READ_AREAS.filter((a) => cache[a]?.status === 'ok').map((a) => (
        <Card key={a} title={`Rohdaten: ${AREA_LABEL[a] ?? a}`} className="mt-4">
          <pre className="max-h-80 overflow-auto rounded-xl bg-ink p-3 font-mono text-[0.72rem] leading-relaxed text-cream/80">{JSON.stringify(cache[a]?.data, null, 2)}</pre>
        </Card>
      ))}
    </>
  );
}
