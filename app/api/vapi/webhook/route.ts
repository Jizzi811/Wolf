import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/admin/settings';
import { applyEndOfCallReport, createLead, recordOpenQuestion } from '@/lib/admin/tracking';
import { summarizeConversation } from '@/lib/admin/documents';
import { pushConversationToPlatform, pushFeedbackToPlatform, pushLeadToPlatform } from '@/lib/bridge/outbound';
import { db, hasDatabase, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { TranscriptEntry } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface VapiToolCall {
  id: string;
  function?: { name?: string; arguments?: Record<string, unknown> | string };
}

interface VapiServerMessage {
  message?: {
    type?: string;
    call?: { id?: string; metadata?: Record<string, string>; assistantOverrides?: { metadata?: Record<string, string> } };
    assistant?: { metadata?: Record<string, string> };
    toolCallList?: VapiToolCall[];
    toolWithToolCallList?: { toolCall?: VapiToolCall }[];
    durationSeconds?: number;
    summary?: string;
    endedReason?: string;
    cost?: number;
    artifact?: { messages?: { role?: string; message?: string; content?: string; secondsFromStart?: number }[] };
    messages?: { role?: string; message?: string; content?: string; secondsFromStart?: number }[];
  };
}

function metadataOf(m: VapiServerMessage['message']): Record<string, string> {
  return m?.call?.metadata ?? m?.call?.assistantOverrides?.metadata ?? m?.assistant?.metadata ?? {};
}

function transcriptOf(m: VapiServerMessage['message']): TranscriptEntry[] {
  const raw = m?.artifact?.messages ?? m?.messages ?? [];
  const out: TranscriptEntry[] = [];
  for (const x of raw) {
    const role = x.role === 'user' ? 'user' : x.role === 'bot' || x.role === 'assistant' ? 'assistant' : null;
    const text = (x.message ?? x.content ?? '').toString().trim();
    if (!role || !text) continue;
    out.push({ role, text, at: typeof x.secondsFromStart === 'number' ? Math.round(x.secondsFromStart) : undefined });
  }
  return out;
}

/** Webhook von Vapi: Funktionsaufrufe (Lead, offene Frage) und Gesprächsende-Bericht. */
export async function POST(req: Request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-vapi-secret') !== secret) {
    return new NextResponse(null, { status: 401 });
  }
  if (!hasDatabase()) return NextResponse.json({ ok: true, reason: 'no_database' });

  const body = (await req.json().catch(() => null)) as VapiServerMessage | null;
  const m = body?.message;
  if (!m?.type) return NextResponse.json({ ok: false }, { status: 400 });

  const meta = metadataOf(m);
  const conversationId = meta.conversationId ?? null;
  const vapiCallId = m.call?.id ?? null;

  if (m.type === 'tool-calls') {
    const settings = await getSettings();
    const calls: VapiToolCall[] = m.toolCallList ?? (m.toolWithToolCallList ?? []).map((t) => t.toolCall).filter((t): t is VapiToolCall => Boolean(t));
    const results: { toolCallId: string; result: string }[] = [];
    for (const call of calls) {
      const name = call.function?.name ?? '';
      let args: Record<string, unknown> = {};
      const a = call.function?.arguments;
      if (typeof a === 'string') {
        try { args = JSON.parse(a) as Record<string, unknown>; } catch { args = {}; }
      } else if (a && typeof a === 'object') args = a;

      try {
        if (name === 'erfasse_lead') {
          if (!settings.features.leadCapture) {
            results.push({ toolCallId: call.id, result: 'Lead-Erfassung ist deaktiviert. Bitte auf die Website verweisen.' });
            continue;
          }
          const consent = args.consent === true || args.consent === 'true';
          const email = String(args.email ?? '').trim().toLowerCase();
          const firstName = String(args.vorname ?? '').trim();
          if (!consent) {
            results.push({ toolCallId: call.id, result: 'Nicht gespeichert: Es fehlt die ausdrückliche Zustimmung. Bitte den Einwilligungstext vorlesen und auf ein klares Ja warten.' });
            continue;
          }
          if (!firstName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            results.push({ toolCallId: call.id, result: 'Nicht gespeichert: Vorname oder E-Mail-Adresse fehlen oder sind ungültig. Bitte noch einmal erfragen.' });
            continue;
          }
          const lead = await createLead({
            conversationId,
            firstName,
            lastName: String(args.nachname ?? '').trim() || null,
            email,
            phone: String(args.telefon ?? '').trim() || null,
            interest: String(args.anliegen ?? '').trim() || null,
            sponsorUsername: meta.refUsername ?? null,
            consent: true,
            consentText: settings.privacy.consentText,
          });
          if (settings.features.leadsToPlatform) await pushLeadToPlatform(lead).catch(() => null);
          results.push({ toolCallId: call.id, result: 'Gespeichert. Sag kurz, dass sich das Team bzw. der Empfehler per E-Mail meldet.' });
        } else if (name === 'offene_frage') {
          const frage = String(args.frage ?? '').trim();
          if (frage) {
            await recordOpenQuestion(frage);
            if (settings.features.feedbackToPlatform) await pushFeedbackToPlatform(frage, 'de', conversationId).catch(() => null);
          }
          results.push({ toolCallId: call.id, result: 'Notiert. Sag ehrlich, dass du das nicht sicher weißt und das Team es nachträgt.' });
        } else {
          results.push({ toolCallId: call.id, result: 'Unbekannte Funktion.' });
        }
      } catch (e) {
        console.error('tool-call', name, e);
        results.push({ toolCallId: call.id, result: 'Technischer Fehler beim Speichern. Bitte auf die Website verweisen.' });
      }
    }
    return NextResponse.json({ results });
  }

  if (m.type === 'end-of-call-report') {
    const settings = await getSettings();
    const transcript = transcriptOf(m);
    await applyEndOfCallReport({
      conversationId,
      vapiCallId,
      durationS: typeof m.durationSeconds === 'number' ? Math.round(m.durationSeconds) : null,
      summary: m.summary ?? null,
      transcript,
      endedReason: m.endedReason ?? null,
      costUsd: typeof m.cost === 'number' ? m.cost : null,
      storeTranscript: settings.features.storeTranscripts,
    });
    if (conversationId) {
      const d = await db();
      const row = await d.query.conversations.findFirst({ where: eq(schema.conversations.conversationId, conversationId) });
      if (row) {
        if (!row.summary && transcript.length) {
          const s = await summarizeConversation(transcript).catch(() => null);
          if (s) await d.update(schema.conversations).set({ summary: s }).where(eq(schema.conversations.id, row.id));
        }
        if (settings.features.conversationsToPlatform) await pushConversationToPlatform(row).catch(() => null);
      }
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: m.type });
}
