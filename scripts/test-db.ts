/**
 * Funktionstest ohne Netz: PGlite als Postgres-Ersatz. Prüft Schema-Bootstrap,
 * Nutzer, Einstellungen, Wissen, Assistenten-Aufbau, Gespräche, Leads, Statistik.
 * Aufruf: pnpm test:db
 */
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { setDbForTests, db, schema, type Db } from '@/lib/db';
import { createUser, findUserByEmail, countUsers } from '@/lib/admin/users';
import { verifyPassword } from '@/lib/auth/password';
import { getSettings, saveSetting } from '@/lib/admin/settings';
import { seedSectionsIfEmpty, getPromptSections, listSections } from '@/lib/admin/knowledge';
import { buildAssistantConfig } from '@/lib/admin/assistant';
import { startConversation, endConversation, applyEndOfCallReport, createLead, recordOpenQuestion, recordEvent, extractTopics } from '@/lib/admin/tracking';
import { getDashboardStats, getUserStats } from '@/lib/admin/stats';
import { getBridgeCache } from '@/lib/bridge/sync';
import { bridgeSections } from '@/lib/bridge/knowledge-from-bridge';
import { LANGUAGES, VOICE_LANGUAGES, TEXT_ONLY_LANGUAGES, getLanguage } from '@/lib/closer/languages';
import { normalizeBrand, BRAND } from '@/lib/closer/brand';
import { GREETINGS, UI, greetingForMode, GREETINGS_POLITE, ADDRESS_QUESTIONS } from '@/lib/closer/i18n';
import { hasTvDistinction, addressPromptRule, getAddressMode } from '@/lib/closer/address';
import { buildSystemContent } from '@/lib/admin/assistant';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(`FEHLER: ${msg}`);
  console.log(`ok  ${msg}`);
}

