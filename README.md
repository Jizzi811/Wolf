# CLOSER – Voice Agent für KickstarterCash.club

**CLOSER** ist ein charismatischer, humorvoller Voice Agent für Business,
Motivation und Klartext – „Charme im Anzug. Klartext im Kopf.“ Das Projekt
besteht aus einem Next.js-Frontend und einem eigenständigen LiveKit-Voice-Agent.

> CLOSER ist ein KI-gestützter Gesprächspartner und **keine reale Person**. Er
> stellt niemanden Reales dar, imitiert keine reale Stimme und macht keine
> erfundenen Produkt-, Gewinn- oder Rechtsangaben.

Basiert auf dem offiziellen [LiveKit Agent Starter for React](https://github.com/livekit-examples/agent-starter-react)
und dem [LiveKit Agents SDK](https://docs.livekit.io/agents).

## Aufbau

```
.
├── app/                 – Next.js App Router (Frontend)
├── components/
│   ├── closer/          – CLOSER-UI (Orb, Hero, Status, Controls, Transkript …)
│   ├── agents-ui/       – LiveKit Agents-UI-Komponenten
│   └── ui/              – shadcn/ui-Primitive
├── hooks/               – u. a. useCloserState (Orb-Phasenlogik)
├── lib/closer-content.ts – zentrale, austauschbare UI-Texte (Deutsch)
├── styles/globals.css   – Gold/Anthrazit-Theme + Orb-Animationen
├── voice-agent/         – eigenständiges Voice-Agent-Backend (LiveKit Agents)
│   └── src/
│       ├── main.ts              – Session-Pipeline (STT→LLM→TTS) + Begrüßung
│       ├── agent.ts             – Agent-Zusammenbau
│       ├── config.ts            – zentrale Modell-/Stimmen-/Sprachkonfiguration
│       ├── prompts/             – vollständiger CLOSER-Systemprompt
│       ├── knowledge/           – Wissensbasis (Platzhalter)
│       └── tools/               – Lead-Erfassung (deaktivierter Platzhalter)
└── SETUP-CLOSER.md      – ausführliche Einrichtungsanleitung
```

## Schnellstart

```bash
# 1) Frontend
pnpm install
cp .env.example .env.local        # LiveKit-Zugangsdaten eintragen
pnpm dev                          # http://localhost:3000

# 2) Voice-Agent (zweites Terminal, Node >= 24 empfohlen)
cd voice-agent
pnpm install
cp .env.example .env.local        # LiveKit-Zugangsdaten eintragen
pnpm dev
```

Die vollständige Anleitung (Voraussetzungen, LiveKit-Projekt, Environment,
Orb-Bild, Modelle/Stimme ändern, Produktion, offene Platzhalter) steht in
**[SETUP-CLOSER.md](./SETUP-CLOSER.md)**.

## Orb-Bild

Lege `public/johann-orb.png` (quadratisch, ~1024×1024, transparent) ab. Fehlt
die Datei, zeigt die App automatisch einen CSS-Fallback-Orb. Siehe
`public/README-johann-orb.md`.

## Prüfungen

```bash
# Frontend
pnpm lint
pnpm build            # inkl. Typecheck

# Voice-Agent
cd voice-agent
pnpm typecheck
pnpm lint
pnpm test
```

## Konfiguration & Branding

- **UI-Texte:** `lib/closer-content.ts`
- **Branding/Features (Farben, Voice-only, Chat):** `app-config.ts`
- **Theme (Gold/Anthrazit) & Orb-Animationen:** `styles/globals.css`
- **Agent-Charakter (Systemprompt):** `voice-agent/src/prompts/closer-system-prompt.ts`
- **Modelle & Stimme:** `voice-agent/src/config.ts`

## Sicherheit

- LiveKit-Secrets ausschließlich serverseitig, niemals in `NEXT_PUBLIC_`-Variablen.
- Die Token-Route `app/api/token/route.ts` ist ein Entwicklungs-Endpunkt und
  muss vor Produktion abgesichert werden (siehe SETUP-CLOSER.md, Abschnitt 12).
- Keine echten Schlüssel committen (`.env*` ist per `.gitignore` ausgeschlossen).
