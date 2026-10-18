/**
 * Sitzungen als signierte Cookies (JWT, HS256). Der Signaturschlüssel kommt aus
 * AUTH_SECRET oder wird einmalig erzeugt und in den Einstellungen gespeichert,
 * damit keine zusätzliche Umgebungsvariable nötig ist.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Role, User } from '@/lib/db/schema';

export const SESSION_COOKIE = 'closer_session';
const SESSION_DAYS = 14;

let cachedSecret: Uint8Array | null = null;

export async function getAuthSecret(): Promise<Uint8Array> {
  if (cachedSecret) return cachedSecret;
  const env = process.env.AUTH_SECRET;
  if (env && env.length >= 16) {
    cachedSecret = new TextEncoder().encode(env);
    return cachedSecret;
  }
  const d = await db();
  const row = await d.query.settings.findFirst({ where: eq(schema.settings.key, 'auth.secret') });
  let secret = typeof row?.value === 'string' ? (row.value as string) : '';
  if (!secret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    await d
      .insert(schema.settings)
      .values({ key: 'auth.secret', value: secret })
      .onConflictDoNothing();
    const again = await d.query.settings.findFirst({ where: eq(schema.settings.key, 'auth.secret') });
    secret = (again?.value as string) || secret;
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export interface SessionPayload {
  uid: number;
  role: Role;
  name: string;
  email: string;
}

export async function createSessionToken(user: Pick<User, 'id' | 'role' | 'name' | 'email'>): Promise<string> {
  const secret = await getAuthSecret();
  return new SignJWT({ uid: user.id, role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = await getAuthSecret();
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.uid !== 'number') return null;
    return {
      uid: payload.uid,
      role: (payload.role as Role) ?? 'user',
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** Sitzung aus dem Cookie lesen und das Konto frisch aus der Datenbank holen. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const payload = await readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const d = await db();
  const user = await d.query.users.findFirst({ where: eq(schema.users.id, payload.uid) });
  if (!user || !user.isActive) return null;
  return user;
}
