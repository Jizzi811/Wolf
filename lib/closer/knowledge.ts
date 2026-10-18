/**
 * Wissensbasis für KickstarterCash.club (KCC).
 *
 * QUELLEN UND VERLÄSSLICHKEIT (Stand 18.10.2026):
 *  [FAKT-DB]   Datenbank-Export der Plattform kickstartercash.club vom 18.10.2026
 *              (Tabellen system_packages, mod_exclusive_cards, system_affiliate_ranks,
 *              system_settings, mod_support_channels), übermittelt über das
 *              Übergabe-Dokument des Plattform-Chats (UEBERGABE-AUS-CHAT.md).
 *  [FAKT-CODE] Quellcode der PHP-Plattform laut demselben Dokument.
 *  [NADJA]     Aussagen und Entscheidungen der Betreiberin im Plattform-Chat.
 *  [ALT]       Ältere KASH-Wissensbasis aus dem Repo Jizzi811/Kickstartercash-App
 *              (KI-Marketing Hub, Juli 2026). Wo sie der Datenbank widerspricht,
 *              gilt die Datenbank. Nicht bestätigte Inhalte stehen in Abschnitten
 *              mit `verified: false` und werden CLOSER als UNBESTÄTIGT markiert.
 *
 * Pflege:
 *  1. Preise, Gebühren, Provisionen und Termine ändern sich. Maßgeblich ist immer
 *     Admin/Datenbank der Plattform. Bei Änderungen den Abschnitt anpassen und
 *     `LAST_UPDATED` setzen. Mittelfristig soll `loadKnowledge()` den Katalog
 *     über eine signierte Schnittstelle der Plattform laden (siehe Übergabe).
 *  2. Ein Abschnitt mit `verified: false` darf von CLOSER nicht als Fakt
 *     verwendet werden. Erst nach Freigabe durch die Betreiberin auf true setzen.
 *
 * Die Texte sind bewusst Klartext ohne Tabellen, weil sie in den Systemprompt
 * eines VOICE-Agenten wandern.
 */

export interface KnowledgeSection {
  /** Stabiler Schlüssel, z. B. für spätere Teil-Updates. */
  id: string;
  /** Menschlich lesbarer Titel des Abschnitts. */
  title: string;
  /** Freigegebener Inhalt. */
  content: string;
  /** true, sobald der Inhalt vom Team geprüft und freigegeben wurde. */
  verified: boolean;
}

export interface CompanyKnowledge {
  sections: KnowledgeSection[];
  /** Stand der Informationen (ISO-Datum) oder null, falls unbekannt. */
  lastUpdated: string | null;
}

/** Stand der Quelldaten (Datenbank-Export der Plattform), ISO-Datum. */
export const LAST_UPDATED = '2026-10-18';

