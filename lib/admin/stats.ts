/**
 * Kennzahlen für Dashboard und Statistik-Seiten.
 */

import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

export interface DashboardStats {
  conversationsTotal: number;
  conversations7d: number;
  conversations30d: number;
  avgDurationS: number;
  totalMinutes: number;
  leadsTotal: number;
  leads30d: number;
  openQuestions: number;
  usersTotal: number;
  documentsTotal: number;
  sectionsTotal: number;
  sectionsUnverified: number;
  perDay: { day: string; conversations: number; minutes: number; leads: number }[];
  topTopics: { topic: string; count: number }[];
  outcomes: { outcome: string; count: number }[];
  byHour: { hour: number; count: number }[];
  topRefs: { ref: string; count: number }[];
  recent: (typeof schema.conversations.$inferSelect)[];
}

const DAY = 24 * 60 * 60 * 1000;

export async function getDashboardStats(days = 30): Promise<DashboardStats> {
  const d = await db();
  const since = new Date(Date.now() - days * DAY);
  const since7 = new Date(Date.now() - 7 * DAY);

  const [[tot], [c7], [c30], [dur], [leadsTot], [leads30], [oq], [usersTot], [docsTot], [secTot], [secUnv]] = await Promise.all([
    d.select({ n: count() }).from(schema.conversations),
    d.select({ n: count() }).from(schema.conversations).where(gte(schema.conversations.startedAt, since7)),
    d.select({ n: count() }).from(schema.conversations).where(gte(schema.conversations.startedAt, since)),
    d.select({ avg: sql<number>`coalesce(avg(${schema.conversations.durationS}),0)`, sum: sql<number>`coalesce(sum(${schema.conversations.durationS}),0)` }).from(schema.conversations),
    d.select({ n: count() }).from(schema.leads),
    d.select({ n: count() }).from(schema.leads).where(gte(schema.leads.createdAt, since)),
    d.select({ n: count() }).from(schema.openQuestions).where(eq(schema.openQuestions.status, 'offen')),
    d.select({ n: count() }).from(schema.users),
    d.select({ n: count() }).from(schema.documents),
    d.select({ n: count() }).from(schema.knowledgeSections),
    d.select({ n: count() }).from(schema.knowledgeSections).where(and(eq(schema.knowledgeSections.verified, false), eq(schema.knowledgeSections.enabled, true))),
  ]);

  const perDayRows = await d
    .select({
      day: sql<string>`to_char(${schema.conversations.startedAt} at time zone 'Europe/Berlin', 'YYYY-MM-DD')`,
      conversations: count(),
      minutes: sql<number>`coalesce(sum(${schema.conversations.durationS}),0) / 60.0`,
      leads: sql<number>`count(${schema.conversations.leadId})`,
    })
    .from(schema.conversations)
    .where(gte(schema.conversations.startedAt, since))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const perDayMap = new Map(perDayRows.map((r) => [r.day, r]));
  const perDay: DashboardStats['perDay'] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date(Date.now() - i * DAY));
    const r = perDayMap.get(day);
    perDay.push({ day, conversations: Number(r?.conversations ?? 0), minutes: Math.round(Number(r?.minutes ?? 0)), leads: Number(r?.leads ?? 0) });
  }

  const topicRows = await d
    .select({ topic: sql<string>`t`, count: count() })
    .from(sql`${schema.conversations}, jsonb_array_elements_text(${schema.conversations.topics}) as t`)
    .where(gte(schema.conversations.startedAt, since))
    .groupBy(sql`t`)
    .orderBy(desc(count()))
    .limit(10);

  const outcomeRows = await d
    .select({ outcome: schema.conversations.outcome, count: count() })
    .from(schema.conversations)
    .where(gte(schema.conversations.startedAt, since))
    .groupBy(schema.conversations.outcome);

  const hourRows = await d
    .select({ hour: sql<number>`extract(hour from ${schema.conversations.startedAt} at time zone 'Europe/Berlin')::int`, count: count() })
    .from(schema.conversations)
    .where(gte(schema.conversations.startedAt, since))
    .groupBy(sql`1`);
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: Number(hourRows.find((r) => Number(r.hour) === h)?.count ?? 0) }));

  const refRows = await d
    .select({ ref: schema.conversations.refUsername, count: count() })
    .from(schema.conversations)
    .where(and(gte(schema.conversations.startedAt, since), sql`${schema.conversations.refUsername} is not null`))
    .groupBy(schema.conversations.refUsername)
    .orderBy(desc(count()))
    .limit(10);

  const recent = await d.select().from(schema.conversations).orderBy(desc(schema.conversations.startedAt)).limit(8);

  return {
    conversationsTotal: Number(tot.n),
    conversations7d: Number(c7.n),
    conversations30d: Number(c30.n),
    avgDurationS: Math.round(Number(dur.avg)),
    totalMinutes: Math.round(Number(dur.sum) / 60),
    leadsTotal: Number(leadsTot.n),
    leads30d: Number(leads30.n),
    openQuestions: Number(oq.n),
    usersTotal: Number(usersTot.n),
    documentsTotal: Number(docsTot.n),
    sectionsTotal: Number(secTot.n),
    sectionsUnverified: Number(secUnv.n),
    perDay,
    topTopics: topicRows.map((r) => ({ topic: r.topic, count: Number(r.count) })),
    outcomes: outcomeRows.map((r) => ({ outcome: r.outcome, count: Number(r.count) })),
    byHour,
    topRefs: refRows.map((r) => ({ ref: r.ref ?? '', count: Number(r.count) })),
    recent,
  };
}

export async function getUserStats(userId: number) {
  const d = await db();
  const [[c], [dur]] = await Promise.all([
    d.select({ n: count() }).from(schema.conversations).where(eq(schema.conversations.userId, userId)),
    d.select({ sum: sql<number>`coalesce(sum(${schema.conversations.durationS}),0)` }).from(schema.conversations).where(eq(schema.conversations.userId, userId)),
  ]);
  return { conversations: Number(c.n), minutes: Math.round(Number(dur.sum) / 60) };
}
