/**
 * Übersetzer-API (keyless) über MyMemory.
 *
 * Kostenlos, ohne Key (anonym ~5.000 Wörter/Tag). Übersetzt kurzen Text
 * zwischen zwei Sprachen. Antwort ist schlank und sprachausgabe-freundlich.
 *
 *   GET /api/translate?q=Hallo%20Welt&from=de&to=en
 */

import { LANGUAGE_CODES } from '@/lib/closer/languages';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const VALID = LANGUAGE_CODES;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const from = (searchParams.get('from') || 'de').trim().toLowerCase();
  const to = (searchParams.get('to') || 'en').trim().toLowerCase();

  if (!q) {
    return Response.json({ error: 'Bitte einen Text zum Übersetzen angeben.' }, { status: 400 });
  }
  if (q.length > 500) {
    return Response.json({ error: 'Bitte höchstens 500 Zeichen auf einmal übersetzen.' }, { status: 400 });
  }
  if (!VALID.has(from) || !VALID.has(to)) {
    return Response.json({ error: 'Diese Sprachkombination wird nicht unterstützt.' }, { status: 400 });
  }
  if (from === to) {
    return Response.json({ translatedText: q, from, to });
  }

  try {
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(q) +
      '&langpair=' +
      encodeURIComponent(`${from}|${to}`);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('translate failed');
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || typeof translated !== 'string') throw new Error('no translation');

    return Response.json({ translatedText: translated, from, to });
  } catch {
    return Response.json(
      { error: 'Die Übersetzung ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.' },
      { status: 502 }
    );
  }
}
