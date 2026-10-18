# Übergabe: CLOSER Voice Agent, KASH-Chatblase und geplanter Admin-Bereich

Stand: 18. Oktober 2026. Dieses Dokument fasst alles zusammen, was in der
Claude-Code-Session zum CLOSER Voice Agent erarbeitet wurde, damit ein anderer
Chat ohne Vorwissen nahtlos weiterarbeiten kann.

---

## 1. Projekte, Repos, Hosting

### GitHub (Owner: Jizzi811)

| Repo | Inhalt | Zugriff |
|------|--------|---------|
| `Jizzi811/Wolf` | CLOSER Voice Agent (Next.js 15, React 19, Tailwind 4, Vapi Web SDK) | Lesen + Schreiben |
| `Jizzi811/Kickstartercash-App` | Brandmind / KASH-System: React-Frontend (CRA) + FastAPI-Backend + MongoDB, enthält die KASH-Chatblase der Website und die KASH-Wissensbasis | nur Lesen |
| `Jizzi811/Kickstartercash-Promo` | Opt-in-Komponente (Vorname + E-Mail, leitet zu `https://kickstarterai.net/funnel`) | nur Lesen |
| `Jizzi811/chatbot` | Vercel AI-Chatbot-Template, nicht projektspezifisch angepasst | Lesen + Schreiben |

Branches in `Wolf`:

- `persona/closer`: **Produktions-Branch** von closer-henna.vercel.app (CLOSER-Persona). Hier wurde PR #11 gemergt.
- `main`: ältere Version mit LiveKit/Deepgram-Engine (`components/agents-ui`, `app/api/llm-proxy`), nicht die Live-Version.
- `claude/closer-voice-agent-app-qhg2ms`: Slav-Persona (Comedy-Reporter) mit Live-Widgets (Wetter, News, Übersetzer), nur Preview, nicht in Produktion.
- `claude/happy-cori-huugor`: Arbeitsbranch dieser Session, Basis `persona/closer`, Inhalt = PR #11.
- Weitere: `claude/github-setup-lq0lni`, `claude/wolf-voice-agents-clone-tkcx92`, `claude/zoeyos-male-voice-clone-0ti3al`, `feat/jordan-german-no-livekit`, `fix/jordan-voice-groq`.

Offene PRs in `Wolf`: #8 (claude/github-setup → main) und #2 (closer-voice-agent-app → main). Beide unbearbeitet, nicht Teil dieser Session.

### Vercel

- Team: **Nadjai** (`team_UC21dNtljg8K2HMKI4MFd1jD`, slug `nadjai`). Hobby-Plan.
- Projekt **closer** (`prj_X4MJkrag4CuHEa2QSQxY57kuKEkH`), Framework Next.js, Node 24.
  - Domains: `closer-henna.vercel.app` (öffentlich), `closer-nadjai.vercel.app`, `closer-git-persona-closer-nadjai.vercel.app`.
  - Produktions-Branch: `persona/closer`. Preview-Deployments haben Vercel-SSO-Schutz, die öffentliche Domain nicht.
  - Aktuelles Produktions-Deployment: Merge-Commit von PR #11 (`dfd46a0`), Status READY.
- Weitere Projekte im Team: `wolf` (gleiches Repo, baut `main`), `evoli-x`, `rwe-willi`, `aion`.
- Env-Variable im Projekt: `NEXT_PUBLIC_VAPI_PUBLIC_KEY` (öffentlicher Vapi-Key). Provider-Keys (OpenAI, Deepgram, ElevenLabs) liegen im Vapi-Dashboard, nicht in der App.

Hinweis: Die Website `kickstartercash.club` und `kickstarterai.net` waren aus der Session-Umgebung nicht per DNS erreichbar. Ob sie aktuell live sind, konnte nicht geprüft werden.

---

## 2. CLOSER Voice Agent (Wolf, Branch persona/closer)

### Architektur

Eine Next.js-App. Sprachlogik komplett über **Vapi** (gehostet): Browser → Vapi Web SDK mit öffentlichem Key → Vapi (Deepgram STT, OpenAI LLM, ElevenLabs TTS). Kein eigener Agenten-Server.

