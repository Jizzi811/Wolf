import Link from 'next/link';
import { getDashboardStats } from '@/lib/admin/stats';
import { getSettings } from '@/lib/admin/settings';
import { bridgeConfigured } from '@/lib/bridge/client';
import { getBridgeCache } from '@/lib/bridge/sync';
import { BarChart, Donut, HBars } from '../charts';
import { Badge, Card, Notice, PageHeader, StatCard, Table, Td, fmtDate, fmtDuration } from '../ui';

const OUTCOME_LABEL: Record<string, string> = { info: 'Information', lead: 'Lead', abbruch: 'Abbruch' };

export async function DashboardModule({ base, days = 30 }: { base: string; days?: number }) {
  const [stats, settings, bridge] = await Promise.all([getDashboardStats(days), getSettings(), getBridgeCache().catch(() => ({}))]);
  const health = (bridge as Record<string, { status: string; fetchedAt: Date | null }>).health;
  const envMissing: string[] = [];
  if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) envMissing.push('NEXT_PUBLIC_VAPI_PUBLIC_KEY');
  if (!process.env.BLOB_READ_WRITE_TOKEN) envMissing.push('BLOB_READ_WRITE_TOKEN (Datei-Uploads)');
  if (!process.env.OPENAI_API_KEY) envMissing.push('OPENAI_API_KEY (Transkription, KI-Vorschläge, Zusammenfassungen)');
  if (!bridgeConfigured()) envMissing.push('KCC_BRIDGE_URL / KCC_BRIDGE_SECRET (Plattform-Brücke)');

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Alle Zahlen zu ${settings.persona.name}: Gespräche, Dauer, Leads, Themen und Nutzung. Zeitraum: letzte ${days} Tage.`}
        actions={
          <div className="flex gap-1 rounded-full border border-gold/20 p-1 text-xs">
            {[7, 30, 90].map((d) => (
              <Link key={d} href={`${base}?tage=${d}`} className={`rounded-full px-3 py-1 ${d === days ? 'bg-gold/20 text-gold-light' : 'text-muted hover:text-cream'}`}>
                {d} Tage
              </Link>
            ))}
          </div>
        }
      />

      {envMissing.length ? (
        <div className="mb-6">
          <Notice tone="warn">
            Noch nicht eingerichtet: {envMissing.join(', ')}. Diese Werte werden in Vercel unter Settings → Environment Variables eingetragen. Siehe Einstellungen → System.
          </Notice>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={`Gespräche (${days} Tage)`} value={stats.conversations30d} sub={`${stats.conversationsTotal} gesamt · ${stats.conversations7d} in 7 Tagen`} tone="gold" />
        <StatCard label="Ø Gesprächsdauer" value={fmtDuration(stats.avgDurationS)} sub={`${stats.totalMinutes} Minuten gesamt`} />
        <StatCard label={`Leads (${days} Tage)`} value={stats.leads30d} sub={`${stats.leadsTotal} gesamt`} />
        <StatCard label="Offene Fragen" value={stats.openQuestions} sub="ohne Antwort in der Wissensbasis" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Wissensabschnitte" value={stats.sectionsTotal} sub={stats.sectionsUnverified ? `${stats.sectionsUnverified} unbestätigt` : 'alle bestätigt'} />
        <StatCard label="Dateien" value={stats.documentsTotal} />
        <StatCard label="Konten" value={stats.usersTotal} sub="Admin, Team und Mitglieder" />
        <StatCard label="Plattform-Brücke" value={health?.status === 'ok' ? 'verbunden' : health?.status ?? 'offen'} sub={health?.fetchedAt ? `Stand ${fmtDate(health.fetchedAt)}` : 'noch nicht abgeglichen'} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Gespräche pro Tag" className="lg:col-span-2">
          <BarChart data={stats.perDay.map((d) => ({ label: d.day.slice(5).split('-').reverse().join('.'), value: d.conversations }))} />
        </Card>
        <Card title="Ergebnis der Gespräche">
          <Donut data={stats.outcomes.map((o) => ({ label: OUTCOME_LABEL[o.outcome] ?? o.outcome, value: o.count }))} />
        </Card>
        <Card title="Gesprächsminuten pro Tag" className="lg:col-span-2">
          <BarChart data={stats.perDay.map((d) => ({ label: d.day.slice(5).split('-').reverse().join('.'), value: d.minutes }))} valueLabel=" min" />
        </Card>
        <Card title="Uhrzeit der Gespräche" description="Nach Berliner Zeit.">
          <BarChart data={stats.byHour.map((h) => ({ label: `${h.hour} Uhr`, value: h.count }))} />
        </Card>
        <Card title="Häufigste Themen">
          <HBars data={stats.topTopics.map((t) => ({ label: t.topic, value: t.count }))} />
        </Card>
        <Card title="Empfehler (Ref-Links)" description="Über welche Partner-Links Gespräche kamen.">
          <HBars data={stats.topRefs.map((t) => ({ label: t.ref, value: t.count }))} />
        </Card>
        <Card title="Schnellzugriff">
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link className="text-gold-light hover:underline" href={`${base}/wissen`}>Wissen prüfen und freigeben →</Link></li>
            <li><Link className="text-gold-light hover:underline" href={`${base}/dateien`}>Datei hochladen (PDF, Word, Audio, Video) →</Link></li>
            <li><Link className="text-gold-light hover:underline" href={`${base}/persona`}>Name, Bild und Begrüßung ändern →</Link></li>
            <li><Link className="text-gold-light hover:underline" href={`${base}/stimme`}>Stimme wechseln →</Link></li>
            <li><Link className="text-gold-light hover:underline" href={`${base}/fragen`}>Offene Fragen beantworten →</Link></li>
          </ul>
        </Card>
      </div>

      <Card title="Letzte Gespräche" className="mt-4">
        <Table head={['Zeit', 'Dauer', 'Nachrichten', 'Themen', 'Ergebnis', 'Empfehler', '']}>
          {stats.recent.map((c) => (
            <tr key={c.id}>
              <Td>{fmtDate(c.startedAt)}</Td>
              <Td>{fmtDuration(c.durationS)}</Td>
              <Td>{c.messagesCount}</Td>
              <Td>{c.topics.slice(0, 3).join(', ') || '–'}</Td>
              <Td><Badge tone={c.outcome === 'lead' ? 'green' : 'neutral'}>{OUTCOME_LABEL[c.outcome] ?? c.outcome}</Badge></Td>
              <Td>{c.refUsername ?? '–'}</Td>
              <Td><Link href={`${base}/gespraeche/${c.id}`} className="text-gold-light hover:underline">Öffnen</Link></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
