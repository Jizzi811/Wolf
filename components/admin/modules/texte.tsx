import { saveSettingsAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { ActionForm } from '../action-form';
import { Card, Field, Input, PageHeader, Textarea, Toggle } from '../ui';
import { ResetButton } from './persona';

export async function TexteModule({ isAdmin }: { isAdmin: boolean }) {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Texte & Design" description="Alle Texte der öffentlichen Seite und die Farben. Nichts ist fest im Code – was hier steht, sieht der Besucher." actions={isAdmin ? <><ResetButton keyName="texts" /><ResetButton keyName="design" /></> : undefined} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Texte der öffentlichen Seite">
          <ActionForm action={saveSettingsAction} hidden={{ _key: 'texts' }}>
            <Field label="Kleine Zeile über der Überschrift"><Input name="eyebrow" defaultValue={s.texts.eyebrow} /></Field>
            <Field label="Überschrift Zeile 1"><Input name="heroTitleLine1" defaultValue={s.texts.heroTitleLine1} /></Field>
            <Field label="Überschrift Zeile 2 (gold)"><Input name="heroTitleLine2" defaultValue={s.texts.heroTitleLine2} /></Field>
            <Field label="Beschreibung"><Textarea name="heroDescription" defaultValue={s.texts.heroDescription} /></Field>
            <Field label="Start-Knopf"><Input name="buttonStart" defaultValue={s.texts.buttonStart} /></Field>
            <Field label="Merkmale (eine Zeile je Punkt)"><Textarea name="features" defaultValue={s.texts.features.join('\n')} /></Field>
            <Field label="Status, wenn nicht verbunden"><Input name="statusDisconnected" defaultValue={s.texts.statusDisconnected} /></Field>
            <Field label="Datenschutzhinweis unter dem Knopf"><Textarea name="privacyNote" defaultValue={s.texts.privacyNote} /></Field>
            <Field label="Fußzeile"><Textarea name="footer" defaultValue={s.texts.footer} /></Field>
            <Field label="Seitentitel (Browser-Tab, Google)"><Input name="pageTitle" defaultValue={s.texts.pageTitle} /></Field>
            <Field label="Seitenbeschreibung (Google, Teilen)"><Textarea name="pageDescription" defaultValue={s.texts.pageDescription} /></Field>
          </ActionForm>
        </Card>
        <Card title="Farben & Darstellung">
          <ActionForm action={saveSettingsAction} hidden={{ _key: 'design' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Akzent (Gold)"><Input name="accent" type="color" defaultValue={s.design.accent} className="h-11 p-1" /></Field>
              <Field label="Akzent hell"><Input name="accentLight" type="color" defaultValue={s.design.accentLight} className="h-11 p-1" /></Field>
              <Field label="Akzent dunkel"><Input name="accentDark" type="color" defaultValue={s.design.accentDark} className="h-11 p-1" /></Field>
              <Field label="Hintergrund"><Input name="background" type="color" defaultValue={s.design.background} className="h-11 p-1" /></Field>
            </div>
            <Toggle name="showTranscript" label="Transkript-Knopf anzeigen" defaultChecked={s.design.showTranscript} />
            <Toggle name="supportsChatInput" label="Texteingabe zusätzlich zur Stimme" defaultChecked={s.design.supportsChatInput} />
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