```
app/                      Layout, Seite, globale Styles
components/closer/        Hero, Orb, Status, Controls, Transkript, Visualizer, Fehler
hooks/use-vapi.ts         kapselt die Vapi-Logik
lib/closer/assistant.ts   transienter Vapi-Assistent (Prompt, Modell, Stimme, Transcriber)
lib/closer/system-prompt.ts  vollständiger CLOSER-Systemprompt
lib/closer/knowledge.ts   Wissensbasis KickstarterCash.club (NEU gefüllt)
lib/closer/lead-capture.ts  Lead-Erfassung, deaktivierter Platzhalter (LEAD_CAPTURE_ENABLED = false)
lib/closer-state.ts       visuelle Zustände
lib/ui-text.ts            alle UI-Texte
app-config.ts             Branding (companyName, productName, Farben, Orb-Bild, startButtonText)
public/johann-orb.png     Orb-Bild
SETUP-CLOSER.md, README.md
```

### Assistenten-Konfiguration (lib/closer/assistant.ts)

- Name: CLOSER, `firstMessageMode: assistant-speaks-first`
- Begrüßung: „Da bist du ja. Ich bin CLOSER, Johanns digitaler Gesprächspartner. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?"
- Modell: OpenAI `gpt-4o-mini`, temperature 0.8
- Stimme: ElevenLabs (`11labs`), voiceId `BDqe1qZiwPi7xspRxTgh`, Modell `eleven_turbo_v2_5`, language `de`, stability 0.45, similarityBoost 0.8, style 0.35, speakerBoost an, speed 1.0
- Transcriber: Deepgram `nova-2`, language `de`
- Systemprompt = CLOSER_SYSTEM_PROMPT + buildKnowledgeContext() + Voice-Hinweis. Gesamtgröße ca. 36.000 Zeichen, ca. 11.000 Tokens.

### Persona CLOSER (Systemprompt, Kurzfassung)

Charismatischer Business-Mentor, Motivationscoach, Sales-Experte mit trockenem Humor, „Wall-Street-Energie, aber juristisch sauber". Keine reale Person, keine Jordan-Belfort-Imitation. Vier Modi: Gesprächspartner, Motivationscoach, Business- und Sales-Mentor, KickstarterCash.club Guide. Voice-Regeln: 1 bis 3 Sätze, eine Frage pro Antwort, keine Listen, kein Markdown, keine Emojis. Keine Anlage-, Rechts- oder Steuerberatung, keine Gewinnversprechen, keine Dark Patterns, keine sensiblen Daten abfragen. Modus 4 nutzt ausschließlich die Wissensbasis und verweist bei Kaufinteresse auf Website, Webinar oder persönlichen Berater; CLOSER speichert keine Daten und löst keine Bestellungen aus.

### Wissensbasis (lib/closer/knowledge.ts), Stand der Quellen Juli 2026

Struktur: `KICKSTARTERCASH_SECTIONS: KnowledgeSection[]` mit `id`, `title`, `content`, `verified`; `LAST_UPDATED = '2026-07-13'`; `buildKnowledgeContext()` baut den Prompt-Block inklusive Voice-Hinweisen (nur Gefragtes nennen, Zahlen aussprechbar, früh klären: privat oder Business, IBAN oder Krypto, schon Member?). `loadKnowledge()` ist der künftige Ladepunkt für DB/Dokumente.

Abschnitte und Kerninhalte:

