'use server';

/**
 * Server-Aktionen für Login, Setup, Einstellungen, Wissen, Dateien, Nutzer,
 * Leads, offene Fragen und Brücke. Jede Aktion prüft die Berechtigung selbst.
 */

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, hasDatabase, schema } from '@/lib/db';
import { passwordPolicyError, verifyPassword } from '@/lib/auth/password';
import { clearSessionCookie, createSessionToken, getCurrentUser, setSessionCookie } from '@/lib/auth/session';
import { TEAM_MODULES, hasModule, homeFor } from '@/lib/auth/guards';
import { audit } from './audit';
import { getDocument, processDocument, suggestSections } from './documents';
import { seedSectionsIfEmpty, slugify } from './knowledge';
import { DEFAULT_SETTINGS, getSettings, saveSetting, type AllSettings, type SettingsKey } from './settings';
import { countUsers, createUser, findUserByEmail, touchLogin, updateUser } from './users';
import { pushLeadToPlatform } from '@/lib/bridge/outbound';
import { syncBridge } from '@/lib/bridge/sync';
import type { Role } from '@/lib/db/schema';

export interface ActionResult {
  ok: boolean;
  message: string;
  id?: number;
}

const fail = (message: string): ActionResult => ({ ok: false, message });
const done = (message = 'Gespeichert.', id?: number): ActionResult => ({ ok: true, message, id });

function str(fd: FormData, key: string, max = 20000): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.slice(0, max) : '';
}
function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === 'on' || v === 'true' || v === '1';
}
function num(fd: FormData, key: string, fallback: number, min?: number, max?: number): number {
  const n = Number(str(fd, key, 20).replace(',', '.'));
  if (!Number.isFinite(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}
function id(fd: FormData, key = 'id'): number {
  return Number.parseInt(str(fd, key, 20), 10) || 0;
}
/** Basis-Pfad des aufrufenden Bereichs (/admin oder /team) für Weiterleitungen. */
function base(fd: FormData): '/admin' | '/team' {
  return str(fd, 'base', 10) === '/team' ? '/team' : '/admin';
}

async function requireModuleAction(moduleKey: string) {
  const user = await getCurrentUser();
  if (!user || !hasModule(user, moduleKey)) throw new Error('Keine Berechtigung.');
  return user;
}
async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Nur für Administratoren.');
  return user;
}

function revalidateAll() {
  revalidatePath('/', 'layout');
}

/* ------------------------------------------------------------------ */
/*  Login / Setup / Registrierung                                       */
/* ------------------------------------------------------------------ */

export async function loginAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!hasDatabase()) return fail('Keine Datenbank verbunden. Bitte DATABASE_URL in Vercel setzen.');
  const email = str(fd, 'email', 200).trim().toLowerCase();
  const password = str(fd, 'password', 200);
  const next = str(fd, 'next', 300);
  if (!email || !password) return fail('Bitte E-Mail und Passwort eingeben.');
  const user = await findUserByEmail(email);
  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    await new Promise((r) => setTimeout(r, 400));
    return fail('E-Mail oder Passwort stimmen nicht.');
  }
  await setSessionCookie(await createSessionToken(user));
  await touchLogin(user.id);
  await audit(user.id, 'login');
  redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : homeFor(user.role));
}

export async function logoutAction() {
  const user = await getCurrentUser().catch(() => null);
  await clearSessionCookie();
  if (user) await audit(user.id, 'logout');
  redirect('/login');
}

export async function setupAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!hasDatabase()) return fail('Keine Datenbank verbunden. Bitte DATABASE_URL in Vercel setzen.');
  if ((await countUsers()) > 0) return fail('Die Einrichtung wurde bereits abgeschlossen.');
  const email = str(fd, 'email', 200).trim().toLowerCase();
  const name = str(fd, 'name', 100).trim() || 'Admin';
  const password = str(fd, 'password', 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Bitte eine gültige E-Mail-Adresse eingeben.');
  const pw = passwordPolicyError(password);
  if (pw) return fail(pw);
  if (password !== str(fd, 'password2', 200)) return fail('Die Passwörter stimmen nicht überein.');
  const user = await createUser({ email, name, password, role: 'admin' });
  await seedSectionsIfEmpty(user.id);
  await setSessionCookie(await createSessionToken(user));
  await audit(user.id, 'setup', 'admin');
  redirect('/admin');
}

