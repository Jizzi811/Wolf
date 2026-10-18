import { desc } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

export async function audit(userId: number | null, action: string, target?: string, meta?: Record<string, unknown>) {
  try {
    const d = await db();
    await d.insert(schema.auditLog).values({ userId, action, target: target ?? null, meta: meta ?? {} });
  } catch {
    /* Protokoll darf nie den Vorgang stoppen */
  }
}

export async function recentAudit(limit = 50) {
  const d = await db();
  return d.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(limit);
}