1. **company**: Kickstartercash.Club = exklusive Membership-Plattform für digitale Unternehmer, Creator, Networker. Slogan „Exclusivity starts with your membership!". Gründer Johann. Ökosystem mit Hubs: Banking, Cards, Investment, Academy, KI, Lifestyle (Immobilien, Adventure, Beauty, Gesundheit), Premium Shop, Fanshop, Videothek, Social Hub, Charity Impact (Global Ledger). Community mit Events, Portal in 70+ Sprachen. Kein Finanzinstitut, keine Bank, kein regulierter Vermögensverwalter; im algorithmischen Kryptohandel tätig, agiert als Club.
2. **membership**: 385 € einmalig, enthält aktuell NUR die Premium Black Card. KI-Plattform (Marketing-Tools, Content-Automatisierung, Funnel-Optimierung, Agenten-System, Design/Video Studio, Social, Analytics, SEO, Agenten-Builder) ist NICHT enthalten, wird separat angeboten, Details offen. Webinar nennt „Premium VIP Gold Membership" / „VIP Gold + KI-Masterclass", 30+ Premium-Features, Lifetime. Zugang dreistufig: kostenlos, Member-Vergünstigung, Premium per Vouchercode.
3. **cards-black** (PayMago): Premium Black Card (Mastercard Debit, Euro-IBAN, Multi-Currency, Exchange, SEPA/SWIFT, Apple/Google Pay, kein Cashback, kein DEX) 385 € in Membership oder 299 € einzeln. Deluxe Black Card: plus DEX/WEX, Cashback, erweiterte Exchange, 460 € separat. KYC vor Ausstellung, App iOS/Android + Web-App.
4. **fees-limits**: Privat: Onboarding 15 €, IBAN 0,60 €/Monat, SEPA 4,50 €, SWIFT 0,375 % min. 45 €, Monitoring 0,12 €, intern 0,23 €, Karte 3 €/Monat, Inaktivität nach 3 Monaten 12 €, pro Kartentransaktion 0,53 €. Business: Onboarding 300 €, IBAN 60 €/Monat, SEPA 0,30 % min. 4,50 €, SWIFT 0,30 % min. 52,50 €, intern 0,15 % min. 4,50 €. Limits: Ein-/Auszahlung je max. 50.000 €, mehr nach KYC/AML.
5. **card-alpha2pay**: Alpha2Pay Mastercard (Krypto): 350 USD Kaufpreis, 25 USD Ausstellung, 10 USD Mindestguthaben, keine Monatsgebühr, USDT TRC20, Top-up 2,3 % min. 4 USD, Mindestaufladung 14 USD, Transaktion 0,25 USD, Apple/Google Pay, internes KYC. Limits: 5.000 USD pro Aufladung, 30.000 USD/Tag, 300.000 USD/Monat. Ausschlüsse: Glücksspiel, Erotik, Geldtransfer, Quasi-Cash, Tankautomaten, Börsenhändler, Waffen. Support DE +49 30 33075362, TR +90 850 3092282.
6. **card-valygo**: Valygo Premium Visa 3.703,70 AED (VIP-Member-Preis), physisch + virtuell, USD-Banking, Multi-Krypto-Wallets, Web3-Identity. Pläne: Freedom 0 USD, Essential 10 USD/Monat (250 USD VYO-Deposit), Premium 50 USD/Monat (1.000 USD VYO). VYO/PGD-Token via MetaMask mit USDT/USDC. Setup: valygo.io registrieren, KYC (Reisepass bevorzugt, keine T-Online/Gmail, max. 500 KB JPG), MetaMask, Plan-Upgrade, playglobal.io mit gleicher E-Mail. Playglobal Visa Debit mit Provisionen in USDT/VYO/PGD.
7. **card-redotpay**: RedotPay Visa (Fintech, 7 Mio. Nutzer), physisch (keine Jahresgebühr, 130 Mio. Händler, ATM, USDC/USDT) und virtuell (in Minuten). Aufladen on-chain, Binance, PayPal, Banküberweisung. Global Payout in Landeswährungen, SWIFT 1 bis 3 Tage. Multiwährungs-Wallet, Earn auf USDC/USDT (Risiko). Portal: Member 150 € (VIP-Code), regulär 180 €, Sponsor-Bonus 25 €.
8. **card-aurum**: Aurum Foundation (Kanada BC1571382, Polen KRS 0001117211), 170.000+ Partner, 150 Mio. USD AuM, USA gesperrt. Stufen: Nova 33 USDT (kein KYC, 3 % / 1,5 %, Bonus 15), Imperium 66 USDT (kein KYC, 2,7 % / 1,2 %, Bonus 30), World Elite 99 USDT (KYC, 2,5 % / 1 %, Bonus 50), Infinity 249 USDT (KYC, 2,2 % / 0,7 %, Bonus 150, 100.000 USD/Monat). Neo-Bank-Provisionen: bis 100 % aus Kartenverkauf, 0,5 % Transaktionen, 1 % Umrechnung, 2,2 % USDT-Einzahlungen. Ökosystem: EX-AI Bot (laut Anbieter Ø +18,5 %/Monat, keine Garantie), Zeus AI, NEYRO, Flash Loans, AURUM Exchange, AURUM Token (Polygon, 100 Mio.). Portal: Member 265 €, regulär 320 €, Bonus 20 €.
9. **cards-more**: Globale White Krypto Card (kein KYC, anonym) Member 470 € / regulär 550 € / Bonus 40 €. Wefi Card (Platinum Business, kostenlose Abhebungen) Member 100 € / regulär 110 € / Bonus 10 €. Alphatopay Kryptocard (kein KYC, kostenlose Abhebungen) Member 350 € / regulär 450 € / Bonus 35 €.
10. **card-overview**: Schnellvergleich aller Karten.
11. **career-plan**: Affiliates verdienen an Hardware (Polar Tresor), Fanshop, Membership-Paketen und Teamaufbau. Basis-Provision 5 Ebenen ohne Qualifikation: 10 / 5 / 2 / 2 / 1 %. Ränge: Visionary 12 %, Momentum Leader 14 %, Elite Ambassador 16 % auf Level 1. Boni: Level-Provision 10 bis 16 %, Leadership 8 bis 15 %, Generations 2 bis 3 %, Team 0,5 bis 1 %. Aktivstatus: 2 neue Kunden/Partner pro Monat ODER 2.000 USD Umsatz. Ränge bleiben für immer.
12. **webinar**: kickstartercash.club/webinar.html, Button „Webinar ansehen". Vertrauensmerkmale: 256-Bit SSL, lizenzierte Produkte, verifizierte Payment-Gateways, Rechtsgutachten Polar Tresor.
13. **contact**: Website, Webinar, Funnel (Vorname + E-Mail, Berater meldet sich), KASH-Chat (Team meldet sich in 24 h), Sponsor/Berater. CLOSER speichert nichts und behauptet das auch nicht.
14. **legal**: Risikohinweise (Kryptohandel, Totalverlust möglich), keine Rendite-Garantie, Provisionen keine garantierte Einnahme, Steuerpflicht möglich, kein öffentliches Angebot, Nutzung auf eigene Verantwortung, DSGVO-Hinweis.
15. **forbidden**: Was CLOSER nie behaupten darf.

