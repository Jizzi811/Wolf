'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { adoptSuggestionsAction, suggestSectionsAction, type SuggestResult } from '@/lib/admin/actions';
import { SubmitButton } from './action-form';

/** KI-Vorschläge aus einem Dokument erzeugen und ausgewählte als Wissensabschnitte übernehmen. */
export function SuggestSections({ documentId, aiReady }: { documentId: number; aiReady: boolean }) {
  const [state, run, pending] = useActionState<SuggestResult | null, FormData>(suggestSectionsAction, null);
  const [adopt, adoptAction] = useActionState(adoptSuggestionsAction, null);
  const sections = state?.ok ? state.sections ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <form action={run} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={documentId} />
        <Button type="submit" variant="primary" disabled={!aiReady || pending}>
          {pending ? 'KI arbeitet …' : 'Abschnitte per KI vorschlagen'}
        </Button>
        {!aiReady ? <span className="text-xs text-danger">OPENAI_API_KEY fehlt in Vercel. Abschnitte können von Hand angelegt werden.</span> : null}
        {state && !state.ok ? <span className="text-sm text-danger">{state.message}</span> : null}
        {state?.ok ? <span className="text-sm text-emerald-300">{state.message}</span> : null}
      </form>

      {sections.length ? (
        <form action={adoptAction} className="flex flex-col gap-3">
          <input type="hidden" name="documentId" value={documentId} />
          <input type="hidden" name="sections" value={JSON.stringify(sections)} />
          {sections.map((s, i) => (
            <label key={i} className="flex gap-3 rounded-xl border border-gold/15 bg-ink/40 p-3">
              <input type="checkbox" name="adopt" value={i} defaultChecked className="mt-1 h-4 w-4 accent-[var(--color-gold)]" />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-cream">{s.title}</span>
                <span className="text-sm leading-relaxed text-cream/80">{s.content}</span>
              </span>
            </label>
          ))}
          <div className="flex items-center gap-3">
            <SubmitButton label="Ausgewählte als Wissen übernehmen (unbestätigt)" />
            {adopt ? <span className={adopt.ok ? 'text-sm text-emerald-300' : 'text-sm text-danger'}>{adopt.message}</span> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
