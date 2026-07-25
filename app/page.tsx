import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { CloserApp } from '@/components/app/closer-app';
import { getAppConfig } from '@/lib/utils';

/**
 * Voice-Engine-Auswahl (Sektion 12):
 *  - "deepgram" (Standard): Deepgram Voice Agent – kein LiveKit, kein Worker,
 *    läuft komplett in dieser App. Braucht nur DEEPGRAM_API_KEY (serverseitig).
 *  - "livekit": die ursprüngliche LiveKit-Variante (separates Agent-Backend).
 *
 * Umschaltbar über NEXT_PUBLIC_VOICE_ENGINE.
 */
const VOICE_ENGINE = process.env.NEXT_PUBLIC_VOICE_ENGINE === 'livekit' ? 'livekit' : 'deepgram';

export default async function Page() {
  if (VOICE_ENGINE === 'deepgram') {
    return <CloserApp />;
  }

  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  return <App appConfig={appConfig} />;
}