Im Webinar-Footer genannte Firmen: „ALPHA CASHCLUB BİLİŞİM LİMİTED ŞİRKETİ" und „REPAL L.L.C-FZ · BUILT FOR THE FUTURE" (nicht in die Wissensbasis übernommen, da nicht bestätigt).

### PR #11

`https://github.com/Jizzi811/Wolf/pull/11`, Branch `claude/happy-cori-huugor` → `persona/closer`, gemergt am 18.10.2026. Geänderte Dateien: `lib/closer/knowledge.ts`, `lib/closer/system-prompt.ts` (Modus 4 erweitert), `README.md`, `SETUP-CLOSER.md`. Typecheck, Lint, Build grün. Produktion live.

---

## 3. KASH-Chatblase (Kickstartercash-App)

### Frontend (Repo-Root `index.html`, ca. 88 KB)

- Titel „KASHBOT | Kickstartercash.Club KI-Agent System". Goldener Orb, Klick öffnet Panel.
- CEO-Agent „Kashbot" begrüßt und delegiert an Abteilungen: Marketing, Design, Video, Sales, SEO, Automation, Social Media, Analytics (jeweils eigener Agent mit Farbe, Emoji, Intro, Studio-Link ins Dashboard).
- Zweite Blase „KASH, Sales & Support" mit Schnellfragen („Was kann Kickstartercash.Club für mich tun?", „Welche KI-Tools sind enthalten?", „Was kostet die Mitgliedschaft?", „Wie starte ich mit dem System?"), Support-Ticket (Support, Abrechnung, Technisch, Feature-Wunsch) und Lead-Badge „LEAD ERFASST".
- Browser-TTS (speechSynthesis) und Spracheingabe (SpeechRecognition).
- Backend-Aufruf: POST mit `{agent_id, message, language: "DE", history (letzte 10), model: "claude-opus-4-8", use_knowledge: false}` an das Agenten-API; die KASH-Blase ruft `/api/homepage/chat`.
- `webinar.html` und `backend/funnel_bundle.html` sind 28-MB-Bundles (Webinar-Präsentation, Mitglieder-Funnel).

### Backend (`backend/server.py`, FastAPI + MongoDB)

