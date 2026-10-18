import { asc, count, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import type { Role } from '@/lib/db/schema';

export async function countUsers(): Promise<number> {
  const d = await db();
  const [r] = await d.select({ n: count() }).from(schema.users);
  return Number(r.n);
}

export async function listUsers() {
  const d = await db();
  return d.select().from(schema.users).orderBy(asc(schema.users.role), asc(schema.users.email));
}

export async function findUserByEmail(email: string) {
  const d = await db();
  return d.query.users.findFirst({ where: eq(schema.users.email, email.toLowerCase().trim()) });
}

export async function createUser(u: { email: string; password: string; name: string; role: Role; permissions?: string[]; createdBy?: number | null }) {
  const d = await db();
  const [row] = await d
    .insert(schema.users)
    .values({
      email: u.email.toLowerCase().trim(),
      passwordHash: await hashPassword(u.password),
      name: u.name.trim(),
      role: u.role,
      permissions: u.permissions ?? [],
      createdBy: u.createdBy ?? null,
    })
    .returning();
  return row;
}

export async function updateUser(id: number, patch: { name?: string; role?: Role; permissions?: string[]; isActive?: boolean; password?: string }) {
  const d = await db();
  const set: Partial<typeof schema.users.$inferInsert> = {};
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.role !== undefined) set.role = patch.role;
  if (patch.permissions !== undefined) set.permissions = patch.permissions;
  if (patch.isActive !== undefined) set.isActive = patch.isActive;
  if (patch.password) set.passwordHash = await hashPassword(patch.password);
  if (Object.keys(set).length === 0) return;
  await d.update(schema.users).set(set).where(eq(schema.users.id, id));
}

export async function touchLogin(id: number) {
  const d = await db();
  await d.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, id));
}