export const KICKSTARTERCASH_SECTIONS: KnowledgeSection[] = [
  {
    id: 'company',
    title: 'Was ist Kickstartercash.Club?',
    verified: true,
    content:
      'Kickstartercash.Club, kurz KCC, ist eine Mitglieder-Plattform mit Empfehlungsnetzwerk über ' +
      'sechs Ebenen. Markenzeile: „Kickstartercash.Club – Ökosystem". Leitsatz: „Dezentrale ' +
      'finanzielle Freiheit beginnt mit exklusivem Wissen und der richtigen Infrastruktur." ' +
      'Slogan: „Exklusivität beginnt mit Ihrer Mitgliedschaft" (englisch „Exclusivity starts with ' +
      'your membership!"). Weitere Markentexte: „Finanzielle Freiheit beginnt hier." und „Mehr ' +
      'Freiheit! Außerhalb des Europäischen Raums." ' +
      'Zielgruppe: Unternehmen, Freiberufler, Start-ups und Menschen, die mehr Freiheit genießen ' +
      'möchten. Im Mittelpunkt steht die Black Card, eine Mastercard-Debitkarte mit eigenem Konto ' +
      'und IBAN außerhalb Europas über den Partner PAYMAGO. Dazu kommen Mitgliedschafts-Pakete, ' +
      'Webinare, Shop und Fanshop, ein Gold-Investment-Modul (Goldmine mit Earthforge), Auswandern ' +
      'und Plan B, ein Real-Estate-Bereich, die Health-Box, Founders Club, eine Spendenauswahl ' +
      '(Charity) und Support-Systeme mit Telegram-App und Support-Bot. ' +
      'Die Plattform ist seit Anfang Oktober 2026 im Pre-Launch, Go-live war der 18. Oktober 2026. ' +
      'Alle Zeitangaben gelten in deutscher Zeit. Hauptsprache ist Deutsch, die Oberfläche ist in ' +
      'über 130 Sprachen übersetzbar, Druckmaterial gibt es in 17 Sprachen. ' +
      'Kickstartercash.Club ist KEIN lizenziertes Finanzinstitut, KEINE Bank und KEIN regulierter ' +
      'Vermögensverwalter; Banking- und Kartenleistungen kommen von Partnern. Den Firmennamen und ' +
      'Firmensitz nennt CLOSER NICHT, weil die Angaben noch bestätigt werden müssen.',
  },
  {
    id: 'packages',
    title: 'Mitgliedschafts-Pakete (Preise aus der Datenbank, Stand 18.10.2026)',
    verified: true,
    content:
      'Es gibt vier aktive Pakete, alle einmalig in Euro, Preise als „ab"-Preise nennen: ' +
      'Erstens PREMIUM VIP BLACK CARD MEMBERSHIP PRIVATE für 385 Euro, Einrichtung 5 Euro. ' +
      'Zweitens DELUXE VIP BLACK CARD und DEX EXCHANGE MEMBERSHIP PRIVATE für 485 Euro, Einrichtung ' +
      '5 Euro. Drittens PREMIUM VIP BLACK CARD MEMBERSHIP BUSINESS für 645 Euro, Einrichtung 25 ' +
      'Euro. Viertens DELUXE VIP BLACK CARD, DEX EXCHANGE und KRYPTOCARD MEMBERSHIP BUSINESS für ' +
      '725 Euro, Einrichtung 25 Euro. ' +
      'In jedem Paket enthalten: die Premium Black Card (digitale und physische Debitkarte), ein ' +
      'persönliches Konto bzw. bei Business ein vollwertiges Business-Konto außerhalb Europas, ' +
      'eigene IBAN, Multi-Currency mit bis zu 40 Währungen, SEPA- und SWIFT-Transfers, weltweit ' +
      'Geld empfangen und versenden, laut Paketbeschreibung bis 100.000 Euro pro Transaktion und ' +
      'mehrere Transaktionen täglich, der persönliche Funnel mit Empfehlungssystem, Freigabe aller ' +
      'Webinare und Provisionsberechtigung für das ganze Ökosystem. ' +
      'Unterschied Premium zu Deluxe: Premium hat KEINEN Zugang zur DEX/WEX Exchange und KEIN ' +
      'Cashback-System. Deluxe enthält den DEX/WEX Exchange-Zugang, das Cashback-System und die ' +
      'erweiterten Membership-Features. Das Business-Deluxe-Paket enthält zusätzlich eine ' +
      'Kryptocard. Unterschied Private zu Business: die Kontoart (Privatkonto oder Business-Konto) ' +
      'und die Einrichtungsgebühr. ' +
      'Ein Upgrade von Premium auf Deluxe kostet nur die Preisdifferenz. Preise werden in Euro ' +
      'geführt und automatisch in US-Dollar, Türkische Lira, Kanadische Dollar und Dirham ' +
      'umgerechnet. Gutscheine (Voucher) sind möglich und senken Preis und Provisionen anteilig. ' +
      'Die Mitgliedschaft ist einmalig; es gibt derzeit keine monatliche Mitgliedsgebühr. ' +
      'Die Zahl „ab 285 Euro" auf Flyern und Postern ist der Mitgliedspreis der Black Card Private, ' +
      'NICHT der Paketpreis. Nie vermischen.',
  },
  {
    id: 'cards-black',
    title: 'Black Cards (Exclusive Cards, Partner PAYMAGO)',
    verified: true,
    content:
      'Zwei Karten, beide Mastercard-Debitkarten, physisch und virtuell, „powered by PAYMAGO": ' +
      'Die BLACK CARD PRIVATKUNDEN kostet regulär 315 Euro, für Mitglieder 285 Euro, Einrichtung 5 ' +
      'Euro, monatliche Kartengebühr 10 Euro. Die BLACK CARD BUSINESSKUNDEN kostet regulär 550 ' +
      'Euro, für Mitglieder 450 Euro, Einrichtung 25 Euro, monatliche Kartengebühr 15 Euro. ' +
      'Beide Karten bieten: physische Karte plus digitale Card, eigene IBAN plus bis zu 40 ' +
      'Währungskonten, Multi-Currency-Zahlungen, SEPA- und SWIFT-Transfers, weltweiten ' +
      'Geldempfang, Online-Banking und Kartenverwaltung, alle Membership-Features. DEX/WEX Exchange ' +
      'gibt es nur mit zusätzlichem Upgrade (Deluxe). Private und Business unterscheiden sich nur ' +
      'in der Kontoart. ' +
      'Karten und Bankkonten gibt es ausschließlich per Antrag im Mitgliederbereich, nicht als ' +
      'Sofortkauf. Vorher ist eine einmalige Identitätsprüfung (KYC) nötig; wer sie bestanden hat, ' +
      'wird nie wieder gefragt. Die Kartenausgabe und Aktivierung startet laut Countdown am 20. ' +
      'Oktober 2026. Gutscheine sind einlösbar. ' +
      'Banking-Konten: Anträge für „Kickstartercash Banking" und „Valygo Banking" laufen über den ' +
      'Mitgliederbereich; die Berechtigung hängt vom Paket bzw. der Karte ab. Die DEX/WEX ' +
      'Exchange-App (Partner-Registrierung) steht Deluxe-Mitgliedern offen.',
  },
  {
    id: 'commissions-ranks',
    title: 'Vergütungsplan: Provisionen und Ränge',
    verified: true,
    content:
      'Sechs Ebenen. Ebene eins, der direkte Empfehler, erhält eine feste Direktprovision in Euro ' +
      'je Produkt: Paket Premium Private 45 Euro, Deluxe Private 65 Euro, Premium Business 80 ' +
      'Euro, Deluxe Business 100 Euro; Black Card Private 35 Euro, Black Card Business 55 Euro. ' +
      'Es gibt KEINE fünf Prozent auf Ebene eins mehr. Die Ebenen zwei bis sechs erhalten ' +
      'Prozentsätze auf den CV-Wert des Produkts: ein Prozent auf Ebene zwei und je null Komma ' +
      'fünf Prozent auf den Ebenen drei bis sechs. Der CV-Wert entspricht bei Paketen und Karten ' +
      'der Direktprovision (45, 65, 80, 100 bzw. 35 Euro). ' +
      'Shop-Produkte (physische Waren) haben eigene Prozentsätze: fünf Prozent auf Ebene eins, ein ' +
      'Prozent auf Ebene zwei, je null Komma fünf Prozent auf den Ebenen drei bis sechs. Der ' +
      'Fanshop (Print on Demand) zahlt KEINE Provision, Mitglieder erhalten dort vier Prozent ' +
      'Rabatt, ein Prozent geht an Charity. Gold-Käufe zählen nicht für Ränge oder Teamumsatz. ' +
      'Gutscheine senken die Provisionen anteilig, Upgrades zahlen nur auf die Differenz, ein ' +
      'inaktiver Sponsor wird übersprungen. ' +
      'Fünf Ränge: Affiliate (Basis), Visionary (5 direkte Partner, 1.000 CV persönlich), ' +
      'Momentum Leader (5 direkte Partner mit Rang Visionary, 2.000 CV), Elite Ambassador (8 ' +
      'direkte Partner, 3.000 CV), Crown President (10 direkte Partner, 5.000 CV). Einmal ' +
      'erreichte Ränge bleiben. Zusätzliche Boni (Leadership, Generation, Team) sind derzeit mit ' +
      'null Prozent hinterlegt; frühere Angaben wie „12 bis 16 Prozent" gelten NICHT. ' +
      'WICHTIG: Auszahlungen an Mitglieder sind aktuell wegen Systemwartung pausiert. CLOSER ' +
      'sagt KEINE Auszahlung und KEINEN Verdienst zu. Provisionen sind keine garantierte ' +
      'Einnahmequelle und hängen von eigener Leistung und den Plattformregeln ab.',
  },
  {
    id: 'ecosystem',
    title: 'Weitere Module des Ökosystems',
    verified: true,
    content:
      'WEBINARE: eigene Live-Webinare auf der Plattform (Zoom eingebettet oder Stream) und ' +
      'Partner-Webinare, mit Gästeanmeldung, Erinnerungen und Replays in der Videothek. Zoom-Calls ' +
      'aktuell nur auf Deutsch, Türkisch und Englisch folgen. ' +
      'FUNNEL: jedes Mitglied hat eine persönliche Landingpage mit Empfehlungslink (Reflink); der ' +
      'Empfehler wird per Cookie festgehalten. ' +
      'SHOP und FANSHOP: physische Produkte im Shop, Fanshop mit Print-on-Demand-Artikeln über ' +
      'Printful (rund 57 Produkte). ' +
      'GOLDMINE: Gold-Investment-Modul mit dem Partner Earthforge Minerals (Gold aus dem Yukon), ' +
      'mit Projekten, Zertifikaten und Auszahlungen; Details und Konditionen nur über die Plattform ' +
      'und mit Freigabe, CLOSER nennt KEINE Renditen. ' +
      'AUSWANDERN / PLAN B: ein Paket, fünf Länder, Roadmaps, Beratungstermine und Relocation-' +
      'Buchungen. REAL ESTATE: Immobilien-Bereich mit CRM. ' +
      'HEALTH-BOX: Gesundheits- und Wellness-Bereich mit dem Partner ARVI in drei Stufen, aktuell ' +
      'nur die Stufe „Secure" aktiv; Zahlen und Konditionen nur über die Plattform, CLOSER nennt ' +
      'KEINE Prozentwerte. ' +
      'FOUNDERS CLUB: Investments mit Verträgen und monatlicher Abrechnung; Details nur über die ' +
      'Plattform. ' +
      'CHARITY: Spendenauswahl im Warenkorb. ' +
      'APPS und SUPPORT: Telegram-App „Kickstartercash.Club App", Member Support Bot auf Telegram ' +
      'mit Wissensdatenbank und KI-Assistent „Kash", Ticket-System, Mailbox, News und Termine im ' +
      'Mitgliederbereich. ' +
      'PARTNER, die in Webinaren vorkommen: PAYMAGO (Karten und Banking), VALYGO (Banking und ' +
      'Virtual Card), HashNet, ARVI, HIBARR, Earthforge Minerals, Printful.',
  },
  {
    id: 'webinars',
    title: 'Webinar-Termine (deutsche Zeit, Stand 18.10.2026)',
    verified: true,
    content:
      'KCC Live-Webinar: Dienstag und Donnerstag um 20 Uhr sowie Samstag um 12 Uhr. VALYGO: ' +
      'Freitag um 19 Uhr 30. ARVI Health-Box: Mittwoch um 20 Uhr. Präsentation in 50 Sprachen: ' +
      'Montag um 18 Uhr und Donnerstag um 20 Uhr. HIBARR „Hinter dem System": Dienstag um 19 Uhr. ' +
      'HashNet auf Deutsch: Mittwoch um 19 Uhr. HashNet auf Englisch: täglich um 20 Uhr. ' +
      'Anmeldung und Zugangslinks gibt es über die Webinar-Seiten auf kickstartercash.club bzw. im ' +
      'Mitgliederbereich; Partner-Webinare schicken den Zoom-Link erst nach der Anmeldung. Termine ' +
      'können sich ändern, im Zweifel auf die Webinar-Übersicht der Website verweisen.',
  },
  {
    id: 'contact',
    title: 'Kontakt, nächste Schritte und Eskalation',
    verified: true,
    content:
      'Offizielle Wege: Website kickstartercash.club mit Login und Registrierung, Portal ' +
      'portal.kickstartercash.club. Telegram-Kanal für Interessenten: t.me/+juuqRe8GYmQ1YzBk. ' +
      'WhatsApp-Kanal: whatsapp.com/channel/0029VbCkUpgAu3aHRCVBJG0F. Support-Bot auf Telegram: ' +
      't.me/Member_Support_Help_Bot. Telegram-App: t.me/kickstartercashclub_bot. Auf jeder Seite ' +
      'der Plattform gibt es unten die goldene Support-Blase mit WhatsApp-Support, Telegram-Gruppe ' +
      'und Ticket-System. Links im Gespräch nicht buchstabieren, sondern sagen, wo man sie findet. ' +
      'Wer über einen Empfehler kam, wendet sich an genau diese Person; sie sichert Zugang und ' +
      'Konditionen. Interessenten ohne Empfehler werden an Website, Webinar oder die offiziellen ' +
      'Kanäle verwiesen. Kontobezogene Fragen, Beschwerden, Zahlungs- und Vertragsdetails, KYC und ' +
      'individuelle Angebote gehören immer zum menschlichen Team. ' +
      'WICHTIG FÜR CLOSER: CLOSER hat KEINE Anbindung, um Kontaktdaten zu speichern, Anträge zu ' +
      'stellen oder Bestellungen auszulösen. Er behauptet niemals, Daten gespeichert, ein Angebot ' +
      'verschickt oder das Team benachrichtigt zu haben.',
  },
  {
    id: 'status',
    title: 'Aktueller Status (zeitkritisch)',
    verified: true,
    content:
      'Go-live der Plattform am 18. Oktober 2026 nach Pre-Launch. Kartenausgabe und Aktivierung ' +
      'starten laut Countdown am 20. Oktober 2026. Auszahlungen sind derzeit wegen Systemwartung ' +
      'pausiert, weil die Berechnungen noch geprüft werden. Diese Angaben können sich täglich ' +
      'ändern; bei Fragen dazu auf den aktuellen Stand im Mitgliederbereich verweisen.',
  },
  {
    id: 'partner-cards-legacy',
    title: 'Partner-Kryptokarten aus älterer Wissensbasis',
    verified: false,
    content:
      'Eine ältere Wissensbasis (KI-Marketing Hub, Juli 2026) nannte zusätzliche Partnerkarten mit ' +
      'Member-Preisen: Alpha2Pay Mastercard, Valygo Premium Visa Card mit Playglobal, RedotPay ' +
      'Visa, Aurum Cards (Nova, Imperium, World Elite, Infinity), Globale White Krypto Card, Wefi ' +
      'Card und Alphatopay Kryptocard, dazu detaillierte PAYMAGO-Gebührenlisten (zum Beispiel 0,60 ' +
      'Euro IBAN-Gebühr pro Monat, SEPA 4,50 Euro) und eine „Deluxe Black Card für 460 Euro". ' +
      'Diese Angaben stehen NICHT in der aktuellen Plattform-Datenbank und widersprechen teilweise ' +
      'den dort hinterlegten Preisen. Bis zur Freigabe durch das Team gelten sie als unbestätigt: ' +
      'CLOSER nennt dazu keine Preise oder Konditionen und verweist auf die Website und das Team.',
  },
  {
    id: 'not-approved',
    title: 'Aussagen, die CLOSER erst nach Freigabe treffen darf',
    verified: true,
    content:
      'Folgende Punkte sind in den Quellen widersprüchlich oder noch nicht freigegeben. CLOSER ' +
      'nennt sie NICHT als Fakt, sondern sagt, dass das Team sie bestätigt: ' +
      'Firmenname, Firmensitz und Impressum. Einlagensicherung (auf Flyern steht „bis zu 500.000 ' +
      'Euro", die Aussage ist nicht freigegeben). Wer rechtlich Herausgeber der Karten ist. ' +
      'Genaue Lieferzeiten der Karten. Wann Auszahlungen wieder freigegeben werden. Renditen oder ' +
      'Performance-Zahlen von Health-Box, Goldmine oder Founders Club. Verfügbarkeit und Preis einer ' +
      'KI-Marketing-Plattform (das „KI-Marketing Hub" ist ein separates Projekt, nicht Teil der ' +
      'Mitgliedschaft). Zugangsregeln zur Exchange-App für das Business-Deluxe-Paket. Jegliche ' +
      'Telefonnummern.',
  },
  {
    id: 'legal',
    title: 'Rechtliche Hinweise und Risiken (immer beachten)',
    verified: true,
    content:
      'Kickstartercash.Club ist kein lizenziertes Finanzinstitut, keine Bank und kein regulierter ' +
      'Vermögensverwalter. Alle Inhalte dienen nur der Information und sind keine Anlage-, Finanz-, ' +
      'Rechts- oder Steuerberatung und keine Handelsempfehlung. Kein öffentliches Angebot von ' +
      'Wertpapieren oder Finanzinstrumenten. Investitionen in Kryptowährungen, Gold und ' +
      'algorithmische Handelssysteme sind mit erheblichen Risiken verbunden, bis hin zum ' +
      'vollständigen Verlust des eingesetzten Kapitals. Es gibt keine Garantie auf Rendite; ' +
      'vergangene Ergebnisse sind kein Indikator für die Zukunft. Nur Kapital einsetzen, dessen ' +
      'Verlust man verkraften kann. Provisionen im Empfehlungsprogramm sind keine garantierte ' +
      'Einnahmequelle. Gewinne können steuerpflichtig sein; der Club erteilt keine Steuerberatung. ' +
      'Nutzer prüfen die rechtliche Zulässigkeit im eigenen Land selbst und nutzen die Plattform ' +
      'auf eigene Verantwortung. Datenverarbeitung gemäß Datenschutzerklärung auf ' +
      'kickstartercash.club. CLOSER sagt zu Beginn, dass er ein KI-Assistent ist, und erhebt nie ' +
      'Ausweisdaten, Kartennummern, IBANs, Passwörter, 2FA-Codes oder Seed-Phrasen. Änderungen ' +
      'der Inhalte, Preise und Konditionen vorbehalten.',
  },
  {
    id: 'forbidden',
    title: 'Was CLOSER nicht behaupten darf',
    verified: true,
    content:
      'Keine Preise, Gebühren, Limits oder Konditionen nennen, die nicht in dieser Wissensbasis ' +
      'als bestätigt stehen. Nie „fünf Prozent Provision" oder „12 bis 16 Prozent" nennen. Keine ' +
      'Renditen, Gewinne, Einkommen oder Auszahlungen versprechen oder in Aussicht stellen. Keine ' +
      'Zulassungen, Lizenzen, Firmennamen oder rechtlichen Eigenschaften behaupten. Nicht ' +
      'behaupten, ein Produkt sei für jeden geeignet oder risikolos. Keine Partner, Produkte, ' +
      'Features oder Links erfinden. Die Flyer-Zahl „ab 285 Euro" nie als Paketpreis ausgeben. Bei ' +
      'allem, was hier fehlt oder sich geändert haben könnte: ehrlich sagen, dass die Angabe vom ' +
      'Team bestätigt werden muss, und auf Website, Webinar oder den persönlichen Empfehler ' +
      'verweisen.',
  },
];

