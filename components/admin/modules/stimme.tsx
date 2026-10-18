import { saveSettingsAction } from '@/lib/admin/actions';
import { elevenLabsConfigured, listElevenLabsVoices, type ElevenVoice } from '@/lib/admin/elevenlabs';
import { getSettings } from '@/lib/admin/settings';
import { ActionForm } from '../action-form';
import { VoicePicker } from '../voice-picker';
import { Card, Field, Input, Notice, PageHeader, Select, Toggle } from '../ui';
import { ResetButton } from './persona';

export async function StimmeModule({ isAdmin }: { isAdmin: boolean }) {
  const s = await getSettings();
  let voices: ElevenVoice[] = [];
  let voiceError: string | null = null;
  if (elevenLabsConfigured()) {
    try {
      voices = await listElevenLabsVoices();
    } catch (e) {
      voiceError = (e as Error).message;
    }
  }
  return (
    <>
      <PageHeader title="Stimme & Modell" description="Stimme (ElevenLabs), Sprechgeschwindigkeit, Sprachmodell und Transkription. Eigene Stimme: in ElevenLabs klonen (Voice Lab → Instant Voice Clone), dann hier die Voice-ID eintragen. Der ElevenLabs-Schlüssel muss zusätzlich im Vapi-Dashboard unter Provider Keys hinterlegt sein, damit Vapi eigene Stimmen abspielen darf." actions={isAdmin ? <><ResetButton keyName="voice" /><ResetButton keyName="model" /></> : undefined} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Stimme">
          <ActionForm action={saveSettingsAction} hidden={{ _key: 'voice' }}>
            {voiceError ? <Notice tone="error">{voiceError}</Notice> : null}
            {!elevenLabsConfigured() ? <Notice tone="info">Mit ELEVENLABS_API_KEY in Vercel erscheint hier die Liste aller Stimmen deines Kontos inklusive Hörprobe. Ohne Schlüssel die Voice-ID von Hand eintragen.</Notice> : null}
            <VoicePicker voices={voices} defaultVoiceId={s.voice.voiceId} defaultVoiceName={s.voice.voiceName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ElevenLabs-Modell">
                <Select name="model" defaultValue={s.voice.model}>
                  <option value="eleven_turbo_v2_5">eleven_turbo_v2_5 (schnell, Deutsch gut)</option>
                  <option value="eleven_flash_v2_5">eleven_flash_v2_5 (am schnellsten)</option>
                  <option value="eleven_multilingual_v2">eleven_multilingual_v2 (beste Qualität, langsamer)</option>
                </Select>
              </Field>
              <Field label="Geschwindigkeit" hint="0,7 bis 1,2"><Input name="speed" type="number" step="0.05" min="0.7" max="1.2" defaultValue={s.voice.speed} /></Field>
              <Field label="Stabilität" hint="0 = lebendig, 1 = gleichmäßig"><Input name="stability" type="number" step="0.05" min="0" max="1" defaultValue={s.voice.stability} /></Field>
              <Field label="Ähnlichkeit" hint="Nähe zur Originalstimme"><Input name="similarityBoost" type="number" step="0.05" min="0" max="1" defaultValue={s.voice.similarityBoost} /></Field>
              <Field label="Ausdruck (Style)" hint="0 bis 1"><Input name="style" type="number" step="0.05" min="0" max="1" defaultValue={s.voice.style} /></Field>
            </div>
            <Toggle name="useSpeakerBoost" label="Speaker Boost" hint="Klarere Stimme, minimal mehr Latenz." defaultChecked={s.voice.useSpeakerBoost} />
          </ActionForm>
        </Card>
        <Card title="Sprachmodell & Transkription">
          <ActionForm action={saveSettingsAction} hidden={{ _key: 'model' }}>
            <Field label="OpenAI-Modell" hint="z. B. gpt-4o-mini (günstig, schnell) oder gpt-4o (klüger, teurer). Der Schlüssel liegt im Vapi-Dashboard.">
              <Input name="model" defaultValue={s.model.model} />
            </Field>
            <Field label="Temperatur" hint="0 = sachlich, 1 = kreativ"><Input name="temperature" type="number" step="0.1" min="0" max="1.5" defaultValue={s.model.temperature} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Transkription (Deepgram)">
                <Select name="transcriberModel" defaultValue={s.model.transcriberModel}>
                  <option value="nova-2">nova-2</option>
                  <option value="nova-3">nova-3</option>
                </Select>
              </Field>
              <Field label="Erkannte Sprache">
                <Select name="transcriberLanguage" defaultValue={s.model.transcriberLanguage}>
                  <option value="de">Deutsch</option>
                  <option value="multi">Mehrsprachig (automatisch)</option>
                </Select>
              </Field>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