export async function registerAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!hasDatabase()) return fail('Keine Datenbank verbunden.');
  const settings = await getSettings();
  if (!settings.features.selfRegistration) return fail('Die Registrierung ist derzeit geschlossen.');
  const email = str(fd, 'email', 200).trim().toLowerCase();
  const name = str(fd, 'name', 100).trim();
  const password = str(fd, 'password', 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Bitte eine gültige E-Mail-Adresse eingeben.');
  if (!name) return fail('Bitte einen Namen eingeben.');
  const pw = passwordPolicyError(password);
  if (pw) return fail(pw);
  if (await findUserByEmail(email)) return fail('Diese E-Mail-Adresse ist bereits registriert.');
  const user = await createUser({ email, name, password, role: 'user' });
  await setSessionCookie(await createSessionToken(user));
  await audit(user.id, 'register');
  redirect('/mein');
}

export async function changePasswordAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail('Nicht angemeldet.');
  const current = str(fd, 'current', 200);
  const next = str(fd, 'password', 200);
  if (!(await verifyPassword(current, user.passwordHash))) return fail('Das aktuelle Passwort stimmt nicht.');
  const pw = passwordPolicyError(next);
  if (pw) return fail(pw);
  if (next !== str(fd, 'password2', 200)) return fail('Die neuen Passwörter stimmen nicht überein.');
  await updateUser(user.id, { password: next });
  await audit(user.id, 'password.change');
  return done('Passwort geändert.');
}

export async function updateProfileAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail('Nicht angemeldet.');
  const name = str(fd, 'name', 100).trim();
  if (!name) return fail('Bitte einen Namen eingeben.');
  await updateUser(user.id, { name });
  revalidateAll();
  return done('Profil gespeichert.');
}

/* ------------------------------------------------------------------ */
/*  Einstellungen                                                       */
/* ------------------------------------------------------------------ */

const MODULE_FOR_KEY: Record<SettingsKey, string> = {
  persona: 'persona',
  voice: 'persona',
  model: 'persona',
  texts: 'texte',
  design: 'texte',
  features: 'admin',
  privacy: 'admin',
};

