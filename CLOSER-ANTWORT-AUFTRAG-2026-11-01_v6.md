# Antwort der CLOSER-Session auf die Übergabe v6 „Die ganze Webseite“ (01.11.2026)

Stand: 01.11.2026, mittags. Branch `claude/happy-cori-huugor`, PR Jizzi811/Wolf#14 (Entwurf) gegen `persona/closer`.
Preview: https://closer-git-claude-happy-cori-huugor-nadjai.vercel.app · **Kein Merge ohne Nadjas Ja.**
Plattform-Version, auf die der Code passt: `CLOSER_BRIDGE_LOADED 2026-11-01.2` (P18e), Route `directory` neu.

## 1. Zugang und Bereiche

- `KCC_BRIDGE_URL` / `KCC_BRIDGE_SECRET`: vorhanden (Production und Preview). Signatur unverändert wie v5.
- Gelesen werden jetzt 14 Bereiche: `catalog`, `webinars`, `channels`, `content`, `knowledge`, `overview`, `relocation`, `guides`, `promo`, `realestate`, `social`, `tour`, `learned`, **`directory`**, dazu `changes?since=`.
- Antwort „geschlossen/404/403“ oder `available:false` oder leere Liste = CLOSER weiß es nicht und sagt das ehrlich; im CLOSER-Admin steht der Bereich dann als „nicht freigeschaltet“ bzw. „aus“.
- **Anzahl Einträge je Bereich:** steht im CLOSER-Admin → Plattform-Anbindung in der neuen Spalte „Einträge“ (nach „Alles neu laden“). Die CLOSER-Session kann die Zahlen aus der Sandbox nicht selbst abrufen; Nadja liest sie dort ab.

## 2. „Einen Moment, ich schaue nach“ – so ist es gebaut

1. **Ein Werkzeug in beiden Kanälen:** `kcc_nachschlagen(bereich, stichwort?)`, `bereich` ∈ {catalog, webinars, overview, relocation, guides, realestate, directory, social, promo, tour, content, learned}. Es ruft die Route **ohne Zwischenspeicher** auf (`lib/bridge/lookup.ts`) und gibt die Daten gekürzt (max. ca. 14 000 Zeichen, optional nach Stichwort gefiltert) an das Modell zurück. Frische Daten landen nebenbei im Zwischenspeicher.
2. **Ansage vor dem Aufruf:** im Sprachmodus als Vapi-Nachricht `request-start` in der Sprache der Person (32 Sprachen hinterlegt, Rückfall Englisch), z. B. de „Einen Moment, ich schaue kurz nach.“, en „One moment, let me check that for you.“, tr „Bir saniye, hemen bakıyorum.“, fr „Un instant, je vérifie.“. Dauert es länger als 3 Sekunden, wiederholt Vapi die Ansage einmal. Im Textmodus erscheint der Satz als kleine Zeile über der Antwort. Die Prompt-Regel sagt: nicht bei jeder Kleinigkeit, nur wenn wirklich nachgeschlagen wird.
3. **Wann live:** laut Prompt-Regel immer bei Webinar-Terminen, Preisen und Paketen, Karten, Bankkonten, Auswandern, Health Box, Shop/Fanshop, Mitteilungen/News, Team, Services, Partnern, Rechtlichem und bei „Wo finde ich …?“ (Link). Menü, Handbuch, Wissensdatei aus dem Speicher.
4. **Zeitlimit 4 Sekunden.** Kommt nichts: letzter gespeicherter Stand mit Datum an das Modell, Anweisung „nichts erfinden, keine Fehlermeldung zeigen“, stattdessen Rückfrage oder Weg über Termin/Support. Gibt es auch keinen Speicher: dieselbe Anweisung ohne Daten.
5. **Webinare:** Zeitzone aus dem Feld `timezone` (Antwort oder je Termin) wird mitgegeben; Prompt-Regel „immer mit Zeitzone, auf Wunsch in Ortszeit umrechnen“.

## 3. Landkarte (Abschnitt 3 der Übergabe)

Umgesetzt in `lib/bridge/knowledge-from-bridge.ts` (Speicher) und `lib/bridge/lookup.ts` (live):
- `overview`: beide Bereiche (`public`, `user`) mit Kategorien, Menüpunkten und Links; Zahl der Hauptkategorien wird aus den Daten gezählt (nichts fest). `site_url`, `login_url`, `register_url`, `member_area_url` werden mitgegeben. Mitglieder-Links nur mit „nach der Anmeldung“.
- `directory`: `legal` (Titel + Link, keine Auslegung), `team`/`experts` (Name, Rolle, Sprachen; Telefon/E-Mail-Felder werden serverseitig entfernt), `services` (mit Preisen), `partners`, `print_partners`, `news` (nur laufende, Zeitfenster `from`/`until` wird serverseitig geprüft), `charity`.
- `catalog`: zusätzlich `banking_accounts`, `healthbox_packages`, `shop_products`, `fanshop`, `emigration_packages` (nur aktiv und sichtbar). Keine feste Paket-Anzahl mehr im Prompt; ein alter gespeicherter Prompt mit „vier Pakete“ wird beim Lesen automatisch ersetzt.
- Alle anderen Bereiche wie in v5/P18c.

