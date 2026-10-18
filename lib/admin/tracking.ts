/**
 * Gespräche, Ereignisse und Leads speichern (Statistik und Protokolle).
 */

import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { TranscriptEntry } from '@/lib/db/schema';

export async function recordEvent(e: {
  type: string;
  conversationId?: string | null;
  visitorId?: string | null;
  userId?: number | null;
  path?: string | null;
  meta?: Record<string, unknown>;
}) {
  const d = await db();
  await d.insert(schema.events).values({
    type: e.type,
    conversationId: e.conversationId ?? null,
    visitorId: e.visitorId ?? null,
    userId: e.userId ?? null,
    path: e.path ?? null,
    meta: e.meta ?? {},
  });
}

export async function startConversation(c: {
  conversationId: string;
  vapiCallId?: string | null;
  visitorId?: string | null;
  userId?: number | null;
  refUsername?: string | null;
  userAgent?: string | null;
  language?: string;
}) {
  const d = await db();
  await d
    .insert(schema.conversations)
    .values({
      conversationId: c.conversationId,
      vapiCallId: c.vapiCallId ?? null,
      visitorId: c.visitorId ?? null,
      userId: c.userId ?? null,
      refUsername: c.refUsername ?? null,
      userAgent: c.userAgent ?? null,
      language: c.language ?? 'de',
    })
    .onConflictDoUpdate({
      target: schema.conversations.conversationId,
      set: { vapiCallId: c.vapiCallId ?? undefined, userId: c.userId ?? undefined, refUsername: c.refUsername ?? undefined },
    });
}

export async function endConversation(c: {
  conversationId: string;
  durationS?: number;
  transcript?: TranscriptEntry[];
  endedReason?: string | null;
  storeTranscript: boolean;
}) {
  const d = await db();
  const existing = await d.query.conversations.findFirst({ where: eq(schema.conversations.conversationId, c.conversationId) });
  if (!existing) {
    await d.insert(schema.conversations).values({ conversationId: c.conversationId }).onConflictDoNothing();
  }
  const transcript = c.storeTranscript ? (c.transcript ?? []) : [];
  const started = existing?.startedAt ?? new Date();
  const ended = new Date();
  const duration = c.durationS ?? Math.max(0, Math.round((ended.getTime() - started.getTime()) / 1000));
  await d
    .update(schema.conversations)
    .set({
      endedAt: ended,
      durationS: duration,
      messagesCount: (c.transcript ?? []).length,
      transcript,
      endedReason: c.endedReason ?? null,
      topics: existing?.topics?.length ? existing.topics : extractTopics(c.transcript ?? []),
    })
    .where(eq(schema.conversations.conversationId, c.conversationId));
}

/** Ergänzt Daten aus dem Vapi-Gesprächsende-Bericht (Webhook). */
export async function applyEndOfCallReport(r: {
  conversationId?: string | null;
  vapiCallId?: string | null;
  durationS?: number | null;
  summary?: string | null;
  transcript?: TranscriptEntry[] | null;
  endedReason?: string | null;
  costUsd?: number | null;
  storeTranscript: boolean;
}) {
  const d = await db();
  let row = r.conversationId
    ? await d.query.conversations.findFirst({ where: eq(schema.conversations.conversationId, r.conversationId) })
    : undefined;
  if (!row && r.vapiCallId) {
    row = await d.query.conversations.findFirst({ where: eq(schema.conversations.vapiCallId, r.vapiCallId) });
  }
  if (!row) {
    const id = r.conversationId ?? `clsr-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(r.vapiCallId ?? 'x').replace(/[^a-z0-9]/gi, '').slice(-12) || 'unbekannt'}`;
    await d.insert(schema.conversations).values({ conversationId: id, vapiCallId: r.vapiCallId ?? null }).onConflictDoNothing();
    row = await d.query.conversations.findFirst({ where: eq(schema.conversations.conversationId, id) });
    if (!row) return;
  }
  const transcript = r.storeTranscript && r.transcript?.length ? r.transcript : row.transcript;
  await d
    .update(schema.conversations)
    .set({
      vapiCallId: r.vapiCallId ?? row.vapiCallId,
      endedAt: row.endedAt ?? new Date(),
      durationS: r.durationS ?? row.durationS,
      summary: r.summary ?? row.summary,
      transcript,
      messagesCount: transcript.length || row.messagesCount,
      endedReason: r.endedReason ?? row.endedReason,
      costUsd: r.costUsd != null ? String(r.costUsd) : row.costUsd,
      topics: row.topics.length ? row.topics : extractTopics(transcript),
    })
    .where(eq(schema.conversations.id, row.id));
}