function parseSettings(key: SettingsKey, fd: FormData, current: AllSettings): Partial<AllSettings[SettingsKey]> {
  switch (key) {
    case 'persona':
      return {
        name: str(fd, 'name', 60).trim() || DEFAULT_SETTINGS.persona.name,
        tagline: str(fd, 'tagline', 200).trim(),
        greeting: str(fd, 'greeting', 1000).trim() || DEFAULT_SETTINGS.persona.greeting,
        systemPrompt: str(fd, 'systemPrompt', 60000).trim() || DEFAULT_SETTINGS.persona.systemPrompt,
        imageUrl: str(fd, 'imageUrl', 500).trim() || DEFAULT_SETTINGS.persona.imageUrl,
        language: str(fd, 'language', 10).trim() || 'de',
        formOfAddress: str(fd, 'formOfAddress', 5) === 'Sie' ? 'Sie' : 'du',
      } satisfies Partial<AllSettings['persona']>;
    case 'voice': {
      const model = str(fd, 'model', 40);
      return {
        voiceId: str(fd, 'voiceId', 80).trim() || DEFAULT_SETTINGS.voice.voiceId,
        voiceName: str(fd, 'voiceName', 120).trim(),
        model: (['eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_flash_v2_5'].includes(model) ? model : 'eleven_turbo_v2_5') as AllSettings['voice']['model'],
        stability: num(fd, 'stability', current.voice.stability, 0, 1),
        similarityBoost: num(fd, 'similarityBoost', current.voice.similarityBoost, 0, 1),
        style: num(fd, 'style', current.voice.style, 0, 1),
        useSpeakerBoost: bool(fd, 'useSpeakerBoost'),
        speed: num(fd, 'speed', current.voice.speed, 0.7, 1.2),
      } satisfies Partial<AllSettings['voice']>;
    }
    case 'model': {
      const tm = str(fd, 'transcriberModel', 20);
      const tl = str(fd, 'transcriberLanguage', 10);
      return {
        model: str(fd, 'model', 60).trim() || 'gpt-4o-mini',
        temperature: num(fd, 'temperature', current.model.temperature, 0, 1.5),
        transcriberModel: (tm === 'nova-3' ? 'nova-3' : 'nova-2') as AllSettings['model']['transcriberModel'],
        transcriberLanguage: (tl === 'multi' ? 'multi' : 'de') as AllSettings['model']['transcriberLanguage'],
      } satisfies Partial<AllSettings['model']>;
    }
    case 'texts':
      return {
        eyebrow: str(fd, 'eyebrow', 120),
        heroTitleLine1: str(fd, 'heroTitleLine1', 120),
        heroTitleLine2: str(fd, 'heroTitleLine2', 160),
        heroDescription: str(fd, 'heroDescription', 1000),
        buttonStart: str(fd, 'buttonStart', 60) || DEFAULT_SETTINGS.texts.buttonStart,
        features: str(fd, 'features', 600).split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6),
        privacyNote: str(fd, 'privacyNote', 500),
        footer: str(fd, 'footer', 1000),
        pageTitle: str(fd, 'pageTitle', 120) || DEFAULT_SETTINGS.texts.pageTitle,
        pageDescription: str(fd, 'pageDescription', 300),
        statusDisconnected: str(fd, 'statusDisconnected', 120) || DEFAULT_SETTINGS.texts.statusDisconnected,
      } satisfies Partial<AllSettings['texts']>;
    case 'design': {
      const color = (k: string, fb: string) => (/^#[0-9a-fA-F]{6}$/.test(str(fd, k, 10).trim()) ? str(fd, k, 10).trim() : fb);
      return {
        accent: color('accent', current.design.accent),
        accentLight: color('accentLight', current.design.accentLight),
        accentDark: color('accentDark', current.design.accentDark),
        background: color('background', current.design.background),
        showTranscript: bool(fd, 'showTranscript'),
        supportsChatInput: bool(fd, 'supportsChatInput'),
      } satisfies Partial<AllSettings['design']>;
    }
    case 'features':
      return {
        leadCapture: bool(fd, 'leadCapture'),
        leadsToPlatform: bool(fd, 'leadsToPlatform'),
        conversationsToPlatform: bool(fd, 'conversationsToPlatform'),
        feedbackToPlatform: bool(fd, 'feedbackToPlatform'),
        storeTranscripts: bool(fd, 'storeTranscripts'),
        selfRegistration: bool(fd, 'selfRegistration'),
        publicAccess: bool(fd, 'publicAccess'),
        bridgeAutoSync: bool(fd, 'bridgeAutoSync'),
        useSeedKnowledge: bool(fd, 'useSeedKnowledge'),
      } satisfies Partial<AllSettings['features']>;
    case 'privacy':
      return {
        consentText: str(fd, 'consentText', 2000).trim() || DEFAULT_SETTINGS.privacy.consentText,
        aiDisclosure: str(fd, 'aiDisclosure', 500).trim(),
      } satisfies Partial<AllSettings['privacy']>;
  }
}

