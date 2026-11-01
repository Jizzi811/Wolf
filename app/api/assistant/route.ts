import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import { buildAssistantConfig } from '@/lib/admin/assistant';
import { getSettings } from '@/lib/admin/settings';
import { recordEvent, startConversation } from '@/lib/admin/tracking';
import { getCurrentUser } from '@/lib/auth/session';
import { bridgeConfigured, newConversationId } from '@/lib/bridge/client';
import { syncBridgeIfStale } from '@/lib/bridge/sync';
import { getLanguage } from '@/lib/closer/languages';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REF_RE = /^[a-zA-Z0-9._-]{2,64}$/;

const Body = z.object({
  lang: z.string().max(12).optional(),
  ref: z.string().max(64).optional(),
  v: z.string().max(64).optional(),
  history: z.string().max(4000).optional(),
});

/**
 * Liefert den fertigen Assistenten (Persona + Wissen + Stimme + Sprache) für den
 * Browser und legt das Gespräch in der Datenbank an. GET mit Query oder POST mit JSON.
 */
async function handle(req: Request, input: z.infer<typeof Body>) {
  const url = new URL(req.url);
  const refUsername = input.ref && REF_RE.test(input.ref) ? input.ref : null;
  const visitorId = (input.v ?? '').slice(0, 64) || null;
  const origin = req.headers.get('origin') || url.origin;
  const conversationId = newConversationId();
  const language = getLanguage(input.lang);

  let userId: number | null = null;
  if (hasDatabase()) {
    try {
      const settings = await getSettings();
      const user = await getCurrentUser().catch(() => null);
      userId = user?.id ?? null;
      if (!settings.features.publicAccess && !user) {
        return NextResponse.json({ error: 'login_required' }, { status: 401 });
      }
    } catch {
      /* ohne Datenbank: öffentlich */
    }
  }

  if (!language.voice) {
    return NextResponse.json({ error: 'text_only', lang: language.lang }, { status: 409 });
  }

  const assistant = await buildAssistantConfig({ conversationId, refUsername, origin, lang: language.lang, history: input.history ?? null });

  if (hasDatabase()) {
    after(async () => {
      try {
        await startConversation({ conversationId, visitorId, userId, refUsername, userAgent: req.headers.get('user-agent'), language: language.lang, channel: 'web' });
        await recordEvent({ type: 'conversation_start', conversationId, visitorId, userId, path: '/', meta: { lang: language.lang, mode: 'voice' } });
        // Speicher aktuell halten (Übergabe v6): bei jedem neuen Gespräch Änderungsabgleich
        // (changes?since=…), höchstens alle 60 Sekunden; nur geänderte Bereiche werden neu geladen.
        const settings = await getSettings();
        if (settings.features.bridgeAutoSync && bridgeConfigured()) await syncBridgeIfStale(60 * 1000);
      } catch (e) {
        console.error('assistant/after', e);
      }
    });
  }

  return NextResponse.json({ conversationId, lang: language.lang, assistant }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Body.safeParse({
    lang: url.searchParams.get('lang') ?? undefined,
    ref: url.searchParams.get('ref') ?? undefined,
    v: url.searchParams.get('v') ?? undefined,
  });
  return handle(req, parsed.success ? parsed.data : {});
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  return handle(req, parsed.success ? parsed.data : {});
}
