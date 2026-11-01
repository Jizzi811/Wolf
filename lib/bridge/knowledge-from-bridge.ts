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

  // Angebote v2 / v6: weitere Gruppen des Katalogs (nur was aktiv und sichtbar ist; keine festen Anzahlen).
  if (catalog) {
    const active = (x: Record<string, unknown>) => x.active !== false && (x.visibility as Record<string, boolean> | undefined)?.public !== false && x.visible !== false;
    const priceOf = (x: Record<string, unknown>) => eur((x.price ?? x.price_eur ?? x.price_normal) as Money);
    const memberOf = (x: Record<string, unknown>) => eur((x.member_price ?? x.price_member ?? x.price_member_eur) as Money);
    const line = (x: Record<string, unknown>) => {
      const parts = [str(x.name ?? x.title)];
      const p = priceOf(x);
      const m = memberOf(x);
      if (p) parts.push(p);
      if (m) parts.push(`für Mitglieder ${m}`);
      const monthly = eur(x.monthly_fee as Money);
      if (monthly) parts.push(`monatlich ${monthly}`);
      const promo = x.promo as Record<string, unknown> | undefined;
      const promoPrice = eur((promo?.active ? promo.price : x.promo_price ?? x.promo_price_eur) as Money);
      if (promoPrice) parts.push(`Aktionspreis ${promoPrice}${str(x.promo_until) ? ` bis ${str(x.promo_until)}` : ''}`);
      const sum = stripHtml(str(x.summary ?? x.description)).slice(0, 160);
      return parts.filter(Boolean).join(', ') + (sum ? ` – ${sum}` : '') + '.';
    };
    const groups: { key: string; slug: string; title: string; intro: string; outro: string }[] = [
      { key: 'banking_accounts', slug: 'bridge-banking', title: 'Bankkonten (live aus der Plattform)', intro: 'Konten laut Plattform: ', outro: ' Konten gibt es nur per Antrag im Mitgliederbereich nach Identitätsprüfung; keine Aussage zu Einlagensicherung oder Banklizenzen.' },
      { key: 'healthbox_packages', slug: 'bridge-healthbox', title: 'Health Box (live aus der Plattform)', intro: 'Health-Box-Angebote laut Plattform: ', outro: ' Keine Gesundheitsversprechen.' },
      { key: 'shop_products', slug: 'bridge-shop', title: 'Premium Shop (live aus der Plattform)', intro: 'Produkte im Premium Shop: ', outro: ' Bestellungen laufen über den Shop der Plattform; CLOSER löst nichts aus und liest keinen Bestellstatus.' },
      { key: 'fanshop', slug: 'bridge-fanshop', title: 'Fanshop (live aus der Plattform)', intro: 'Fanshop-Artikel: ', outro: ' Bestellung über den Fanshop der Plattform.' },
      { key: 'emigration_packages', slug: 'bridge-emigration', title: 'Auswander-Pakete (live aus der Plattform)', intro: 'Pakete zum Auswandern: ', outro: ' Nur nennen, was hier steht; Beratung über „Termin buchen".' },
    ];
    for (const g of groups) {
      const items = list(catalog[g.key]).map((x) => x as Record<string, unknown>).filter(active);
      if (!items.length) continue;
      out.push({ slug: g.slug, title: g.title, content: g.intro + items.slice(0, 40).map(line).join(' ') + g.outro, verified: true, source: 'bridge' });
    }
  }

  const webinars = cache.webinars?.status === 'ok' ? (cache.webinars.data as Record<string, unknown>) : null;
  if (webinars) {
    note(cache.webinars.fetchedAt);
    const items = list(webinars.items).map((w) => w as Record<string, unknown>);
    const tz = str(webinars.timezone) || 'Europe/Berlin';
    if (items.length) {
      const lines = items.map((w) => {
        const itemTz = str(w.timezone) || tz;
        const when =
          w.weekday && w.time_local
            ? `${WEEKDAYS[Number(w.weekday)] ?? ''} um ${str(w.time_local)} Uhr (${itemTz})`
            : w.next_start
              ? `nächster Termin ${formatBerlin(str(w.next_start))} (${itemTz})`
              : '';
        const host = str(w.host) ? `, Moderation ${str(w.host)}` : '';
        return `${str(w.title)} (${str(w.type) === 'PARTNER' ? 'Partner-Webinar' : 'eigenes Webinar'}${host})${when ? `: ${when}` : ''}.`;
      });
      out.push({
        slug: 'bridge-webinars',
        title: `Webinare (live aus der Plattform, Zeitzone ${tz})`,
        content: lines.join(' ') + ` Zeiten immer mit Zeitzone nennen und auf Wunsch in die Ortszeit der Person umrechnen. Vor einer konkreten Terminauskunft live nachschlagen (kcc_nachschlagen webinars). Anmeldung über die Webinar-Seiten auf kickstartercash.club.`,
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
    const news = list(content.news).map((n) => n as Record<string, unknown>).filter(running).slice(0, 5);
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
      const isPublic = str(sc.scope) === 'public';
      const where = isPublic ? 'Öffentliche Webseite' : 'Mitgliederbereich (nur nach der Anmeldung)';
      const cats = list(sc.categories).map((c) => c as Record<string, unknown>).filter((c) => list(c.items).length);
      const catTxt = cats.map((c) => {
        const items = list(c.items)
          .map((i) => i as Record<string, unknown>)
          .map((i) => `${str(i.title)}${str(i.url) ? ` [${str(i.url)}]` : ''}`)
          .filter((t) => t.trim() && !t.startsWith(' ['));
        return `${str(c.category)} (${items.length}): ${items.join(', ')}`;
      });
      if (catTxt.length) parts.push(`${where}, ${cats.length} Hauptkategorien: ${catTxt.join('; ')}.`);
    }
    const links: string[] = [];
    if (str(overview.site_url)) links.push(`Startseite ${str(overview.site_url)}`);
    if (str(overview.login_url)) links.push(`Login ${str(overview.login_url)}`);
    if (str(overview.register_url)) links.push(`Registrierung ${str(overview.register_url)}`);
    if (str(overview.member_area_url)) links.push(`Mitgliederbereich ${str(overview.member_area_url)}`);
    if (parts.length) {
      out.push({
        slug: 'bridge-overview',
        title: 'Die ganze Webseite: Hauptkategorien, Menüpunkte und Links (live)',
        content:
          'Menü der Webseite laut Plattform; Zahlen sind aus diesen Daten gezählt und ändern sich mit dem Menü. ' +
          parts.join(' ') +
          (links.length ? ` Wichtige Adressen: ${links.join(', ')}.` : '') +
          ' Links nur so nennen, wie sie hier in eckigen Klammern stehen, nie selbst bauen; Links des Mitgliederbereichs nur mit dem Hinweis „nach der Anmeldung". Im Gespräch Links nicht buchstabieren, sondern sagen, wo man sie findet. Admin- und Team-Menüs gibt es für Besucher nicht.',
        verified: true,
        source: 'bridge',
      });
    }
  }

  // directory (P18e): Rechtstexte, Team, Services, Partner, Druck-Partner, laufende News, Charity.
  const directory = avail('directory');
  if (directory) {
    const bits: string[] = [];
    const legal = list(directory.legal).map((x) => x as Record<string, unknown>).filter((x) => str(x.title));
    if (legal.length) bits.push(`Rechtliches (${legal.length} Texte, nur Titel und Link nennen, nicht auslegen): ${legal.map((x) => `${str(x.title)}${str(x.url) ? ` [${str(x.url)}]` : ''}`).join('; ')}.`);
    const team = list(directory.team).map((x) => x as Record<string, unknown>).filter((x) => str(x.name));
    if (team.length) bits.push(`Expertenteam (${team.length}): ${team.map((x) => `${str(x.name)}${str(x.role) ? `, ${str(x.role)}` : ''}${list(x.languages).length ? ` (Sprachen: ${list(x.languages).map(str).join(', ')})` : ''}${str(x.about) ? ` – ${stripHtml(str(x.about)).slice(0, 160)}` : ''}`).join('; ')}. Kontakt zum Team nur über „Termin buchen" oder den Support; keine Telefonnummern oder E-Mail-Adressen von Personen.`);
    const experts = list(directory.experts).map((x) => x as Record<string, unknown>).filter((x) => str(x.name));
    if (experts.length) bits.push(`Support-Experten für Mitglieder (${experts.length}): ${experts.map((x) => `${str(x.name)}${str(x.role) ? `, ${str(x.role)}` : ''}${list(x.languages).length ? ` (${list(x.languages).map(str).join(', ')})` : ''}`).join('; ')}.`);
    const services = list(directory.services).map((x) => x as Record<string, unknown>).filter((x) => str(x.title));
    if (services.length) bits.push(`Services (${services.length}): ${services.slice(0, 40).map((x) => {
      const parts = [str(x.title)];
      const p = eur(x.price_eur as Money); const m = eur(x.price_member_eur as Money); const promo = eur(x.promo_price_eur as Money);
      if (p) parts.push(p); if (m) parts.push(`für Mitglieder ${m}`); if (promo) parts.push(`Aktion ${promo}${str(x.promo_until) ? ` bis ${str(x.promo_until)}` : ''}`);
      if (str(x.badge)) parts.push(str(x.badge));
      return parts.join(', ') + (str(x.summary) ? ` – ${stripHtml(str(x.summary)).slice(0, 160)}` : '') + (str(x.url) ? ` [${str(x.url)}]` : '');
    }).join('; ')}.`);
    const partners = list(directory.partners).map((x) => x as Record<string, unknown>).filter((x) => str(x.name));
    if (partners.length) bits.push(`Partner (${partners.length}): ${partners.slice(0, 40).map((x) => `${str(x.name)}${str(x.summary) ? ` – ${stripHtml(str(x.summary)).slice(0, 120)}` : ''}${str(x.website) ? ` [${str(x.website)}]` : ''}`).join('; ')}. Keine Rabattcodes nennen.`);
    const print = list(directory.print_partners).map((x) => x as Record<string, unknown>).filter((x) => str(x.name));
    if (print.length) bits.push(`Druck-Partner (${print.length}): ${print.slice(0, 40).map((x) => `${str(x.name)}${str(x.country_from) || str(x.country_to) ? ` (${[str(x.country_from), str(x.country_to)].filter(Boolean).join(' → ')})` : ''}${str(x.summary) ? ` – ${stripHtml(str(x.summary)).slice(0, 120)}` : ''}`).join('; ')}.`);
    const news = list(directory.news).map((x) => x as Record<string, unknown>).filter(running).filter((x) => str(x.title));
    if (news.length) bits.push(`Laufende Mitteilungen (${news.length}): ${news.map((x) => `${str(x.title)}${str(x.text) ? `: ${stripHtml(str(x.text)).slice(0, 300)}` : ''}${str(x.until) ? ` (gilt bis ${formatBerlin(str(x.until))})` : ''}`).join(' | ')}. Vor einer Auskunft zu Mitteilungen live nachschlagen (directory).`);
    const charity = list(directory.charity).map((x) => x as Record<string, unknown>).filter((x) => str(x.name));
    if (charity.length) bits.push(`Charity (${charity.length} Organisationen): ${charity.map((x) => `${str(x.name)}${str(x.summary) ? ` – ${stripHtml(str(x.summary)).slice(0, 160)}` : ''}${str(x.website) ? ` [${str(x.website)}]` : ''}`).join('; ')}.`);
    if (bits.length) {
      out.push({ slug: 'bridge-directory', title: 'Verzeichnis der Plattform: Rechtliches, Team, Services, Partner, Mitteilungen, Charity (live)', content: bits.join(' ') + ' Leere Gruppen gibt es nicht zu erwähnen.', verified: true, source: 'bridge' });
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

/** Mitteilung läuft gerade (Zeitfenster from/until). */
function running(n: Record<string, unknown>): boolean {
  const now = Date.now();
  const from = n.from ? Date.parse(String(n.from)) : NaN;
  const until = n.until ? Date.parse(String(n.until)) : NaN;
  if (Number.isFinite(from) && from > now) return false;
  if (Number.isFinite(until) && until < now) return false;
  return true;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatBerlin(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(d) + ' Uhr';
}
