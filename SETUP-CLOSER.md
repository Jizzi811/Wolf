# SETUP-CLOSER.md

Anleitung zum Einrichten, Starten und Bereitstellen von **CLOSER** – dem Voice
Agent von KickstarterCash.club. Sprach-Engine: **Vapi** (gehostet).

Die Anleitung richtet sich an eine technisch interessierte Person, die nicht
täglich mit Voice-Agents arbeitet.

---

## 1. Überblick

CLOSER besteht aus **einer** Anwendung: einem Next.js-Frontend. Die komplette
Sprachlogik (Zuhören, Denken, Sprechen, Unterbrechen) übernimmt **Vapi** als
gehosteter Dienst. Es gibt **keinen** separaten Agenten-Prozess, den du
betreiben musst.

```
Browser ──(Vapi Web SDK, öffentlicher Key)──► Vapi (STT · LLM · TTS, gehostet)
```

Der CLOSER-„Charakter" (Persönlichkeit, Begrüßung, Modelle, Stimme) wird im Code
als transienter Vapi-Assistent definiert: `lib/closer/assistant.ts`. Alternativ
kannst du einen Assistenten im Vapi-Dashboard anlegen und nur dessen ID setzen.

---

## 2. Voraussetzungen

- **Node.js ≥ 20** (empfohlen 20 oder 22). Prüfen: `node -v`
- **pnpm** (empfohlen) – `npm i -g pnpm` – oder `npm`.
- Ein **Vapi-Konto** (<https://vapi.ai>) mit:
  - einem **öffentlichen** API-Key (Public Key),
  - konfigurierten Provider-Keys **im Vapi-Dashboard** (OpenAI für das LLM,
    Deepgram für STT, optional ElevenLabs für Premium-Stimmen) – oder Vapi-Guthaben.

> Wichtig: Die Provider-Schlüssel liegen **im Vapi-Dashboard**, nicht in dieser
> App. Im Browser wird ausschließlich der öffentliche Vapi-Key verwendet.

---

## 3. Installation

```bash
pnpm install
```

---

## 4. Environment-Variablen setzen

```bash
cp .env.example .env.local
```

Mindestens setzen:

```
NEXT_PUBLIC_VAPI_PUBLIC_KEY=<dein_oeffentlicher_vapi_key>
```

Optional:

```
# Wenn du einen Assistenten im Vapi-Dashboard pflegst, hier dessen ID setzen.
# Leer = App baut den CLOSER-Assistenten aus lib/closer/assistant.ts (empfohlen).
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# Absolute Basis-URL für korrekte Open-Graph-Vorschau.
NEXT_PUBLIC_SITE_URL=
```

---

## 5. Vapi einrichten

1. Konto auf <https://vapi.ai> anlegen.
2. Unter **API Keys** den **Public Key** kopieren → `NEXT_PUBLIC_VAPI_PUBLIC_KEY`.
3. Unter **Provider Keys** deine Anbieter verbinden (mindestens OpenAI für das
   LLM und Deepgram für die Transkription; optional ElevenLabs für die Stimme) –
   oder Vapi-Guthaben nutzen.
4. **Optional:** einen Assistenten im Dashboard anlegen und `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
   setzen. Ohne ID nutzt die App automatisch den in `lib/closer/assistant.ts`
   definierten CLOSER-Assistenten (empfohlen für den Start).

---

## 6. Lokal starten

```bash
pnpm dev
# http://localhost:3000
```

Auf **„Gespräch starten"** klicken, Mikrofon erlauben – CLOSER begrüßt dich von
selbst (Vapi `firstMessage`).

---

## 7. Orb-Bild ablegen

- Pfad: **`public/johann-orb.png`** (liegt bereits als reales CLOSER-Bild vor).
- Zum Austauschen die Datei am selben Pfad ersetzen (quadratisch, ~1024×1024,
  freigestellt/auf Dunkel). Fehlt sie, zeigt die App einen CSS-Fallback-Orb.
- Ebenfalls ersetzbar: `public/og-image.png`, `app/favicon.ico`.

---

## 8. Name, Persönlichkeit, Begrüßung, Stimme & Modell ändern

Alles zentral und klar getrennt:

| Was | Datei |
|-----|-------|
| Anzeigename „CLOSER" & alle UI-Texte | `lib/ui-text.ts` |
| Marken-/Seitenname, Farben, Orb-Pfad | `app-config.ts` |
| **Systemprompt / Persönlichkeit** | `lib/closer/system-prompt.ts` |
| **Begrüßung, Modell, Stimme, Sprache** | `lib/closer/assistant.ts` |
| Wissensbasis (Firmenfakten) | `lib/closer/knowledge.ts` |

**Stimme auf Premium-Deutsch (empfohlen):** In `lib/closer/assistant.ts` das
`voice`-Objekt ersetzen, z. B.

```ts
voice: { provider: '11labs', voiceId: '<deine-elevenlabs-stimme>' }
```

und ElevenLabs im Vapi-Dashboard verbinden. Verfügbare Modelle/Stimmen:
<https://docs.vapi.ai/>. **Erfinde keine Modell-/Stimmnamen** – nur reale Werte
deines Kontos verwenden.

---

## 9. Wissensbasis pflegen (KickstarterCash-Fakten)

Datei: `lib/closer/knowledge.ts`

- Aktuell **nur Platzhalter** – **keine** Preise, Leistungen, Partner oder
  Garantien hinterlegt.
- Nur **geprüfte** Fakten eintragen und `verified: true` sowie `lastUpdated`
  setzen. Solange nichts freigegeben ist, sagt CLOSER ehrlich, dass ihm die
  Daten fehlen.

---

## 10. Optionale Lead-Erfassung

Datei: `lib/closer/lead-capture.ts` – **deaktivierter Platzhalter** (keine
Speicherung). Für Vapi später als Assistenten-Tool/Funktion umsetzen (mit
ausdrücklicher Einwilligung, ohne Zahlungs-/Ausweis-/Kartendaten).

---

## 11. Lokale Fehlerdiagnose

| Symptom | Ursache / Lösung |
|--------|-------------------|
| „Es fehlt der öffentliche Vapi-Schlüssel." | `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env.local` setzen, Dev-Server neu starten. |
| „Kein Mikrofonzugriff." | Im Browser Mikrofon erlauben; Seite über `https`/`localhost` öffnen. |
| Kein Ton / keine Antwort | Provider-Keys im Vapi-Dashboard gesetzt? Guthaben vorhanden? |
| Verbindung bricht ab | Public Key gültig? In der Vapi-Konsole die Call-Logs prüfen. |
| Browser nicht unterstützt | Aktuellen Chrome/Edge/Firefox/Safari verwenden. |

---

## 12. Produktionsbereitstellung

```bash
pnpm build && pnpm start
```

- Environment-Variablen im Hosting-Dashboard (z. B. Vercel) hinterlegen.
- **Sicherheit:**
  - Den **Public Key** im Vapi-Dashboard auf deine Domain(s) beschränken
    (Allowed Origins), damit ihn niemand missbräuchlich nutzt.
  - Optional den **Systemprompt verbergen**: Assistenten serverseitig per
    privatem Vapi-Key erzeugen (eigene API-Route) und nur die Assistenten-ID an
    den Client geben. Für den Standardbetrieb nicht nötig – der Prompt ist kein
    Geheimnis.

---

## 13. Was ist noch Platzhalter?

- `public/johann-orb.png`, `public/og-image.png`, `app/favicon.ico` – aus dem
  gelieferten CLOSER-Bild erzeugt (bei Bedarf ersetzen).
- `lib/closer/knowledge.ts` – **alle** Firmen-/Produktfakten.
- `lib/closer/lead-capture.ts` – Lead-Erfassung, **deaktiviert**.
- Modell/Stimme in `lib/closer/assistant.ts` – gegen dein Vapi-Konto prüfen.
