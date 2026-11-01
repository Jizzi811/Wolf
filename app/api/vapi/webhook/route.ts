import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/admin/settings';
import { applyEndOfCallReport } from '@/lib/admin/tracking';
import { conversationToken } from '@/lib/admin/assistant';
import { runTool } from '@/lib/admin/tools';
import { summarizeConversation } from '@/lib/admin/documents';
import { pushConversationToPlatform } from '@/lib/bridge/outbound';
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
  if (!hasDatabase()) return NextResponse.json({ ok: true, reason: 'no_database' });

  const body = (await req.json().catch(() => null)) as VapiServerMessage | null;
  const m = body?.message;
  if (!m?.type) return NextResponse.json({ ok: false }, { status: 400 });

  const meta = metadataOf(m);
  const conversationId = meta.conversationId ?? null;

  // Echtheit: entweder das Dashboard-Geheimnis im Header (feste Assistenten) oder
  // das Token je Gespräch aus den Metadaten (transiente Assistenten aus /api/assistant).
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret) {
    const headerOk = req.headers.get('x-vapi-secret') === secret;
    const tokenOk = Boolean(conversationId && meta.token && conversationToken(conversationId) === meta.token);
    if (!headerOk && !tokenOk) return new NextResponse(null, { status: 401 });
  }
  const vapiCallId = m.call?.id ?? null;

  if (m.type === 'tool-calls') {
    const calls: VapiToolCall[] = m.toolCallList ?? (m.toolWithToolCallList ?? []).map((t) => t.toolCall).filter((t): t is VapiToolCall => Boolean(t));
    const results: { toolCallId: string; result: string }[] = [];
    for (const call of calls) {
      const name = call.function?.name ?? '';
      let args: Record<string, unknown> = {};
      const a = call.function?.arguments;
      if (typeof a === 'string') {
        try { args = JSON.parse(a) as Record<string, unknown>; } catch { args = {}; }
      } else if (a && typeof a === 'object') args = a;
      const result = await runTool(name, args, { conversationId, refUsername: meta.refUsername ?? null, language: meta.language ?? 'de' });
      results.push({ toolCallId: call.id, result });
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
