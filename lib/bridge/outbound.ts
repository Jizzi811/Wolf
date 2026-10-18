/**
 * Schreibende Brücken-Routen: Lead, Gesprächszusammenfassung, offene Frage.
 * Werden nur aufgerufen, wenn die jeweiligen Schalter im Admin aktiv sind.
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Conversation, Lead } from '@/lib/db/schema';
import { bridgeConfigured, callBridge } from './client';

export async function pushLeadToPlatform(lead: Lead): Promise<{ ok: boolean; message: string }> {
  const d = await db();
  if (!bridgeConfigured()) return { ok: false, message: 'Brücke nicht konfiguriert' };
  const res = await callBridge<{ lead_id?: number; sponsor_resolved?: boolean }>('lead', {
    method: 'POST',
    body: {
      first_name: lead.firstName,
      last_name: lead.lastName ?? '',
      email: lead.email,
      phone: lead.phone ?? '',
      interest: lead.interest ?? '',
      language: lead.language,
      sponsor_username: lead.sponsorUsername ?? '',
      consent: lead.consent,
      consent_text: lead.consentText ?? '',
      source: 'closer',
      conversation_id: lead.conversationId ?? '',
    },
  });
  const ok = Boolean(res.body?.ok);
  const message = ok ? 'übertragen' : `${res.body?.code ?? res.status}: ${res.body?.error ?? 'Fehler'}`;
  await d
    .update(schema.leads)
    .set({
      platformSyncStatus: ok ? 'übertragen' : 'fehler',
      platformSyncError: ok ? null : message,
      platformLeadId: res.body?.data?.lead_id ?? null,
    })
    .where(eq(schema.leads.id, lead.id));
  return { ok, message };
}

export async function pushConversationToPlatform(c: Conversation): Promise<{ ok: boolean; message: string }> {
  if (!bridgeConfigured()) return { ok: false, message: 'Brücke nicht konfiguriert' };
  const res = await callBridge('conversation', {
    method: 'POST',
    body: {
      conversation_id: c.conversationId,
      duration_s: c.durationS,
      language: c.language,
      topics: c.topics,
      outcome: c.outcome,
      started_at: c.startedAt.toISOString(),
      ended_at: (c.endedAt ?? new Date()).toISOString(),
      sponsor_username: c.refUsername ?? '',
    },
  });
  return { ok: Boolean(res.body?.ok), message: res.body?.ok ? 'übertragen' : `${res.body?.code ?? res.status}` };
}

export async function pushFeedbackToPlatform(question: string, language = 'de', conversationId?: string | null) {
  if (!bridgeConfigured()) return { ok: false, message: 'Brücke nicht konfiguriert' };
  const res = await callBridge('feedback', {
    method: 'POST',
    body: { question, language, conversation_id: conversationId ?? '', source: 'closer' },
  });
  return { ok: Boolean(res.body?.ok), message: res.body?.ok ? 'übertragen' : `${res.body?.code ?? res.status}` };
}