const TOPIC_KEYWORDS: [RegExp, string][] = [
  [/black ?card|karte|mastercard|debit/i, 'Black Card'],
  [/paket|membership|mitgliedschaft|premium|deluxe/i, 'Pakete'],
  [/provision|vergütung|rang|affiliate|empfehl/i, 'Vergütungsplan'],
  [/webinar|zoom|präsentation/i, 'Webinare'],
  [/preis|kosten|gebühr|euro/i, 'Preise'],
  [/iban|konto|banking|sepa|swift/i, 'Banking'],
  [/krypto|exchange|dex|wex|bitcoin/i, 'Krypto & Exchange'],
  [/gold|earthforge|yukon/i, 'Goldmine'],
  [/auswander|plan b|relocation|dubai|zypern/i, 'Auswandern'],
  [/health|gesundheit|arvi/i, 'Health-Box'],
  [/auszahl|wallet/i, 'Auszahlungen'],
  [/motivation|ziel|disziplin|gewohnheit/i, 'Motivation'],
  [/kontakt|e-?mail|anruf|melden|angebot/i, 'Kontakt / Lead'],
];

export function extractTopics(transcript: TranscriptEntry[]): string[] {
  const text = transcript.map((t) => t.text).join(' ');
  const topics = new Set<string>();
  for (const [re, label] of TOPIC_KEYWORDS) if (re.test(text)) topics.add(label);
  return [...topics].slice(0, 8);
}

export async function listConversations(opts: { limit?: number; userId?: number } = {}) {
  const d = await db();
  const q = d.select().from(schema.conversations).orderBy(desc(schema.conversations.startedAt)).limit(opts.limit ?? 100);
  if (opts.userId != null) return q.where(eq(schema.conversations.userId, opts.userId));
  return q;
}

export async function getConversation(id: number) {
  const d = await db();
  return d.query.conversations.findFirst({ where: eq(schema.conversations.id, id) });
}

export async function createLead(l: {
  conversationId?: string | null;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  interest?: string | null;
  language?: string;
  sponsorUsername?: string | null;
  consent: boolean;
  consentText?: string | null;
}) {
  const d = await db();
  const [row] = await d
    .insert(schema.leads)
    .values({
      conversationId: l.conversationId ?? null,
      firstName: l.firstName,
      lastName: l.lastName ?? null,
      email: l.email.toLowerCase(),
      phone: l.phone ?? null,
      interest: l.interest ?? null,
      language: l.language ?? 'de',
      sponsorUsername: l.sponsorUsername ?? null,
      consent: l.consent,
      consentText: l.consentText ?? null,
    })
    .returning();
  if (l.conversationId) {
    await d
      .update(schema.conversations)
      .set({ leadId: row.id, outcome: 'lead' })
      .where(eq(schema.conversations.conversationId, l.conversationId));
  }
  return row;
}

export async function recordOpenQuestion(question: string, language = 'de') {
  const d = await db();
  const normalized = question.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!normalized) return;
  await d
    .insert(schema.openQuestions)
    .values({ question: question.slice(0, 1000), normalized, language })
    .onConflictDoUpdate({
      target: schema.openQuestions.normalized,
      set: { count: sql`${schema.openQuestions.count} + 1`, lastAskedAt: new Date() },
    });
}
