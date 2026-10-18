# CLOSER-Admin: Einrichtung und Bedienung

Stand: 18.10.2026. Der Admin-Bereich steckt im selben Vercel-Projekt (`closer`)
wie die öffentliche Seite. Alles, was der Agent sagt, zeigt und kann, wird dort
eingestellt. Nichts davon ist fest im Code.

## 1. Einmalige Einrichtung in Vercel (ca. 10 Minuten)

1. **Datenbank:** Vercel → Projekt `closer` → Storage → Neon (Postgres) →
   „Connect Project“. Danach ist `DATABASE_URL` gesetzt. Alle Tabellen
   (`closer_*`) legt die App beim ersten Aufruf selbst an.
2. **Dateispeicher:** Storage → Blob → „Connect Project“. Setzt
   `BLOB_READ_WRITE_TOKEN`. Ohne das geht alles außer Datei- und Bild-Upload.
3. **Umgebungsvariablen** (Settings → Environment Variables), siehe `.env.example`:
   - `NEXT_PUBLIC_SITE_URL` = `https://closer-henna.vercel.app` (später eigene Domain)
   - `VAPI_WEBHOOK_SECRET` = ein langes, frei erfundenes Geheimnis
   - `OPENAI_API_KEY` = für Audio-/Video-Transkription und KI-Vorschläge (optional)
   - `ELEVENLABS_API_KEY` = für die Stimmenliste im Admin (optional)
   - `KCC_BRIDGE_URL` und `KCC_BRIDGE_SECRET` = Plattform-Brücke (sobald P18 läuft)
4. **Redeploy** (Deployments → ⋯ → Redeploy), damit die Variablen greifen.
5. **Erstes Admin-Konto:** `https://closer-henna.vercel.app/setup` aufrufen,
   Name, E-Mail und Passwort (mindestens 10 Zeichen) eingeben. Diese Seite
   sperrt sich danach selbst. Das Startwissen (12 Abschnitte) wird dabei in
   die Datenbank übernommen.

Kosten: Neon Free, Blob Free (Hobby-Kontingent), Vercel Hobby. Nur Vapi,
ElevenLabs und OpenAI werden nach Nutzung abgerechnet.

## 2. Bereiche

| Adresse | Wer | Inhalt |
|---|---|---|
| `/` | alle (oder nur angemeldet, je nach Schalter) | Öffentliche Seite mit dem Agenten |
| `/login`, `/registrieren` | alle | Anmeldung; Registrierung nur, wenn freigeschaltet |
| `/admin` | Admin | Alles |
| `/team` | Team | Dieselben Module wie Admin, aber nur die freigeschalteten |
| `/mein` | Mitglied, Team, Admin | Eigene Gespräche, eigene Zahlen, Profil, Passwort |

### Admin-Module

- **Dashboard:** Gespräche pro Tag, Minuten, Ø-Dauer, Leads, Ergebnis-Verteilung,
  Uhrzeiten, Themen, Empfehler (Ref-Links), letzte Gespräche. Zeitraum 7/30/90 Tage.
- **Gespräche:** jedes Gespräch mit Zeit, Dauer, Nachrichten, Nutzer/Besucher,
  Empfehler, Themen, Ergebnis, Transkript, Zusammenfassung, Kosten (aus Vapi).
- **Leads:** Interessenten mit Einwilligung; Status, Notizen, Übertragung an
  die Plattform.
- **Offene Fragen:** was der Agent nicht wusste, mit Zähler; Antwort wird
  direkt zum Wissensabschnitt.
- **Wissen:** alle Abschnitte, bestätigen/aufheben, aktivieren/deaktivieren,
  Reihenfolge, Quelle (Startwissen, manuell, Datei, KI, Plattform). Unbestätigte
  Abschnitte bekommt der Agent mit dem Hinweis „nicht als Fakt verwenden“.
- **Dateien:** Upload aller Formate (PDF, Word, Text, Markdown, CSV, Bilder,
  Audio, Video bis 500 MB). Text wird ausgelesen, Audio/Video transkribiert
  (Whisper, bis 24 MB pro Datei; größere vorher als MP3 exportieren). Danach
  „Abschnitte per KI vorschlagen“, prüfen, übernehmen, freigeben.
