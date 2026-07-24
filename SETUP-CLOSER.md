# SETUP-CLOSER

Anleitung für **CLOSER** – den charismatischen Voice Agent von
**KickstarterCash.club**. CLOSER besteht aus zwei getrennten Teilen:

| Teil                 | Ordner         | Technik                                            |
| -------------------- | -------------- | -------------------------------------------------- |
| **A – Web-Frontend** | Projektwurzel  | Next.js 15 (App Router) + LiveKit Components React |
| **B – Voice-Agent**  | `voice-agent/` | LiveKit Agents SDK (Node.js/TypeScript, v1.5)      |

Beide Teile werden **unabhängig** gestartet und deployt. Das Frontend stellt
die Verbindung her; der Agent liefert Stimme und Intelligenz.

> Diese Anleitung ist für technisch interessierte Personen gedacht, die nicht
> täglich mit LiveKit arbeiten.

---

## 0. Zwei Voice-Engines (wichtig zuerst lesen)

CLOSER kann die „Sprech-Maschine" auf zwei Arten betreiben – umschaltbar über
`NEXT_PUBLIC_VOICE_ENGINE`:

- **`deepgram` (Standard, empfohlen):** Deepgram Voice Agent. Hören + Denken +
  Sprechen laufen über **eine** Verbindung direkt im Browser. **Kein LiveKit,
  kein Dauer-Worker, keine zweite App.** Es genügt **ein** Server-Key
  (`DEEPGRAM_API_KEY`); das LLM (OpenAI/GPT) wird von Deepgram verwaltet und über
  dein Deepgram-Guthaben abgerechnet. Deutsche Stimme (z. B. „Julius").
  → Der Ordner `voice-agent/` wird für diesen Weg **nicht** gebraucht.
- **`livekit`:** die ursprüngliche Architektur mit separatem `voice-agent/`
  Backend (Abschnitte weiter unten). Nur nötig, wenn du LiveKit brauchst.

### Schnellstart mit der Deepgram-Engine

1. In der App (z. B. Sevalla) Environment-Variablen setzen:

   ```env
   NEXT_PUBLIC_VOICE_ENGINE=deepgram
   DEEPGRAM_API_KEY=<dein_deepgram_key>     # nur serverseitig!
   CLOSER_DG_VOICE=aura-2-julius-de          # exakte deutsche Stimmen-ID
   CLOSER_DG_LANGUAGE=de
   CLOSER_DG_THINK_MODEL=gpt-4o-mini
   ```

2. Deployen. Fertig – „Gespräch starten" verbindet direkt mit Deepgram.
   Check: `/api/dg-token` liefert ein Token (kein `{"configured":false}`).

> **Sicherheit:** `DEEPGRAM_API_KEY` NUR als normale (nicht `NEXT_PUBLIC_`)
> Server-Variable setzen. Der Browser erhält ausschließlich ein kurzlebiges
> Token aus `/api/dg-token`. Schlüssel niemals in Screenshots, Chats oder
> `.env`-Dateien in fremde Tools kopieren.

---

## 1. Voraussetzungen

- **Node.js**
  - Frontend: Node ≥ 20 (getestet mit Node 22).
  - Voice-Agent: **Node ≥ 24** (das Agent-SDK nutzt Nodes natives
    TypeScript-Stripping, `node src/main.ts`).
- **pnpm** ≥ 9 fürs Frontend, **pnpm ≥ 10** empfohlen für den Voice-Agent.
- Ein **LiveKit-Cloud-Projekt** (kostenlos): <https://cloud.livekit.io>
  – daraus stammen `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
- Ein Mikrofon und ein moderner Browser (Chrome, Edge, Firefox, Safari).

---

## 2. Installation

```bash
# Frontend (Projektwurzel)
pnpm install

# Voice-Agent
cd voice-agent
pnpm install
cd ..
```

---

## 3. Frontend starten

```bash
# In der Projektwurzel
cp .env.example .env.local     # Werte eintragen (siehe Abschnitt 6)
pnpm dev
```

Dann <http://localhost:3000> öffnen. Ohne laufenden Voice-Agent baut die Seite
zwar die Verbindung auf, es meldet sich aber niemand.

---

## 4. Voice Agent starten

```bash
cd voice-agent
cp .env.example .env.local     # Werte eintragen (siehe Abschnitt 6)
pnpm dev                       # Entwicklungs-Modus (verbindet sich mit LiveKit Cloud)
```

Für den Dauerbetrieb:

```bash
pnpm start
```

> Der Agent ist ein **langlebiger Prozess** und läuft bewusst getrennt vom
> Next.js-Frontend – nicht in einer Next.js-API-Route.

---

## 5. LiveKit-Projekt verbinden

1. In der [LiveKit Cloud Console](https://cloud.livekit.io) ein Projekt
   erstellen bzw. auswählen.
2. Unter **Settings → Keys** einen API-Key erzeugen.
3. `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` in **beiden**
   `.env.local`-Dateien (Frontend + `voice-agent/`) eintragen.
4. `AGENT_NAME` in beiden Dateien identisch setzen (Standard: `CLOSER`) für
   expliziten Dispatch – oder in beiden leer lassen für automatischen Dispatch.

Für die **KI** (Hören/Denken/Sprechen) gibt es zwei Wege: eigene Anbieter
(Deepgram + OpenAI, empfohlen und günstig) oder LiveKit Inference. Details in
Abschnitt 10. LiveKit selbst wird in beiden Fällen als **Audiotransport**
benötigt.

---

## 6. Environment-Variablen setzen

### Frontend – `.env.local` (aus `.env.example`)

| Variable                          | Zweck                                                       |
| --------------------------------- | ----------------------------------------------------------- |
| `LIVEKIT_URL`                     | WebSocket-URL des LiveKit-Projekts (serverseitig)           |
| `LIVEKIT_API_KEY`                 | API-Key (serverseitig, für die Token-Route)                 |
| `LIVEKIT_API_SECRET`              | API-Secret (serverseitig)                                   |
| `AGENT_NAME`                      | Dispatch-Name; muss zum Voice-Agent passen (z. B. `CLOSER`) |
| `NEXT_PUBLIC_APP_CONFIG_ENDPOINT` | Nur für die LiveKit Cloud Sandbox (sonst leer)              |
| `SANDBOX_ID`                      | Nur für die Sandbox (sonst leer)                            |

### Voice-Agent – `voice-agent/.env.local` (aus `voice-agent/.env.example`)

| Variable                    | Zweck                                                          |
| --------------------------- | -------------------------------------------------------------- |
| `LIVEKIT_URL`               | WebSocket-URL des LiveKit-Projekts (nur Audiotransport)        |
| `LIVEKIT_API_KEY`           | API-Key                                                        |
| `LIVEKIT_API_SECRET`        | API-Secret                                                     |
| `AGENT_NAME`                | Agentenname / Dispatch-Name (Standard `CLOSER`)                |
| `CLOSER_PIPELINE`           | `providers` oder `inference` (leer = automatisch, siehe unten) |
| `DEEPGRAM_API_KEY`          | Deepgram: Hören (STT) und optional Stimme (TTS)                |
| `OPENAI_API_KEY`            | OpenAI: Denken (LLM/GPT) und Standard-Stimme (TTS)             |
| `CLOSER_TTS_PROVIDER`       | `openai` (Deutsch, Standard) oder `deepgram`                   |
| `CLOSER_TTS_VOICE`          | OpenAI-Stimme (z. B. `onyx`, `ash`, `sage`)                    |
| `CLOSER_DEEPGRAM_TTS_MODEL` | Deepgram-Stimme (exakte Modell-ID, z. B. deutsche Aura-2)      |
| `CLOSER_LLM_MODEL`          | Optional: LLM-Modell überschreiben                             |
| `CLOSER_STT_MODEL`          | Optional: STT-Modell überschreiben                             |
| `CLOSER_LANGUAGE`           | Optional: Standardsprache (Standard `de`)                      |
| `CLOSER_GREETING`           | Optional: Begrüßungstext überschreiben                         |
| `LEAD_CAPTURE_ENABLED`      | Lead-Erfassung aktivieren (Standard `false`, Abschnitt 13)     |
| `CLOSER_DEBUG`              | Ausführliche Logausgaben (`true`/`false`)                      |

**Zwei Pipelines** (Abschnitt 10):

- **`providers`** (empfohlen, günstig): Deepgram (STT) + OpenAI (LLM) + Stimme
  (OpenAI oder Deepgram). LiveKit dient nur als Audiotransport – **keine
  LiveKit-Inference-Kosten**. Aktiv, sobald `DEEPGRAM_API_KEY` **und**
  `OPENAI_API_KEY` gesetzt sind.
- **`inference`**: STT/LLM/TTS über LiveKit Inference (ohne separate Keys, aber
  kostenpflichtig bei LiveKit).

> **Sicherheit:** API-Secrets gehören ausschließlich serverseitig. Niemals in
> `NEXT_PUBLIC_`-Variablen speichern, niemals echte Schlüssel committen.

---

## 7. Orb-Bild ablegen

Die zentrale Figur ist der goldene Orb. Lege die Datei hier ab:

```
public/johann-orb.png
```

Empfohlen: quadratisches PNG, ~1024×1024 px, transparenter Hintergrund.

**Fehlt die Datei**, zeigt die Oberfläche automatisch einen passenden
CSS-Fallback-Orb an (siehe `components/closer/closer-orb.tsx`). Der Pfad
`/johann-orb.png` bleibt gültig – sobald die Datei vorhanden ist, wird sie
ohne Codeänderung verwendet. Details: `public/README-johann-orb.md`.

---

## 8. Agentenname ändern

Der Name muss an drei Stellen konsistent sein:

- Frontend `.env.local`: `AGENT_NAME`
- Voice-Agent `.env.local`: `AGENT_NAME`
- Angezeigter Name/Texte: `lib/closer-content.ts` (`agentName`, `agentTagline`)

Standard ist überall `CLOSER`.

---

## 9. Systemprompt ändern

Der vollständige Charakter-Prompt liegt zentral in:

```
voice-agent/src/prompts/closer-system-prompt.ts
```

Dort die Konstante `CLOSER_SYSTEM_PROMPT` anpassen. Zusätzliche Regeln (Sprache,
kurze Sprachausgabe) und die Wissensbasis werden in `voice-agent/src/agent.ts`
zusammengeführt.

---

## 10. Pipeline, Stimme und Modelle ändern

Alle austauschbaren Bausteine sind in **`voice-agent/src/config.ts`** gebündelt
und über Environment-Variablen steuerbar (`voice-agent/.env.local`).

### Pipeline „providers" (empfohlen – nutzt deine eigenen Keys)

Deepgram (Hören) + OpenAI (Denken) + Stimme (OpenAI **oder** Deepgram). LiveKit
ist dann nur das Audiokabel – **keine LiveKit-Inference-Kosten**. Aktiviert sich
automatisch, sobald beide Keys gesetzt sind:

```env
DEEPGRAM_API_KEY=...      # STT (und optional die Stimme)
OPENAI_API_KEY=...        # LLM/GPT (und Standard-Stimme)
```

**Deutsche Stimme wählen:**

- **OpenAI-TTS (Standard, mehrsprachig):**
  ```env
  CLOSER_TTS_PROVIDER=openai
  CLOSER_TTS_VOICE=onyx      # alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
  ```
- **Deepgram-Stimme (z. B. deutsche Aura-2-„Julius"-Variante):** die **exakte
  Modell-ID** aus der Deepgram-Doku eintragen:
  ```env
  CLOSER_TTS_PROVIDER=deepgram
  CLOSER_DEEPGRAM_TTS_MODEL=<exakte-deepgram-modell-id>
  ```

Modelle optional überschreiben: `CLOSER_LLM_MODEL` (OpenAI-Modell, z. B.
`gpt-4o-mini`), `CLOSER_STT_MODEL` (Deepgram, z. B. `nova-3`).

### Pipeline „inference" (alles über LiveKit)

`CLOSER_PIPELINE=inference` – nutzt LiveKit Inference (kostenpflichtig bei
LiveKit), keine separaten Keys nötig. Modelle via `CLOSER_LLM_MODEL`,
`CLOSER_STT_MODEL`, `CLOSER_TTS_MODEL`, `VOICE_ID`.

> **Wichtig:** Modell-/Stimmen-Namen ändern sich – bitte in der jeweiligen Doku
> prüfen: OpenAI (LLM/TTS), Deepgram (STT/TTS) bzw. LiveKit
> (<https://docs.livekit.io/agents/models/>). **Keine Stimme einer realen
> Person klonen.**

Für eine Realtime-Pipeline statt STT→LLM→TTS siehe die LiveKit-Doku
(`RealtimeModel`) – die erste Version nutzt bewusst die klassische Pipeline,
damit Stimme, Intelligenz und Anbieter getrennt konfigurierbar bleiben.

---

## 11. Lokale Fehlerdiagnose

- **„Ton aktivieren“-Button erscheint:** Der Browser blockiert Autoplay – klicken.
- **Mikrofon abgelehnt:** Zugriff in den Browser-Einstellungen erlauben, neu starten.
- **Es meldet sich niemand:** Läuft der Voice-Agent (`voice-agent/`, `pnpm dev`)?
  Stimmen `AGENT_NAME` und LiveKit-Zugangsdaten in beiden `.env.local` überein?
- **„Konfiguration unvollständig“:** `LIVEKIT_URL/API_KEY/API_SECRET` prüfen.
- **`maximum number of agents reached (1/1)`:** Du versuchst, den Agent **bei
  LiveKit** zu hosten – das ist limitiert. Stattdessen selbst betreiben
  (Abschnitt 12, „Agent selbst hosten"). Den hängenden LiveKit-Deploy löschen.
- **Agent-Logs:** `CLOSER_DEBUG=true` im Voice-Agent setzen.
- **Checks ausführen:** siehe Abschnitt „Prüfung“ in dieser Datei / README.

Die Oberfläche zeigt nutzerfreundliche Fehlermeldungen statt technischer
Rohfehler (siehe `components/closer/closer-error.tsx`).

---

## 12. Produktionsbereitstellung

- **Frontend:** Als normale Next.js-App deploybar (z. B. Vercel). LiveKit-Secrets
  als serverseitige Environment-Variablen hinterlegen.
  - Die Token-Route `app/api/token/route.ts` funktioniert auch in Produktion
    (sie meldet fehlende Zugangsdaten klar). ⚠️ Sie gibt Tokens jedoch **ohne
    eigene Authentifizierung** aus – vor einem öffentlichen Launch davor eine
    Auth-Schicht (Login/Rate-Limit) ergänzen. Zum harten Sperren:
    `LIVEKIT_TOKEN_ROUTE_DISABLED=true`.
- **Voice-Agent:** Als eigenständiger, langlebiger Node-Prozess deployen
  (`pnpm start`), z. B. Container/Worker. Er läuft **getrennt** vom Frontend.
  LiveKit-Zugangsdaten als Environment-Variablen setzen.
- Build-Befehle: Frontend `pnpm build`; Voice-Agent `pnpm typecheck` (+ Tests).

### Agent selbst hosten – NICHT bei LiveKit „deployen"

> **Wichtig:** „Deploy new agent" in der LiveKit-Konsole = LiveKit **hostet** den
> Agent für dich. Der kostenlose Tarif erlaubt nur **einen** solchen gehosteten
> Agent (Fehler `maximum number of agents reached (1/1)`). Unser Agent braucht
> das **nicht**: Er läuft auf **deiner** Infrastruktur und **verbindet sich nur**
> mit dem LiveKit-Projekt über den API-Key – das zählt nicht gegen dieses Limit.

Der Ordner `voice-agent/` enthält dafür ein **`Dockerfile`** (Node 24). Damit
lässt sich der Agent überall als Container betreiben (Sevalla-Dienst, VM,
beliebiger Container-Host):

```bash
# im Ordner voice-agent/
docker build -t closer-agent .
docker run --env-file .env.local closer-agent
```

**Auf Sevalla** als zweiter Dienst:

1. Neuen Dienst anlegen, **Root-Verzeichnis** auf `voice-agent` setzen (damit das
   Dockerfile gefunden wird).
2. **Environment-Variablen** setzen: `LIVEKIT_URL`, `LIVEKIT_API_KEY`,
   `LIVEKIT_API_SECRET`, `AGENT_NAME=CLOSER`, `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`
   (plus optional `CLOSER_TTS_PROVIDER` / `CLOSER_DEEPGRAM_TTS_MODEL`).
3. Deploy. Der Dienst ist ein **Worker** (kein Web-Port nötig) und verbindet sich
   selbstständig mit LiveKit.

> LiveKit-Projekt: Du kannst dasselbe Projekt wie ein anderer Agent nutzen
> (mit eindeutigem `AGENT_NAME` für expliziten Dispatch) – ihr teilt euch dann
> die Freiminuten – oder für saubere Trennung ein eigenes LiveKit-Projekt/Konto
> anlegen.

---

## 13. Welche Teile sind noch Platzhalter?

- **`public/johann-orb.png`** – noch abzulegen (CSS-Fallback aktiv).
- **`voice-agent/src/knowledge/kickstartercash.ts`** – die Wissensbasis enthält
  **keine** echten Firmendaten. Solange keine geprüften Angaben hinterlegt sind,
  sagt CLOSER ehrlich, dass ihm die Daten fehlen. **Hier** echte, freigegebene
  Informationen ergänzen (Unternehmensbeschreibung, Produkte/Leistungen, FAQ,
  Kontakt-/Eskalationswege). Keine Preise, Garantien oder rechtlichen Aussagen
  erfinden.
- **Lead-Erfassung** (`voice-agent/src/tools/lead-capture.ts`) – nur die
  Struktur ist vorbereitet, standardmäßig **deaktiviert**. Es wird **nichts**
  gespeichert. Vor Aktivierung ein echtes, DSGVO-konformes Backend anbinden und
  ausdrückliche Einwilligung voraussetzen.
- **Open-Graph-Bild** (`app/opengraph-image.tsx`) – schlichter, selbsttragender
  Platzhalter. Bei Bedarf durch ein echtes Motiv ersetzen.
- **Favicon** (`app/favicon.ico`) – aktuell das Starter-Icon; bei Bedarf ersetzen.
- **Token-Route** – funktionsfähig, aber ohne eigene Authentifizierung; vor
  öffentlichem Launch absichern (Abschnitt 12).