export async function saveSettingsAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const key = str(fd, '_key', 20) as SettingsKey;
  if (!(key in DEFAULT_SETTINGS)) return fail('Unbekannter Bereich.');
  const mod = MODULE_FOR_KEY[key];
  let user;
  try {
    user = mod === 'admin' ? await requireAdminAction() : await requireModuleAction(mod);
  } catch (e) {
    return fail((e as Error).message);
  }
  try {
    const current = await getSettings();
    await saveSetting(key, parseSettings(key, fd, current) as Partial<AllSettings[typeof key]>, user.id);
    await audit(user.id, 'settings.save', key);
    revalidateAll();
    return done();
  } catch (e) {
    return fail(`Speichern fehlgeschlagen: ${(e as Error).message}`);
  }
}

export async function resetSettingsAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const key = str(fd, '_key', 20) as SettingsKey;
  if (!(key in DEFAULT_SETTINGS)) return fail('Unbekannter Bereich.');
  let user;
  try {
    user = await requireAdminAction();
  } catch (e) {
    return fail((e as Error).message);
  }
  const d = await db();
  await d.delete(schema.settings).where(eq(schema.settings.key, key));
  await audit(user.id, 'settings.reset', key);
  revalidateAll();
  return done('Auf Standardwerte zurückgesetzt.');
}

export async function resetSettingsFormAction(fd: FormData): Promise<void> {
  await resetSettingsAction(null, fd);
}

/* ------------------------------------------------------------------ */
/*  Wissen                                                              */
/* ------------------------------------------------------------------ */

export async function saveSectionAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('wissen');
  } catch (e) {
    return fail((e as Error).message);
  }
  const sectionId = id(fd);
  const title = str(fd, 'title', 200).trim();
  const content = str(fd, 'content', 60000).trim();
  if (!title) return fail('Bitte einen Titel eingeben.');
  const verified = bool(fd, 'verified');
  const enabled = bool(fd, 'enabled');
  const sortOrder = num(fd, 'sortOrder', 100, 0, 100000);
  const d = await db();
  if (sectionId) {
    await d
      .update(schema.knowledgeSections)
      .set({ title, content, verified, enabled, sortOrder, updatedAt: new Date(), updatedBy: user.id })
      .where(eq(schema.knowledgeSections.id, sectionId));
    await audit(user.id, 'knowledge.update', String(sectionId), { title });
    revalidateAll();
    return done('Abschnitt gespeichert.', sectionId);
  }
  let slug = str(fd, 'slug', 60).trim() || slugify(title);
  const exists = await d.query.knowledgeSections.findFirst({ where: eq(schema.knowledgeSections.slug, slug) });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;
  const documentId = id(fd, 'documentId') || null;
  const [row] = await d
    .insert(schema.knowledgeSections)
    .values({ slug, title, content, verified, enabled, sortOrder, source: documentId ? 'document' : 'manual', documentId, updatedBy: user.id })
    .returning();
  await audit(user.id, 'knowledge.create', String(row.id), { title });
  revalidateAll();
  return done('Abschnitt angelegt.', row.id);
}

export async function toggleSectionAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('wissen');
  const sectionId = id(fd);
  const field = str(fd, 'field', 20);
  const value = bool(fd, 'value');
  const d = await db();
  if (field === 'verified') await d.update(schema.knowledgeSections).set({ verified: value, updatedAt: new Date(), updatedBy: user.id }).where(eq(schema.knowledgeSections.id, sectionId));
  if (field === 'enabled') await d.update(schema.knowledgeSections).set({ enabled: value, updatedAt: new Date(), updatedBy: user.id }).where(eq(schema.knowledgeSections.id, sectionId));
  await audit(user.id, `knowledge.${field}`, String(sectionId), { value });
  revalidateAll();
}

export async function deleteSectionAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('wissen');
  const sectionId = id(fd);
  const d = await db();
  await d.delete(schema.knowledgeSections).where(eq(schema.knowledgeSections.id, sectionId));
  await audit(user.id, 'knowledge.delete', String(sectionId));
  revalidateAll();
  redirect(`${base(fd)}/wissen`);
}

export async function seedSectionsAction(): Promise<void> {
  const user = await requireModuleAction('wissen');
  const n = await seedSectionsIfEmpty(user.id);
  await audit(user.id, 'knowledge.seed', undefined, { inserted: n });
  revalidateAll();
}