async function main() {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://closer-test.example';
  process.env.VAPI_WEBHOOK_SECRET = 'test-secret';
  const client = new PGlite();
  const pg = drizzle(client, { schema }) as unknown as Db;
  setDbForTests(pg);
  const d = await db();
  assert(d, 'Datenbank und Schema angelegt');

  // Nutzer
  assert((await countUsers()) === 0, 'noch keine Nutzer');
  const admin = await createUser({ email: 'Admin@Example.com', password: 'sehr-geheim-123', name: 'Nadja', role: 'admin' });
  const found = await findUserByEmail('admin@example.com');
  assert(found?.id === admin.id, 'Nutzer per E-Mail (kleingeschrieben) gefunden');
  assert(await verifyPassword('sehr-geheim-123', found!.passwordHash), 'Passwort-Hash prüfbar');
  assert(!(await verifyPassword('falsch', found!.passwordHash)), 'falsches Passwort abgelehnt');
  await createUser({ email: 'team@example.com', password: 'team-passwort-1', name: 'Team', role: 'team', permissions: ['wissen', 'leads'] });

  // Einstellungen
  const s0 = await getSettings();
  assert(s0.persona.name === 'CLOSER', 'Standardname CLOSER');
  await saveSetting('persona', { name: 'NOVA', greeting: 'Hallo, ich bin Nova.' }, admin.id);
  await saveSetting('voice', { voiceId: 'abc123', speed: 1.05 }, admin.id);
  await saveSetting('features', { leadCapture: true, storeTranscripts: true }, admin.id);
  const s1 = await getSettings();
  assert(s1.persona.name === 'NOVA' && s1.persona.tagline === s0.persona.tagline, 'Einstellungen gemerged (Name neu, Rest Standard)');
  assert(s1.voice.voiceId === 'abc123' && s1.voice.speed === 1.05, 'Stimme gespeichert');

  // Wissen
  const n = await seedSectionsIfEmpty(admin.id);
  assert(n > 5, `Startwissen übernommen (${n} Abschnitte)`);
  assert((await seedSectionsIfEmpty(admin.id)) === 0, 'zweites Seed ist no-op');
  const sections = await listSections();
  const pkg = sections.find((x) => x.slug === 'packages');
  assert(pkg, 'Abschnitt packages vorhanden');
  const prompt = await getPromptSections();
  assert(prompt.sections.length === sections.length, 'Prompt-Abschnitte = DB-Abschnitte (keine Brücke)');
  assert(prompt.fromBridge === false, 'ohne Brücke: fromBridge=false');

  // Brücke simulieren
  await d.insert(schema.bridgeCache).values({
    area: 'catalog',
    status: 'ok',
    hash: 'h1',
    fetchedAt: new Date(),
    data: {
      packages: [{ name: 'Private Premium', price: { EUR: 385 }, setup_fee: { EUR: 5 }, features: ['Banking', 'Karte'], visibility: { public: true } }],
      black_cards: [{ name: 'Black Card Private', price: { EUR: 315 }, member_price: { EUR: 285 }, monthly_fee: { EUR: 10 } }],
      ranks: [{ name: 'Affiliate' }, { name: 'Visionary' }],
      commissions: { global_comm_lvl2: 1, global_comm_lvl3: 0.5 },
    },
  });
  const bs = await bridgeSections();
  assert(bs.sections.length >= 1, `Brücken-Abschnitte gebaut (${bs.sections.length})`);
  assert(bs.sections.some((x) => x.content.includes('385')), 'Brücken-Text enthält Preis 385');
  const prompt2 = await getPromptSections();
  assert(prompt2.fromBridge && !prompt2.sections.some((x) => x.slug === 'packages'), 'Brücke ersetzt Seed-Abschnitt packages');
  const cache = await getBridgeCache();
  assert(cache.catalog?.status === 'ok', 'Brücken-Cache lesbar');

  // Assistent
  const cfg = await buildAssistantConfig({ conversationId: 'clsr-20261018-abcdefabcdef', refUsername: 'nadja', origin: 'https://x' });
  const sys = cfg.model.messages[0].content;
  assert(cfg.name === 'NOVA' && cfg.firstMessage.includes('Möchten Sie lieber mit „Sie“'), 'Assistent nutzt Persona-Namen; Begrüßung im Modus ask höflich mit Anrede-Frage');
  assert(cfg.voice.voiceId === 'abc123', 'Assistent nutzt Stimme');
  assert(sys.includes('Du bist NOVA') && !sys.includes('Du bist CLOSER'), 'Name im Prompt ersetzt');
  assert(sys.includes('385'), 'Wissen (Brücke) im Prompt');
  assert(sys.includes('nadja'), 'Empfehler im Prompt');
  assert(cfg.server?.url === 'https://closer-test.example/api/vapi/webhook' && cfg.server.secret === 'test-secret', 'Webhook gesetzt');
  assert(Array.isArray(cfg.model.tools) && cfg.model.tools.length === 2, 'Funktionen erfasse_lead + offene_frage');
  assert(cfg.metadata?.conversationId === 'clsr-20261018-abcdefabcdef', 'Metadaten enthalten Gesprächs-ID');

  // Gespräche
  const cid = 'clsr-20261018-aaaaaaaaaaaa';
  await startConversation({ conversationId: cid, visitorId: 'v1', refUsername: 'nadja', userId: admin.id });
  await startConversation({ conversationId: cid, vapiCallId: 'call-1' });
  await recordEvent({ type: 'page_view', visitorId: 'v1', path: '/' });
  const transcript = [
    { role: 'assistant' as const, text: 'Hallo', at: 0 },
    { role: 'user' as const, text: 'Was kostet die Black Card und wie sind die Provisionen?', at: 3 },
    { role: 'assistant' as const, text: 'Die Black Card Private kostet 315 Euro.', at: 6 },
  ];
  await endConversation({ conversationId: cid, durationS: 95, transcript, endedReason: 'nutzer-beendet', storeTranscript: true });
  let conv = await d.query.conversations.findFirst({ where: (c, { eq }) => eq(c.conversationId, cid) });
  assert(conv?.durationS === 95 && conv.messagesCount === 3 && conv.vapiCallId === 'call-1', 'Gespräch beendet und gezählt');
  assert(conv!.topics.includes('Black Card') && conv!.topics.includes('Vergütungsplan'), `Themen erkannt: ${conv!.topics.join(', ')}`);
  await applyEndOfCallReport({ conversationId: cid, vapiCallId: 'call-1', durationS: 97, summary: 'Preisfrage.', transcript, endedReason: 'customer-ended-call', costUsd: 0.0421, storeTranscript: true });
  conv = await d.query.conversations.findFirst({ where: (c, { eq }) => eq(c.conversationId, cid) });
  assert(conv?.summary === 'Preisfrage.' && conv.durationS === 97 && Number(conv.costUsd) === 0.0421, 'Vapi-Bericht übernommen');
  await applyEndOfCallReport({ vapiCallId: 'call-unbekannt', durationS: 10, storeTranscript: false });
  const orphan = await d.query.conversations.findFirst({ where: (c, { eq }) => eq(c.vapiCallId, 'call-unbekannt') });
  assert(orphan, 'Bericht ohne Gesprächs-ID legt Gespräch an');
  await endConversation({ conversationId: 'clsr-20261018-bbbbbbbbbbbb', transcript, storeTranscript: false });
  const noStore = await d.query.conversations.findFirst({ where: (c, { eq }) => eq(c.conversationId, 'clsr-20261018-bbbbbbbbbbbb') });
  assert(noStore && noStore.transcript.length === 0 && noStore.messagesCount === 3, 'Transkript nicht gespeichert, Zähler bleibt');
  assert(extractTopics([{ role: 'user', text: 'Webinar heute?' }]).includes('Webinare'), 'Themen-Extraktion');

  // Leads und Fragen
  const lead = await createLead({ conversationId: cid, firstName: 'Max', email: 'MAX@EXAMPLE.COM', consent: true, consentText: 'Einwilligung', sponsorUsername: 'nadja' });
  assert(lead.email === 'max@example.com', 'Lead gespeichert (E-Mail klein)');
  conv = await d.query.conversations.findFirst({ where: (c, { eq }) => eq(c.conversationId, cid) });
  assert(conv?.leadId === lead.id && conv.outcome === 'lead', 'Gespräch mit Lead verknüpft');
  await recordOpenQuestion('Gibt es die Karte auch in Gold?');
  await recordOpenQuestion('Gibt es die Karte auch in GOLD??');
  const qs = await d.select().from(schema.openQuestions);
  assert(qs.length === 1 && qs[0].count === 2, 'Offene Frage dedupliziert und gezählt');

  // Statistik
  const stats = await getDashboardStats(30);
  assert(stats.conversationsTotal === 3 && stats.leadsTotal === 1 && stats.openQuestions === 1, 'Dashboard-Zahlen stimmen');
  assert(stats.perDay.length === 30 && stats.perDay[29].conversations === 3, 'Tagesreihe (heute = 3 Gespräche)');
  assert(stats.topTopics.some((t) => t.topic === 'Black Card'), 'Top-Themen');
  assert(stats.topRefs[0]?.ref === 'nadja', 'Top-Empfehler');
  assert(stats.byHour.length === 24, '24 Stunden');
  const us = await getUserStats(admin.id);
  assert(us.conversations === 1, 'Nutzer-Statistik');

  // Sprachen, Marke, Sprachwechsel
  assert(LANGUAGES.length === 136, '136 Sprachen aus dem Plattform-Header');
  assert(VOICE_LANGUAGES.length === 36 && TEXT_ONLY_LANGUAGES.length === 100, `Aufteilung ${VOICE_LANGUAGES.length} Sprachmodus / ${TEXT_ONLY_LANGUAGES.length} Textmodus`);
  assert(VOICE_LANGUAGES.every((l) => l.deepgram && l.eleven && GREETINGS[l.lang.startsWith('zh') ? 'zh' : l.lang.split('-')[0]]), 'jede Sprachmodus-Sprache hat Codes und Begrüßung');
  assert(VOICE_LANGUAGES.every((l) => UI[l.lang.startsWith('zh') ? 'zh' : l.lang.split('-')[0]]), 'jede Sprachmodus-Sprache hat Oberflächentexte');
  assert(getLanguage('tr').voice && !getLanguage('sw').voice, 'Türkisch Stimme, Swahili nur Text');
  assert(normalizeBrand('Willkommen bei Kickstarter Cash Club und KICKSTARTERCASH.CLUB, siehe https://kickstartercash.club/x') === `Willkommen bei ${BRAND.written} und ${BRAND.written}, siehe https://kickstartercash.club/x`, 'Schreibweise normalisiert, Adresse bleibt');
  const trCfg = await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'tr', origin: 'https://x' });
  assert(trCfg.transcriber.language === 'tr' && trCfg.voice.language === 'tr' && trCfg.firstMessage.startsWith('İşte geldin'), 'Türkisch: Erkennung, Stimme, Begrüßung');
  assert(trCfg.model.messages[0].content.includes('Antworte ausschließlich auf Türkisch') && trCfg.model.messages[0].content.includes('Kickstartercash Club'), 'Sprachzeile und Aussprache im Prompt');
  assert(Array.isArray(trCfg.voice.chunkPlan?.formatPlan.replacements) && trCfg.voice.chunkPlan!.formatPlan.replacements.length >= 4, 'Ersetzungen für die Aussprache gesetzt');
  const brCfg = await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'pt-br', history: 'Nutzer: Hallo', origin: 'https://x' });
  assert(brCfg.transcriber.language === 'pt-BR' && brCfg.model.messages[0].content.includes('BISHERIGER VERLAUF'), 'Portugiesisch (Brasilien) + Verlauf beim Sprachwechsel');
  let threw = false;
  try { await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'sw' }); } catch { threw = true; }
  assert(threw, 'Textmodus-Sprache liefert keinen Sprach-Assistenten');
  const text = await buildSystemContent({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'sw', textMode: true });
  assert(text.content.includes('Antworte ausschließlich auf Swahili') && text.content.includes('FORMAT: Du antwortest als Text'), 'Textmodus-Prompt auf Swahili');
  assert(!text.content.includes('Johann'), 'kein Johann im Prompt');
  // Legacy-Fix: alte Standardtexte in der DB werden angehoben
  await saveSetting('persona', { greeting: 'Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. Was wollen wir heute klären?', imageUrl: '/johann-orb.png', name: 'CLOSER' }, admin.id);
  const fixed = await getSettings();
  assert(!fixed.persona.greeting.includes('Johann') && fixed.persona.imageUrl === '/closer-orb.png', 'alte Standardtexte werden automatisch ersetzt');
  // Neue Brücken-Bereiche
  await d.insert(schema.bridgeCache).values([
    { area: 'learned', status: 'ok', fetchedAt: new Date(), data: { available: true, entries: [{ id: 'q1', question: 'Gibt es die Karte in Gold?', answer: 'Nein, nur in Schwarz.', language: 'de' }] } },
    { area: 'relocation', status: 'ok', fetchedAt: new Date(), data: { available: true, countries: [{ name: 'Dubai', slug: 'dubai', iso: 'AE', summary: 'Steuerfrei.', packages: [] }] } },
    { area: 'guides', status: 'ok', fetchedAt: new Date(), data: { available: true, handbook: [{ category: 'Start', title: 'Erste Schritte', summary: 'Konto anlegen und KYC.' }], guides: [{ title: 'Karte beantragen', steps: ['Login', 'Karten', 'Antrag'] }], knowledge_articles: [] } },
    { area: 'promo', status: 'ok', fetchedAt: new Date(), data: { available: false, note: 'nicht live' } },
    { area: 'overview', status: 'ok', fetchedAt: new Date(), data: { available: true, scopes: [{ scope: 'user', categories: [{ category: 'Banking', items: [{ title: 'Black Card' }, { title: 'Konto' }] }] }] } },
  ]);
  const bs2 = await bridgeSections();
  assert(bs2.sections[0].slug === 'bridge-learned', 'gelernte Antworten stehen ganz vorne');
  assert(bs2.sections.some((x) => x.slug === 'bridge-relocation' && x.content.includes('kein öffentliches Paket')), 'Auswandern ohne Pakete: keine Preise erfunden');
  assert(bs2.sections.some((x) => x.slug === 'bridge-guides' && x.content.includes('Schritt 1: Login')), 'Anleitungen mit Schritten');
  assert(!bs2.sections.some((x) => x.slug === 'bridge-promo'), 'promo available:false wird nicht genannt');
  assert(bs2.sections.some((x) => x.slug === 'bridge-overview' && x.content.includes('Black Card')), 'Funktionsübersicht');

  // Anrede (Zusatzauftrag 01.11.2026)
  assert(getAddressMode() === 'ask', 'Anrede-Modus ohne Variable = ask');
  assert(VOICE_LANGUAGES.every((l) => GREETINGS_POLITE[l.lang.startsWith('zh') ? 'zh' : l.lang.split('-')[0]]), 'jede Sprachmodus-Sprache hat eine höfliche Begrüßung');
  const askDe = greetingForMode('de', 'ask', true)!;
  assert(askDe.includes('Möchten Sie lieber mit „Sie“ oder mit „du“') && (askDe.match(/\?/g) ?? []).length === 1, 'Deutsch: genau eine Anrede-Frage am Anfang');
  assert(greetingForMode('en', 'ask', hasTvDistinction('en')) === GREETINGS_POLITE.en, 'Englisch: keine Frage, höflich');
  assert(!greetingForMode('es', 'ask', true)!.includes('¿ '), 'Spanisch: keine verwaiste Satzzeichen');
  assert(Object.keys(ADDRESS_QUESTIONS).every((k) => hasTvDistinction(k)), 'Anrede-Fragen nur für Sprachen mit Höflichkeitsform');
  assert(addressPromptRule('ask', 'de', 'Deutsch').includes('Standard ist die höfliche Form') && addressPromptRule('du', 'de', 'Deutsch').startsWith('ANREDE: Duze'), 'Prompt-Regeln je Modus');
  const askCfg = await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'de', origin: 'https://x' });
  assert(askCfg.firstMessage === askDe && askCfg.model.messages[0].content.includes('ANREDE: Standard ist die höfliche Form'), 'Sprach-Assistent: Begrüßung mit Anrede-Frage und Regel');
  process.env.CLOSER_ADDRESS_MODE = 'du';
  const duCfg = await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'de', origin: 'https://x' });
  assert(duCfg.firstMessage.startsWith('Da bist du ja') && duCfg.model.messages[0].content.includes('ANREDE: Duze'), 'CLOSER_ADDRESS_MODE=du: Du-Begrüßung aus dem Admin');
  process.env.CLOSER_ADDRESS_MODE = 'sie';
  const sieCfg = await buildAssistantConfig({ conversationId: 'clsr-20261101-abcdefabcdef', lang: 'fr', origin: 'https://x' });
  assert(sieCfg.firstMessage === GREETINGS_POLITE.fr && sieCfg.model.messages[0].content.includes('ANREDE: Sieze'), 'CLOSER_ADDRESS_MODE=sie: höflich ohne Frage (Französisch)');
  delete process.env.CLOSER_ADDRESS_MODE;

  console.log('\nAlle Tests bestanden.');
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
