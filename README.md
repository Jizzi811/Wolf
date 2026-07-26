# CLOSER — Voice Agent von KickstarterCash.club

> Charme im Anzug. Klartext im Kopf.

Eine eigenständige Premium-Voice-Agent-Anwendung: ein charismatischer,
psychologisch kluger und trocken-humorvoller KI-Gesprächspartner mit der Energie
eines selbstbewussten Sales-Mentors — **keine** reale Person, keine Nachahmung
konkreter Personen, keine finanziellen Garantien.

Gebaut mit **Next.js 15**, **React 19**, **Tailwind v4**. Sprach-Engine: **Vapi**
(gehostet) über das offizielle Web-SDK `@vapi-ai/web`.

---

## Architektur

Eine einzige Next.js-App. Die gesamte Echtzeit-Sprachlogik (STT → LLM → TTS,
Turn-Taking, Barge-in) läuft über **Vapi**. Kein separater Agenten-Prozess.

```
Browser ──(Vapi Web SDK, öffentlicher Key)──► Vapi (gehostet)
```

Das Design ist **engine-unabhängig** gebaut: Orb, Zustände, Hero, Controls,
Transkript und Fehler hängen nur an einem kleinen Zustands-/Signalsatz. Die
Vapi-Anbindung steckt gekapselt in einem einzigen Hook (`hooks/use-vapi.ts`).

```
.
├─ app/                      # Next.js App Router (Layout, Seite, globale Styles)
├─ components/closer/        # UI: Hero, Orb, Status, Controls, Transkript, …
├─ hooks/use-vapi.ts         # Kapselt die gesamte Vapi-Logik (Engine)
├─ lib/
│  ├─ closer/
│  │  ├─ assistant.ts        # Zentrale Assistenten-Config (Prompt, Modell, Stimme)
│  │  ├─ system-prompt.ts    # Vollständiger CLOSER-Systemprompt
│  │  ├─ knowledge.ts        # Wissensbasis (Platzhalter, keine erfundenen Fakten)
│  │  └─ lead-capture.ts     # Lead-Erfassung (deaktivierter Platzhalter)
│  ├─ closer-state.ts        # Visuelle Zustände
│  ├─ ui-text.ts             # Alle UI-Texte zentral
│  └─ errors.ts              # Nutzerfreundliche Fehlerklassifizierung
├─ app-config.ts             # Branding/Feature-Konfiguration
├─ public/johann-orb.png     # Orb-Bild (reales CLOSER-Motiv)
└─ SETUP-CLOSER.md           # Ausführliche Einrichtungs-/Betriebsanleitung
```

## Schnellstart

```bash
pnpm install
cp .env.example .env.local           # NEXT_PUBLIC_VAPI_PUBLIC_KEY eintragen
pnpm dev                             # http://localhost:3000
```

Voraussetzung: ein **Vapi-Konto** mit öffentlichem Key; die Provider-Keys
(OpenAI/Deepgram/optional ElevenLabs) werden **im Vapi-Dashboard** hinterlegt.
Details, Stimme/Modell ändern, Fehlerdiagnose und Produktion:
**[SETUP-CLOSER.md](./SETUP-CLOSER.md)**.

## Das Orb-Bild

Die zentrale Figur wird aus `public/johann-orb.png` geladen. Zum Austauschen die
Datei am selben Pfad ersetzen. Fehlt sie, greift automatisch ein CSS-Fallback-Orb.

## Wichtige Grenzen (bewusst so gebaut)

- CLOSER gibt sich **nie** als reale Person aus.
- **Keine** erfundenen KickstarterCash-Fakten, Preise oder Garantien.
- **Keine** individuelle Anlage-, Rechts- oder Steuerberatung.
- Im Browser liegt nur der **öffentliche** Vapi-Key; Provider-Schlüssel bleiben bei Vapi.
