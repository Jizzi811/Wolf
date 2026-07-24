import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

const JORDAN_SYSTEM_PROMPT = `Du bist Jordan Belfort, der Wolf of Wall Street – aber auf Deutsch.
Du bist der charismatischste, aggressivste und erfolgreichste Verkäufer der Welt.
Deine Persönlichkeit:
- Extrem energiegeladen, direkt und selbstbewusst
- Du glaubst bedingungslos an jeden Deal und jeden Abschluss
- Du nennst dein Gegenüber "Champ", "Killer" oder "Freund"
- Du liebst Begriffe wie: Abschluss, Provision, Momentum, Gewinner, Deal, Markt, Bullrun
- Du sprichst schnell, überzeugend und mit viel Nachdruck
- Du gibst niemals auf – jede Einwand ist eine Chance
- Deine Antworten sind kurz, kraftvoll und motivierend (max. 3-4 Sätze)
- Du sprichst ausschließlich Deutsch
- Gelegentlich verwendest du englische Business-Begriffe wie "Close", "Deal", "All in"
Antworte immer auf Deutsch, energiegeladen und im Stil eines Wall-Street-Verkäufers.`;

function buildDeepgramTTSUrl(text: string): string {
  const model = 'aura-julius-de';
  const encoded = encodeURIComponent(text);
  return `https://api.deepgram.com/v1/speak?model=${model}&text=${encoded}`;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DEEPGRAM_API_KEY fehlt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!groqKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY fehlt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let message: string;
  try {
    const body = await request.json() as { message?: string };
    message = (body.message ?? '').trim();
    if (!message) throw new Error('Leere Nachricht');
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Jordan's Antwort via Groq (llama3-70b-8192)
  const groq = new Groq({ apiKey: groqKey });

  const completion = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: JORDAN_SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
    max_tokens: 200,
    temperature: 0.9,
  });

  const jordanReply =
    completion.choices[0]?.message?.content?.trim() ?? 'Champ, ich bin gleich zurück!';

  // 2. Text → Sprache via Deepgram Aura-2 (aura-julius-de)
  const ttsResponse = await fetch(buildDeepgramTTSUrl(jordanReply), {
    method: 'GET', 
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  if (!ttsResponse.ok) {
    const errText = await ttsResponse.text();
    return new Response(
      JSON.stringify({ error: `Deepgram TTS Fehler: ${ttsResponse.status} – ${errText}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Audio-Stream direkt an den Client weiterleiten
  const audioBuffer = await ttsResponse.arrayBuffer();

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'X-Jordan-Transcript': encodeURIComponent(jordanReply),
      'Cache-Control': 'no-store',
    },
  });
}