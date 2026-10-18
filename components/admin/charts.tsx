/** Kleine, abhängigkeitsfreie SVG-Diagramme für die Statistik. */

export function BarChart({ data, height = 140, valueLabel = '' }: { data: { label: string; value: number }[]; height?: number; valueLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 100 ${height / 4}`} preserveAspectRatio="none" className="h-36 w-full overflow-visible" role="img" aria-label="Balkendiagramm">
        {data.map((d, i) => {
          const h = (d.value / max) * (height / 4 - 4);
          return (
            <g key={d.label}>
              <rect x={i * w + w * 0.15} y={height / 4 - h} width={w * 0.7} height={h} rx={0.6} fill="url(#bar-gold)" opacity={d.value === 0 ? 0.25 : 1}>
                <title>{`${d.label}: ${d.value}${valueLabel}`}</title>
              </rect>
            </g>
          );
        })}
        <defs>
          <linearGradient id="bar-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3D58A" />
            <stop offset="1" stopColor="#8A6420" />
          </linearGradient>
        </defs>
      </svg>
      <figcaption className="mt-1 flex justify-between text-[0.65rem] text-muted">
        <span>{data[0]?.label ?? ''}</span>
        <span>{data[Math.floor(data.length / 2)]?.label ?? ''}</span>
        <span>{data[data.length - 1]?.label ?? ''}</span>
      </figcaption>
    </figure>
  );
}

export function HBars({ data, suffix = '' }: { data: { label: string; value: number }[]; suffix?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-muted">Noch keine Daten.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <div>
            <div className="mb-1 flex justify-between">
              <span className="truncate text-cream/90">{d.label}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-3">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </div>
          <span className="w-12 text-right font-mono text-xs text-muted">{d.value}{suffix}</span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (!total) return <p className="text-sm text-muted">Noch keine Daten.</p>;
  const colors = ['#F3D58A', '#D4A63A', '#8A6420', '#9c9484', '#e0795f', '#5aa0d8'];
  let acc = 0;
  const r = 15.9155;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90" role="img" aria-label="Kreisdiagramm">
        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#1b1b1f" strokeWidth="6" />
        {data.map((d, i) => {
          const pct = (d.value / total) * 100;
          const el = (
            <circle key={d.label} cx="21" cy="21" r={r} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc}>
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          acc += pct;
          return el;
        })}
      </svg>
      <ul className="flex flex-col gap-1 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-cream/90">{d.label}</span>
            <span className="font-mono text-xs text-muted">{d.value} ({Math.round((d.value / total) * 100)} %)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
