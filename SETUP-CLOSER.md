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

Die Standard-Sprachpipeline nutzt **LiveKit Inference**: LLM, STT und TTS
laufen über die LiveKit-Zugangsdaten, **ohne** separate Provider-Keys.

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

| Variable               | Zweck                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `LIVEKIT_URL`          | WebSocket-URL des LiveKit-Projekts                               |
| `LIVEKIT_API_KEY`      | API-Key                                                          |
| `LIVEKIT_API_SECRET`   | API-Secret                                                       |
| `AGENT_NAME`           | Agentenname / Dispatch-Name (Standard `CLOSER`)                  |
| `VOICE_ID`             | Stimmen-ID des TTS-Anbieters (leer = Standardstimme)             |
| `CLOSER_LLM_MODEL`     | Optional: LLM-Modell überschreiben                               |
| `CLOSER_STT_MODEL`     | Optional: Speech-to-Text-Modell überschreiben                    |
| `CLOSER_TTS_MODEL`     | Optional: Text-to-Speech-Modell überschreiben                    |
| `CLOSER_LANGUAGE`      | Optional: Standardsprache (Standard `de`)                        |
| `CLOSER_GREETING`      | Optional: Begrüßungstext überschreiben                           |
| `LEAD_CAPTURE_ENABLED` | Lead-Erfassung aktivieren (Standard `false`, siehe Abschnitt 13) |
| `CLOSER_DEBUG`         | Ausführliche Logausgaben (`true`/`false`)                        |

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

## 10. Stimme und Modelle ändern

Alle austauschbaren Bausteine sind in **`voice-agent/src/config.ts`** gebündelt:

- `llm.model` – Sprachmodell (Intelligenz)
- `stt.model` / `stt.language` – Spracherkennung (`multi` = automatisch mehrsprachig)
- `tts.model` / `tts.voice` – Stimme

Am einfachsten per Environment-Variable überschreiben (`CLOSER_LLM_MODEL`,
`CLOSER_STT_MODEL`, `CLOSER_TTS_MODEL`, `VOICE_ID`).

> **Wichtig:** Verfügbare Modelle und Stimmen bitte in der LiveKit-Dokumentation
> prüfen, bevor sie geändert werden (Modellnamen ändern sich):
> LLM <https://docs.livekit.io/agents/models/llm/> ·
> STT <https://docs.livekit.io/agents/models/stt/> ·
> TTS <https://docs.livekit.io/agents/models/tts/>.
> Die Standardwerte entsprechen dem offiziellen LiveKit Node-Starter.
> **Keine Stimme einer realen Person klonen.**

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
