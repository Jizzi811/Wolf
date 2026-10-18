/**
 * Dateien: Text aus PDF, Word, Text/Markdown/CSV/JSON auslesen; Audio und
 * Video transkribieren (OpenAI Whisper, falls OPENAI_API_KEY gesetzt);
 * Wissensabschnitte per KI vorschlagen (OpenAI, falls Schlüssel gesetzt).
 */

import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { DocumentRow } from '@/lib/db/schema';

export const MAX_TRANSCRIBE_BYTES = 24 * 1024 * 1024; // Whisper-Grenze 25 MB

export async function listDocuments(): Promise<DocumentRow[]> {
  const d = await db();
  return d.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));
}

export async function getDocument(id: number): Promise<DocumentRow | undefined> {
  const d = await db();
  return d.query.documents.findFirst({ where: eq(schema.documents.id, id) });
}

export function kindOf(mime: string, filename: string): 'pdf' | 'docx' | 'text' | 'image' | 'audio' | 'video' | 'other' {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mime.includes('wordprocessingml') || ext === 'docx') return 'docx';
  if (mime.startsWith('text/') || ['txt', 'md', 'csv', 'json', 'html', 'htm'].includes(ext)) return 'text';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'webm'].includes(ext)) return 'audio';
  if (mime.startsWith('video/') || ['mp4', 'mov', 'mkv', 'avi'].includes(ext)) return 'video';
  return 'other';
}

/** Lädt die Datei vom Blob-Speicher und extrahiert Text. */
export async function processDocument(id: number): Promise<DocumentRow | undefined> {
  const d = await db();
  const doc = await getDocument(id);
  if (!doc) return undefined;
  await d.update(schema.documents).set({ status: 'processing', error: null }).where(eq(schema.documents.id, id));
  try {
    const kind = kindOf(doc.mime, doc.filename);
    let text = '';
    if (kind === 'image') {
      throw new Error('Bilder werden gespeichert, aber nicht ausgelesen. Bitte den Inhalt als Text ergänzen.');
    }
    if (kind === 'other') {
      throw new Error('Dateityp wird nicht automatisch ausgelesen. Unterstützt: PDF, Word (.docx), Text, Markdown, CSV, JSON, Audio, Video.');
    }
    const res = await fetch(doc.blobUrl);
    if (!res.ok) throw new Error(`Datei konnte nicht geladen werden (HTTP ${res.status}).`);
    const buf = Buffer.from(await res.arrayBuffer());

    if (kind === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      try {
        const out = await parser.getText();
        text = out.text ?? '';
      } finally {
        await parser.destroy().catch(() => null);
      }
    } else if (kind === 'docx') {
      const mammoth = await import('mammoth');
      const out = await mammoth.extractRawText({ buffer: buf });
      text = out.value ?? '';
    } else if (kind === 'text') {
      text = buf.toString('utf8');
      if (doc.filename.toLowerCase().match(/\.html?$/)) text = text.replace(/<[^>]+>/g, ' ');
    } else if (kind === 'audio' || kind === 'video') {
      text = await transcribeWithOpenAI(buf, doc.filename, doc.mime);
    }

    text = text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (!text) throw new Error('Es konnte kein Text gefunden werden (eventuell ein gescanntes PDF ohne Textebene).');

    await d
      .update(schema.documents)
      .set({ status: 'done', extractedText: text, charCount: text.length, processedAt: new Date(), error: null })
      .where(eq(schema.documents.id, id));
  } catch (e) {
    await d
      .update(schema.documents)
      .set({ status: 'error', error: e instanceof Error ? e.message : String(e), processedAt: new Date() })
      .where(eq(schema.documents.id, id));
  }
  return getDocument(id);
}

async function transcribeWithOpenAI(buf: Buffer, filename: string, mime: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Für Audio- und Video-Transkription fehlt OPENAI_API_KEY in Vercel.');
  if (buf.length > MAX_TRANSCRIBE_BYTES) {
    throw new Error('Die Datei ist größer als 24 MB. Bitte vorher die Tonspur als MP3 exportieren oder in Teile schneiden.');
  }
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buf)], { type: mime || 'application/octet-stream' }), filename);
  form.append('model', 'whisper-1');
  form.append('language', 'de');
  form.append('response_format', 'text');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Transkription fehlgeschlagen (HTTP ${res.status}).`);
  return res.text();
}

export function aiAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export interface SuggestedSection {
  title: string;
  content: string;
}

/**
 * Lässt die KI aus einem Dokumenttext sprechtaugliche Wissensabschnitte
 * vorschlagen. Nur Vorschläge – freigegeben wird im Admin.
 */
export async function suggestSections(text: string, filename: string): Promise<SuggestedSection[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY fehlt. Ohne Schlüssel können Abschnitte nur von Hand angelegt werden.');
  const trimmed = text.slice(0, 60000);
  const body = {
    model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Du bereitest Firmenwissen für einen deutschsprachigen Voice-Agenten auf. Antworte als JSON {"sections":[{"title":"…","content":"…"}]}. ' +
          'Jeder Abschnitt: ein Thema, 3 bis 12 Sätze Klartext ohne Listen, Zahlen aussprechbar, keine Markdown-Zeichen, keine erfundenen Fakten, ' +
          'nur was im Text steht. Preise, Fristen und Konditionen wörtlich übernehmen. Maximal 8 Abschnitte. Rechtliche oder riskante Aussagen ' +
          '(Rendite, Garantien) mit dem Hinweis versehen, dass das Team sie freigeben muss.',
      },
      { role: 'user', content: `Dateiname: ${filename}\n\nText:\n${trimmed}` },
    ],
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`KI-Vorschlag fehlgeschlagen (HTTP ${res.status}).`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? '{}';
  try {
    const parsed = JSON.parse(content) as { sections?: SuggestedSection[] };
    return (parsed.sections ?? []).filter((s) => s && s.title && s.content).slice(0, 8);
  } catch {
    return [];
  }
}

/** Kurze Zusammenfassung eines Gesprächs (optional, wenn Schlüssel vorhanden). */
export async function summarizeConversation(transcript: { role: string; text: string }[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || transcript.length === 0) return null;
  const text = transcript.map((t) => `${t.role === 'user' ? 'Nutzer' : 'Agent'}: ${t.text}`).join('\n').slice(0, 20000);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Fasse das Gespräch in maximal drei deutschen Sätzen zusammen: Anliegen, Ergebnis, offene Punkte. Keine Namen, keine E-Mail-Adressen, keine Telefonnummern.' },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? null;
}
