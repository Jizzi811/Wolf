/**
 * Synchronisation der Plattform-Brücke in den Zwischenspeicher (closer_bridge_cache).
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { bridgeConfigured, callBridge, type BridgeRoute } from './client';

export const READ_AREAS: BridgeRoute[] = ['catalog', 'webinars', 'channels', 'content', 'knowledge'];

export interface SyncReport {
  configured: boolean;
  health: { status: number; ok: boolean; routes?: Record<string, boolean>; error?: string };
  areas: Record<string, { status: 'ok' | 'disabled' | 'error' | 'unchanged'; message?: string }>;
  syncedAt: string;
}

export async function getBridgeCache(): Promise<Record<string, typeof schema.bridgeCache.$inferSelect>> {
  const d = await db();
  const rows = await d.select().from(schema.bridgeCache);
  return Object.fromEntries(rows.map((r) => [r.area, r]));
}

async function upsert(area: string, patch: Partial<typeof schema.bridgeCache.$inferInsert>) {
  const d = await db();
  await d
    .insert(schema.bridgeCache)
    .values({ area, ...patch })
    .onConflictDoUpdate({ target: schema.bridgeCache.area, set: patch });
}

/** Lädt alle Lese-Bereiche (oder nur geänderte) und speichert sie. */
export async function syncBridge(opts: { force?: boolean } = {}): Promise<SyncReport> {
  const report: SyncReport = { configured: bridgeConfigured(), health: { status: 0, ok: false }, areas: {}, syncedAt: new Date().toISOString() };
  if (!report.configured) {
    report.health.error = 'Brücke nicht konfiguriert (KCC_BRIDGE_URL / KCC_BRIDGE_SECRET fehlen).';
    await upsert('health', { status: 'nicht konfiguriert', error: report.health.error, fetchedAt: new Date() });
    return report;
  }

  const health = await callBridge<{ status: string; routes?: Record<string, boolean> }>('health');
  report.health = {
    status: health.status,
    ok: Boolean(health.body?.ok),
    routes: health.body?.data?.routes,
    error: health.body?.ok ? undefined : health.body?.error ?? `HTTP ${health.status}`,
  };
  await upsert('health', {
    status: health.body?.ok ? 'ok' : 'fehler',
    data: health.body?.data ?? null,
    error: report.health.error ?? null,
    fetchedAt: new Date(),
  });
  if (!health.body?.ok) return report;

  // Welche Bereiche haben sich geändert?
  let changed: Record<string, boolean> | null = null;
  if (!opts.force) {
    const cache = await getBridgeCache();
    const since = Object.values(cache)
      .filter((r) => r.area !== 'health' && r.fetchedAt)
      .map((r) => r.fetchedAt as Date)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    if (since) {
      const ch = await callBridge<{ areas: Record<string, { hash: string; changed: boolean }> }>('changes', {
        query: { since: toBerlinIso(since) },
      });
      if (ch.body?.ok && ch.body.data?.areas) {
        changed = {};
        for (const [area, v] of Object.entries(ch.body.data.areas)) {
          const cached = cache[area];
          changed[area] = v.changed || !cached?.hash || cached.hash !== v.hash;
        }
      }
    }
  }

  for (const area of READ_AREAS) {
    if (report.health.routes && report.health.routes[area] === false) {
      report.areas[area] = { status: 'disabled' };
      await upsert(area, { status: 'nicht freigeschaltet', error: null });
      continue;
    }
    if (changed && changed[area] === false) {
      report.areas[area] = { status: 'unchanged' };
      continue;
    }
    const res = await callBridge(area);
    if (res.body?.ok) {
      await upsert(area, { status: 'ok', data: res.body.data ?? null, hash: res.body.hash ?? null, error: null, fetchedAt: new Date() });
      report.areas[area] = { status: 'ok' };
    } else if (res.status === 403) {
      await upsert(area, { status: 'nicht freigeschaltet', error: null });
      report.areas[area] = { status: 'disabled' };
    } else {
      const msg = res.body?.error ?? `HTTP ${res.status}`;
      await upsert(area, { status: 'fehler', error: msg, fetchedAt: new Date() });
      report.areas[area] = { status: 'error', message: msg };
    }
  }
  return report;
}

/** Datum als ISO mit Berliner Offset (Brücke erwartet deutsche Zeit mit Offset). */
export function toBerlinIso(date: Date): string {
  const fmt = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZoneName: 'longOffset',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const off = (parts.timeZoneName || 'GMT+01:00').replace('GMT', '') || '+00:00';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${off}`;
}

/** Zugriff auf einen gespeicherten Bereich. */
export async function getCachedArea<T = unknown>(area: string): Promise<T | null> {
  const d = await db();
  const row = await d.query.bridgeCache.findFirst({ where: eq(schema.bridgeCache.area, area) });
  return (row?.data as T) ?? null;
}
