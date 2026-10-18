/**
 * Datenbank-Schema von CLOSER (Postgres, Drizzle ORM).
 *
 * Das Schema wird zur Laufzeit additiv angelegt (siehe bootstrap.ts), damit
 * kein separater Migrationsschritt beim Deployment nötig ist. Neue Spalten
 * werden dort per `ADD COLUMN IF NOT EXISTS` ergänzt.
 */

import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export type Role = 'admin' | 'team' | 'user';

/** Konten für Admin, Team und Mitglieder (User). */
export const users = pgTable('closer_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default(''),
  role: text('role').$type<Role>().notNull().default('user'),
  /** Team-Rechte als Liste von Modul-Schlüsseln (z. B. "wissen", "leads"). */
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdBy: integer('created_by'),
});

/** Schlüssel/Wert-Einstellungen (Persona, Stimme, Texte, Design, Schalter). */
export const settings = pgTable('closer_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer('updated_by'),
});

export type KnowledgeSource = 'seed' | 'manual' | 'bridge' | 'document' | 'ai';

/** Wissensabschnitte, aus denen der Systemprompt gebaut wird. */
export const knowledgeSections = pgTable('closer_knowledge_sections', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  verified: boolean('verified').notNull().default(false),
  enabled: boolean('enabled').notNull().default(true),
  source: text('source').$type<KnowledgeSource>().notNull().default('manual'),
  sortOrder: integer('sort_order').notNull().default(100),
  documentId: integer('document_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer('updated_by'),
});

export type DocumentStatus = 'uploaded' | 'processing' | 'done' | 'error' | 'manual';

/** Hochgeladene Dateien (PDF, Word, Text, Bild, Audio, Video) und ihr ausgelesener Text. */
export const documents = pgTable('closer_documents', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  mime: text('mime').notNull().default(''),
  size: integer('size').notNull().default(0),
  blobUrl: text('blob_url').notNull(),
  blobPathname: text('blob_pathname').notNull().default(''),
  status: text('status').$type<DocumentStatus>().notNull().default('uploaded'),
  error: text('error'),
  extractedText: text('extracted_text'),
  summary: text('summary'),
  charCount: integer('char_count').notNull().default(0),
  uploadedBy: integer('uploaded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  at?: number;
}

/** Ein Gespräch mit CLOSER (Web-Voice oder Text). */
export const conversations = pgTable('closer_conversations', {
  id: serial('id').primaryKey(),
  /** Eigene Kennung im Format clsr-YYYYMMDD-xxxxxxxxxxxx. */
  conversationId: text('conversation_id').notNull().unique(),
  vapiCallId: text('vapi_call_id'),
  visitorId: text('visitor_id'),
  userId: integer('user_id'),
  refUsername: text('ref_username'),
  channel: text('channel').notNull().default('web'),
  language: text('language').notNull().default('de'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationS: integer('duration_s').notNull().default(0),
  messagesCount: integer('messages_count').notNull().default(0),
  transcript: jsonb('transcript').$type<TranscriptEntry[]>().notNull().default([]),
  summary: text('summary'),
  topics: jsonb('topics').$type<string[]>().notNull().default([]),
  outcome: text('outcome').notNull().default('info'),
  endedReason: text('ended_reason'),
  leadId: integer('lead_id'),
  costUsd: numeric('cost_usd'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Interessenten, die CLOSER im Gespräch erfasst hat. */
export const leads = pgTable('closer_leads', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  interest: text('interest'),
  language: text('language').notNull().default('de'),
  sponsorUsername: text('sponsor_username'),
  consent: boolean('consent').notNull().default(false),
  consentText: text('consent_text'),
  status: text('status').notNull().default('neu'),
  platformLeadId: integer('platform_lead_id'),
  platformSyncStatus: text('platform_sync_status').notNull().default('offen'),
  platformSyncError: text('platform_sync_error'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Ereignisse für Statistik (Seitenaufruf, Start, Ende, Fehler …). */
export const events = pgTable('closer_events', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  conversationId: text('conversation_id'),
  visitorId: text('visitor_id'),
  userId: integer('user_id'),
  path: text('path'),
  meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Fragen, auf die CLOSER keine Antwort wusste. */
export const openQuestions = pgTable('closer_open_questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  normalized: text('normalized').notNull().unique(),
  count: integer('count').notNull().default(1),
  language: text('language').notNull().default('de'),
  status: text('status').notNull().default('offen'),
  answerSectionId: integer('answer_section_id'),
  lastAskedAt: timestamp('last_asked_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Zwischenspeicher der Plattform-Brücke je Bereich. */
export const bridgeCache = pgTable('closer_bridge_cache', {
  area: text('area').primaryKey(),
  hash: text('hash'),
  data: jsonb('data').$type<unknown>(),
  status: text('status').notNull().default('leer'),
  error: text('error'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
});

/** Änderungsprotokoll im Admin. */
export const auditLog = pgTable('closer_audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  action: text('action').notNull(),
  target: text('target'),
  meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type KnowledgeSection = typeof knowledgeSections.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type OpenQuestion = typeof openQuestions.$inferSelect;
export type BridgeCacheRow = typeof bridgeCache.$inferSelect;
