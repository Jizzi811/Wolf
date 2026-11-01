import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import { buildSystemContent, greetingForLanguage } from '@/lib/admin/assistant';
import { getSettings } from '@/lib/admin/settings';
import { TOOL_DEFINITIONS, runTool } from '@/lib/admin/tools';
import { endConversation, recordEvent, startConversation } from '@/lib/admin/tracking';
import { getCurrentUser } from '@/lib/auth/session';
import { newConversationId } from '@/lib/bridge/client';
import { normalizeBrand } from '@/lib/closer/brand';
import { getLanguage } from '@/lib/closer/languages';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Msg = z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) });
const Body = z.object({
  lang: z.string().max(12).optional(),
  ref: z.string().max(64).optional(),
  v: z.string().max(64).optional(),
  conversationId: z.string().max(64).optional(),
  messages: z.array(Msg).max(60),
});

const REF_RE = /^[a-zA-Z0-9._-]{2,64}$/;

/** Textmodus für Sprachen ohne Sprachausgabe (und als Rückfall ohne Mikrofon). */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const b = parsed.data;
  const language = getLanguage(b.lang);
  const refUsername = b.ref && REF_RE.test(b.ref) ? b.ref : null;
  const settings = await getSettings();

  let userId: number | null = null;
  if (hasDatabase()) {
    const user = await getCurrentUser().catch(() => null);
    userId = user?.id ?? null;
    if (!settings.features.publicAccess && !user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const vapiKey = process.env.VAPI_PRIVATE_KEY;
  if (!openaiKey && !vapiKey) {
    return NextResponse.json({ error: 'text_mode_unavailable', message: 'Der Textmodus ist noch nicht eingerichtet (OPENAI_API_KEY oder VAPI_PRIVATE_KEY fehlt in Vercel).' }, { status: 503 });
  }

  const conversationId = b.conversationId && /^clsr-\d{8}-[a-z0-9]{12}$/i.test(b.conversationId) ? b.conversationId : newConversationId();
  const isNew = b.messages.length <= 1;
  const { content } = await buildSystemContent({ conversationId, refUsername, lang: language.lang, textMode: true }, settings);

  // Begrüßung als erste Assistenten-Nachricht, damit das Modell den Ton kennt.
  const greeting = greetingForLanguage(settings, language);
  const history = [
    { role: 'assistant' as const, content: greeting },
    ...b.messages.map((m) => ({ role: m.role, content: m.text })),
  ];

  let reply: string;
  try {
    reply = openaiKey
      ? await askOpenAI(openaiKey, settings.model.model, settings.model.temperature, content, history, settings.features.leadCapture, { conversationId, refUsername, language: language.lang })
      : await askVapi(vapiKey as string, settings.model.model, content, history);
  } catch (e) {
    console.error('chat', e);
    return NextResponse.json({ error: 'upstream', message: 'Die Antwort konnte gerade nicht erzeugt werden. Bitte noch einmal versuchen.' }, { status: 502 });
  }
  reply = normalizeBrand(reply.trim());

  if (hasDatabase()) {
    const transcript = [...b.messages, { role: 'assistant' as const, text: reply }].map((m) => ({ role: m.role, text: m.text }));
    after(async () => {
      try {
        if (isNew) {
          await startConversation({ conversationId, visitorId: b.v ?? null, userId, refUsername, userAgent: req.headers.get('user-agent'), language: language.lang, channel: 'text' });
          await recordEvent({ type: 'conversation_start', conversationId, visitorId: b.v ?? null, userId, path: '/', meta: { lang: language.lang, mode: 'text' } });
        }
        await endConversation({ conversationId, transcript, storeTranscript: settings.features.storeTranscripts, endedReason: 'text-laufend', keepOpen: true });
      } catch (e) {
        console.error('chat/after', e);
      }
    });
  }

  return NextResponse.json({ conversationId, reply, lang: language.lang, greeting: isNew ? greeting : undefined });
}

type ChatMsg = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_call_id?: string; tool_calls?: unknown[] };

async function askOpenAI(
  key: string,
  model: string,
  temperature: number,
  system: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  leadCapture: boolean,
  ctx: { conversationId: string; refUsername: string | null; language: string }
): Promise<string> {
  const tools = [
    { type: 'function', function: TOOL_DEFINITIONS.offene_frage },
    ...(leadCapture ? [{ type: 'function', function: TOOL_DEFINITIONS.erfasse_lead }] : []),
  ];
  const messages: ChatMsg[] = [{ role: 'system', content: system }, ...history];
  for (let round = 0; round < 3; round++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model || 'gpt-4o-mini', temperature, messages, tools, tool_choice: 'auto', max_tokens: 500 }),
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[] };
    const msg = json.choices?.[0]?.message;
    if (!msg) throw new Error('OpenAI: leere Antwort');
    if (msg.tool_calls?.length) {
      messages.push({ role: 'assistant', content: msg.content ?? null, tool_calls: msg.tool_calls });
      for (const call of msg.tool_calls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>; } catch { args = {}; }
        const result = await runTool(call.function.name, args, ctx);
        messages.push({ role: 'tool', tool_call_id: call.id, content: result });
      }
      continue;
    }
    return msg.content?.trim() || '…';
  }
  return 'Das konnte ich gerade nicht abschließen. Bitte noch einmal versuchen.';
}

/** Rückfall über die Vapi-Chat-API (ohne Funktionen). */
async function askVapi(key: string, model: string, system: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await fetch('https://api.vapi.ai/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assistant: { model: { provider: 'openai', model: model || 'gpt-4o-mini', messages: [{ role: 'system', content: system }] } },
      input: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Vapi HTTP ${res.status}`);
  const json = (await res.json()) as { output?: { role?: string; content?: string }[] };
  const last = [...(json.output ?? [])].reverse().find((o) => o.role === 'assistant' && o.content);
  return last?.content?.trim() || '…';
}