- **Persona:** Name (ersetzt CLOSER überall), Bild (Orb), Untertitel, Begrüßung,
  Anrede du/Sie, Sprache, kompletter Charakter-Prompt.
- **Stimme & Modell:** ElevenLabs-Stimme (Liste mit Hörprobe, wenn Schlüssel
  gesetzt; sonst Voice-ID eintragen), Modell, Geschwindigkeit, Stabilität,
  Ähnlichkeit, Ausdruck; OpenAI-Modell, Temperatur; Deepgram-Transkription.
- **Texte & Design:** jeder Text der öffentlichen Seite, Seitentitel, Farben
  (Akzent, hell, dunkel, Hintergrund), Transkript-Knopf, Texteingabe.
- **Plattform-Anbindung:** Status der Brücke, Abgleich jetzt/alles neu laden,
  je Bereich Stand und Rohdaten.
- **Einstellungen (nur Admin):** öffentlicher Zugang, Selbstregistrierung,
  Lead-Erfassung, Transkripte speichern, Leads/Gespräche/Fragen an Plattform,
  automatischer Abgleich; KI-Offenlegung und Einwilligungstext; Systemstatus
  (welche Variablen gesetzt sind, ohne Werte zu zeigen).
- **Benutzer & Team (nur Admin):** Konten anlegen, Rolle, Rechte je Modul,
  Passwort setzen, deaktivieren, löschen.
- **Protokoll (nur Admin):** wer hat wann was geändert.

## 3. Eigene Stimme (Nadja oder Johann)

1. ElevenLabs → Voices → „Add a new voice“ → Instant Voice Clone: 1 bis 3
   Minuten saubere Aufnahme hochladen (keine Musik, kein Hall).
2. Die Voice-ID der neuen Stimme kopieren.
3. Vapi-Dashboard → Provider Keys → ElevenLabs-Schlüssel hinterlegen (sonst
   darf Vapi die Stimme nicht abspielen).
4. CLOSER-Admin → Stimme & Modell → Voice-ID eintragen (oder aus der Liste
   wählen, wenn `ELEVENLABS_API_KEY` in Vercel gesetzt ist) → Speichern.

## 4. Wie Leads und offene Fragen entstehen

Der Agent bekommt zwei Funktionen: `erfasse_lead` (nur nach vorgelesenem
Einwilligungstext und klarem Ja) und `offene_frage`. Vapi ruft dafür
`/api/vapi/webhook` auf; dieselbe Adresse empfängt den Gesprächsende-Bericht
(Dauer, Transkript, Zusammenfassung, Kosten). Voraussetzung: `NEXT_PUBLIC_SITE_URL`
gesetzt. `VAPI_WEBHOOK_SECRET` schützt die Adresse.

## 5. Plattform-Brücke

Sobald Paket P18 auf der Plattform eingespielt ist: Plattform-Admin →
„CLOSER-Anbindung“ → „Schlüssel erzeugen“ → in Vercel als `KCC_BRIDGE_SECRET`
eintragen, `KCC_BRIDGE_URL` dazu, Redeploy, dann im Admin → Plattform-Anbindung
→ „Alles neu laden“. Ab dann kommen Pakete, Karten, Provisionen, Webinare,
Kanäle und Texte automatisch; die manuellen Abschnitte dazu werden als
„überholt durch Plattform“ markiert. Abgleich: täglich (Vercel-Cron) und bei
Gesprächsstart, wenn der letzte Stand älter als eine Stunde ist.

Ref-Links: `https://closer-henna.vercel.app/?ref=<benutzername>` – der Agent
merkt sich den Empfehler 30 Tage im Browser und gibt ihn mit dem Lead weiter.

## 6. Lokal testen

```
pnpm install
pnpm test:db      # Funktionstest mit PGlite (ohne Netz)
pnpm typecheck && pnpm lint && pnpm build
```
