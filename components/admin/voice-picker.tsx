'use client';

import * as React from 'react';
import type { ElevenVoice } from '@/lib/admin/elevenlabs';
import { Field, Input, Select } from './ui';

/** Auswahl einer ElevenLabs-Stimme mit Hörprobe; schreibt voiceId und voiceName. */
export function VoicePicker({ voices, defaultVoiceId, defaultVoiceName }: { voices: ElevenVoice[]; defaultVoiceId: string; defaultVoiceName: string }) {
  const [voiceId, setVoiceId] = React.useState(defaultVoiceId);
  const [voiceName, setVoiceName] = React.useState(defaultVoiceName);
  const selected = voices.find((v) => v.voiceId === voiceId);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {voices.length ? (
        <Field label="Stimme aus deinem ElevenLabs-Konto">
          <Select
            value={voices.some((v) => v.voiceId === voiceId) ? voiceId : ''}
            onChange={(e) => {
              const v = voices.find((x) => x.voiceId === e.target.value);
              if (v) {
                setVoiceId(v.voiceId);
                setVoiceName(`${v.name} (${v.category})`);
              }
            }}
          >
            <option value="">– eigene Voice-ID unten –</option>
            {voices.map((v) => (
              <option key={v.voiceId} value={v.voiceId}>
                {v.name} · {v.category}{v.labels?.gender ? ` · ${v.labels.gender}` : ''}{v.labels?.accent ? ` · ${v.labels.accent}` : ''}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      {selected?.previewUrl ? (
        <div className="flex items-center gap-3 text-sm">
          <audio ref={audioRef} src={selected.previewUrl} controls preload="none" className="h-9 max-w-xs" />
          <span className="text-xs text-muted">Hörprobe von ElevenLabs</span>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Voice-ID" hint="ElevenLabs-Voice-ID (auch für geklonte Stimmen).">
          <Input name="voiceId" value={voiceId} onChange={(e) => setVoiceId(e.target.value.trim())} required />
        </Field>
        <Field label="Bezeichnung" hint="Nur zur Anzeige.">
          <Input name="voiceName" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
