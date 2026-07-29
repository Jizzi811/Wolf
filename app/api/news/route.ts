/**
 * News-API (keyless) über die öffentliche tagesschau-API.
 *
 * Liefert aktuelle deutsche Schlagzeilen, schlank aufbereitet.
 * Keine API-Keys nötig, kostenlos.
 *
 *   GET /api/news?limit=6
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 6, 1), 12);

  try {
    const res = await fetch('https://www.tagesschau.de/api2u/news/', { cache: 'no-store' });
    if (!res.ok) throw new Error('news fetch failed');
    const data = await res.json();

    const raw: unknown[] = Array.isArray(data?.news) ? data.news : [];

    const items: NewsItem[] = raw
      // nur echte Meldungen mit Titel
      .filter((n): n is Record<string, unknown> => !!n && typeof n === 'object' && 'title' in n)
      .map((n) => {
        const dateStr = typeof n.date === 'string' ? n.date : '';
        let date = '';
        if (dateStr) {
          const d = new Date(dateStr);
          if (!Number.isNaN(d.getTime())) {
            date = d.toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
        }
        return {
          title: String(n.title ?? '').trim(),
          summary: String(n.firstSentence ?? '').trim(),
          date,
          url: typeof n.detailsweb === 'string' ? n.detailsweb : 'https://www.tagesschau.de',
        };
      })
      .filter((n) => n.title.length > 0)
      .slice(0, limit);

    if (items.length === 0) throw new Error('no items');

    return Response.json({
      items,
      summary:
        'Aktuelle Schlagzeilen: ' + items.slice(0, 3).map((i) => i.title).join(' — ') + '.',
    });
  } catch {
    return Response.json(
      { error: 'Die Nachrichten sind gerade nicht erreichbar. Bitte gleich noch einmal versuchen.' },
      { status: 502 }
    );
  }
}