/* ------------------------------------------------------------------ */
/*  Dateien                                                             */
/* ------------------------------------------------------------------ */

const RegisterDoc = z.object({
  url: z.string().url(),
  pathname: z.string().max(500),
  filename: z.string().min(1).max(300),
  mime: z.string().max(120),
  size: z.number().int().min(0),
});

/** Wird vom Browser nach dem Blob-Upload aufgerufen. */
export async function registerDocumentAction(input: unknown): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('dateien');
  } catch (e) {
    return fail((e as Error).message);
  }
  const parsed = RegisterDoc.safeParse(input);
  if (!parsed.success) return fail('Ungültige Upload-Daten.');
  const d = await db();
  const [row] = await d
    .insert(schema.documents)
    .values({ filename: parsed.data.filename, mime: parsed.data.mime, size: parsed.data.size, blobUrl: parsed.data.url, blobPathname: parsed.data.pathname, uploadedBy: user.id })
    .returning();
  await audit(user.id, 'document.upload', String(row.id), { filename: row.filename, size: row.size });
  revalidateAll();
  // Direkt auslesen (kleine Dateien sofort; große Audio/Video werden im Hintergrund verarbeitet).
  await processDocument(row.id).catch(() => null);
  revalidateAll();
  return done('Datei hochgeladen.', row.id);
}

/** Text direkt einfügen (ohne Datei). */
export async function createTextDocumentAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('dateien');
  } catch (e) {
    return fail((e as Error).message);
  }
  const title = str(fd, 'title', 200).trim() || 'Eingefügter Text';
  const text = str(fd, 'text', 200000).trim();
  if (!text) return fail('Bitte Text einfügen.');
  const d = await db();
  const [row] = await d
    .insert(schema.documents)
    .values({ filename: title, mime: 'text/plain', size: text.length, blobUrl: '', blobPathname: '', status: 'done', extractedText: text, charCount: text.length, uploadedBy: user.id, processedAt: new Date() })
    .returning();
  await audit(user.id, 'document.text', String(row.id), { title });
  revalidateAll();
  redirect(`${base(fd)}/dateien/${row.id}`);
}

export async function processDocumentAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('dateien');
  const docId = id(fd);
  await processDocument(docId);
  await audit(user.id, 'document.process', String(docId));
  revalidateAll();
}

export async function saveDocumentTextAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('dateien');
  } catch (e) {
    return fail((e as Error).message);
  }
  const docId = id(fd);
  const text = str(fd, 'text', 200000);
  const d = await db();
  await d
    .update(schema.documents)
    .set({ extractedText: text, charCount: text.length, status: 'done', error: null, processedAt: new Date() })
    .where(eq(schema.documents.id, docId));
  await audit(user.id, 'document.text.edit', String(docId));
  revalidateAll();
  return done('Text gespeichert.');
}

export async function deleteDocumentAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('dateien');
  const docId = id(fd);
  const doc = await getDocument(docId);
  if (doc?.blobPathname && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { del } = await import('@vercel/blob');
      await del(doc.blobUrl);
    } catch {
      /* Blob bereits weg */
    }
  }
  const d = await db();
  await d.update(schema.knowledgeSections).set({ documentId: null }).where(eq(schema.knowledgeSections.documentId, docId));
  await d.delete(schema.documents).where(eq(schema.documents.id, docId));
  await audit(user.id, 'document.delete', String(docId));
  revalidateAll();
  redirect(`${base(fd)}/dateien`);
}

export interface SuggestResult extends ActionResult {
  sections?: { title: string; content: string }[];
}

