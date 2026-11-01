# Antwort der CLOSER-Session auf den Auftrag v5 und den Zusatzauftrag Anrede (01.11.2026)

Stand: 01.11.2026, vormittags. Branch `claude/happy-cori-huugor`, PR Jizzi811/Wolf#13 (Entwurf) gegen `persona/closer`.
Preview: https://closer-git-claude-happy-cori-huugor-nadjai.vercel.app · **Kein Merge ohne Nadjas Ja.**

## Rückmeldung zu Abschnitt 8 (bitte zurückmelden)

1. **`KCC_BRIDGE_URL` / `KCC_BRIDGE_SECRET` angeschlossen: JA.** Beide stehen seit 25.10. in Vercel (Produktion, seit heute auch Preview). Beweis: Der Produktions-Prompt enthält bereits Wissen aus dem Bereich `knowledge` (Frage „Welche Länder sind im Auswanderungsmodul …" mit der Antwort aus der Wissens-Datei).
2. **Alle 8 neuen Bereiche werden geladen:** `overview`, `relocation`, `guides`, `promo`, `realestate`, `social`, `tour`, `learned` sind in `lib/bridge/sync.ts` (READ_AREAS) und in `lib/bridge/knowledge-from-bridge.ts` als Wissensabschnitte umgesetzt. Vorrang: `learned` > Live-Bereiche (catalog, relocation, guides …) > `knowledge`-Datei > Startwissen. `available:false` oder leere Liste = CLOSER sagt ehrlich, dass er es nicht weiß. Abgleich: bei Gesprächsstart, wenn der letzte Stand älter als eine Stunde ist (`changes`), dazu nachts 03:00 ein kompletter Abgleich (Vercel-Cron mit `force=1`).
   **Anzahl Einträge je Bereich:** kann die CLOSER-Session nicht selbst ablesen (die Preview ist aus der Sandbox nicht erreichbar, die Produktion hat die neuen Bereiche erst nach dem Merge). Der Bericht des Abgleichs zeigt jetzt je Bereich `status`, `available` und `count`; Nadja sieht ihn im CLOSER-Admin unter „Plattform-Anbindung" → „Alles neu laden" (Preview oder nach dem Merge Produktion). Bitte diese Zahlen dort ablesen und hier eintragen.
3. Abschnitt 6 und 7 wie bisher: Preview-Link oben, kein Merge ohne Ja.

## Umgesetzt (Kurzfassung für den Plattform-Chat)

- **Identität:** CLOSER = digitaler Assistent von Kickstartercash.Club. Kein „Johann" mehr in Code, Prompt, Begrüßung, Bild (`public/closer-orb.png`), Doku. Alte Texte in der Datenbank werden beim Lesen automatisch angehoben. Inhaber/Firmenname/Einlagensicherung: nie, Verweis auf Webseite und Team.
- **Name:** geschrieben „Kickstartercash.Club", gesprochen „Kickstartercash Club" (Vapi-Sprachplan-Ersetzungen, Prompt-Regel, Normalisierung im Transkript und Textmodus).
- **Sprachen (Abschnitt 7.1):** alle 136 Header-Sprachen aus `kcc-header-languages.ts` in `lib/closer/languages.ts`. **36 Sprachmodus** (Stimme + Erkennung: de, en, en-au, en-ca, en-us, bg, zh-CN, zh-TW, cs, da, nl, fi, fr, fr-ca, el, hi, hu, id, it, ja, ko, ms, no, pl, pt, pt-br, ro, ru, sk, es, es-mx, es-ar, sv, tr, uk, vi) und **100 Textmodus**. Quelle: Schnittmenge Deepgram nova-2 (36 Sprachen laut Deepgram-Changelog, Codes aus dem Vapi-SDK) × ElevenLabs eleven_turbo_v2_5 (32 Sprachen laut ElevenLabs-Doku). Begrüßungen und Oberflächentexte in 28 Basissprachen.
- **Flagge (7.2/7.2a):** oben links neben dem Namen, 30 px Flagge in 44 px Tippfläche, Kürzel daneben, flagcdn.com mit Rückfall Kürzel im Goldrahmen, neutrales Symbol ohne Landesflagge. Tipp öffnet die Auswahl (Suche + Flaggenliste). Voreinstellung `?lang=xx` → gemerkte Wahl → Browser → Admin. Wechsel mitten im Gespräch: sauber beenden, neu starten, Verlauf wird als Zusammenfassung mitgegeben.
- **Textmodus:** `/api/chat` (OpenAI mit Funktionen erfasse_lead/offene_frage, Rückfall Vapi-Chat), „Vorlesen" über Browser-Stimme, Hinweis „Für diese Sprache nur Text". Braucht `OPENAI_API_KEY` oder `VAPI_PRIVATE_KEY` in Vercel.
- **Lernen (7.3):** `offene_frage` meldet Lücken ohne Namen, mit Sprache → Route `feedback` (Schalter im CLOSER-Admin); `learned` wird bei jedem Gespräch gelesen und hat Vorrang.
- **Anrede (Zusatzauftrag):** Standard siezen + eine Frage am Anfang (nur Sprachen mit Höflichkeitsform; Englisch/Japanisch/Koreanisch ohne Frage); ohne klare Antwort Sie; Wechsel jederzeit sofort. Steuerung: `CLOSER_ADDRESS_MODE` = `ask` (Standard, auch wenn leer) | `sie` | `du`; nach Änderung Redeploy.
- **Sicherheit:** Das Webhook-Geheimnis geht nicht mehr an den Browser; jedes Gespräch bekommt ein eigenes Token, das der Webhook prüft.

## Bitte an den Plattform-Chat

- Kanal „KI Berater" als Link auf `https://closer-henna.vercel.app/?lang=<Header-Sprache>&ref=<Benutzername>` setzen, damit CLOSER in der Sprache des Besuchers startet (Kennungen wie im Header, z. B. `de`, `tr`, `zh-CN`, `pt-br`).
- Für die Wissens-Einträge zur Anrede („Können wir uns duzen?", „Bitte sprechen Sie mich mit Sie an.") ist nichts weiter nötig; die Reihenfolge bleibt unverändert.
- Falls die Brücke im Admin bei einem Bereich `fehler` zeigt: Bitte Route, HTTP-Status und `code` aus dem Bericht mitschicken.
