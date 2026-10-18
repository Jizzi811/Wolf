# Spezifikation: Signierte Brücke Plattform ↔ CLOSER

Stand: 18.10.2026. Auftrag an den Plattform-Chat (PHP-Plattform kickstartercash.club).
Ziel: CLOSER (Voice Agent, Repo Jizzi811/Wolf, Vercel) soll **alle Inhalte, Preise,
Produkte, Webinare, Kanäle und Texte der Plattform** automatisch lesen und Leads
zurückschreiben, ohne direkten Datenbankzugriff und ohne Personendaten von
Mitgliedern. CLOSER **ersetzt Kash nicht**, er ist ein zusätzlicher Kanal; beide
sollen dieselbe Quelle nutzen.

Regeln der Plattform gelten: Lieferung als ZIP durch den Plattform-Chat, additiv,
nichts löschen, Zeilenenden erhalten, keine Geheimnisse in Chats oder Dateien.
Die CLOSER-Session spielt nichts auf dem Server ein.

---

## 1. Technik, bitte genau wie die bestehende Member-Support-Brücke

- Neue Datei `api/closer/index.php`, aufgebaut wie `api/member-support/index.php`
  (Routen über `?route=…`, JSON UTF-8, `inc/config.php` einbinden).
- Signatur: HMAC-SHA256 über `timestamp + "\n" + nonce + "\n" + method + "\n" + route + "\n" + sha256(body)`.
  Header: `X-CLOSER-Timestamp` (Unix-Sekunden), `X-CLOSER-Nonce` (zufällig, einmalig),
  `X-CLOSER-Signature` (hex). Zeitfenster 5 Minuten, Nonces merken (eigene Tabelle
  `closer_api_nonces`, Aufbau wie `member_support_api_nonces`). Ohne gültige
  Signatur: HTTP 401, ohne Inhalt.
- Geheimnis: neuer Schlüssel `closer_api_secret` in `inc/member-support-secrets.php`
  (oder eigene Datei `inc/closer-secrets.php`), gesetzt über eine Admin-Seite
  „CLOSER-Anbindung" mit Knopf „Schlüssel erzeugen". Der Schlüssel wird NUR im Admin
  angezeigt und von Nadja als Umgebungsvariable `KCC_BRIDGE_SECRET` in Vercel
  eingetragen. Nie in Chats.
- Außerdem Einstellungen: `closer_enabled` (0/1), `closer_public_url`
  (z. B. `https://closer-henna.vercel.app`), `closer_allowed_ips` (optional).
- Antworten enthalten immer `generated_at` (deutsche Zeit, ISO) und `version`.

## 2. Lesende Routen (GET)

Alle Routen liefern **nur Katalog- und Inhaltsdaten**, nie Zeilen aus `users`,
nie Wallet-, Transaktions-, KYC-, Ticket- oder Mailbox-Daten.

| Route | Inhalt | Quelle |
|---|---|---|
| `health` | Status, Version, Serverzeit | – |
| `catalog` | Pakete (`system_packages`: id, name, Preise in allen Währungen, `cv_value`, `direct_commission_eur`, Einrichtung, `features_json`, Sichtbarkeit, enthaltene Karten/Konten/Exchange), Black Cards (`mod_exclusive_cards`: id, name, Marke, Normal-/Mitgliedspreis, Einrichtung, monatlich, cv, aktiv), Health-Box-Pakete, Auswandern-Pakete, Shop-Produkte (`mod_shop_products`, nur aktive), Fanshop-Kollektionen (Name, Preis), Ränge (`system_affiliate_ranks`), Provisions-Einstellungen (`global_comm_lvl2..6`, `shop_comm_lvl1..6_percent`, `withdrawals_locked`, `global_comm_active`), Währungen (`giga_currencies`) | DB |
| `webinars` | Kommende und wiederkehrende Webinare (`mod_live_webinars` + Wiederholungslogik aus `inc/kcc-webinar-occ.php`): Titel, Typ EIGEN/PARTNER, Beschreibung, Kurzbeschreibung, nächster Termin deutsche Zeit, Sprache, öffentliche Anmeldeseite. **Keine** Zoom-Links oder Passwörter. | DB |
| `channels` | Support-Kanäle (`mod_support_channels`: Name, Art, Icon, Untertitel, Link) und offizielle Links aus `funnel_cms_widgets` (`bubble_telegram`, `bubble_whatsapp`). **Keine** Telefonnummern, außer Nadja gibt sie explizit frei (Einstellung `closer_share_phone = 1`). | DB |
| `content` | Öffentliche Texte: Seitentitel/SEO, Markentexte, Pre-Launch-Texte, Countdown-Einstellung (`dashboard_timer_date`), Auszahlungs-Hinweistext, News (`system_news`, nur öffentliche), Funnel-CMS-Texte (`funnel_cms_widgets`, `funnel_cms_settings` ohne Geheimnisse), Fußzeilen-Links, Rechtstexte-Links (`legal.php`-Abschnitte). Dazu eine **Whitelist** unkritischer `system_settings`-Schlüssel (Liste wie Anhang E.2 der Übergabe). | DB |
| `knowledge` | Wissensdatenbank-Einträge des Member Support Bots (Frage, Varianten, Antwort, Thema, Sprache, Stichwörter), falls erreichbar: entweder über eine Export-Datei, die der Node-Bot regelmäßig nach `uploads/closer/knowledge.json` schreibt, oder über eine neue Bot-Route. Ziel: **eine Wissensquelle für Kash und CLOSER.** | Bot |
| `changes?since=<ISO>` | Welche der obigen Bereiche sich seit dem Zeitpunkt geändert haben (Vergleich über `updated_at`-Spalten bzw. Hash des Inhalts), damit CLOSER nur bei Bedarf neu lädt. | DB |

