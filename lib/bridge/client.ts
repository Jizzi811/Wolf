/**
 * Client für die signierte Brücke zur Plattform (Paket P18).
 * 1:1 nach der Rückmeldung des Plattform-Chats: HMAC-SHA256 über
 * Timestamp \n Nonce \n METHODE \n ZIEL \n sha256(Body).
 */

import { createHash, createHmac, randomBytes } from 'node:crypto';

export type BridgeRoute =
  | 'health'
  | 'catalog'
  | 'webinars'
  | 'channels'
  | 'content'
  | 'knowledge'
  | 'changes'
  | 'lead'
  | 'conversation'
  | 'feedback';

export interface BridgeEnvelope<T = unknown> {
  ok: boolean;
  version?: string;
  generated_at?: string;
  route?: string;
  hash?: string;
  data?: T;
  code?: string;
  error?: string;
  fields?: Record<string, string>;
}

export interface BridgeResult<T = unknown> {
  status: number;
  body: BridgeEnvelope<T> | null;
}

const enc = (s: string) =>
  encodeURIComponent(String(s)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

export function bridgeConfigured(): boolean {
  return Boolean(process.env.KCC_BRIDGE_URL && process.env.KCC_BRIDGE_SECRET);
}

export function buildRequest(opts: {
  base: string;
  secret: string;
  route: BridgeRoute;
  method?: 'GET' | 'POST';
  query?: Record<string, string | undefined>;
  body?: unknown;
  now?: number;
  nonce?: string;
}) {
  const method = (opts.method ?? 'GET').toUpperCase();
  const raw = opts.body === undefined ? '' : JSON.stringify(opts.body);
  const pairs = Object.entries(opts.query ?? {})
    .filter(([, v]) => v !== '' && v != null)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)) as [string, string][];
  const cq = pairs.map(([k, v]) => enc(k) + '=' + enc(v)).join('&');
  const target = opts.route + (cq ? '?' + cq : '');
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const nonce = opts.nonce ?? randomBytes(16).toString('hex');
  const canonical = [String(now), nonce, method, target, createHash('sha256').update(raw, 'utf8').digest('hex')].join('\n');
  const signature = createHmac('sha256', opts.secret).update(canonical, 'utf8').digest('hex');
  const url = opts.base + '?route=' + enc(opts.route) + (cq ? '&' + cq : '');
  return {
    url,
    init: {
      method,
      body: raw === '' ? undefined : raw,
      headers: {
        'Content-Type': 'application/json',
        'X-CLOSER-Timestamp': String(now),
        'X-CLOSER-Nonce': nonce,
        'X-CLOSER-Signature': signature,
      },
    } satisfies RequestInit,
    canonical,
    signature,
    target,
  };
}

export async function callBridge<T = unknown>(
  route: BridgeRoute,
  opts: { method?: 'GET' | 'POST'; query?: Record<string, string | undefined>; body?: unknown; timeoutMs?: number } = {}
): Promise<BridgeResult<T>> {
  const base = process.env.KCC_BRIDGE_URL;
  const secret = process.env.KCC_BRIDGE_SECRET;
  if (!base || !secret) {
    return { status: 0, body: { ok: false, code: 'NOT_CONFIGURED', error: 'KCC_BRIDGE_URL oder KCC_BRIDGE_SECRET fehlt.' } };
  }
  const { url, init } = buildRequest({ base, secret, route, ...opts });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: 'no-store' });
    const text = await res.text();
    let body: BridgeEnvelope<T> | null = null;
    try {
      body = text ? (JSON.parse(text) as BridgeEnvelope<T>) : null;
    } catch {
      body = null;
    }
    return { status: res.status, body };
  } catch (e) {
    return { status: 0, body: { ok: false, code: 'NETWORK', error: e instanceof Error ? e.message : String(e) } };
  } finally {
    clearTimeout(t);
  }
}

/** Gesprächs-Kennung nach Absprache: clsr-YYYYMMDD-<12 Hex>. */
export function newConversationId(date = new Date()): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `clsr-${d}-${randomBytes(6).toString('hex')}`;
}
