import { saveSettingsAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { bridgeConfigured } from '@/lib/bridge/client';
import { hasDatabase } from '@/lib/db';
import { ActionForm } from '../action-form';
import { Badge, Card, Field, PageHeader, Textarea, Toggle } from '../ui';
import { ResetButton } from './persona';

export async function EinstellungenModule() {
  const s = await getSettings();
  const env: { key: string; ok: boolean; note: string }[] = [
    { key: 'DATABASE_URL', ok: hasDatabase(), note: 'Neon-Postgres (Vercel Storage → Neon → Connect Project)' },
    { key: 'NEXT_PUBLIC_VAPI_PUBLIC_KEY', ok: Boolean(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY), note: 'Öffentlicher Vapi-Schlüssel für den Browser' },
    { key: 'VAPI_WEBHOOK_SECRET', ok: Boolean(process.env.VAPI_WEBHOOK_SECRET), note: 'Frei wählbares Geheimnis; schützt den Webhook (Gesprächsende, Leads)' },
    { key: 'NEXT_PUBLIC_SITE_URL', ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL), note: 'Öffentliche Adresse, z. B. https://closer-henna.vercel.app' },
    { key: 'BLOB_READ_WRITE_TOKEN', ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN), note: 'Vercel Blob für Datei- und Bild-Uploads (Storage → Blob → Connect Project)' },
    { key: 'OPENAI_API_KEY', ok: Boolean(process.env.OPENAI_API_KEY), note: 'Transkription (Whisper), KI-Vorschläge, Gesprächszusammenfassungen' },
    { key: 'ELEVENLABS_API_KEY', ok: Boolean(process.env.ELEVENLABS_API_KEY), note: 'Stimmenliste mit Hörproben im Admin' },
    { key: 'KCC_BRIDGE_URL + KCC_BRIDGE_SECRET', ok: bridgeConfigured(), note: 'Plattform-Brücke (Schlüssel aus Plattform-Admin → CLOSER-Anbindung)' },
    { key: 'CRON_SECRET', ok: Boolean(process.env.CRON_SECRET), note: 'Optional: schützt den täglichen Abgleich' },
    { key: 'AUTH_SECRET', ok: Boolean(process.env.AUTH_SECRET), note: 'Optional: fester Schlüssel für Login-Sitzungen (sonst automatisch in der Datenbank)' },
  ];
  return (
    <>
      <PageHeader title="Einstellungen" description="Schalter für Funktionen, Datenschutztexte und Systemstatus." actions={<><ResetButton keyName="features" /><ResetButton keyName="privacy" /></>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Funktionen">
          <ActionForm action={saveSettingsAction} hidden={{ _key: 'features' }}>
            <Toggle name="publicAccess" label="Öffentlicher Zugang" hint="Aus: Nur angemeldete Mitglieder können mit dem Agenten sprechen." defaultChecked={s.features.publicAccess} />
            <Toggle name="selfRegistration" label="Selbstregistrierung" hint="Besucher dürfen sich ein Mitgliedskonto anlegen (Seite /registrieren)." defaultChecked={s.features.selfRegistration} />
            <Toggle name="leadCapture" label="Lead-Erfassung im Gespräch" hint="Der Agent fragt bei Interesse nach Name und E-Mail und liest den Einwilligungstext vor." defaultChecked={s.features.leadCapture} />
            <Toggle name="storeTranscripts" label="Transkripte speichern" hint="Aus: nur Dauer, Themen und Zusammenfassung werden gespeichert." defaultChecked={s.features.storeTranscripts} />
            <Toggle name="leadsToPlatform" label="Leads an die Plattform senden" hint="Route lead der Brücke (CRM)." defaultChecked={s.features.leadsToPlatform} />
            <Toggle name="conversationsToPlatform" label="Gesprächsstatistik an die Plattform senden" hint="Route conversation (ohne Transkript)." defaultChecked={s.features.conversationsToPlatform} />
            <Toggle name="feedbackToPlatform" label="Offene Fragen an die Plattform senden" hint="Route feedback (Wissensdatenbank von Kash)." defaultChecked={s.features.feedbackToPlatform} />
            <Toggle name="bridgeAutoSync" label="Brücke automatisch abgleichen" hint="Täglich und bei Gesprächsstart, wenn älter als eine Stunde." defaultChecked={s.features.bridgeAutoSync} />
            <Toggle name="useSeedKnowledge" label="Startwissen aus dem Code als Rückfall" hint="Nur relevant, solange keine Abschnitte in der Datenbank liegen." defaultChecked={s.features.useSeedKnowledge} />
          </ActionForm>
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Datenschutz-Texte">
            <ActionForm action={saveSettingsAction} hidden={{ _key: 'privacy' }}>
              <Field label="KI-Offenlegung (einmal pro Gespräch gesprochen)"><Textarea name="aiDisclosure" defaultValue={s.privacy.aiDisclosure} /></Field>
              <Field label="Einwilligungstext für Leads" hint="Wird wörtlich vorgelesen und mit dem Lead gespeichert."><Textarea name="consentText" defaultValue={s.privacy.consentText} className="min-h-36" /></Field>
            </ActionForm>
          </Card>
          <Card title="System" description="Umgebungsvariablen in Vercel (Settings → Environment Variables). Werte werden hier nie angezeigt.">
            <ul className="flex flex-col gap-2 text-sm">
              {env.map((e) => (
                <li key={e.key} className="flex items-start gap-3">
                  <Badge tone={e.ok ? 'green' : 'red'} className="mt-0.5 w-16 justify-center">{e.ok ? 'gesetzt' : 'fehlt'}</Badge>
                  <span><code className="text-cream">{e.key}</code><br /><span className="text-xs text-muted">{e.note}</span></span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
