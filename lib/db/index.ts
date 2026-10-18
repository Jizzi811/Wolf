/**
 * Datenbank-Zugriff. Produktion: Neon/Postgres über HTTP (serverless-tauglich).
 * Tests: eine PGlite-Instanz kann per `setDbForTests()` eingesetzt werden.
 */

import { sql } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { BOOTSTRAP_SQL } from './bootstrap';
import * as schema from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<any, typeof schema>;

let dbInstance: Db | null = null;
let bootstrapPromise: Promise<void> | null = null;

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

/** true, wenn eine Datenbank konfiguriert ist (sonst läuft die App im Nur-Lese-Modus). */
export function hasDatabase(): boolean {
  return Boolean(dbInstance || getDatabaseUrl());
}

/** Für Tests: eine beliebige Drizzle-Instanz (z. B. PGlite) einsetzen. */
export function setDbForTests(db: Db) {
  dbInstance = db;
  bootstrapPromise = null;
}

function createDb(): Db {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL fehlt. Bitte die Neon-Datenbank in Vercel mit dem Projekt verbinden.');
  }
  // Dynamische Imports vermeiden, damit der Bundler die Treiber sauber auflöst.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require('@neondatabase/serverless') as typeof import('@neondatabase/serverless');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require('drizzle-orm/neon-http') as typeof import('drizzle-orm/neon-http');
  return drizzle(neon(url), { schema }) as unknown as Db;
}

/** Liefert die Datenbank und stellt sicher, dass das Schema existiert. */
export async function db(): Promise<Db> {
  if (!dbInstance) dbInstance = createDb();
  if (!bootstrapPromise) {
    const inst = dbInstance;
    bootstrapPromise = (async () => {
      for (const stmt of BOOTSTRAP_SQL) {
        await inst.execute(sql.raw(stmt));
      }
    })().catch((e) => {
      bootstrapPromise = null;
      throw e;
    });
  }
  await bootstrapPromise;
  return dbInstance;
}

export { schema };
