import { NextResponse } from 'next/server';

/**
 * Sicherer LLM-Proxy für die Deepgram-Engine mit Groq als "Gehirn".
 *
 * Der Deepgram Voice Agent ruft diesen (öffentlich erreichbaren) Endpunkt
 * serverseitig auf und erwartet eine OpenAI-kompatible Chat-Completions-Antwort.
 * Dieser Proxy hängt den geheimen `GROQ_API_KEY` an und leitet an Groq weiter –
 * so verlässt der Schlüssel NIE den Server / den Browser (Sektion 21).
 *
 * Groq ist OpenAI-kompatibel: https://api.groq.com/openai/v1/chat/completions
 *
 * Optionaler Schutz: Ist `GROQ_PROXY_SECRET` gesetzt, muss der Aufruf den Header
 * `x-closer-proxy-key` mit demselben Wert mitbringen (setzt die Token-Route in
 * der Agent-Konfiguration). Das ist ein leichter Schutz – der eigentliche Wert
 * ist, dass der Groq-Key serverseitig bleibt.
 */
export const runtime = 'nodejs';
export const revalidate = 0;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL?.trim() || 'https://api.groq.com/openai/v1';
const PROXY_SECRET = process.env.GROQ_PROXY_SECRET?.trim();

export async function POST(req: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 503 });
  }
  if (PROXY_SECRET && req.headers.get('x-closer-proxy-key') !== PROXY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.text();
    const upstream = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body,
    });

    // Antwort (auch Streaming/SSE) unverändert durchreichen.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('llm-proxy error:', error);
    return NextResponse.json({ error: 'Upstream LLM request failed' }, { status: 502 });
  }
}