## 3. Schreibende Routen (POST, JSON-Body)

| Route | Zweck | Ziel |
|---|---|---|
| `lead` | Interessent aus einem CLOSER-Gespräch: `first_name`, `last_name` (optional), `email`, `phone` (optional), `interest` (Freitext), `language`, `sponsor_username` (aus Reflink-Cookie oder Nennung, optional), `consent` (muss true sein, sonst 422), `source = "closer"`, `conversation_id`. | `crm_leads` (plus `users.role = lead`, falls so üblich) und Benachrichtigung an den Sponsor bzw. Admin per `sendSystemEmail` (neue Vorlage `closer_lead`) |
| `conversation` | Gesprächs-Zusammenfassung ohne Audio: `conversation_id`, Dauer, Sprache, Themen (Liste), Ergebnis (Lead/Info/Abbruch), Zeitpunkt. Dient der Statistik im Plattform-Admin (optional, Nadja entscheidet). | neue Tabelle `closer_conversations` |
| `feedback` | Hinweise, dass eine Antwort fehlte (Frage, die CLOSER nicht beantworten konnte) → landet als „Offene Frage" in der Wissensdatenbank des Bots bzw. in `closer_open_questions`. | Tabelle |

## 4. Anbindung an die Support-Blase

1. Sofort, ohne Code: Kanal **„KI Berater"** in `mod_support_channels` auf Art `link`
   stellen und als Ziel `closer_public_url` eintragen (Admin → Support). Untertitel
   z. B. „Sprich mit CLOSER – KI-Berater".
2. Später: Einbettung als Overlay über den bestehenden Injektor in `inc/config.php`
   (nur `widget_show_public`/`widget_show_user`, nie Admin), sobald das
   Cookie-/Einwilligungssystem (P3) steht. CLOSER liefert dafür ein eigenes
   Einbettungsskript und einen Content-Security-Policy-Hinweis.

## 5. Was CLOSER daraus macht

- Lädt `catalog`, `webinars`, `channels`, `content`, `knowledge` beim Start und dann
  stündlich bzw. wenn `changes` etwas meldet; baut daraus automatisch die
  Wissensbasis (Preise werden damit nie mehr von Hand gepflegt).
- Im CLOSER-Admin kann Nadja jeden Abschnitt freigeben oder sperren, eigene Texte
  ergänzen und Dateien hochladen. Gesperrte oder widersprüchliche Angaben nennt
  CLOSER nicht.
- Leads und Gespräche werden an die Plattform gemeldet, wenn Nadja die Routen
  freischaltet.

## 6. Was der Plattform-Chat bitte zurückmeldet

- Dateiliste der Lieferung, Routenliste mit Beispielantworten (ohne echte Daten),
  Name der neuen Admin-Seite, Name der Einstellungen, Hinweis, wie Nadja den
  Schlüssel erzeugt und in Vercel einträgt.
- Offene Punkte, die er nicht liefern kann (z. B. Bot-Wissensexport), mit Vorschlag.