- `KASH_SYSTEM` (Zeilen ca. 1489 bis 1950): die komplette Produkt-Wissensbasis, Quelle für Abschnitt 2 oben. Enthält zusätzlich: Lead-Capture-Protokoll (Name + E-Mail erfragen, dann `LEAD_CAPTURE:{"name","email","interest"}` als JSON anhängen), Sales-Rolle, Persönlichkeit („Luxury-Mindset, max. 4 bis 5 Sätze, ✦ als Aufzählungszeichen").
- `POST /api/homepage/chat`: Rate-Limit pro IP, Modellwahl (Gemini Standard, Claude wenn verfügbar, kein Grok), extrahiert `LEAD_CAPTURE`, erkennt Signale, speichert Gespräche und Leads in MongoDB, versendet HTML-Benachrichtigungen (Resend) und einen täglichen KASH-Report (`_kash_daily_report_scheduler`).
- Weitere Module laut `memory/PRD.md`: Brand Designer, Social Media Maschine, Bildgenerator (Nano Banana via poyo.ai), Copywriter, Prompt-Bibliothek, Ein-Klick-Kampagne, Content-Kalender, Export-Center, Markenwächter, Verkaufs-Funnel (personalisiert pro Member mit Reflink, Foto, Kontaktdaten inkl. optionalem Telegram-/Instagram-Handle; Leads per Resend an Berater), GPT-/Gemini-Chat.
- Standard-Marke wurde von „Kickstartercash.Club" auf „Brandmind" umbenannt (Projekt heißt intern Brandmind, Slogan „Das Gehirn deiner Marke").
- Hosting laut Repo-Dateien: `railway.toml`, `nixpacks.toml`, `Procfile`, `netlify.toml`, `BRANDMIND_DEPLOY.md`, `docs/NETLIFY_MIGRATION.md`. Welche Instanz aktuell live ist, ist unbekannt.
- Offener Punkt aus PRD: Domain kickstartercash.club bei Resend verifizieren.

### Telegram

Es gibt in keinem der Repos einen Telegram-Bot. „Telegram" kommt nur als optionales Kontaktfeld im Funnel-Formular und in Prompt-Texten vor.

---

## 4. Geplanter Ausbau: Admin, Team, User, Chatblase

Zielbild, wie in der Session besprochen, noch NICHT umgesetzt:

- **Öffentliche Seite**: die heutige CLOSER-Seite.
- **Admin-Bereich** (nur Inhaber): Login; Pflege aller Texte, Bilder, Icons, Farben, Begrüßung, Stimme; komplette Wissensbasis editierbar; Upload von PDF, Word, Text, Bildern, Audio, Video; Dokumente werden ausgelesen, Audio/Video transkribiert, alles wird Wissen für den Agent; Leads und Gesprächsprotokolle.
- **Team-Bereich**: gleiche Oberfläche wie Admin, Rechte pro Person, zusätzliche Tabs (Leads, Protokolle, Material).
- **User-Bereich**: Login für Mitglieder, persönlicher Zugang zum Agent, Gesprächsverlauf, freigegebene Downloads.
- **Eine Wissensbasis für alles**: CLOSER (Voice) und KASH-Chatblase lesen aus derselben Quelle. KASH-Backend holt Wissen per geschützter Schnittstelle aus dem Admin statt aus dem fest kodierten `KASH_SYSTEM`. Leads aus der Chatblase landen ebenfalls im Admin. Optional CLOSER als Sprach-Button in der Chatblase.
- **Technik-Vorschlag**: Datenbank (Vercel Postgres/Neon) und Datei-Speicher (Vercel Blob) im Team Nadjai; Rollen admin/team/user; Wissen aus DB laden, große Dokumente als Vapi-Wissensbasis (Vapi Files/Knowledge Base API, braucht `VAPI_PRIVATE_KEY` serverseitig); Transkription von Audio/Video z. B. über Deepgram oder Whisper.
- **Reihenfolge**: 1) Datenbank, Login, Admin mit Wissenspflege und Uploads, 2) Anbindung KASH-Chatblase, 3) Team- und User-Bereich. Jeweils Preview-Link vor dem Merge.

### Was noch fehlt, bevor gebaut werden kann

1. Inhalt des anderen Claude-Chats (Datenbank-Planung, Felder, Rollen, ggf. Code), als Text, Datei, Repo-Link oder Artefakt-Link.
2. Okay des Inhabers, Datenbank und Blob-Speicher im Vercel-Team Nadjai anzulegen (Freikontingent im Hobby-Plan, Kosten möglich bei viel Video).
3. `VAPI_PRIVATE_KEY` als Umgebungsvariable im Vercel-Projekt closer (nicht im Chat teilen).
4. Info, wo das KASH-Backend aktuell läuft (Railway/Netlify/andere) und Schreibrecht auf `Jizzi811/Kickstartercash-App`.

---

## 5. Nützliche Befehle (Wolf)

```bash
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_VAPI_PUBLIC_KEY setzen
pnpm dev                     # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm build
```

Persona wechseln: `lib/active-persona.ts` (nur auf dem Slav-Branch vorhanden), Branding in `app-config.ts`, Texte in `lib/ui-text.ts`.

