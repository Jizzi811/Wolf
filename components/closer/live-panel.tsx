'use client';

import { useCallback, useEffect, useState } from 'react';
import { LANGUAGES } from '@/lib/closer/languages';
import { cn } from '@/lib/utils';

/**
 * Live-Panel: drei kostenlose, keyless Widgets im CLOSER-Design.
 *  - Wetter  (Open-Meteo)
 *  - News    (tagesschau)
 *  - Übersetzer (MyMemory)
 *
 * Rein clientseitig; jedes Widget spricht seine eigene /api/*-Route an.
 */
export function LivePanel() {
  return (
    <section
      aria-label="Live-Dienste"
      className="mx-auto w-full max-w-6xl px-6 pb-16 pt-4"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
        <h2 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold/80">
          CLOSER · Live-Dienste
        </h2>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <WeatherCard />
        <NewsCard />
        <TranslatorCard />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Gemeinsame Kartenhülle                                            */
/* ------------------------------------------------------------------ */
function Card({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-gold/15 bg-ink-2/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <span aria-hidden="true" className="text-lg">
          {emoji}
        </span>
        <h3 className="font-display text-lg text-cream">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

const inputCls =
  'h-11 w-full rounded-full border border-gold/25 bg-white/[0.03] px-4 text-sm text-cream ' +
  'placeholder:text-muted/60 focus-visible:border-gold/60 focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-gold';

const btnCls =
  'inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-gold-light ' +
  'via-gold to-gold-dark px-5 text-sm font-semibold text-ink transition hover:brightness-110 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/* ------------------------------------------------------------------ */
/*  Wetter                                                            */
/* ------------------------------------------------------------------ */
function WeatherCard() {
  const [city, setCity] = useState('Berlin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    location: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    description: string;
    emoji: string;
  } | null>(null);

  const load = useCallback(async (q: string) => {
    const value = q.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather?city=' + encodeURIComponent(value));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler');
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Fehler beim Laden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('Berlin');
  }, [load]);

  return (
    <Card title="Wetter" emoji="🌤️">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(city);
        }}
        className="flex gap-2"
      >
        <input
          className={inputCls}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Stadt eingeben …"
          aria-label="Stadt für Wetterabfrage"
        />
        <button type="submit" className={btnCls} disabled={loading}>
          {loading ? '…' : 'Los'}
        </button>
      </form>

      <div className="mt-4 flex-1">
        {error && <p className="text-sm text-danger">{error}</p>}
        {data && !error && (
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="text-5xl">
              {data.emoji}
            </span>
            <div>
              <p className="text-3xl font-semibold text-cream">{data.temperature}°C</p>
              <p className="text-sm text-gold">{data.description}</p>
              <p className="mt-1 text-xs text-muted">
                {data.location} · gefühlt {data.feelsLike}°C · {data.humidity}% · Wind {data.wind} km/h
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  News                                                              */
/* ------------------------------------------------------------------ */
function NewsCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<{ title: string; summary: string; date: string; url: string }[]>(
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news?limit=6');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler');
      setItems(json.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card title="Aktuelle News" emoji="📰">
      <div className="flex-1">
        {error && <p className="text-sm text-danger">{error}</p>}
        {loading && items.length === 0 && <p className="text-sm text-muted">Lädt Schlagzeilen …</p>}
        <ul className="scroll-gold flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
          {items.map((n, i) => (
            <li key={i} className="border-b border-gold/10 pb-2 last:border-0">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-cream hover:text-gold focus-visible:text-gold focus-visible:outline-none"
              >
                {n.title}
              </a>
              {n.date && <p className="mt-0.5 text-[0.7rem] text-muted/70">{n.date} · tagesschau</p>}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={load}
        disabled={loading}
        className="mt-4 self-start text-xs font-semibold text-gold hover:underline disabled:opacity-50"
      >
        ↻ Aktualisieren
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Übersetzer                                                        */
/* ------------------------------------------------------------------ */
function TranslatorCard() {
  const langNames = Object.keys(LANGUAGES);
  const [text, setText] = useState('');
  const [from, setFrom] = useState('Deutsch');
  const [to, setTo] = useState('Englisch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const translate = useCallback(async () => {
    const value = text.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        '/api/translate?q=' +
          encodeURIComponent(value) +
          '&from=' +
          LANGUAGES[from] +
          '&to=' +
          LANGUAGES[to]
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler');
      setResult(json.translatedText);
    } catch (e) {
      setResult('');
      setError(e instanceof Error ? e.message : 'Fehler beim Übersetzen.');
    } finally {
      setLoading(false);
    }
  }, [text, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setText(result || text);
    setResult('');
  };

  const selectCls =
    'h-9 rounded-full border border-gold/25 bg-ink-3 px-3 text-xs text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

  return (
    <Card title="Echtzeit-Übersetzer" emoji="🌍">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted">
        <select
          className={selectCls}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="Ausgangssprache"
        >
          {langNames.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={swap}
          aria-label="Sprachen tauschen"
          className="rounded-full px-2 py-1 text-gold hover:bg-gold/10"
        >
          ⇄
        </button>
        <select
          className={selectCls}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="Zielsprache"
        >
          {langNames.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Text eingeben …"
        rows={2}
        maxLength={500}
        aria-label="Zu übersetzender Text"
        className={cn(
          'w-full resize-none rounded-2xl border border-gold/25 bg-white/[0.03] px-4 py-3 text-sm text-cream',
          'placeholder:text-muted/60 focus-visible:border-gold/60 focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-gold'
        )}
      />

      <button type="button" onClick={translate} disabled={loading} className={cn(btnCls, 'mt-3 self-start')}>
        {loading ? 'Übersetzt …' : 'Übersetzen'}
      </button>

      <div className="mt-3 flex-1">
        {error && <p className="text-sm text-danger">{error}</p>}
        {result && !error && (
          <p className="rounded-2xl border border-gold/15 bg-ink-3/60 px-4 py-3 text-sm text-cream">
            {result}
          </p>
        )}
      </div>
    </Card>
  );
}
