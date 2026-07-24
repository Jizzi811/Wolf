import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

/**
 * Token-Endpunkt für den Deepgram Voice Agent (Engine "deepgram").
 *
 * Der geheime `DEEPGRAM_API_KEY` bleibt serverseitig. Der Browser erhält nur
 * ein **kurzlebiges** Access-Token (Sektion 21). Zusätzlich liefert die Route
 * die NICHT geheime Agent-Konfiguration (Sprache, Modelle, Stimme, Begrüßung)
 * aus den Server-Environment-Variablen – so lässt sie sich ohne Rebuild ändern.
 */
export const revalidate = 0;

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export async function GET() {
  if (!DEEPGRAM_API_KEY) {
    // Klar als Konfigurationsproblem kennzeichnen (kein Stacktrace nach außen).
    return NextResponse.json(
      { error: 'config', message: 'DEEPGRAM_API_KEY is not set.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const deepgram = createClient(DEEPGRAM_API_KEY);
    // Kurzlebiges Token (max. 1 Stunde) für den Browser erzeugen.
    const { result, error } = await deepgram.auth.grantToken({ ttl_seconds: 3600 });

    if (error || !result?.access_token) {
      console.error('Deepgram grantToken failed:', error);
      return NextResponse.json(
        { error: 'connection', message: 'Could not create Deepgram token.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        token: result.access_token,
        // NICHT geheime Agent-Konfiguration (serverseitig steuerbar).
        config: {
          language: env('CLOSER_DG_LANGUAGE', 'de'),
          listenModel: env('CLOSER_DG_LISTEN_MODEL', 'nova-3'),
          // Deepgram-verwaltetes OpenAI-Modell (kein Key im Browser).
          thinkProvider: env('CLOSER_DG_THINK_PROVIDER', 'open_ai'),
          thinkModel: env('CLOSER_DG_THINK_MODEL', 'gpt-4o-mini'),
          // Deutsche Stimme – exakte Deepgram-Modell-ID (z. B. Julius).
          speakModel: env('CLOSER_DG_VOICE', 'aura-2-julius-de'),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('dg-token route error:', err);
    return NextResponse.json(
      { error: 'connection', message: 'Deepgram token error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