export async function suggestSectionsAction(_prev: SuggestResult | null, fd: FormData): Promise<SuggestResult> {
  try {
    await requireModuleAction('wissen');
  } catch (e) {
    return fail((e as Error).message);
  }
  const docId = id(fd);
  const doc = await getDocument(docId);
  if (!doc?.extractedText) return fail('Für diese Datei liegt noch kein Text vor.');
  try {
    const sections = await suggestSections(doc.extractedText, doc.filename);
    if (!sections.length) return fail('Die KI hat keine verwertbaren Abschnitte gefunden.');
    return { ok: true, message: `${sections.length} Vorschläge erstellt. Bitte prüfen und übernehmen.`, sections };
  } catch (e) {
    return fail((e as Error).message);
  }
}

export async function adoptSuggestionsAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('wissen');
  } catch (e) {
    return fail((e as Error).message);
  }
  const docId = id(fd, 'documentId') || null;
  const raw = str(fd, 'sections', 200000);
  let items: { title: string; content: string }[] = [];
  try {
    items = JSON.parse(raw) as { title: string; content: string }[];
  } catch {
    return fail('Ungültige Vorschläge.');
  }
  const chosen = fd.getAll('adopt').map(String);
  const d = await db();
  let n = 0;
  for (const [i, it] of items.entries()) {
    if (!chosen.includes(String(i))) continue;
    if (!it.title || !it.content) continue;
    let slug = slugify(it.title);
    const exists = await d.query.knowledgeSections.findFirst({ where: eq(schema.knowledgeSections.slug, slug) });
    if (exists) slug = `${slug}-${Date.now().toString(36)}${i}`;
    await d.insert(schema.knowledgeSections).values({
      slug,
      title: it.title.slice(0, 200),
      content: it.content.slice(0, 60000),
      verified: false,
      enabled: true,
      source: 'ai',
      documentId: docId,
      sortOrder: 500,
      updatedBy: user.id,
    });
    n++;
  }
  await audit(user.id, 'knowledge.adopt', docId ? String(docId) : undefined, { inserted: n });
  revalidateAll();
  return done(`${n} Abschnitt(e) übernommen – noch unbestätigt. Bitte prüfen und freigeben.`);
}

/* ------------------------------------------------------------------ */
/*  Benutzer (nur Admin)                                                */
/* ------------------------------------------------------------------ */

export async function saveUserAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdminAction();
  } catch (e) {
    return fail((e as Error).message);
  }
  const userId = id(fd);
  const roleRaw = str(fd, 'role', 10);
  const role: Role = roleRaw === 'admin' ? 'admin' : roleRaw === 'team' ? 'team' : 'user';
  const name = str(fd, 'name', 100).trim();
  const permissions = fd.getAll('permissions').map(String).filter((p) => TEAM_MODULES.some((m) => m.key === p));
  const password = str(fd, 'password', 200);
  const isActive = bool(fd, 'isActive');
  if (!name) return fail('Bitte einen Namen eingeben.');
  if (userId) {
    if (userId === admin.id && role !== 'admin') return fail('Du kannst dir selbst die Admin-Rolle nicht entziehen.');
    if (userId === admin.id && !isActive) return fail('Du kannst dich nicht selbst deaktivieren.');
    if (password) {
      const pw = passwordPolicyError(password);
      if (pw) return fail(pw);
    }
    await updateUser(userId, { name, role, permissions, isActive, password: password || undefined });
    await audit(admin.id, 'user.update', String(userId), { role, permissions });
    revalidateAll();
    return done('Benutzer gespeichert.');
  }
  const email = str(fd, 'email', 200).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Bitte eine gültige E-Mail-Adresse eingeben.');
  const pw = passwordPolicyError(password);
  if (pw) return fail(pw);
  if (await findUserByEmail(email)) return fail('Diese E-Mail-Adresse existiert bereits.');
  const row = await createUser({ email, name, password, role, permissions, createdBy: admin.id });
  await audit(admin.id, 'user.create', String(row.id), { role });
  revalidateAll();
  return done('Benutzer angelegt.', row.id);
}

