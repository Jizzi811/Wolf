/**
 * Wissensbasis für KickstarterCash.club.
 *
 * Quelle: die freigegebene Produkt-Wissensbasis des KASH-Assistenten aus dem
 * Repo `Jizzi811/Kickstartercash-App` (backend/server.py, KASH_SYSTEM) sowie
 * die Inhalte der offiziellen Webinar-Präsentation (webinar.html) und des
 * Mitglieder-Funnels. Stand der Quellen: Juli 2026.
 *
 * Pflege:
 *  1. Nur vom Team freigegebene, geprüfte Fakten eintragen.
 *  2. Bei Preis-/Konditionsänderungen den betroffenen Abschnitt anpassen und
 *     `LAST_UPDATED` aktualisieren.
 *  3. Ein Abschnitt mit `verified: false` wird CLOSER als UNBESTÄTIGT
 *     gekennzeichnet; er darf ihn dann nicht als Fakt verwenden.
 *
 * Die Texte sind bewusst in Klartext gehalten (keine Tabellen), weil sie in
 * einen Systemprompt für einen VOICE-Agenten wandern. Ein echtes RAG-System
 * (Vektor-Datenbank o. Ä.) wird bewusst NOCH NICHT gebaut; `loadKnowledge()`
 * ist der zukünftige Ladepunkt dafür.
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

/** Stand der Quelldaten (KASH-Wissensbasis + Webinar), ISO-Datum. */
export const LAST_UPDATED = '2026-07-13';

