/**
 * Legt das Schema additiv an (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS).
 * Wird einmal pro Serverinstanz beim ersten Datenbankzugriff ausgeführt.
 * Es wird nie etwas gelöscht oder umbenannt.
 */

export const BOOTSTRAP_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS closer_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    created_by INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS closer_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS closer_knowledge_sections (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    source TEXT NOT NULL DEFAULT 'manual',
    sort_order INTEGER NOT NULL DEFAULT 100,
    document_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS closer_documents (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    mime TEXT NOT NULL DEFAULT '',
    size INTEGER NOT NULL DEFAULT 0,
    blob_url TEXT NOT NULL,
    blob_pathname TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'uploaded',
    error TEXT,
    extracted_text TEXT,
    summary TEXT,
    char_count INTEGER NOT NULL DEFAULT 0,
    uploaded_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS closer_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id TEXT NOT NULL UNIQUE,
    vapi_call_id TEXT,
    visitor_id TEXT,
    user_id INTEGER,
    ref_username TEXT,
    channel TEXT NOT NULL DEFAULT 'web',
    language TEXT NOT NULL DEFAULT 'de',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_s INTEGER NOT NULL DEFAULT 0,
    messages_count INTEGER NOT NULL DEFAULT 0,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    outcome TEXT NOT NULL DEFAULT 'info',
    ended_reason TEXT,
    lead_id INTEGER,
    cost_usd NUMERIC,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS closer_conversations_started_idx ON closer_conversations (started_at)`,
  `CREATE INDEX IF NOT EXISTS closer_conversations_user_idx ON closer_conversations (user_id)`,
  `CREATE TABLE IF NOT EXISTS closer_leads (
    id SERIAL PRIMARY KEY,
    conversation_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    interest TEXT,
    language TEXT NOT NULL DEFAULT 'de',
    sponsor_username TEXT,
    consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_text TEXT,
    status TEXT NOT NULL DEFAULT 'neu',
    platform_lead_id INTEGER,
    platform_sync_status TEXT NOT NULL DEFAULT 'offen',
    platform_sync_error TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS closer_events (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    conversation_id TEXT,
    visitor_id TEXT,
    user_id INTEGER,
    path TEXT,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS closer_events_created_idx ON closer_events (created_at)`,
  `CREATE TABLE IF NOT EXISTS closer_open_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    normalized TEXT NOT NULL UNIQUE,
    count INTEGER NOT NULL DEFAULT 1,
    language TEXT NOT NULL DEFAULT 'de',
    status TEXT NOT NULL DEFAULT 'offen',
    answer_section_id INTEGER,
    last_asked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS closer_bridge_cache (
    area TEXT PRIMARY KEY,
    hash TEXT,
    data JSONB,
    status TEXT NOT NULL DEFAULT 'leer',
    error TEXT,
    fetched_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS closer_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action TEXT NOT NULL,
    target TEXT,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];
