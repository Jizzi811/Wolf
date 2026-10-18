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
  await saveSetting('persona', { name: 'JOHANN', greeting: 'Hallo, ich bin Johann.' }, admin.id);
  await saveSetting('voice', { voiceId: 'abc123', speed: 1.05 }, admin.id);
  await saveSetting('features', { leadCapture: true, storeTranscripts: true }, admin.id);
  const s1 = await getSettings();
  assert(s1.persona.name === 'JOHANN' && s1.persona.tagline === s0.persona.tagline, 'Einstellungen gemerged (Name neu, Rest Standard)');
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
  assert(cfg.name === 'JOHANN' && cfg.firstMessage === 'Hallo, ich bin Johann.', 'Assistent nutzt Persona');
  assert(cfg.voice.voiceId === 'abc123', 'Assistent nutzt Stimme');
  assert(sys.includes('Du bist JOHANN') && !sys.includes('Du bist CLOSER'), 'Name im Prompt ersetzt');
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

  console.log('\nAlle Tests bestanden.');
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