export const KICKSTARTERCASH_SECTIONS: KnowledgeSection[] = [
  {
    id: 'company',
    title: 'Was ist Kickstartercash.Club?',
    verified: true,
    content:
      'Kickstartercash.Club ist eine exklusive Membership-Plattform für digitale Unternehmer, ' +
      'Creator und Networker. Slogan: „Exclusivity starts with your membership!" ' +
      'Gründer und Gesicht des Clubs ist Johann. Die Idee: ein Ökosystem aus exklusivem Wissen, ' +
      'professionellen Marketing-Tools, Finanz- und Kartenlösungen und einem globalen ' +
      'Affiliate-Netzwerk, das Menschen über Grenzen hinweg verbindet. Leitbild: finanzielle ' +
      'Freiheit entsteht aus Wissen plus Infrastruktur. ' +
      'Das Ökosystem besteht aus mehreren Hubs: Banking, Cards, Investment, Academy (Bildung), ' +
      'KI-Tools und KI-Beratung, Lifestyle (Immobilien, Adventure, Beauty, Gesundheit), ' +
      'Premium Shop, Fanshop, Videothek, Social Hub und Charity Impact (gemeinnütziges Engagement, ' +
      'transparent dokumentiert über einen Global Ledger). Dazu eine internationale Community mit ' +
      'Events, Networking und einem Portal in über 70 Sprachen. ' +
      'Kickstartercash.Club ist KEIN lizenziertes Finanzinstitut, KEINE Bank und KEIN regulierter ' +
      'Vermögensverwalter. Der Club ist im algorithmischen Kryptohandel tätig und agiert als Club; ' +
      'über Member-Packages gibt es Zugang zu eigenen Dienstleistungen und zu Angeboten von Partnern. ' +
      'Website: kickstartercash.club. Auf der Startseite gibt es den KI-Chat-Assistenten KASH und ' +
      'den Button „Webinar ansehen".',
  },
  {
    id: 'membership',
    title: 'Membership (aktueller Stand)',
    verified: true,
    content:
      'Die Membership kostet 385 Euro (einmalig). Sie enthält derzeit die Premium Black Card, eine ' +
      'physische schwarze Mastercard-Debitkarte mit echter Euro-IBAN, SEPA und SWIFT und weltweitem ' +
      'Karteneinsatz. Die Karte ist im Membership-Preis bereits enthalten. ' +
      'WICHTIG: Die KI-Plattform des Clubs (KI-Marketing-Tools, Content-Automatisierung, ' +
      'Funnel-Optimierung, KI-Agenten-System, Design Studio, Video Studio, Social-Media-Tools, ' +
      'Analytics, SEO-Tools, Agenten-Builder) ist NICHT im Membership-Preis enthalten. Sie ist ein ' +
      'eigenständiges Premium-Modul, das aktuell finalisiert wird und separat angeboten werden soll. ' +
      'Wer danach fragt, kann sich über die Website bzw. seinen Berater informieren lassen, sobald es ' +
      'verfügbar ist. Weitere Details und Preise dazu sind noch nicht freigegeben. ' +
      'Im Webinar wird die Membership als „Premium VIP Gold Membership" bzw. „VIP Gold + ' +
      'KI-Masterclass" vorgestellt, mit über 30 Premium-Features in einer Lifetime-Membership. ' +
      'Der Feature-Zugang ist dreistufig: viele Features sind kostenlos, andere gibt es über ' +
      'Member-Vergünstigungen, Premium-Dienste werden über Vouchercodes freigeschaltet. ' +
      'Member erhalten privilegierten Zugang zu den Partner-Kartenlösungen (Member-Preise, teils mit ' +
      'VIP-Promo-Code, den Member automatisch erhalten).',
  },
  {
    id: 'cards-black',
    title: 'Kartenlösungen 1 und 2: Premium Black Card und Deluxe Black Card (PayMago)',
    verified: true,
    content:
      'Anbieter und Plattform beider Debitkarten: PayMago. Beide Karten sind physische schwarze ' +
      'Mastercard-Debitkarten mit Euro-IBAN, die auf den Kundennamen oder einen Firmennamen läuft. ' +
      'App für iOS und Android sowie Web-App im Browser. Vor der Kartenausstellung ist eine ' +
      'Identitätsprüfung (KYC/AML) nötig; die physische Karte wird nach KYC-Freigabe geliefert. ' +
      'PREMIUM BLACK CARD: persönliches Konto oder Firmenkonto, eigene IBAN sofort verfügbar, ' +
      'Multi-Currency, Exchange-Funktion, SEPA-Transfers ein und aus, SWIFT-Transfers weltweit ein ' +
      'und aus, interne Transfers, weltweiter Geldempfang, Online-Banking und Kartenmanagement, ' +
      'Apple Pay und Google Pay. KEIN Cashback, KEIN DEX/WEX. ' +
      'Preis: mit Membership 385 Euro (Karte enthalten), ohne Membership nur die Karte 299 Euro. ' +
      'DELUXE BLACK CARD: höherwertiges Upgrade mit allen Funktionen der Premium Black Card PLUS ' +
      'DEX/WEX (dezentrale Börse), aktivem Cashback-System und erweiterten Exchange-Funktionen. ' +
      'Preis: 460 Euro als Einzelkauf oder Upgrade. Sie ist NICHT automatisch in der Membership ' +
      'enthalten, sondern ein separater Kauf. ' +
      'Empfehlung: klassische Bankfunktionen plus IBAN gesucht, dann Premium Black Card (in der ' +
      'Membership inklusive). Cashback, DEX und mehr Power gesucht, dann Deluxe Black Card.',
  },
  {
    id: 'fees-limits',
    title: 'Gebühren und Limits der Black Cards (PayMago)',
    verified: true,
    content:
      'PRIVATKUNDEN: Onboarding einmalig 15 Euro. IBAN 0,60 Euro pro Monat. SEPA ein- oder ' +
      'ausgehend je 4,50 Euro. SWIFT ein- oder ausgehend 0,375 Prozent, mindestens 45 Euro. ' +
      'Transaction Monitoring 0,12 Euro pro Transaktion. Interner Transfer 0,23 Euro. Monatliche ' +
      'Kartengebühr 3 Euro. Inaktivitätsgebühr nach 3 Monaten 12 Euro. Gebühr pro Kartentransaktion ' +
      '0,53 Euro. ' +
      'BUSINESSKUNDEN: Onboarding einmalig 300 Euro. IBAN 60 Euro pro Monat. SEPA ein- oder ' +
      'ausgehend 0,30 Prozent, mindestens 4,50 Euro. SWIFT ein- oder ausgehend 0,30 Prozent, ' +
      'mindestens 52,50 Euro. Interner Transfer 0,15 Prozent, mindestens 4,50 Euro. ' +
      'TRANSFER-LIMITS: einmalige Einzahlung maximal 50.000 Euro, einmalige Auszahlung maximal ' +
      '50.000 Euro. Höhere Limits sind nach individueller KYC/AML-Prüfung möglich. ' +
      'Ob jemand Privat- oder Businesskunde ist, bestimmt die Gebührenstruktur; das sollte CLOSER ' +
      'früh klären.',
  },
  {
    id: 'card-alpha2pay',
    title: 'Kartenlösung 3: Alpha2Pay Mastercard (Kryptokarte)',
    verified: true,
    content:
      'Slogan: „Take Control of Your Money. Anywhere." Physische Mastercard-Kryptokarte, weltweit ' +
      'einsetzbar. Anbieter: Alpha2Pay. Support Deutschland: +49 30 33075362, Support Türkei: ' +
      '+90 850 3092282. ' +
      'PREISE UND GEBÜHREN: Kaufpreis 350 US-Dollar einmalig, Kartenausstellungsgebühr 25 US-Dollar ' +
      'einmalig, Mindestguthaben bei Aktivierung 10 US-Dollar, KEINE monatliche Kartengebühr. ' +
      'Aufladung per USDT (TRC20), weitere Kryptowährungen in Vorbereitung. Top-up-Gebühr 2,3 ' +
      'Prozent, mindestens 4 US-Dollar. Mindestaufladung 14 US-Dollar. Transaktionsgebühr 0,25 ' +
      'US-Dollar. Apple Pay und Google Pay werden unterstützt. Internes KYC: ja. ' +
      'LIMITS: maximale Aufladung pro Transaktion 5.000 US-Dollar, Einzahlungslimit unbegrenzt, ' +
      'Transaktionslimit bis zu 30.000 US-Dollar pro Tag, Monatslimit bis zu 300.000 US-Dollar. ' +
      'VORTEILE: weltweit einsetzbar, Geld global per Kryptowährung senden, bald DEX-Anbindung, ' +
      'hohe Limits für privat und Business, keine monatlichen Gebühren, unbegrenzte Einzahlungen. ' +
      'EINSCHRÄNKUNGEN: nicht nutzbar für Glücksspiel/Casinos, Escort/Erotik, ' +
      'Geldtransfer-Dienste, Quasi-Cash, Tankautomaten, Börsenhändler, Waffenhändler. Einige Länder ' +
      'sind laut Sanktionsliste des Anbieters gesperrt. ' +
      'Empfehlung: Krypto nutzen, weltweit zahlen, keine monatlichen Gebühren, dann Alpha2Pay.',
  },
  {
    id: 'card-valygo',
    title: 'Kartenlösung 4: Valygo Premium Visa Card und Playglobal Visa Debit',
    verified: true,
    content:
      'Partner: Valygo (VALYGO OMNIBANK Ecosystem) und Playglobal. ' +
      'VALYGO PREMIUM VISA CARD: Preis 3.703,70 AED (VIP-Member-Preis für Kickstartercash.Club-Kunden). ' +
      'Physische UND virtuelle Visa Card gleichzeitig, USD-Banking-Konto mit echten ' +
      'Bankkonto-Funktionen, Multi-Krypto-Wallets (BTC, ETH, USDT und mehr), integrierte ' +
      'Web3-Identity, blockchain-basierte Infrastruktur, weltweit bei allen Visa-Akzeptanzstellen. ' +
      'VALYGO-PLÄNE: Freedom 0 US-Dollar pro Monat ohne Deposit (Basisfunktionen). Essential 10 ' +
      'US-Dollar pro Monat, Voraussetzung 250 US-Dollar in VYO-Token hinterlegen. Premium 50 ' +
      'US-Dollar pro Monat, Voraussetzung 1.000 US-Dollar in VYO-Token hinterlegen. ' +
      'VYO-TOKEN (Valygo) und PGD-TOKEN (Playglobal) werden über MetaMask mit USDT oder USDC ' +
      'direkt über die Plattform gekauft (nicht über Börsen) und als Deposit hinterlegt; sie werden ' +
      'nicht ausgegeben und bleiben im Wallet. ' +
      'SETUP IN FÜNF SCHRITTEN: 1. Auf valygo.io registrieren. 2. KYC in fünf Schritten: ' +
      'Personalausweis oder Reisepass (Reisepass bevorzugt), keine T-Online- oder Gmail-Adresse ' +
      'verwenden, Dateien maximal 500 KB pro Datei als JPG, KYC-Status in der App prüfen. 3. ' +
      'MetaMask installieren, USDT oder USDC kaufen, VYO-Token kaufen. 4. Im Dashboard den Plan auf ' +
      'Essential oder Premium upgraden. 5. Auf playglobal.io mit EXAKT derselben E-Mail-Adresse wie ' +
      'bei Valygo registrieren. ' +
      'PLAYGLOBAL VISA DEBIT: separate Zusatzkarte im Playglobal-Ökosystem mit Provisionsmodell; ' +
      'Empfehlungsprovisionen werden in USDT, VYO, PGD oder einer Kombination ausgezahlt. ' +
      'Empfehlung: Web3 plus USD-Banking plus Blockchain-Ökosystem plus Provision verdienen, dann ' +
      'Valygo Premium.',
  },
  {
    id: 'card-redotpay',
    title: 'Kartenlösung 5: RedotPay Visa Card (physisch und virtuell)',
    verified: true,
    content:
      'Kartennetzwerk Visa. Partner RedotPay, ein Fintech (keine Bank), Wallet von lizenzierten ' +
      'Finanzinstituten, über 7 Millionen Nutzer weltweit. Apple Pay (in Safari) und Google Pay ' +
      'bzw. Google Wallet werden unterstützt. ' +
      'PHYSISCHE KARTE: keine Jahresgebühren, weltweit bei über 130 Millionen Händlern akzeptiert, ' +
      'Geldautomaten-Abhebung weltweit, stablecoin-basiert (USDC, USDT), kontaktloses Bezahlen. ' +
      'Beantragung per RedotPay-App nach KYC. ' +
      'VIRTUELLE KARTE: innerhalb von Minuten einsatzbereit, für Online-Einkäufe, Abonnements und ' +
      'Reisen, sofortige Transaktionsaufzeichnung, mit Apple Pay und Google Wallet verknüpfbar. ' +
      'AUFLADEN: on-chain mit BTC, ETH, USDT und mehr; über Drittanbieter-Wallets wie Binance oder ' +
      'PayPal; oder per Banküberweisung lokal oder international. ' +
      'GELD SENDEN (Global Payout): Krypto in Landeswährung senden (THB, PHP, BRL, EUR, GBP, USD ' +
      'und mehr), Sofortüberweisungen in Ländern mit lokalem Netzwerk wie Pix oder SPEI, SWIFT in ' +
      '1 bis 3 Werktagen, transparente Gebühren ohne versteckten Spread. ' +
      'MULTIWÄHRUNGS-WALLET: EUR, GBP, USD und Krypto in einer Wallet mit eigenen Kontodaten pro ' +
      'Währung. EARN: Zinsen auf USDC und USDT, flexible Laufzeit, 24/7 Zugriff, nur in ' +
      'ausgewählten Regionen und mit Risiko eines Kapitalverlusts. ' +
      'PREISE IM KICKSTARTERCASH.CLUB-PORTAL: Member-Preis 150 Euro (VIP-Promo-Code erforderlich, ' +
      'Member erhalten ihn automatisch), regulärer Preis 180 Euro, Ersparnis 30 Euro, Sponsor-Bonus ' +
      'für eine Empfehlung 25 Euro. ' +
      'Empfehlung: Krypto im Alltag ausgeben, Apple Pay, keine Jahresgebühr, dann RedotPay.',
  },
  {
    id: 'card-aurum',
    title: 'Kartenlösung 6: Aurum Cards (Neo-Bank und Visa Business)',
    verified: true,
    content:
      'Partner: Aurum Foundation (aurum.foundation), ein KI- und Blockchain-Finanz-Ökosystem, ' +
      'registriert in Kanada (BC1571382) und Polen (KRS 0001117211, Warschau). Trustpilot ' +
      'verifiziert, über 170.000 aktive Partner weltweit, 150 Millionen US-Dollar Assets under ' +
      'Management. Gesperrt: USA und sanktionierte Regionen. ' +
      'VIER KARTENSTUFEN, alle Visa Business: Aurum Nova 33 USDT Ausstellung, kein KYC, 3 Prozent ' +
      'USDT-Aufladegebühr, 1,5 Prozent Transaktionsgebühr, Empfehlungsbonus bis 15 USDT. Aurum ' +
      'Imperium 66 USDT, kein KYC, 2,7 Prozent Aufladung, 1,2 Prozent Transaktion, Bonus bis 30 ' +
      'USDT. Aurum World Elite 99 USDT, KYC ja, 2,5 Prozent Aufladung, 1 Prozent Transaktion, Bonus ' +
      'bis 50 USDT. Aurum Infinity 249 USDT, KYC ja, 2,2 Prozent Aufladung, 0,7 Prozent ' +
      'Transaktion, Bonus bis 150 USDT. ' +
      'AURUM INFINITY (Flaggschiff, physisch und virtuell): monatliches Ausgabelimit 100.000 ' +
      'US-Dollar, Apple Pay und Google Pay, kontaktlos, Echtzeit-Währungsumrechnung, Krypto zu Fiat ' +
      'automatisch beim Bezahlen. AURUM NOVA (Einstieg): nur virtuell, keine Verifizierung, sofort ' +
      'einsatzbereit. ' +
      'ALLGEMEIN: weltweit nutzbar außer USA, online und offline, sofortige Ausstellung, die ersten 3 ' +
      'Karten ohne KYC, keine Begrenzung der Kartenanzahl, Nennwährung Euro (flexibel), Gültigkeit ' +
      'bis zu 3 Jahre, sofortige Aufladung in mehreren Währungen inklusive USDT. ' +
      'AURUM NEO-BANK: Web3-Finanz-Hub mit Krypto, Fiat und Banking in einer App. Provisionsmodell ' +
      'für Partner: bis zu 100 Prozent Gewinn aus Kartenverkäufen, 0,5 Prozent auf jede Transaktion ' +
      'der ausgegebenen Karten, 1 Prozent auf jede Währungsumrechnung, 2,2 Prozent auf ' +
      'USDT-Einzahlungen auf verteilte Karten. ' +
      'AURUM-ÖKOSYSTEM: EX-AI Bot (autonomer Trading-Bot, laut Anbieter im Schnitt plus 18,5 Prozent ' +
      'pro Monat seit Februar 2024, KEINE Garantie), Zeus AI Bot, NEYRO (nicht-verwahrter ' +
      'KI-Agenten-Handelsservice), Flash Loans, AURUM Exchange, AURUM Token auf Polygon mit 100 ' +
      'Millionen Gesamtangebot. ' +
      'PREISE IM KICKSTARTERCASH.CLUB-PORTAL: Member-Preis 265 Euro (kein Promo-Code nötig), ' +
      'regulärer Preis 320 Euro, Ersparnis 55 Euro, Sponsor-Bonus für eine Empfehlung 20 Euro. ' +
      'Empfehlung: sofort ohne KYC und günstig starten, dann Aurum Nova. Business, hohe Limits und ' +
      'Provisionen, dann Aurum Infinity. KI-Trading plus Karte, dann Aurum-Ökosystem.',
  },
  {
    id: 'cards-more',
    title: 'Kartenlösungen 7 bis 9: Globale White Card, Wefi Card, Alphatopay Kryptocard',
    verified: true,
    content:
      'GLOBALE WHITE KRYPTO PAYMENT CARD (Kategorie: eigene Cards, Krypto): komplett dezentral, kein ' +
      'KYC, kein Name, keine Adresse nötig. Apple Pay und Google Pay, kontaktlos, sofortige Nutzung ' +
      'nach Erhalt, Krypto direkt als Zahlungsmittel. Member-Preis 470 Euro (VIP-Promo-Code spart 80 ' +
      'Euro), regulärer Preis 550 Euro, Sponsor-Bonus 40 Euro. Empfehlung bei maximaler Privatsphäre ' +
      'ohne KYC. ' +
      'WEFI CARD (Kategorie: Partnercards, Krypto): Platinum Business Card, kostenloses Geldabheben ' +
      'ohne Abhebungsgebühren, Apple Pay und Google Pay, kontaktlos, Business-Karte für Unternehmer. ' +
      'Member-Preis 100 Euro, regulärer Preis 110 Euro, Ersparnis 10 Euro, Sponsor-Bonus 10 Euro. ' +
      'Empfehlung als günstigster Einstieg. ' +
      'ALPHATOPAY KRYPTOCARD (Kategorie: eigene Cards, Krypto): kein KYC, kostenloses Geldabheben, ' +
      'Apple Pay und Google Pay, kontaktlos. Member-Preis 350 Euro (VIP-Promo-Code spart 100 ' +
      'US-Dollar), regulärer Preis 450 Euro, Ersparnis 100 Euro, Sponsor-Bonus 35 Euro. Empfehlung ' +
      'bei kein KYC plus kostenlose Abhebungen plus großem Promo-Rabatt.',
  },
  {
    id: 'card-overview',
    title: 'Schnellvergleich aller Karten',
    verified: true,
    content:
      'Premium Black Card: 385 Euro inklusive Membership oder 299 Euro einzeln, Euro-IBAN, SEPA und ' +
      'SWIFT, kein Cashback, 3 Euro Monatsgebühr, 50.000 Euro Transferlimit. ' +
      'Deluxe Black Card: 460 Euro extra, wie Premium plus Cashback und DEX/WEX. ' +
      'Alpha2Pay Mastercard: 350 US-Dollar, Krypto-Aufladung per USDT, keine Monatsgebühr, ' +
      '30.000 US-Dollar Tageslimit, keine IBAN. ' +
      'Valygo Premium Visa: 3.703,70 AED, USD-Banking plus Web3. ' +
      'RedotPay Visa: 150 Euro Member-Preis, stablecoin-basiert, keine Jahresgebühr. ' +
      'Aurum Cards: 33 bis 249 USDT je Stufe, Member-Preis im Portal 265 Euro, Visa Business. ' +
      'Globale White Card: 470 Euro Member-Preis, komplett anonym. ' +
      'Wefi Card: 100 Euro Member-Preis, kostenlose Abhebungen. ' +
      'Alphatopay Kryptocard: 350 Euro Member-Preis, kein KYC. ' +
      'Alle Partnerkarten mit Apple Pay und Google Pay. Bei allen Krypto-Produkten gilt: Kurs- und ' +
      'Kapitalverlustrisiko, keine Garantien.',
  },
  {
    id: 'career-plan',
    title: 'Affiliate- und Karriereplan',
    verified: true,
    content:
      'Affiliates verdienen, wenn sie Hardware-Lösungen (sichere Hardware wie den Polar Tresor), ' +
      'Fanshop-Artikel und Membership-Pakete verkaufen und neue Partner ins Team bringen. Jeder kann ' +
      'selbst entscheiden, wie er einsteigt, und jederzeit aktiver Partner werden. ' +
      'BASIS-PROVISIONEN über fünf Ebenen, ganz ohne monatliche Qualifikation: Level 1 zehn ' +
      'Prozent, Level 2 fünf Prozent, Level 3 und Level 4 je zwei Prozent, Level 5 ein Prozent. ' +
      'DREI RÄNGE: Visionary mit 12 Prozent auf Level 1, Momentum Leader mit 14 Prozent, Elite ' +
      'Ambassador mit 16 Prozent, jeweils mit steigenden Boni. Beispiel-Voraussetzungen aus dem ' +
      'Webinar: 5 direkte Partner plus Eigenumsatz von mindestens 1.000 US-Dollar für den ersten ' +
      'Rang; 8 Momentum Leaders plus aktiv für den höchsten Rang. ' +
      'ZUSÄTZLICHE BONI mit höheren Rängen, die sich auf die Basis-Provision stapeln: Level-Provision ' +
      '10 bis 16 Prozent auf direkte Umsätze, Leadership-Bonus 8 bis 15 Prozent für den Aufbau ' +
      'starker Führung, Generations-Bonus 2 bis 3 Prozent über mehrere Generationen, Team-Bonus 0,5 ' +
      'bis 1 Prozent auf das gesamte Teamvolumen. ' +
      'AKTIVSTATUS für Boni: jeden Monat entweder mindestens 2 neue Kunden oder Partner sponsern ' +
      'ODER mindestens 2.000 US-Dollar Umsatz. Einmal erreichte Ränge bleiben für immer, keine ' +
      'Rückstufung durch Inaktivität. ' +
      'Sponsor-Boni für Kartenempfehlungen im Portal: RedotPay 25 Euro, Aurum 20 Euro, Globale ' +
      'White Card 40 Euro, Wefi 10 Euro, Alphatopay 35 Euro. ' +
      'WICHTIG: Provisionen sind keine garantierte Einnahmequelle. Ergebnisse hängen von ' +
      'individueller Leistung, Marktbedingungen und der Erfüllung der Plattformvoraussetzungen ab. ' +
      'Die Teilnahme kann im jeweiligen Land regulatorischen Anforderungen unterliegen.',
  },
  {
    id: 'webinar',
    title: 'Webinar und Präsentation',
    verified: true,
    content:
      'Es gibt eine vollständige Webinar-Präsentation zu Kickstartercash.Club unter ' +
      'kickstartercash.club/webinar.html (auf der Startseite der Button „Webinar ansehen"). Sie ' +
      'erklärt das Ökosystem, die Finanz-Hubs, die Membership-Pakete mit über 30 Premium-Features, ' +
      'die Kartenlösungen und den Karriereplan. Empfehlen, wenn jemand vor dem Kauf mehr erfahren, ' +
      'das Gesamtkonzept verstehen, die Präsentation für sich oder sein Team haben oder einen ' +
      'Überblick über alle Produkte möchte. Wer über einen Empfehlungsgeber eingeladen wurde und ' +
      'Teil des Ökosystems werden will, wendet sich an die Person, die ihm den Link gegeben hat. ' +
      'Vertrauensmerkmale laut Webinar: 256-Bit-SSL-Verschlüsselung, eigene lizenzierte Produkte, ' +
      'verifizierte Payment-Gateways, Rechtsgutachten zum Polar Tresor.',
  },
  {
    id: 'contact',
    title: 'Kontakt, nächste Schritte und Eskalation',
    verified: true,
    content:
      'Offizieller Einstieg: die Website kickstartercash.club, dort das Webinar, der Mitglieder-Funnel ' +
      '(Formular mit Vorname und E-Mail, der persönliche Berater meldet sich) und der KI-Chat KASH ' +
      'auf der Startseite, über den das Team Anfragen erhält und sich innerhalb von 24 Stunden meldet. ' +
      'Wer über einen Sponsor oder Berater kam, sollte sich an genau diese Person wenden; sie ' +
      'sichert den Zugang und die Member-Konditionen. Für Kartenbestellungen, Promo-Codes, ' +
      'Vertragsdetails, KYC-Fragen und individuelle Angebote ist immer das menschliche Team bzw. der ' +
      'persönliche Berater zuständig. ' +
      'WICHTIG FÜR CLOSER: CLOSER hat KEINE Anbindung, um Kontaktdaten zu speichern oder Bestellungen ' +
      'auszulösen. Er darf niemals behaupten, Daten gespeichert, ein Angebot verschickt oder das Team ' +
      'benachrichtigt zu haben. Stattdessen verweist er auf die Website, das Webinar oder den ' +
      'persönlichen Berater.',
  },
  {
    id: 'legal',
    title: 'Rechtliche Hinweise und Risiken (immer beachten)',
    verified: true,
    content:
      'Kickstartercash.Club ist kein lizenziertes Finanzinstitut, keine Bank und kein regulierter ' +
      'Vermögensverwalter. Alle Inhalte dienen nur der Information und sind keine Anlage-, Finanz-, ' +
      'Rechts- oder Steuerberatung und keine Handelsempfehlung. Kein öffentliches Angebot von ' +
      'Wertpapieren oder Finanzinstrumenten. ' +
      'Investitionen in Kryptowährungen und algorithmische Handelssysteme sind mit erheblichen ' +
      'Risiken verbunden, bis hin zum vollständigen Verlust des eingesetzten Kapitals. Es gibt keine ' +
      'Garantie auf Rendite; vergangene Ergebnisse sind kein Indikator für die Zukunft. Alle ' +
      'Renditeangaben beruhen auf historischen Daten, Simulationen oder Schätzungen. Nur Kapital ' +
      'einsetzen, dessen Verlust man verkraften kann. ' +
      'Provisionen und Boni im Empfehlungsprogramm sind keine garantierte Einnahmequelle. Gewinne ' +
      'aus Kryptohandel können steuerpflichtig sein; der Club erteilt keine Steuerberatung. Nutzer ' +
      'prüfen die rechtliche Zulässigkeit der Nutzung in ihrem Land selbst und nutzen Tools und ' +
      'Plattform auf eigene Verantwortung; für die Einhaltung von Network-Marketing-Richtlinien ist ' +
      'der Nutzer selbst verantwortlich. Datenverarbeitung gemäß Datenschutzerklärung auf ' +
      'kickstartercash.club. Änderungen der Inhalte, Preise und Konditionen vorbehalten.',
  },
  {
    id: 'forbidden',
    title: 'Was CLOSER nicht behaupten darf',
    verified: true,
    content:
      'Keine Preise, Gebühren, Limits oder Konditionen nennen, die nicht in dieser Wissensbasis ' +
      'stehen. Keine Renditen, Gewinne oder Erfolge versprechen oder in Aussicht stellen. Keine ' +
      'Zulassungen, Lizenzen oder rechtlichen Eigenschaften behaupten, die hier nicht stehen. Nicht ' +
      'behaupten, ein Produkt sei für jeden geeignet oder risikolos. Nicht behaupten, die KI-Plattform ' +
      'sei bereits in der Membership enthalten oder verfügbar. Keine Partner, Produkte oder Features ' +
      'erfinden. Bei allem, was hier fehlt oder sich geändert haben könnte: ehrlich sagen, dass die ' +
      'Angabe vom Team bestätigt werden muss, und auf Website, Webinar oder Berater verweisen.',
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
    ? `Stand der Informationen: ${k.lastUpdated}. Preise und Konditionen können sich seitdem geändert haben; bei Kaufentscheidungen auf die aktuellen Angaben des Teams verweisen.`
    : 'Stand der Informationen: unbekannt – es liegen noch keine geprüften Daten vor.';

  return [
    'FREIGEGEBENE WISSENSBASIS ZU KICKSTARTERCASH.CLUB',
    'Nutze ausschließlich die hier bestätigten Fakten. Für alles andere ehrlich sagen, dass die Daten fehlen.',
    'Nenne im Gespräch nur die Details, nach denen gefragt wird – keine Produktlisten vorlesen. ' +
      'Sprich Zahlen aussprechbar aus (zum Beispiel „dreihundertfünfundachtzig Euro", „null Komma sechs Prozent"). ' +
      'Bei Preis- oder Karteninteresse zuerst klären: privat oder Business, klassisches Banking mit IBAN ' +
      'oder Krypto, und ob die Person bereits Member ist.',
    '',
    ...lines,
    '',
    stand,
  ].join('\n');
}

/**
 * Zukunftssicherer Ladepunkt. Aktuell nur die statische Struktur oben.
 * Später kann hier aus Dokumenten oder einer Datenbank geladen werden,
 * ohne dass die Agenten-Logik angepasst werden muss.
 */
export async function loadKnowledge(): Promise<CompanyKnowledge> {
  return KICKSTARTERCASH_KNOWLEDGE;
}