## 4. Mitglieder-Seiten, Admin, Team

Prompt-Regeln: Mitglieder-Seiten benennen, erklären und mit „nach der Anmeldung“ verlinken; persönliche Daten (Guthaben, Wallet, Zahlungsdaten, Tickets, Mailbox, Bestellungen, Profil, KYC) nie lesen – es gibt dafür keine Route und keine Funktion; „Wie viel Guthaben habe ich?“ → Erklärung, wo es steht. Admin- und Team-Seiten gibt es für CLOSER nicht („Dazu kann ich Ihnen nichts sagen.“); `admin` ist auch kein gültiger Bereich des Werkzeugs.

## 5. Aktuell halten (Abschnitt 6)

- Bei **jedem neuen Gespräch** (Sprach- und Textmodus) ruft der Server `changes?since=<letzter Abgleich>` (höchstens einmal pro Minute) und lädt nur Bereiche mit anderem Hash bzw. `changed:true` neu. `directory` gehört dazu.
- **Lange Gespräche:** der Browser stößt alle 5 Minuten `/api/bridge/refresh` an (gleiche Logik, höchstens alle 5 Minuten). Im Textmodus passiert das je Nachricht.
- Plattform weg: letzte Daten, nichts erfinden, keine Fehlermeldung.
- Cron 03:00 bleibt als Sicherheitsnetz (kompletter Abgleich), ist aber nicht mehr nötig.
- Vorrang: `learned` > Live-Bereiche > `knowledge` > Startwissen (Startwissen nur, wenn die Plattform nicht erreichbar ist).

## 6. Ehrliche Grenzen

- Live lesbar: alles, was die Routen liefern (Termine, Pakete, Karten, Bankkonten, Auswandern, Handbuch, Immobilien, News, Team, Services, Partner, Charity, Rechtstexte, Menüs/Links).
- Nicht live lesbar: fest in PHP-Seiten stehender Text (Kredit & Finanzen, DEX, Founders Club …). Dort kennt CLOSER Name, Link und Aufbau live und die Erklärung aus `knowledge`; Textänderungen brauchen weiterhin den Wissens-Upload. Ein „Seitenleser“ wäre ein eigener Auftrag.
- Persönliche Mitglieder-Daten: nie.
- Ob die Plattform die Zusatzinformationen `timezone` bei `webinars` und `login_required` bei `overview` wirklich liefert, kann die CLOSER-Session nicht prüfen; fehlt `timezone`, nimmt CLOSER Europe/Berlin an und sagt das dazu.

## 7. Abnahme (Abschnitt 10) – Belege

Automatische Tests (`pnpm test:db`, PGlite ohne Netz, simulierte Plattform-Antworten): Verzeichnis ohne Kontaktdaten und nur laufende News; Menü mit gezählten Hauptkategorien, Links aus den Daten, Mitgliederbereich markiert; Bankkonten nur aktive; Werkzeug mit türkischer Ansage; Live-Abruf mit Zeitzonen-Hinweis und Speicherung; abgeschalteter Bereich → „nicht freigegeben“; Plattform weg → letzter Stand mit Stichwort-Filter; nichts da → keine Fehlermeldung; `admin` kein Bereich; Daten gekürzt. Alles grün, dazu Typprüfung, Lint und Build.

Die Gesprächs-Tests 1 bis 8 (Hauptkategorien, Links, nächstes Webinar, Pakete/Karten/Konten, Guthaben, Expertenteam, Mitteilung, Test-Paket nach 5 Minuten) kann nur Nadja in der Preview machen, weil Vapi/OpenAI aus der Sandbox nicht erreichbar sind. Für den Textmodus braucht die Preview `OPENAI_API_KEY` oder `VAPI_PRIVATE_KEY`.

## 8. Bitte an den Plattform-Chat

- Bei `webinars` das Feld `timezone` (Antwort oder je Termin) sicherstellen; bei `overview` `login_required` für Mitglieder-Punkte.
- Falls ein Bereich im CLOSER-Admin `fehler` zeigt: Route, HTTP-Status und `code` mitschicken.
- Kanal „KI Berater“ weiterhin als Link `https://closer-henna.vercel.app/?lang=<Header-Sprache>&ref=<Benutzername>`.
