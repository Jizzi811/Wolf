/**
 * Baut aus den gespeicherten Brücken-Daten (Katalog, Webinare, Kanäle, Inhalte,
 * Wissensdatenbank) sprechtaugliche Wissensabschnitte. Diese ersetzen die
 * gleichnamigen, von Hand gepflegten Abschnitte, sobald die Brücke läuft.
 */

import type { PromptSection } from '@/lib/admin/prompt-types';
import { getBridgeCache } from './sync';

type Money = Record<string, number> | number | string | null | undefined;

function eur(m: Money): string | null {
  if (m == null) return null;
  if (typeof m === 'number') return fmt(m);
  if (typeof m === 'string') return fmt(Number(m));
  if (typeof m.EUR === 'number') return fmt(m.EUR);
  const first = Object.values(m)[0];
  return typeof first === 'number' ? fmt(first) : null;
}
function fmt(n: number): string {
  if (!Number.isFinite(n)) return '';
  return Number.isInteger(n) ? `${n} Euro` : `${n.toFixed(2).replace('.', ',')} Euro`;
}
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
}
function list(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
const WEEKDAYS = ['', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export async function bridgeSections(): Promise<{ sections: PromptSection[]; fetchedAt: string | null }> {
  const cache = await getBridgeCache();
  const out: PromptSection[] = [];
  let latest: Date | null = null;
  const note = (d: Date | null) => {
    if (d && (!latest || d > latest)) latest = d;
  };

  const catalog = cache.catalog?.status === 'ok' ? (cache.catalog.data as Record<string, unknown>) : null;
  if (catalog) {
    note(cache.catalog.fetchedAt);
    const pk = list(catalog.packages).map((p) => p as Record<string, unknown>);
    if (pk.length) {
      const lines = pk
        .filter((p) => (p.visibility as Record<string, boolean> | undefined)?.public !== false)
        .map((p) => {
          const parts = [`${str(p.name)} für ${eur(p.price as Money) ?? 'Preis auf Anfrage'}`];
          const setup = eur(p.setup_fee as Money);
          if (setup) parts.push(`Einrichtung ${setup}`);
          const member = eur(p.member_price as Money);
          if (member) parts.push(`Mitgliedspreis ${member}`);
          const promo = p.promo as Record<string, unknown> | undefined;
          if (promo?.active && eur(promo.price as Money)) parts.push(`Aktionspreis ${eur(promo.price as Money)}`);
          const feats = list(p.features).map(str).filter(Boolean).slice(0, 12);
          const inc = p.includes as Record<string, unknown> | undefined;
          const incl: string[] = [];
          if (inc?.exchange_app) incl.push('DEX/WEX Exchange-Zugang');
          if (inc?.exchange_cryptocard) incl.push('Kryptocard');
          const txt = `${parts.join(', ')}.` + (feats.length ? ` Enthalten: ${feats.join('; ')}.` : '') + (incl.length ? ` Zusätzlich: ${incl.join(', ')}.` : '');
          return txt;
        });
      out.push({
        slug: 'bridge-packages',
        title: 'Mitgliedschafts-Pakete (live aus der Plattform)',
        content:
          'Aktuelle Pakete laut Plattform, Preise als „ab"-Preise nennen. ' +
          lines.join(' ') +
          ' Ein Upgrade kostet nur die Preisdifferenz. Preise werden in Euro geführt und automatisch in andere Währungen umgerechnet.',
        verified: true,
        source: 'bridge',
        replaces: ['packages', 'membership'],
      });
    }
    const cards = list(catalog.black_cards).map((c) => c as Record<string, unknown>);
    if (cards.length) {
      const lines = cards
        .filter((c) => c.active !== false)
        .map((c) => {
          const parts = [`${str(c.name)} (${str(c.brand) || 'Mastercard'})`];
          const normal = eur(c.price_normal as Money);
          const member = eur(c.price_member as Money);
          if (normal) parts.push(`regulär ${normal}`);
          if (member) parts.push(`für Mitglieder ${member}`);
          const setup = eur(c.setup_fee as Money);
          if (setup) parts.push(`Einrichtung ${setup}`);
          const monthly = eur(c.monthly_fee as Money);
          if (monthly) parts.push(`monatlich ${monthly}`);
          return parts.join(', ') + '.';
        });
      out.push({
        slug: 'bridge-cards',
        title: 'Black Cards (live aus der Plattform)',
        content:
          lines.join(' ') +
          ' Karten und Konten gibt es ausschließlich per Antrag im Mitgliederbereich nach einmaliger Identitätsprüfung.',
        verified: true,
        source: 'bridge',
        replaces: ['cards-black'],
      });
    }
    const ranks = list(catalog.ranks).map((r) => r as Record<string, unknown>);
    const cs = (catalog.commission_settings as Record<string, unknown>) ?? {};
    if (ranks.length || Object.keys(cs).length) {
      const lv = [2, 3, 4, 5, 6].map((i) => cs[`global_comm_lvl${i}`]).filter((v) => v != null);
      const rk = ranks.map((r) => {
        const req: string[] = [];
        if (r.req_direct_partners) req.push(`${r.req_direct_partners} direkte Partner`);
        if (r.req_personal_cv) req.push(`${r.req_personal_cv} CV persönlich`);
        return `${str(r.name ?? r.rank_name)}${req.length ? ` (${req.join(', ')})` : ''}`;
      });
      out.push({
        slug: 'bridge-commissions',
        title: 'Vergütungsplan (live aus der Plattform)',
        content:
          'Ebene eins erhält die feste Direktprovision in Euro je Produkt (steht bei jedem Paket als direct_commission). ' +
          (lv.length ? `Ebenen zwei bis sechs erhalten ${lv.map((v) => `${String(v).replace('.', ',')} Prozent`).join(', ')} auf den CV-Wert. ` : '') +
          (rk.length ? `Ränge: ${rk.join('; ')}. ` : '') +
          (cs.withdrawals_locked ? 'Auszahlungen sind aktuell pausiert; CLOSER sagt keine Auszahlung zu. ' : '') +
          'Provisionen sind keine garantierte Einnahmequelle.',
        verified: true,
        source: 'bridge',
        replaces: ['commissions-ranks'],
      });
    }
  }

  const webinars = cache.webinars?.status === 'ok' ? (cache.webinars.data as Record<string, unknown>) : null;
  if (webinars) {
    note(cache.webinars.fetchedAt);
    const items = list(webinars.items).map((w) => w as Record<string, unknown>);
    if (items.length) {
      const lines = items.map((w) => {
        const when =
          w.weekday && w.time_local
            ? `${WEEKDAYS[Number(w.weekday)] ?? ''} um ${str(w.time_local)} Uhr`
            : w.next_start
              ? `nächster Termin ${formatBerlin(str(w.next_start))}`
              : '';
        const host = str(w.host) ? `, Moderation ${str(w.host)}` : '';
        return `${str(w.title)} (${str(w.type) === 'PARTNER' ? 'Partner-Webinar' : 'eigenes Webinar'}${host})${when ? `: ${when}` : ''}.`;
      });
      out.push({
        slug: 'bridge-webinars',
        title: 'Webinare (live aus der Plattform, deutsche Zeit)',
        content: lines.join(' ') + ' Anmeldung über die Webinar-Seiten auf kickstartercash.club.',
        verified: true,
        source: 'bridge',
        replaces: ['webinars'],
      });
    }
  }

  const channels = cache.channels?.status === 'ok' ? (cache.channels.data as Record<string, unknown>) : null;
  if (channels) {
    note(cache.channels.fetchedAt);
    const ch = list(channels.channels).map((c) => c as Record<string, unknown>);
    const off = list(channels.official_links).map((c) => c as Record<string, unknown>);
    const lines = [
      ...ch.map((c) => `${str(c.name)}${str(c.subtitle) ? ` (${str(c.subtitle)})` : ''}${str(c.url) ? `: ${str(c.url)}` : ''}`),
      ...off.map((c) => `${str(c.label)}: ${str(c.url)}`),
    ];
    if (lines.length) {
      out.push({
        slug: 'bridge-channels',
        title: 'Offizielle Kanäle (live aus der Plattform)',
        content:
          lines.join('. ') +
          '. Links im Gespräch nicht buchstabieren, sondern sagen, wo man sie findet. CLOSER speichert selbst keine Kontaktdaten und löst keine Bestellungen aus.',
        verified: true,
        source: 'bridge',
        replaces: ['contact'],
      });
    }
  }

  const content = cache.content?.status === 'ok' ? (cache.content.data as Record<string, unknown>) : null;
  if (content) {
    note(cache.content.fetchedAt);
    const bits: string[] = [];
    const company = content.company as Record<string, unknown> | undefined;
    if (company && str(company.name)) bits.push(`Betreiber: ${str(company.name)}${str(company.city) ? `, ${str(company.city)}` : ''}${str(company.country) ? `, ${str(company.country)}` : ''}.`);
    if (str(content.payout_notice)) bits.push(`Hinweis zu Auszahlungen: ${stripHtml(str(content.payout_notice))}`);
    if (str(content.countdown_date)) bits.push(`Countdown der Plattform: ${str(content.countdown_title) || 'Start'} bis ${formatBerlin(str(content.countdown_date))}.`);
    const news = list(content.news).map((n) => n as Record<string, unknown>).slice(0, 5);
    if (news.length) bits.push(`Aktuelle Neuigkeiten: ${news.map((n) => str(n.title)).join('; ')}.`);
    if (bits.length) {
      out.push({ slug: 'bridge-content', title: 'Aktuelles (live aus der Plattform)', content: bits.join(' '), verified: true, source: 'bridge', replaces: ['status'] });
    }
  }

  // ---------- P18c: neue Bereiche (Version 1.1.0) ----------
  const avail = (area: string): Record<string, unknown> | null => {
    const row = cache[area];
    if (!row || row.status !== 'ok') return null;
    const data = row.data as Record<string, unknown> | null;
    if (!data || data.available === false) return null;
    note(row.fetchedAt);
    return data;
  };

  // learned: freigegebene Antworten aus „Offene Fragen & Lernen" – Vorrang vor allem anderen.
  const learned = avail('learned');
  if (learned) {
    const entries = list(learned.entries).map((e) => e as Record<string, unknown>).filter((e) => str(e.question) && str(e.answer));
    if (entries.length) {
      const lines = entries.slice(0, 200).map((e) => `Frage: ${str(e.question)} Antwort: ${stripHtml(str(e.answer))}`);
      out.unshift({
        slug: 'bridge-learned',
        title: 'Vom Team freigegebene Antworten (Vorrang vor allem anderen Wissen)',
        content: 'Diese Antworten hat das Team von Kickstartercash.Club geprüft und freigegeben; sie gelten vor allen anderen Angaben. ' + lines.join(' '),
        verified: true,
        source: 'bridge',
      });
    }
  }

  const overview = avail('overview');
  if (overview) {
    const scopes = list(overview.scopes).map((x) => x as Record<string, unknown>);
    const parts: string[] = [];
    for (const sc of scopes) {
      const where = str(sc.scope) === 'public' ? 'Öffentliche Webseite' : 'Mitgliederbereich';
      const cats = list(sc.categories).map((c) => c as Record<string, unknown>);
      const catTxt = cats
        .map((c) => `${str(c.category)}: ${list(c.items).map((i) => str((i as Record<string, unknown>).title)).filter(Boolean).join(', ')}`)
        .filter((t) => !t.endsWith(': '));
      if (catTxt.length) parts.push(`${where} – ${catTxt.join('; ')}.`);
    }
    if (parts.length) {
      out.push({ slug: 'bridge-overview', title: 'Funktionsübersicht der Plattform (live)', content: 'Welche Bereiche es gibt: ' + parts.join(' ') + ' Admin- und Team-Menüs gibt es für Besucher nicht.', verified: true, source: 'bridge' });
    }
  }

  const relocation = avail('relocation');
  if (relocation) {
    const countries = list(relocation.countries).map((c) => c as Record<string, unknown>);
    if (countries.length) {
      const lines = countries.map((c) => {
        const pk = list(c.packages).map((p) => p as Record<string, unknown>);
        const pkTxt = pk.length
          ? ` Pakete: ${pk.map((p) => `${str(p.name)} ${eur(p.price as Money) ?? ''}${str(p.currency) && str(p.currency) !== 'EUR' ? ` ${str(p.currency)}` : ''}${p.promo_price ? ` (Aktion ${eur(p.promo_price as Money)}${str(p.promo_until) ? ` bis ${str(p.promo_until)}` : ''})` : ''}`.trim()).join('; ')}.`
          : ' Derzeit kein öffentliches Paket; Preise nennt CLOSER nicht.';
        return `${str(c.name)}: ${stripHtml(str(c.summary)) || 'Informationen auf der Plattform.'}${pkTxt}`;
      });
      out.push({ slug: 'bridge-relocation', title: 'Auswandern und Plan B (live aus der Plattform)', content: `Länder im Auswandern-Bereich: ${countries.map((c) => str(c.name)).join(', ')}. ` + lines.join(' ') + ' Details, Roadmaps und Beratungstermine gibt es im Bereich Auswandern der Plattform.', verified: true, source: 'bridge' });
    }
  }

  const guides = avail('guides');
  if (guides) {
    const hb = list(guides.handbook).map((h) => h as Record<string, unknown>);
    const gd = list(guides.guides).map((g) => g as Record<string, unknown>);
    const ka = list(guides.knowledge_articles).map((k) => k as Record<string, unknown>);
    const items = [
      ...hb.map((h) => `${str(h.category) ? `[${str(h.category)}] ` : ''}${str(h.title)}: ${stripHtml(str(h.summary) || str(h.text)).slice(0, 400)}`),
      ...gd.map((g) => `Anleitung ${str(g.title)}: ${list(g.steps).map((st, i) => `Schritt ${i + 1}: ${stripHtml(str(typeof st === 'string' ? st : (st as Record<string, unknown>).text ?? (st as Record<string, unknown>).title))}`).join(' ')}`.slice(0, 600)),
      ...ka.map((k) => `${str(k.title)}: ${stripHtml(str(k.summary) || str(k.text)).slice(0, 400)}`),
    ].filter((t) => t.trim().length > 3);
    if (items.length) {
      out.push({ slug: 'bridge-guides', title: 'Handbuch und Anleitungen (live aus der Plattform)', content: items.slice(0, 120).join(' ') + ' Vollständige Anleitungen stehen im Handbuch der Plattform.', verified: true, source: 'bridge' });
    }
  }

  const promo = avail('promo');
  if (promo) {
    const kinds = list(promo.kinds).map((k) => k as Record<string, unknown>);
    const kindName: Record<string, string> = { flyer: 'Flyer', poster: 'Poster', media: 'Medien', video: 'Videos' };
    const lines = kinds.map((k) => {
      const langs = list(k.languages).map(str).filter(Boolean);
      const areas = list(k.areas).map(str).filter(Boolean);
      return `${kindName[str(k.kind)] ?? str(k.kind)}: ${str(k.count) || list(promo.items).length} Stück${areas.length ? `, Bereiche ${areas.join(', ')}` : ''}${langs.length ? `, Sprachen ${langs.join(', ')}` : ''}`;
    });
    if (lines.length) {
      out.push({ slug: 'bridge-promo', title: 'Werbemittel (live aus der Plattform)', content: `Im Bereich Werbemittel der Plattform gibt es: ${lines.join('; ')}. Es gibt keine Download-Adressen im Gespräch; CLOSER verweist auf den Bereich Werbemittel im Mitgliederbereich.`, verified: true, source: 'bridge' });
    }
  }

  const realestate = avail('realestate');
  if (realestate) {
    const objs = list(realestate.objects).map((o) => o as Record<string, unknown>);
    if (objs.length) {
      const lines = objs.slice(0, 40).map((o) => {
        const bits = [str(o.title), [str(o.type), str(o.offer)].filter(Boolean).join(' '), [str(o.city), str(o.country)].filter(Boolean).join(', ')];
        if (o.rooms) bits.push(`${str(o.rooms)} Zimmer`);
        if (o.area_sqm || o.area) bits.push(`${str(o.area_sqm ?? o.area)} Quadratmeter`);
        const price = eur(o.price as Money);
        if (price) bits.push(price);
        return bits.filter(Boolean).join(', ') + '.';
      });
      out.push({ slug: 'bridge-realestate', title: 'Immobilien (live aus der Plattform)', content: `Aktuell ${objs.length} Objekte im Immobilien-Bereich. ` + lines.join(' ') + ' Keine Straßen, Koordinaten oder Maklernamen; Details über den Immobilien-Bereich der Plattform.', verified: true, source: 'bridge' });
    }
  }

  const social = avail('social');
  if (social) {
    const ch = list(social.channels).map((c) => c as Record<string, unknown>).filter((c) => str(c.name));
    if (ch.length) {
      out.push({ slug: 'bridge-social', title: 'Öffentliche Social-Kanäle (live aus der Plattform)', content: ch.map((c) => `${str(c.name)}${str(c.description) ? ` (${stripHtml(str(c.description))})` : ''}${str(c.url) ? `: ${str(c.url)}` : ''}`).join('. ') + '. Links nicht buchstabieren.', verified: true, source: 'bridge' });
    }
  }

  const tour = avail('tour');
  if (tour) {
    const decks = list(tour.decks).map((d) => d as Record<string, unknown>).filter((d) => str(d.deck));
    if (decks.length) {
      out.push({ slug: 'bridge-tour', title: 'System-Tour (Webinar-Folien, live aus der Plattform)', content: decks.map((d) => `${str(d.deck)}: ${list(d.outline).map(str).filter(Boolean).join(', ')}${str(d.text) ? `. ${stripHtml(str(d.text)).slice(0, 800)}` : ''}`).join(' ').slice(0, 6000), verified: true, source: 'bridge' });
    }
  }

  const knowledge = cache.knowledge?.status === 'ok' ? (cache.knowledge.data as Record<string, unknown>) : null;
  if (knowledge && knowledge.available !== false) {
    note(cache.knowledge.fetchedAt);
    const entries = list(knowledge.entries).map((e) => e as Record<string, unknown>);
    if (entries.length) {
      const de = entries.filter((e) => !e.language || str(e.language).startsWith('de'));
      const use = (de.length ? de : entries).slice(0, 150);
      out.push({
        slug: 'bridge-knowledge',
        title: 'Wissensdatenbank des Support-Teams (Fragen und Antworten)',
        content: use.map((e) => `Frage: ${str(e.question)} Antwort: ${str(e.answer)}`).join(' '),
        verified: true,
        source: 'bridge',
      });
    }
  }

  return { sections: out, fetchedAt: latest ? (latest as Date).toISOString().slice(0, 10) : null };
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatBerlin(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(d) + ' Uhr';
}
