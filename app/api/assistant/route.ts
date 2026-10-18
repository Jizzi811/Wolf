import { NextResponse, after } from 'next/server';
import { buildAssistantConfig } from '@/lib/admin/assistant';
import { getSettings } from '@/lib/admin/settings';
import { recordEvent, startConversation } from '@/lib/admin/tracking';
import { getCurrentUser } from '@/lib/auth/session';
import { bridgeConfigured, newConversationId } from '@/lib/bridge/client';
import { getBridgeCache, syncBridge } from '@/lib/bridge/sync';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REF_RE = /^[a-zA-Z0-9._-]{2,64}$/;

/**
 * Liefert den fertigen Assistenten (Persona + Wissen + Stimme) für den Browser.
 * Legt gleichzeitig das Gespräch in der Datenbank an.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const refRaw = url.searchParams.get('ref') ?? '';
  const refUsername = REF_RE.test(refRaw) ? refRaw : null;
  const visitorId = (url.searchParams.get('v') ?? '').slice(0, 64) || null;
  const origin = req.headers.get('origin') || url.origin;
  const conversationId = newConversationId();

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

  const assistant = await buildAssistantConfig({ conversationId, refUsername, origin });

  if (hasDatabase()) {
    after(async () => {
      try {
        await startConversation({ conversationId, visitorId, userId, refUsername, userAgent: req.headers.get('user-agent') });
        await recordEvent({ type: 'conversation_start', conversationId, visitorId, userId, path: '/' });
        // Brücke bei Bedarf im Hintergrund auffrischen (max. einmal pro Stunde).
        const settings = await getSettings();
        if (settings.features.bridgeAutoSync && bridgeConfigured()) {
          const cache = await getBridgeCache();
          const last = cache.health?.fetchedAt?.getTime() ?? 0;
          if (Date.now() - last > 60 * 60 * 1000) await syncBridge();
        }
      } catch (e) {
        console.error('assistant/after', e);
      }
    });
  }

  return NextResponse.json({ conversationId, assistant }, { headers: { 'Cache-Control': 'no-store' } });
}
