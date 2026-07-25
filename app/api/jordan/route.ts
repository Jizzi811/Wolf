import { type NextRequest, NextResponse } from 'next/server';

/**
 * Maps a voice display name or slug to a valid Deepgram TTS model slug.
 *
 * WICHTIG: Deutsche Deepgram-Stimmen gibt es nur in Aura-2 (Format
 * `aura-2-<name>-<sprache>`). Ein Slug wie `aura-julius-de` existiert NICHT und
 * führt zu einem TTS-Fehler (= keine Stimme).
 */
function resolveVoice(raw: string | undefined): string {
  const fallback = 'aura-2-julius-de';
  if (!raw) return fallback;
  const trimmed = raw.trim();
  // Bereits ein Deepgram-Slug (z. B. aus dem Playground)? Direkt verwenden.
  if (trimmed.toLowerCase().startsWith('aura-')) {
    return trimmed.toLowerCase();
  }
  const map: Record<string, string> = {
    'aura 2 - julius (german, masculine)': 'aura-2-julius-de',
    'aura-2-julius-de': 'aura-2-julius-de',
  };
  return map[trimmed.toLowerCase()] ?? fallback;
}

const JORDAN_SYSTEM_PROMPT = `Du bist Jordan Belfort, der Wolf of Wall Street – kompromisslos, charismatisch und aggressiv motivierend.
Du sprichst AUSSCHLIESSLICH auf Deutsch.
Dein Stil: direkt, schlagfertig, immer auf den Abschluss fokussiert.
Du nutzt Begriffe wie "Killer-Instinkt", "den Deal machen", "Abschluss", "Feuer im Bauch".
Antworte IMMER kurz – maximal 2-3 Sätze. Kein Zögern, keine Entschuldigungen.
Du inspirierst, motivierst und forderst heraus.`;

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { text: string; history?: HistoryEntry[] };
  const { text, history = [] } = body;

  const groqKey = process.env.GROQ_API_KEY;
  const dgKey = process.env.DEEPGRAM_API_KEY;

  if (!groqKey || !dgKey) {
    return NextResponse.json(
      { error: 'API-Keys fehlen. Bitte GROQ_API_KEY und DEEPGRAM_API_KEY setzen.' },
      { status: 500 }
    );
  }

  // 1. Jordan's Antwort via Groq (OpenAI-kompatibler Endpunkt)
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // llama3-70b-8192 wurde von Groq abgeschaltet -> aktuelles Modell nutzen.
      model: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: JORDAN_SYSTEM_PROMPT },
        ...history.slice(-10),
        { role: 'user', content: text },
      ],
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    return NextResponse.json({ error: `Groq-Fehler: ${errText}` }, { status: 502 });
  }

  const groqData = (await groqRes.json()) as GroqResponse;
  const agentText = groqData.choices[0]?.message?.content?.trim() ?? 'Mach den Deal!';

  // 2. Text → Sprache via Deepgram TTS
  const voice = resolveVoice(process.env.CLOSER_DG_VOICE);
  const dgRes = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${dgKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: agentText }),
  });

  if (!dgRes.ok) {
    const errText = await dgRes.text();
    return NextResponse.json({ error: `Deepgram-Fehler: ${errText}` }, { status: 502 });
  }

  const audioBuffer = await dgRes.arrayBuffer();

  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'X-Agent-Text': encodeURIComponent(agentText),
      'Cache-Control': 'no-store',
    },
  });
}