export async function deleteUserAction(fd: FormData): Promise<void> {
  const admin = await requireAdminAction();
  const userId = id(fd);
  if (userId === admin.id) throw new Error('Du kannst dich nicht selbst löschen.');
  const d = await db();
  await d.delete(schema.users).where(eq(schema.users.id, userId));
  await audit(admin.id, 'user.delete', String(userId));
  revalidateAll();
  redirect('/admin/benutzer');
}

/* ------------------------------------------------------------------ */
/*  Leads, Gespräche, offene Fragen                                     */
/* ------------------------------------------------------------------ */

export async function updateLeadAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('leads');
  } catch (e) {
    return fail((e as Error).message);
  }
  const leadId = id(fd);
  const status = str(fd, 'status', 30) || 'neu';
  const notes = str(fd, 'notes', 5000);
  const d = await db();
  await d.update(schema.leads).set({ status, notes }).where(eq(schema.leads.id, leadId));
  await audit(user.id, 'lead.update', String(leadId), { status });
  revalidateAll();
  return done('Lead gespeichert.');
}

export async function pushLeadAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('leads');
  const leadId = id(fd);
  const d = await db();
  const lead = await d.query.leads.findFirst({ where: eq(schema.leads.id, leadId) });
  if (lead) {
    await pushLeadToPlatform(lead);
    await audit(user.id, 'lead.push', String(leadId));
  }
  revalidateAll();
}

export async function deleteLeadAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('leads');
  const leadId = id(fd);
  const d = await db();
  await d.delete(schema.leads).where(eq(schema.leads.id, leadId));
  await audit(user.id, 'lead.delete', String(leadId));
  revalidateAll();
}

export async function deleteConversationAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('gespraeche');
  const convId = id(fd);
  const d = await db();
  await d.delete(schema.conversations).where(eq(schema.conversations.id, convId));
  await audit(user.id, 'conversation.delete', String(convId));
  revalidateAll();
  redirect(`${base(fd)}/gespraeche`);
}

export async function resolveQuestionAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('fragen');
  const qid = id(fd);
  const status = str(fd, 'status', 20) || 'erledigt';
  const d = await db();
  await d.update(schema.openQuestions).set({ status }).where(eq(schema.openQuestions.id, qid));
  await audit(user.id, 'question.status', String(qid), { status });
  revalidateAll();
}

export async function answerQuestionAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireModuleAction('fragen');
  } catch (e) {
    return fail((e as Error).message);
  }
  const qid = id(fd);
  const title = str(fd, 'title', 200).trim();
  const content = str(fd, 'content', 60000).trim();
  if (!title || !content) return fail('Bitte Titel und Antwort eingeben.');
  const d = await db();
  let slug = slugify(title);
  if (await d.query.knowledgeSections.findFirst({ where: eq(schema.knowledgeSections.slug, slug) })) slug = `${slug}-${Date.now().toString(36)}`;
  const [row] = await d
    .insert(schema.knowledgeSections)
    .values({ slug, title, content, verified: bool(fd, 'verified'), enabled: true, source: 'manual', sortOrder: 600, updatedBy: user.id })
    .returning();
  await d.update(schema.openQuestions).set({ status: 'beantwortet', answerSectionId: row.id }).where(eq(schema.openQuestions.id, qid));
  await audit(user.id, 'question.answer', String(qid), { sectionId: row.id });
  revalidateAll();
  return done('Antwort als Wissensabschnitt angelegt.', row.id);
}

/* ------------------------------------------------------------------ */
/*  Brücke                                                              */
/* ------------------------------------------------------------------ */

export async function syncBridgeAction(fd: FormData): Promise<void> {
  const user = await requireModuleAction('anbindung');
  const force = bool(fd, 'force');
  const report = await syncBridge({ force });
  await audit(user.id, 'bridge.sync', undefined, { ok: report.health.ok, force });
  revalidateAll();
}

/** Nur für Statistik-Seiten: Zeitraum merken (Cookie-los, per Query). */
export async function noopAction(): Promise<void> {
  /* Platzhalter für Formulare ohne Aktion */
}