---

## 6. Abgleich mit dem Plattform-Chat (UEBERGABE-AUS-CHAT.md, 18.10.2026)

Das Übergabe-Dokument des Plattform-Chats liegt der CLOSER-Session seit dem
18.10.2026 vor. Maßgebliche Reihenfolge bei Widersprüchen: Datenbank der
Plattform > Plattform-Code > Aussagen der Betreiberin > ältere Quellen.

### Korrekturen in der CLOSER-Wissensbasis (umgesetzt)

| Thema | Stand vorher (aus KI-Marketing Hub, Juli 2026) | Plattform-Fakt (Datenbank 18.10.2026) |
|---|---|---|
| Pakete | nur „Membership 385 € mit Premium Black Card" | 4 Pakete: 385 / 485 / 645 / 725 €, Einrichtung 5 € (Privat) bzw. 25 € (Business) |
| Black Card | Premium 299 € einzeln, Deluxe 460 €, Monatsgebühr 3 € | Private 315 € (Mitglied 285 €), Business 550 € (Mitglied 450 €), Einrichtung 5 / 25 €, monatlich 10 / 15 € |
| Provisionen | Level 10 / 5 / 2 / 2 / 1 %, Ränge 12 / 14 / 16 % | Ebene 1 fester Euro-Betrag je Produkt (45 / 65 / 80 / 100 €, Karten 35 / 55 €), Ebenen 2–6: 1 / 0,5 / 0,5 / 0,5 / 0,5 % auf CV; Boni derzeit 0 % |
| Ränge | 3 Ränge | 5 Ränge: Affiliate, Visionary, Momentum Leader, Elite Ambassador, Crown President |
| Partner-Kryptokarten (Alpha2Pay, RedotPay, Aurum, …) | als Fakt mit Preisen | nicht in der Plattform-Datenbank; jetzt als UNBESTÄTIGT markiert |
| PAYMAGO-Gebührenliste | als Fakt | nicht in der Datenbank; UNBESTÄTIGT |
| Webinar | nur Link kickstartercash.club/webinar.html | fester Wochenplan (KCC Di/Do 20:00, Sa 12:00; VALYGO Fr 19:30; ARVI Mi 20:00; …) |
| Kontakt | nur „Website/Team" | offizielle Telegram-/WhatsApp-Kanäle, Support-Bot, Telegram-App, Support-Blase |
| Status | – | Go-live 18.10.2026, Kartenstart 20.10.2026, Auszahlungen pausiert |
| Firma | nicht genannt | weiterhin nicht genannt (Widerspruch KICKSTARTERCASH L.L.C-FZ / REPAL L.L.C-FZ offen) |

### Klarstellungen zur Architektur

- Die Plattform kickstartercash.club ist **PHP + MariaDB auf Namecheap cPanel**; Admin-, Team- und User-Bereich **existieren dort bereits**. Das React/FastAPI/MongoDB-Projekt `Kickstartercash-App` ist der separate **KI-Marketing Hub**, nicht die Plattform.
- Die „Chatblase" der Plattform ist das **Support-Widget** (goldener Knopf, Kanäle aus `mod_support_channels`) mit dem funktionslosen Platzhalter-Kanal **„KI Berater"**. Der KI-Assistent **„Kash"** steckt im **Member Support Bot** (Node.js, Telegram). Die KASH-Blase im KI-Marketing Hub ist ein drittes, separates System.
- Zugriff von außen auf Plattformdaten nur über eine **signierte Schnittstelle** (Muster `api/member-support/index.php`), nie direkt auf die Datenbank. Änderungen an der Plattform liefert der Plattform-Chat als ZIP; die CLOSER-Session spielt nichts live ein.

### Offene Entscheidungen der Betreiberin

1. Ersetzt CLOSER den Kash-Assistenten, ergänzt er ihn, oder ist er die Sprachvariante davor?
2. Anbindung an die Support-Blase: Kanal „KI Berater" als Link auf CLOSER (sofort möglich), Einbettung per Skript, oder signierte Schnittstelle mit `catalog`- und `lead`-Routen (empfohlen, mittelfristig).
3. Firmenname und Einlagensicherungs-Aussage freigeben.
4. Anrede im Voice Agent: CLOSER duzt, die Plattform siezt in Marketing-Texten.
5. Ob „Johann" als Gründer/Gesicht von CLOSER bleibt (die Plattform nennt Nadja als Betreiberin).
