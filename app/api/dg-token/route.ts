import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

/**
 * Token-Endpunkt für den Deepgram Voice Agent (Engine "deepgram").
 *
 * Der geheime `DEEPGRAM_API_KEY` bleibt serverseitig. Der Browser erhält nur
 * ein **kurzlebiges** Access-Token (Sektion 21). Zusätzlich liefert die Route
 * die NICHT geheime Agent-Konfiguration (Sprache, Modelle, Stimme, Begrüßung)
 * aus den Server-Environment-Variablen – so lässt sie sich ohne Rebuild ändern.
 *
 * LLM ("Gehirn"): standardmäßig von Deepgram verwaltetes OpenAI. Alternativ
 * `CLOSER_DG_THINK_PROVIDER=groq` → das LLM läuft über Groq. Der Groq-Key bleibt
 * dabei serverseitig im Proxy `/api/llm-proxy`; hier wird nur dessen URL
 * weitergegeben (Sektion 21).
 */
export const revalidate = 0;

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

/** Baut die öffentliche Basis-URL der App (für den serverseitig aufgerufenen Proxy). */
function baseUrl(req: Request): string {
  const override = env('CLOSER_APP_URL', '');
  if (override) return override.replace(/\/$/, '');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
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

    const useGroq = env('CLOSER_DG_THINK_PROVIDER', 'open_ai').toLowerCase() === 'groq';

    // Basis-Config (Deepgram-verwaltetes OpenAI).
    const config: Record<string, unknown> = {
      language: env('CLOSER_DG_LANGUAGE', 'de'),
      listenModel: env('CLOSER_DG_LISTEN_MODEL', 'nova-3'),
      thinkProvider: 'open_ai',
      thinkModel: env('CLOSER_DG_THINK_MODEL', 'gpt-4o-mini'),
      // Deutsche Stimme – exakte Deepgram-Modell-ID (z. B. Julius).
      speakModel: env('CLOSER_DG_VOICE', 'aura-2-julius-de'),
    };

    // Groq-Variante: OpenAI-kompatibles Format, aber über den Server-Proxy.
    if (useGroq) {
      config.thinkModel = env('CLOSER_DG_THINK_MODEL', 'llama-3.3-70b-versatile');
      config.thinkEndpointUrl = `${baseUrl(req)}/api/llm-proxy`;
      const proxySecret = env('GROQ_PROXY_SECRET', '');
      if (proxySecret) {
        config.thinkEndpointHeaders = { 'x-closer-proxy-key': proxySecret };
      }
    }

    return NextResponse.json(
      { token: result.access_token, config },
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
