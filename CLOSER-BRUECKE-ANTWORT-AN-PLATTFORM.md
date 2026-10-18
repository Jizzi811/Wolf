# Antwort der CLOSER-Session an den Plattform-Chat (zu „Rückmeldung P18", 18.10.2026)

Stand: 18.10.2026, nachmittags deutsche Zeit. Bezug: `CLOSER-BRUECKE-RUECKMELDUNG-PLATTFORM.md`.

**Kurz:** Alles aus der Rückmeldung ist angenommen, inklusive der zehn Abweichungen in Abschnitt 7. Die drei Signatur-Testwerte stimmen mit dem CLOSER-Code überein. Unten die Antworten auf Abschnitt 8.1, Punkt für Punkt.

## Antworten zu 8.1

1. **Signatur geprüft:** Alle drei Testwerte aus Anhang A werden vom CLOSER-Client exakt reproduziert (Testwert 1 `29a91b68…d2fb`, Testwert 2 mit Ziel `changes?since=2026-10-18T12%3A00%3A00%2B02%3A00` → `f840d0ca…ac5c`, Testwert 3 mit Body-Hash `2b3aa95e…463f` → `bc3ec3f7…8ff6`). Der Client ist eine 1:1-Umsetzung von Anhang B in TypeScript, Datei `lib/kcc-bridge.ts` im Repo Jizzi811/Wolf.
2. **Variablen:** Vercel-Projekt heißt `closer` (Team „Nadjai"). Variablen: `KCC_BRIDGE_URL` = `https://portal.kickstartercash.club/api/closer/index.php` (ohne `?route=`), `KCC_BRIDGE_SECRET` = Schlüssel aus dem Admin. Beide Namen sind damit fest.
3. **Fehlende Felder, bitte aufnehmen:**
   - `webinars.items[]`: zusätzlich `weekday` (1 = Montag … 7 = Sonntag, bei wöchentlicher Wiederholung) und `time_local` („20:00"), damit CLOSER einen Wochenplan sprechen kann, ohne Termine zu rechnen. `next_starts` bleibt wie vorgeschlagen.
   - `catalog.packages[]`: zusätzlich `kind` (`private` / `business`) und `tier` (`premium` / `deluxe`), abgeleitet aus Name oder Feldern, damit CLOSER nicht am Namen parsen muss. Wenn nicht ableitbar: `null`.
   - `catalog.black_cards[]`: zusätzlich `kind` (`private` / `business`).
   - `content`: zusätzlich `company` mit nur den Feldern, die Nadja ausdrücklich freigibt (`name`, `city`, `country`); Standard leer. Solange leer, nennt CLOSER keinen Firmennamen.
   - `health`: zusätzlich `knowledge_updated_at` (Zeitpunkt des letzten Wissens-Uploads), optional.
   - Alles andere wie in der Rückmeldung beschrieben.
4. **Wissens-Exportformat:** Format `kcc-knowledge-1` aus Abschnitt 6 ist angenommen, unverändert. Bitte `entries[].id` stabil halten (gleiche Kennung bei Aktualisierung), damit CLOSER Änderungen erkennt.
5. **Einwilligungstext** (Vorschlag, Freigabe durch Nadja; CLOSER sagt ihn vor und zeigt ihn als Text):
   „Damit sich jemand bei dir melden kann, speichere ich deinen Namen, deine E-Mail-Adresse und dein Anliegen und gebe sie an Kickstartercash.Club und an den Partner weiter, der dich empfohlen hat. Du kannst das jederzeit widerrufen. Die Datenschutzerklärung findest du auf kickstartercash.club. Bist du damit einverstanden?"
   CLOSER sendet genau diesen Wortlaut als `consent_text` und `consent: true` nur nach ausdrücklicher Zustimmung im Gespräch.
6. **`conversation_id`:** Format `clsr-<Datum>-<12 Zeichen>` aus `A-Z a-z 0-9 -`, zum Beispiel `clsr-20261018-4f9a1c2be7d0`, Länge 26, erfüllt 8 bis 64 Zeichen. Pro Gespräch einmalig, bei Wiederholungen nach 429/5xx unverändert.
7. **Sponsor-Weitergabe:** Ja. CLOSER liest `?ref=<benutzername>` aus dem Link, behält ihn für die Sitzung (Browser-Speicher, 30 Tage) und sendet ihn als `sponsor_username`. Bitte im Kanal „KI Berater" die Zieladresse mit `?ref=<benutzername des angemeldeten Mitglieds>` versehen, wenn das ohne Eingriff in den Injektor möglich ist; sonst reicht die reine Adresse, dann bleibt `sponsor_resolved: false`.

## Zusätzliche Hinweise

- CLOSER ruft `changes` einmal pro Stunde auf und lädt danach nur geänderte Bereiche; `health` beim Start und bei Fehlern. Bei 403 `DISABLED` wird die Route bis zum nächsten `health` nicht erneut versucht.
- Preise, Produkte, Webinare und Kanäle kommen nach dem Einschalten der Brücke ausschließlich aus der Brücke; die von Hand gepflegten Werte in CLOSER dienen nur noch als Rückfall und werden im CLOSER-Admin als „überholt durch Brücke" angezeigt.
- CLOSER speichert keine Audio-Dateien auf der Plattform und sendet `conversation` und `feedback` nur, wenn Nadja die Routen einschaltet.
- Datenschutz: CLOSER sagt zu Beginn jedes Gesprächs, dass er ein KI-Assistent ist; die Einwilligung zur Lead-Weitergabe wird nur mündlich und zusätzlich sichtbar im Gesprächsfenster eingeholt.

## Was CLOSER für den ersten Test braucht

ZIP P18 eingespielt, Brücke im Admin eingeschaltet, Schlüssel in Vercel als `KCC_BRIDGE_SECRET` hinterlegt. Danach meldet die CLOSER-Session das Ergebnis von `health`, `catalog`, `webinars`, `channels`, `content` und `changes` zurück.
