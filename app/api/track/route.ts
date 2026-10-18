import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSettings } from '@/lib/admin/settings';
import { endConversation, recordEvent, startConversation } from '@/lib/admin/tracking';
import { getCurrentUser } from '@/lib/auth/session';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const Entry = z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000), at: z.number().optional() });

const Body = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('start'),
    conversationId: z.string().min(8).max(64),
    vapiCallId: z.string().max(100).optional(),
    visitorId: z.string().max(64).optional(),
    refUsername: z.string().max(64).optional(),
  }),
  z.object({
    type: z.literal('end'),
    conversationId: z.string().min(8).max(64),
    durationS: z.number().int().min(0).max(86400).optional(),
    transcript: z.array(Entry).max(500).optional(),
    endedReason: z.string().max(120).optional(),
  }),
  z.object({
    type: z.literal('event'),
    name: z.string().min(1).max(60),
    conversationId: z.string().max(64).optional(),
    visitorId: z.string().max(64).optional(),
    path: z.string().max(200).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  }),
]);

/** Nimmt Ereignisse aus dem Browser entgegen (Start, Ende, Seitenaufruf …). */
export async function POST(req: Request) {
  if (!hasDatabase()) return NextResponse.json({ ok: false, reason: 'no_database' });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  const b = parsed.data;
  const user = await getCurrentUser().catch(() => null);
  try {
    if (b.type === 'start') {
      await startConversation({
        conversationId: b.conversationId,
        vapiCallId: b.vapiCallId ?? null,
        visitorId: b.visitorId ?? null,
        userId: user?.id ?? null,
        refUsername: b.refUsername ?? null,
        userAgent: req.headers.get('user-agent'),
      });
    } else if (b.type === 'end') {
      const settings = await getSettings();
      await endConversation({
        conversationId: b.conversationId,
        durationS: b.durationS,
        transcript: b.transcript,
        endedReason: b.endedReason ?? null,
        storeTranscript: settings.features.storeTranscripts,
      });
      await recordEvent({ type: 'conversation_end', conversationId: b.conversationId, userId: user?.id ?? null, meta: { durationS: b.durationS ?? 0 } });
    } else {
      await recordEvent({
        type: b.name,
        conversationId: b.conversationId ?? null,
        visitorId: b.visitorId ?? null,
        userId: user?.id ?? null,
        path: b.path ?? null,
        meta: b.meta ?? {},
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('track', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
