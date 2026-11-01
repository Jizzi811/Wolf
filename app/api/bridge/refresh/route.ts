import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/admin/settings';
import { bridgeConfigured } from '@/lib/bridge/client';
import { syncBridgeIfStale } from '@/lib/bridge/sync';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Leichter Anstoß aus dem Browser während langer Gespräche (alle 5 Minuten):
 * fragt die Plattform nach Änderungen (changes?since=…) und lädt nur geänderte
 * Bereiche nach. Läuft höchstens alle 5 Minuten, egal wie oft er aufgerufen wird.
 */
export async function POST() {
  if (!hasDatabase() || !bridgeConfigured()) return NextResponse.json({ ok: true, ran: false });
  const settings = await getSettings();
  if (!settings.features.bridgeAutoSync) return NextResponse.json({ ok: true, ran: false });
  const r = await syncBridgeIfStale(5 * 60 * 1000).catch(() => ({ ran: false }));
  return NextResponse.json({ ok: true, ran: r.ran }, { headers: { 'Cache-Control': 'no-store' } });
}
