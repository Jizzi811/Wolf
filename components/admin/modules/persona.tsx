import { resetSettingsFormAction, saveSettingsAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { ActionForm, ConfirmButton } from '../action-form';
import { ImageUpload } from '../upload';
import { Card, Field, Input, PageHeader, Select, Textarea } from '../ui';

export async function PersonaModule({ isAdmin }: { isAdmin: boolean }) {
  const s = await getSettings();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return (
    <>
      <PageHeader title="Persona" description="Name, Bild, Begrüßung, Anrede und der komplette Charakter-Prompt. Änderungen gelten sofort für das nächste Gespräch." actions={isAdmin ? <ResetButton keyName="persona" /> : undefined} />
      <Card>
        <ActionForm action={saveSettingsAction} hidden={{ _key: 'persona' }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name des Agenten" hint="Wird überall eingesetzt, auch im Prompt (ersetzt „CLOSER“)."><Input name="name" defaultValue={s.persona.name} required maxLength={60} /></Field>
            <Field label="Untertitel unter dem Orb"><Input name="tagline" defaultValue={s.persona.tagline} maxLength={200} /></Field>
            <Field label="Anrede">
              <Select name="formOfAddress" defaultValue={s.persona.formOfAddress}>
                <option value="du">Du</option>
                <option value="Sie">Sie</option>
              </Select>
            </Field>
            <Field label="Sprache (Code)" hint="de, en, tr …"><Input name="language" defaultValue={s.persona.language} maxLength={10} /></Field>
          </div>
          <Field label="Bild (Orb)"><ImageUpload name="imageUrl" defaultValue={s.persona.imageUrl} blobReady={blobReady} /></Field>
          <Field label="Begrüßung (erster gesprochener Satz)"><Textarea name="greeting" defaultValue={s.persona.greeting} maxLength={1000} /></Field>
          <Field label="Charakter- und Regel-Prompt" hint="Das vollständige Verhalten. Die Wissensbasis, die Sprachregeln, KI-Offenlegung und Lead-Erfassung werden automatisch angehängt.">
            <Textarea name="systemPrompt" defaultValue={s.persona.systemPrompt} className="min-h-[32rem] font-mono text-[0.8rem]" />
          </Field>
        </ActionForm>
      </Card>
    </>
  );
}

export function ResetButton({ keyName }: { keyName: string }) {
  return <ConfirmButton action={resetSettingsFormAction} label="Auf Standard zurücksetzen" confirm="Diesen Bereich wirklich auf die Standardwerte zurücksetzen?" hidden={{ _key: keyName }} />;
}
