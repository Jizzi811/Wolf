/** Stimmen aus dem ElevenLabs-Konto (nur, wenn ELEVENLABS_API_KEY gesetzt ist). */

export interface ElevenVoice {
  voiceId: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string | null;
  labels: Record<string, string>;
}

export function elevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export async function listElevenLabsVoices(): Promise<ElevenVoice[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key }, cache: 'no-store' });
  if (!res.ok) throw new Error(`ElevenLabs antwortet mit HTTP ${res.status}.`);
  const json = (await res.json()) as { voices?: Record<string, unknown>[] };
  return (json.voices ?? []).map((v) => ({
    voiceId: String(v.voice_id ?? ''),
    name: String(v.name ?? ''),
    category: String(v.category ?? ''),
    description: String(v.description ?? ''),
    previewUrl: typeof v.preview_url === 'string' ? v.preview_url : null,
    labels: (v.labels as Record<string, string>) ?? {},
  }));
}