export const KICKSTARTERCASH_KNOWLEDGE: CompanyKnowledge = {
  sections: KICKSTARTERCASH_SECTIONS,
  lastUpdated: LAST_UPDATED,
};

/**
 * Baut aus der Wissensbasis einen kompakten Textblock, der dem Systemprompt
 * angehängt wird. Nicht verifizierte Abschnitte werden klar markiert, damit
 * CLOSER sie nicht als Fakt verwendet.
 */
export function buildKnowledgeContext(k: CompanyKnowledge = KICKSTARTERCASH_KNOWLEDGE): string {
  const lines = k.sections.map((s) => {
    const status = s.verified ? '' : ' [UNBESTÄTIGT – NICHT ALS FAKT VERWENDEN]';
    const body = s.content.trim().length > 0 ? s.content.trim() : '(keine Angaben hinterlegt)';
    return `## ${s.title}${status}\n${body}`;
  });

  const stand = k.lastUpdated
    ? `Stand der Informationen: ${k.lastUpdated}. Preise, Termine und Konditionen können sich seitdem geändert haben; bei Kaufentscheidungen auf die aktuellen Angaben auf kickstartercash.club und das Team verweisen.`
    : 'Stand der Informationen: unbekannt – es liegen noch keine geprüften Daten vor.';

  return [
    'FREIGEGEBENE WISSENSBASIS ZU KICKSTARTERCASH.CLUB',
    'Nutze ausschließlich die hier bestätigten Fakten. Für alles andere ehrlich sagen, dass die Daten fehlen oder bestätigt werden müssen.',
    'Nenne im Gespräch nur die Details, nach denen gefragt wird – keine Produktlisten vorlesen. ' +
      'Sprich Zahlen aussprechbar aus (zum Beispiel „dreihundertfünfundachtzig Euro", „null Komma fünf Prozent"). ' +
      'Bei Preis- oder Karteninteresse zuerst klären: privat oder Business, Premium oder Deluxe (mit Exchange und Cashback), ' +
      'und ob die Person bereits Mitglied ist oder einen Empfehler hat.',
    '',
    ...lines,
    '',
    stand,
  ].join('\n');
}

/**
 * Zukunftssicherer Ladepunkt. Aktuell nur die statische Struktur oben.
 * Später kann hier der Katalog (Pakete, Karten, Webinare, Kanäle) über eine
 * signierte Schnittstelle der Plattform geladen werden, ohne dass die
 * Agenten-Logik angepasst werden muss.
 */
export async function loadKnowledge(): Promise<CompanyKnowledge> {
  return KICKSTARTERCASH_KNOWLEDGE;
}
