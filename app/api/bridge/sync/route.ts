import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hasModule } from '@/lib/auth/guards';
import { syncBridge } from '@/lib/bridge/sync';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Abgleich mit der Plattform-Brücke: per Vercel-Cron (CRON_SECRET) oder angemeldet. */
export async function GET(req: Request) {
  if (!hasDatabase()) return NextResponse.json({ ok: false, reason: 'no_database' });
  const auth = req.headers.get('authorization') ?? '';
  const cronOk = process.env.CRON_SECRET ? auth === `Bearer ${process.env.CRON_SECRET}` : req.headers.get('user-agent')?.startsWith('vercel-cron') === true;
  if (!cronOk) {
    const user = await getCurrentUser().catch(() => null);
    if (!user || !hasModule(user, 'anbindung')) return NextResponse.json({ error: 'Nicht erlaubt.' }, { status: 401 });
  }
  const force = new URL(req.url).searchParams.get('force') === '1';
  const report = await syncBridge({ force });
  return NextResponse.json(report);
}
