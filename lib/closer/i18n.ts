/**
 * Begrüßungen und Oberflächentexte je Sprache (Basis-Code: de, en, pt, zh …).
 * Für Sprachen ohne eigenen Eintrag gilt Englisch; die Antworten des Agenten
 * kommen trotzdem in der gewählten Sprache (Sprachmodell).
 * CLOSER bleibt als Name unübersetzt; der Plattformname wird gesprochen als „Kickstartercash Club".
 */

export interface UiStrings {
  start: string;
  connecting: string;
  end: string;
  ready: string;
  listening: string;
  thinking: string;
  speaking: string;
  chooseLanguage: string;
  searchLanguage: string;
  voiceMode: string;
  textOnly: string;
  textOnlyHint: string;
  typeMessage: string;
  send: string;
  readAloud: string;
  switchLanguage: string;
  privacy: string;
  aiNote: string;
  micDenied: string;
  offline: string;
  sessionEnded: string;
  retry: string;
  you: string;
  newChat: string;
}

export const UI: Record<string, UiStrings> = {
  de: {
    start: 'Gespräch starten', connecting: 'Verbindung wird aufgebaut …', end: 'Gespräch beenden', ready: 'Bereit, wenn du es bist.',
    listening: 'CLOSER hört zu', thinking: 'CLOSER denkt nach', speaking: 'CLOSER spricht',
    chooseLanguage: 'Sprache wählen', searchLanguage: 'Sprache suchen …', voiceMode: 'Sprachmodus',
    textOnly: 'Für diese Sprache nur Text', textOnlyHint: 'Für diese Sprache gibt es keine Sprachausgabe. Du schreibst, CLOSER antwortet als Text. Alternativ die Textversion auf der Webseite mit dem Übersetzer nutzen.',
    typeMessage: 'Nachricht an CLOSER …', send: 'Senden', readAloud: 'Vorlesen', switchLanguage: 'Sprache wechseln',
    privacy: 'Teile im Gespräch keine Passwörter, PINs oder vollständigen Karten- und Zugangsdaten.',
    aiNote: 'CLOSER ist ein KI-Assistent von Kickstartercash.Club, keine reale Person.',
    micDenied: 'Ohne Mikrofon wird das ein sehr einseitiges Gespräch. Bitte erlaube den Mikrofonzugriff in deinem Browser und starte erneut – oder nutze den Textmodus.',
    offline: 'Keine Internetverbindung. Sobald du wieder online bist, kannst du neu starten.',
    sessionEnded: 'Das Gespräch wurde unerwartet beendet. Du kannst jederzeit neu starten.', retry: 'Erneut versuchen', you: 'Du', newChat: 'Neues Gespräch',
  },
  en: {
    start: 'Start conversation', connecting: 'Connecting …', end: 'End conversation', ready: 'Ready when you are.',
    listening: 'CLOSER is listening', thinking: 'CLOSER is thinking', speaking: 'CLOSER is speaking',
    chooseLanguage: 'Choose language', searchLanguage: 'Search language …', voiceMode: 'Voice mode',
    textOnly: 'Text only for this language', textOnlyHint: 'There is no voice output for this language. You type, CLOSER answers in text. Alternatively use the text version on the website with the translator.',
    typeMessage: 'Message to CLOSER …', send: 'Send', readAloud: 'Read aloud', switchLanguage: 'Switch language',
    privacy: 'Do not share passwords, PINs or full card or login details during the conversation.',
    aiNote: 'CLOSER is an AI assistant of Kickstartercash.Club, not a real person.',
    micDenied: 'Without a microphone this will be a one-sided conversation. Please allow microphone access in your browser and start again – or use text mode.',
    offline: 'No internet connection. You can start again once you are back online.',
    sessionEnded: 'The conversation ended unexpectedly. You can start again at any time.', retry: 'Try again', you: 'You', newChat: 'New conversation',
  },
  tr: {
    start: 'Konuşmayı başlat', connecting: 'Bağlanıyor …', end: 'Konuşmayı bitir', ready: 'Hazır olduğunda başlayalım.',
    listening: 'CLOSER dinliyor', thinking: 'CLOSER düşünüyor', speaking: 'CLOSER konuşuyor',
    chooseLanguage: 'Dil seç', searchLanguage: 'Dil ara …', voiceMode: 'Sesli mod',
    textOnly: 'Bu dil için yalnızca metin', textOnlyHint: 'Bu dil için sesli yanıt yok. Sen yazarsın, CLOSER metinle yanıtlar. Alternatif olarak web sitesindeki çevirmenli metin sürümünü kullan.',
    typeMessage: 'CLOSER’a mesaj …', send: 'Gönder', readAloud: 'Sesli oku', switchLanguage: 'Dili değiştir',
    privacy: 'Konuşma sırasında şifre, PIN veya tam kart ve giriş bilgilerini paylaşma.',
    aiNote: 'CLOSER, Kickstartercash.Club’ın yapay zekâ asistanıdır, gerçek bir kişi değildir.',
    micDenied: 'Mikrofon olmadan bu çok tek taraflı bir konuşma olur. Lütfen tarayıcında mikrofon erişimine izin ver ve yeniden başlat – ya da metin modunu kullan.',
    offline: 'İnternet bağlantısı yok. Tekrar çevrimiçi olduğunda yeniden başlayabilirsin.',
    sessionEnded: 'Konuşma beklenmedik şekilde sona erdi. İstediğin zaman yeniden başlayabilirsin.', retry: 'Tekrar dene', you: 'Sen', newChat: 'Yeni konuşma',
  },
  es: {
    start: 'Iniciar conversación', connecting: 'Conectando …', end: 'Terminar conversación', ready: 'Listo cuando tú lo estés.',
    listening: 'CLOSER escucha', thinking: 'CLOSER está pensando', speaking: 'CLOSER habla',
    chooseLanguage: 'Elegir idioma', searchLanguage: 'Buscar idioma …', voiceMode: 'Modo voz',
    textOnly: 'Solo texto para este idioma', textOnlyHint: 'No hay voz para este idioma. Tú escribes y CLOSER responde por texto. También puedes usar la versión de texto del sitio web con el traductor.',
    typeMessage: 'Mensaje para CLOSER …', send: 'Enviar', readAloud: 'Leer en voz alta', switchLanguage: 'Cambiar idioma',
    privacy: 'No compartas contraseñas, PIN ni datos completos de tarjetas o de acceso durante la conversación.',
    aiNote: 'CLOSER es un asistente de IA de Kickstartercash.Club, no una persona real.',
    micDenied: 'Sin micrófono esto será una conversación muy unilateral. Permite el acceso al micrófono en tu navegador y vuelve a empezar, o usa el modo texto.',
    offline: 'Sin conexión a internet. Podrás volver a empezar cuando estés en línea.',
    sessionEnded: 'La conversación terminó de forma inesperada. Puedes volver a empezar cuando quieras.', retry: 'Intentar de nuevo', you: 'Tú', newChat: 'Nueva conversación',
  },
  fr: {
    start: 'Démarrer la conversation', connecting: 'Connexion …', end: 'Terminer la conversation', ready: 'Prêt quand tu l’es.',
    listening: 'CLOSER écoute', thinking: 'CLOSER réfléchit', speaking: 'CLOSER parle',
    chooseLanguage: 'Choisir la langue', searchLanguage: 'Rechercher une langue …', voiceMode: 'Mode vocal',
    textOnly: 'Texte uniquement pour cette langue', textOnlyHint: 'Pas de voix pour cette langue. Tu écris, CLOSER répond par texte. Tu peux aussi utiliser la version texte du site web avec le traducteur.',
    typeMessage: 'Message à CLOSER …', send: 'Envoyer', readAloud: 'Lire à voix haute', switchLanguage: 'Changer de langue',
    privacy: 'Ne partage pas de mots de passe, de codes PIN ni de données complètes de carte ou d’accès pendant la conversation.',
    aiNote: 'CLOSER est un assistant IA de Kickstartercash.Club, pas une personne réelle.',
    micDenied: 'Sans micro, la conversation sera très à sens unique. Autorise l’accès au micro dans ton navigateur et recommence, ou utilise le mode texte.',
    offline: 'Pas de connexion internet. Tu pourras recommencer une fois en ligne.',
    sessionEnded: 'La conversation s’est terminée de façon inattendue. Tu peux recommencer à tout moment.', retry: 'Réessayer', you: 'Toi', newChat: 'Nouvelle conversation',
  },
  it: {
    start: 'Avvia conversazione', connecting: 'Connessione …', end: 'Termina conversazione', ready: 'Pronto quando lo sei tu.',
    listening: 'CLOSER ascolta', thinking: 'CLOSER sta pensando', speaking: 'CLOSER parla',
    chooseLanguage: 'Scegli la lingua', searchLanguage: 'Cerca lingua …', voiceMode: 'Modalità voce',
    textOnly: 'Solo testo per questa lingua', textOnlyHint: 'Per questa lingua non c’è la voce. Tu scrivi, CLOSER risponde per testo. In alternativa usa la versione testo del sito con il traduttore.',
    typeMessage: 'Messaggio a CLOSER …', send: 'Invia', readAloud: 'Leggi ad alta voce', switchLanguage: 'Cambia lingua',
    privacy: 'Non condividere password, PIN o dati completi di carte o di accesso durante la conversazione.',
    aiNote: 'CLOSER è un assistente IA di Kickstartercash.Club, non una persona reale.',
    micDenied: 'Senza microfono la conversazione sarà molto a senso unico. Consenti l’accesso al microfono nel browser e riprova, oppure usa la modalità testo.',
    offline: 'Nessuna connessione internet. Potrai ricominciare quando sarai di nuovo online.',
    sessionEnded: 'La conversazione si è interrotta inaspettatamente. Puoi ricominciare quando vuoi.', retry: 'Riprova', you: 'Tu', newChat: 'Nuova conversazione',
  },
  pt: {
    start: 'Iniciar conversa', connecting: 'A ligar …', end: 'Terminar conversa', ready: 'Pronto quando quiseres.',
    listening: 'CLOSER está a ouvir', thinking: 'CLOSER está a pensar', speaking: 'CLOSER está a falar',
    chooseLanguage: 'Escolher idioma', searchLanguage: 'Procurar idioma …', voiceMode: 'Modo de voz',
    textOnly: 'Só texto para este idioma', textOnlyHint: 'Não há voz para este idioma. Tu escreves, o CLOSER responde por texto. Em alternativa, usa a versão de texto no site com o tradutor.',
    typeMessage: 'Mensagem para o CLOSER …', send: 'Enviar', readAloud: 'Ler em voz alta', switchLanguage: 'Mudar idioma',
    privacy: 'Não partilhes palavras-passe, PIN nem dados completos de cartão ou de acesso durante a conversa.',
    aiNote: 'O CLOSER é um assistente de IA da Kickstartercash.Club, não uma pessoa real.',
    micDenied: 'Sem microfone, a conversa será muito unilateral. Permite o acesso ao microfone no browser e recomeça, ou usa o modo de texto.',
    offline: 'Sem ligação à internet. Podes recomeçar quando estiveres online.',
    sessionEnded: 'A conversa terminou de forma inesperada. Podes recomeçar a qualquer momento.', retry: 'Tentar de novo', you: 'Tu', newChat: 'Nova conversa',
  },
  nl: {
    start: 'Gesprek starten', connecting: 'Verbinden …', end: 'Gesprek beëindigen', ready: 'Klaar wanneer jij het bent.',
    listening: 'CLOSER luistert', thinking: 'CLOSER denkt na', speaking: 'CLOSER spreekt',
    chooseLanguage: 'Taal kiezen', searchLanguage: 'Taal zoeken …', voiceMode: 'Spraakmodus',
    textOnly: 'Alleen tekst voor deze taal', textOnlyHint: 'Voor deze taal is er geen spraak. Jij typt, CLOSER antwoordt in tekst. Of gebruik de tekstversie op de website met de vertaler.',
    typeMessage: 'Bericht aan CLOSER …', send: 'Versturen', readAloud: 'Voorlezen', switchLanguage: 'Taal wisselen',
    privacy: 'Deel tijdens het gesprek geen wachtwoorden, pincodes of volledige kaart- of inloggegevens.',
    aiNote: 'CLOSER is een AI-assistent van Kickstartercash.Club, geen echt persoon.',
    micDenied: 'Zonder microfoon wordt dit een erg eenzijdig gesprek. Sta microfoontoegang toe in je browser en start opnieuw, of gebruik de tekstmodus.',
    offline: 'Geen internetverbinding. Zodra je weer online bent, kun je opnieuw starten.',
    sessionEnded: 'Het gesprek is onverwacht beëindigd. Je kunt altijd opnieuw starten.', retry: 'Opnieuw proberen', you: 'Jij', newChat: 'Nieuw gesprek',
  },
  pl: {
    start: 'Rozpocznij rozmowę', connecting: 'Łączenie …', end: 'Zakończ rozmowę', ready: 'Gotowy, kiedy ty będziesz.',
    listening: 'CLOSER słucha', thinking: 'CLOSER myśli', speaking: 'CLOSER mówi',
    chooseLanguage: 'Wybierz język', searchLanguage: 'Szukaj języka …', voiceMode: 'Tryb głosowy',
    textOnly: 'Dla tego języka tylko tekst', textOnlyHint: 'Dla tego języka nie ma głosu. Ty piszesz, CLOSER odpowiada tekstem. Możesz też użyć wersji tekstowej na stronie z tłumaczem.',
    typeMessage: 'Wiadomość do CLOSER …', send: 'Wyślij', readAloud: 'Czytaj na głos', switchLanguage: 'Zmień język',
    privacy: 'Nie podawaj w rozmowie haseł, PIN-ów ani pełnych danych karty lub logowania.',
    aiNote: 'CLOSER to asystent AI Kickstartercash.Club, nie prawdziwa osoba.',
    micDenied: 'Bez mikrofonu rozmowa będzie bardzo jednostronna. Zezwól na dostęp do mikrofonu w przeglądarce i zacznij od nowa albo użyj trybu tekstowego.',
    offline: 'Brak połączenia z internetem. Gdy znów będziesz online, możesz zacząć od nowa.',
    sessionEnded: 'Rozmowa zakończyła się niespodziewanie. Możesz zacząć od nowa w każdej chwili.', retry: 'Spróbuj ponownie', you: 'Ty', newChat: 'Nowa rozmowa',
  },
  ru: {
    start: 'Начать разговор', connecting: 'Подключение …', end: 'Завершить разговор', ready: 'Готов, когда ты готов.',
    listening: 'CLOSER слушает', thinking: 'CLOSER думает', speaking: 'CLOSER говорит',
    chooseLanguage: 'Выбрать язык', searchLanguage: 'Найти язык …', voiceMode: 'Голосовой режим',
    textOnly: 'Для этого языка только текст', textOnlyHint: 'Для этого языка нет голоса. Ты пишешь, CLOSER отвечает текстом. Или используй текстовую версию на сайте с переводчиком.',
    typeMessage: 'Сообщение для CLOSER …', send: 'Отправить', readAloud: 'Прочитать вслух', switchLanguage: 'Сменить язык',
    privacy: 'Не сообщай в разговоре пароли, PIN-коды или полные данные карты и доступа.',
    aiNote: 'CLOSER — ИИ-ассистент Kickstartercash.Club, а не реальный человек.',
    micDenied: 'Без микрофона разговор будет очень односторонним. Разреши доступ к микрофону в браузере и начни заново или используй текстовый режим.',
    offline: 'Нет подключения к интернету. Как только ты снова онлайн, можно начать заново.',
    sessionEnded: 'Разговор неожиданно завершился. Ты можешь начать заново в любой момент.', retry: 'Повторить', you: 'Ты', newChat: 'Новый разговор',
  },
  uk: {
    start: 'Почати розмову', connecting: 'З’єднання …', end: 'Завершити розмову', ready: 'Готовий, коли ти готовий.',
    listening: 'CLOSER слухає', thinking: 'CLOSER думає', speaking: 'CLOSER говорить',
    chooseLanguage: 'Обрати мову', searchLanguage: 'Знайти мову …', voiceMode: 'Голосовий режим',
    textOnly: 'Для цієї мови лише текст', textOnlyHint: 'Для цієї мови немає голосу. Ти пишеш, CLOSER відповідає текстом. Або скористайся текстовою версією на сайті з перекладачем.',
    typeMessage: 'Повідомлення для CLOSER …', send: 'Надіслати', readAloud: 'Прочитати вголос', switchLanguage: 'Змінити мову',
    privacy: 'Не повідомляй у розмові паролі, PIN-коди чи повні дані картки або доступу.',
    aiNote: 'CLOSER — ШІ-асистент Kickstartercash.Club, а не реальна людина.',
    micDenied: 'Без мікрофона розмова буде дуже односторонньою. Дозволь доступ до мікрофона в браузері й почни знову або скористайся текстовим режимом.',
    offline: 'Немає з’єднання з інтернетом. Щойно ти знову онлайн, можна почати знову.',
    sessionEnded: 'Розмова несподівано завершилася. Ти можеш почати знову будь-коли.', retry: 'Спробувати ще раз', you: 'Ти', newChat: 'Нова розмова',
  },
  cs: {
    start: 'Zahájit rozhovor', connecting: 'Připojování …', end: 'Ukončit rozhovor', ready: 'Připraven, až budeš ty.',
    listening: 'CLOSER poslouchá', thinking: 'CLOSER přemýšlí', speaking: 'CLOSER mluví',
    chooseLanguage: 'Vybrat jazyk', searchLanguage: 'Hledat jazyk …', voiceMode: 'Hlasový režim',
    textOnly: 'Pro tento jazyk jen text', textOnlyHint: 'Pro tento jazyk není hlas. Ty píšeš, CLOSER odpovídá textem. Případně použij textovou verzi na webu s překladačem.',
    typeMessage: 'Zpráva pro CLOSER …', send: 'Odeslat', readAloud: 'Přečíst nahlas', switchLanguage: 'Změnit jazyk',
    privacy: 'Během rozhovoru nesdílej hesla, PIN ani úplné údaje karty nebo přihlášení.',
    aiNote: 'CLOSER je AI asistent Kickstartercash.Club, ne skutečná osoba.',
    micDenied: 'Bez mikrofonu bude rozhovor velmi jednostranný. Povol přístup k mikrofonu v prohlížeči a začni znovu, nebo použij textový režim.',
    offline: 'Žádné připojení k internetu. Jakmile budeš zase online, můžeš začít znovu.',
    sessionEnded: 'Rozhovor nečekaně skončil. Můžeš kdykoli začít znovu.', retry: 'Zkusit znovu', you: 'Ty', newChat: 'Nový rozhovor',
  },
  sk: {
    start: 'Začať rozhovor', connecting: 'Pripájanie …', end: 'Ukončiť rozhovor', ready: 'Pripravený, keď budeš ty.',
    listening: 'CLOSER počúva', thinking: 'CLOSER premýšľa', speaking: 'CLOSER hovorí',
    chooseLanguage: 'Vybrať jazyk', searchLanguage: 'Hľadať jazyk …', voiceMode: 'Hlasový režim',
    textOnly: 'Pre tento jazyk len text', textOnlyHint: 'Pre tento jazyk nie je hlas. Ty píšeš, CLOSER odpovedá textom. Prípadne použi textovú verziu na webe s prekladačom.',
    typeMessage: 'Správa pre CLOSER …', send: 'Odoslať', readAloud: 'Prečítať nahlas', switchLanguage: 'Zmeniť jazyk',
    privacy: 'Počas rozhovoru nezdieľaj heslá, PIN ani úplné údaje karty alebo prihlásenia.',
    aiNote: 'CLOSER je AI asistent Kickstartercash.Club, nie skutočná osoba.',
    micDenied: 'Bez mikrofónu bude rozhovor veľmi jednostranný. Povoľ prístup k mikrofónu v prehliadači a začni znova, alebo použi textový režim.',
    offline: 'Žiadne pripojenie na internet. Keď budeš opäť online, môžeš začať znova.',
    sessionEnded: 'Rozhovor sa nečakane skončil. Môžeš kedykoľvek začať znova.', retry: 'Skúsiť znova', you: 'Ty', newChat: 'Nový rozhovor',
  },
  hu: {
    start: 'Beszélgetés indítása', connecting: 'Kapcsolódás …', end: 'Beszélgetés befejezése', ready: 'Kész, amikor te is.',
    listening: 'CLOSER figyel', thinking: 'CLOSER gondolkodik', speaking: 'CLOSER beszél',
    chooseLanguage: 'Nyelv választása', searchLanguage: 'Nyelv keresése …', voiceMode: 'Hangmód',
    textOnly: 'Ehhez a nyelvhez csak szöveg', textOnlyHint: 'Ehhez a nyelvhez nincs hang. Te írsz, CLOSER szövegben válaszol. Vagy használd a weboldal szöveges változatát a fordítóval.',
    typeMessage: 'Üzenet CLOSER-nek …', send: 'Küldés', readAloud: 'Felolvasás', switchLanguage: 'Nyelv váltása',
    privacy: 'Ne ossz meg jelszót, PIN-t vagy teljes kártya- és belépési adatokat a beszélgetés során.',
    aiNote: 'A CLOSER a Kickstartercash.Club MI-asszisztense, nem valódi személy.',
    micDenied: 'Mikrofon nélkül ez nagyon egyoldalú beszélgetés lesz. Engedélyezd a mikrofont a böngészőben, és indítsd újra – vagy használd a szöveges módot.',
    offline: 'Nincs internetkapcsolat. Amint újra online vagy, újraindíthatod.',
    sessionEnded: 'A beszélgetés váratlanul véget ért. Bármikor újraindíthatod.', retry: 'Újra', you: 'Te', newChat: 'Új beszélgetés',
  },
  ro: {
    start: 'Începe conversația', connecting: 'Se conectează …', end: 'Încheie conversația', ready: 'Gata când ești și tu.',
    listening: 'CLOSER ascultă', thinking: 'CLOSER se gândește', speaking: 'CLOSER vorbește',
    chooseLanguage: 'Alege limba', searchLanguage: 'Caută limba …', voiceMode: 'Mod vocal',
    textOnly: 'Doar text pentru această limbă', textOnlyHint: 'Pentru această limbă nu există voce. Tu scrii, CLOSER răspunde în text. Sau folosește versiunea text de pe site cu traducătorul.',
    typeMessage: 'Mesaj pentru CLOSER …', send: 'Trimite', readAloud: 'Citește cu voce tare', switchLanguage: 'Schimbă limba',
    privacy: 'Nu împărtăși parole, PIN-uri sau date complete de card ori de acces în timpul conversației.',
    aiNote: 'CLOSER este un asistent AI al Kickstartercash.Club, nu o persoană reală.',
    micDenied: 'Fără microfon, conversația va fi foarte unilaterală. Permite accesul la microfon în browser și începe din nou, sau folosește modul text.',
    offline: 'Fără conexiune la internet. Poți reîncepe când ești din nou online.',
    sessionEnded: 'Conversația s-a încheiat neașteptat. Poți reîncepe oricând.', retry: 'Încearcă din nou', you: 'Tu', newChat: 'Conversație nouă',
  },
  bg: {
    start: 'Започни разговор', connecting: 'Свързване …', end: 'Край на разговора', ready: 'Готов, когато си готов.',
    listening: 'CLOSER слуша', thinking: 'CLOSER мисли', speaking: 'CLOSER говори',
    chooseLanguage: 'Избери език', searchLanguage: 'Търси език …', voiceMode: 'Гласов режим',
    textOnly: 'За този език само текст', textOnlyHint: 'За този език няма глас. Ти пишеш, CLOSER отговаря с текст. Или използвай текстовата версия на сайта с преводача.',
    typeMessage: 'Съобщение до CLOSER …', send: 'Изпрати', readAloud: 'Прочети на глас', switchLanguage: 'Смени езика',
    privacy: 'Не споделяй пароли, ПИН кодове или пълни данни за карта или достъп по време на разговора.',
    aiNote: 'CLOSER е AI асистент на Kickstartercash.Club, а не истински човек.',
    micDenied: 'Без микрофон разговорът ще е много едностранен. Разреши достъп до микрофона в браузъра и започни отново, или използвай текстов режим.',
    offline: 'Няма интернет връзка. Щом отново си онлайн, можеш да започнеш отново.',
    sessionEnded: 'Разговорът приключи неочаквано. Можеш да започнеш отново по всяко време.', retry: 'Опитай отново', you: 'Ти', newChat: 'Нов разговор',
  },
  el: {
    start: 'Έναρξη συνομιλίας', connecting: 'Σύνδεση …', end: 'Τέλος συνομιλίας', ready: 'Έτοιμος όταν είσαι κι εσύ.',
    listening: 'Ο CLOSER ακούει', thinking: 'Ο CLOSER σκέφτεται', speaking: 'Ο CLOSER μιλάει',
    chooseLanguage: 'Επιλογή γλώσσας', searchLanguage: 'Αναζήτηση γλώσσας …', voiceMode: 'Φωνητική λειτουργία',
    textOnly: 'Μόνο κείμενο για αυτή τη γλώσσα', textOnlyHint: 'Δεν υπάρχει φωνή για αυτή τη γλώσσα. Εσύ γράφεις, ο CLOSER απαντά με κείμενο. Εναλλακτικά χρησιμοποίησε την έκδοση κειμένου στον ιστότοπο με τον μεταφραστή.',
    typeMessage: 'Μήνυμα προς CLOSER …', send: 'Αποστολή', readAloud: 'Ανάγνωση δυνατά', switchLanguage: 'Αλλαγή γλώσσας',
    privacy: 'Μην μοιράζεσαι κωδικούς, PIN ή πλήρη στοιχεία κάρτας ή πρόσβασης κατά τη συνομιλία.',
    aiNote: 'Ο CLOSER είναι βοηθός ΤΝ της Kickstartercash.Club, όχι πραγματικό πρόσωπο.',
    micDenied: 'Χωρίς μικρόφωνο η συνομιλία θα είναι πολύ μονόπλευρη. Επίτρεψε την πρόσβαση στο μικρόφωνο στον browser και ξεκίνα ξανά, ή χρησιμοποίησε τη λειτουργία κειμένου.',
    offline: 'Δεν υπάρχει σύνδεση στο διαδίκτυο. Μόλις είσαι ξανά online, μπορείς να ξεκινήσεις ξανά.',
    sessionEnded: 'Η συνομιλία τερματίστηκε απρόσμενα. Μπορείς να ξεκινήσεις ξανά όποτε θέλεις.', retry: 'Δοκίμασε ξανά', you: 'Εσύ', newChat: 'Νέα συνομιλία',
  },
  da: {
    start: 'Start samtale', connecting: 'Opretter forbindelse …', end: 'Afslut samtale', ready: 'Klar, når du er.',
    listening: 'CLOSER lytter', thinking: 'CLOSER tænker', speaking: 'CLOSER taler',
    chooseLanguage: 'Vælg sprog', searchLanguage: 'Søg sprog …', voiceMode: 'Stemmetilstand',
    textOnly: 'Kun tekst for dette sprog', textOnlyHint: 'Der er ingen stemme for dette sprog. Du skriver, CLOSER svarer med tekst. Alternativt kan du bruge tekstversionen på hjemmesiden med oversætteren.',
    typeMessage: 'Besked til CLOSER …', send: 'Send', readAloud: 'Læs højt', switchLanguage: 'Skift sprog',
    privacy: 'Del ikke adgangskoder, PIN-koder eller fulde kort- eller loginoplysninger under samtalen.',
    aiNote: 'CLOSER er en AI-assistent fra Kickstartercash.Club, ikke en rigtig person.',
    micDenied: 'Uden mikrofon bliver det en meget ensidig samtale. Tillad mikrofonadgang i din browser og start igen, eller brug teksttilstand.',
    offline: 'Ingen internetforbindelse. Når du er online igen, kan du starte forfra.',
    sessionEnded: 'Samtalen blev uventet afsluttet. Du kan starte forfra når som helst.', retry: 'Prøv igen', you: 'Du', newChat: 'Ny samtale',
  },
  sv: {
    start: 'Starta samtal', connecting: 'Ansluter …', end: 'Avsluta samtal', ready: 'Redo när du är.',
    listening: 'CLOSER lyssnar', thinking: 'CLOSER tänker', speaking: 'CLOSER talar',
    chooseLanguage: 'Välj språk', searchLanguage: 'Sök språk …', voiceMode: 'Röstläge',
    textOnly: 'Endast text för detta språk', textOnlyHint: 'Det finns ingen röst för detta språk. Du skriver, CLOSER svarar i text. Alternativt kan du använda textversionen på webbplatsen med översättaren.',
    typeMessage: 'Meddelande till CLOSER …', send: 'Skicka', readAloud: 'Läs upp', switchLanguage: 'Byt språk',
    privacy: 'Dela inte lösenord, PIN-koder eller fullständiga kort- eller inloggningsuppgifter under samtalet.',
    aiNote: 'CLOSER är en AI-assistent från Kickstartercash.Club, inte en riktig person.',
    micDenied: 'Utan mikrofon blir det ett väldigt ensidigt samtal. Tillåt mikrofonåtkomst i webbläsaren och börja om, eller använd textläget.',
    offline: 'Ingen internetanslutning. När du är online igen kan du börja om.',
    sessionEnded: 'Samtalet avslutades oväntat. Du kan börja om när som helst.', retry: 'Försök igen', you: 'Du', newChat: 'Nytt samtal',
  },
  no: {
    start: 'Start samtale', connecting: 'Kobler til …', end: 'Avslutt samtale', ready: 'Klar når du er.',
    listening: 'CLOSER lytter', thinking: 'CLOSER tenker', speaking: 'CLOSER snakker',
    chooseLanguage: 'Velg språk', searchLanguage: 'Søk språk …', voiceMode: 'Talemodus',
    textOnly: 'Kun tekst for dette språket', textOnlyHint: 'Det finnes ingen stemme for dette språket. Du skriver, CLOSER svarer med tekst. Alternativt kan du bruke tekstversjonen på nettsiden med oversetteren.',
    typeMessage: 'Melding til CLOSER …', send: 'Send', readAloud: 'Les høyt', switchLanguage: 'Bytt språk',
    privacy: 'Ikke del passord, PIN-koder eller fullstendige kort- eller påloggingsdetaljer under samtalen.',
    aiNote: 'CLOSER er en KI-assistent fra Kickstartercash.Club, ikke en ekte person.',
    micDenied: 'Uten mikrofon blir dette en svært ensidig samtale. Tillat mikrofontilgang i nettleseren og start på nytt, eller bruk tekstmodus.',
    offline: 'Ingen internettforbindelse. Når du er tilbake på nett, kan du starte på nytt.',
    sessionEnded: 'Samtalen ble uventet avsluttet. Du kan starte på nytt når som helst.', retry: 'Prøv igjen', you: 'Du', newChat: 'Ny samtale',
  },
  fi: {
    start: 'Aloita keskustelu', connecting: 'Yhdistetään …', end: 'Lopeta keskustelu', ready: 'Valmis, kun sinä olet.',
    listening: 'CLOSER kuuntelee', thinking: 'CLOSER miettii', speaking: 'CLOSER puhuu',
    chooseLanguage: 'Valitse kieli', searchLanguage: 'Hae kieltä …', voiceMode: 'Puhetila',
    textOnly: 'Tälle kielelle vain teksti', textOnlyHint: 'Tälle kielelle ei ole puhetta. Sinä kirjoitat, CLOSER vastaa tekstinä. Vaihtoehtoisesti käytä verkkosivun tekstiversiota kääntäjän kanssa.',
    typeMessage: 'Viesti CLOSERille …', send: 'Lähetä', readAloud: 'Lue ääneen', switchLanguage: 'Vaihda kieli',
    privacy: 'Älä jaa salasanoja, PIN-koodeja tai täydellisiä kortti- tai kirjautumistietoja keskustelun aikana.',
    aiNote: 'CLOSER on Kickstartercash.Clubin tekoälyavustaja, ei oikea henkilö.',
    micDenied: 'Ilman mikrofonia keskustelusta tulee hyvin yksipuolinen. Salli mikrofonin käyttö selaimessa ja aloita uudelleen, tai käytä tekstitilaa.',
    offline: 'Ei internetyhteyttä. Kun olet taas verkossa, voit aloittaa uudelleen.',
    sessionEnded: 'Keskustelu päättyi odottamatta. Voit aloittaa uudelleen milloin tahansa.', retry: 'Yritä uudelleen', you: 'Sinä', newChat: 'Uusi keskustelu',
  },
  hi: {
    start: 'बातचीत शुरू करें', connecting: 'कनेक्ट हो रहा है …', end: 'बातचीत समाप्त करें', ready: 'जब आप तैयार हों।',
    listening: 'CLOSER सुन रहा है', thinking: 'CLOSER सोच रहा है', speaking: 'CLOSER बोल रहा है',
    chooseLanguage: 'भाषा चुनें', searchLanguage: 'भाषा खोजें …', voiceMode: 'वॉइस मोड',
    textOnly: 'इस भाषा के लिए केवल टेक्स्ट', textOnlyHint: 'इस भाषा के लिए आवाज़ उपलब्ध नहीं है। आप लिखें, CLOSER टेक्स्ट में जवाब देगा। या वेबसाइट पर अनुवादक के साथ टेक्स्ट संस्करण का उपयोग करें।',
    typeMessage: 'CLOSER को संदेश …', send: 'भेजें', readAloud: 'ज़ोर से पढ़ें', switchLanguage: 'भाषा बदलें',
    privacy: 'बातचीत में पासवर्ड, पिन या कार्ड/लॉगिन का पूरा विवरण साझा न करें।',
    aiNote: 'CLOSER Kickstartercash.Club का एआई सहायक है, कोई वास्तविक व्यक्ति नहीं।',
    micDenied: 'बिना माइक्रोफ़ोन के यह बहुत एकतरफ़ा बातचीत होगी। ब्राउज़र में माइक्रोफ़ोन की अनुमति दें और फिर से शुरू करें, या टेक्स्ट मोड का उपयोग करें।',
    offline: 'इंटरनेट कनेक्शन नहीं है। ऑनलाइन होते ही आप फिर से शुरू कर सकते हैं।',
    sessionEnded: 'बातचीत अप्रत्याशित रूप से समाप्त हो गई। आप कभी भी फिर से शुरू कर सकते हैं।', retry: 'फिर कोशिश करें', you: 'आप', newChat: 'नई बातचीत',
  },
  id: {
    start: 'Mulai percakapan', connecting: 'Menghubungkan …', end: 'Akhiri percakapan', ready: 'Siap kapan pun kamu siap.',
    listening: 'CLOSER mendengarkan', thinking: 'CLOSER berpikir', speaking: 'CLOSER berbicara',
    chooseLanguage: 'Pilih bahasa', searchLanguage: 'Cari bahasa …', voiceMode: 'Mode suara',
    textOnly: 'Hanya teks untuk bahasa ini', textOnlyHint: 'Tidak ada suara untuk bahasa ini. Kamu menulis, CLOSER menjawab dengan teks. Atau gunakan versi teks di situs web dengan penerjemah.',
    typeMessage: 'Pesan untuk CLOSER …', send: 'Kirim', readAloud: 'Bacakan', switchLanguage: 'Ganti bahasa',
    privacy: 'Jangan bagikan kata sandi, PIN, atau data kartu dan login lengkap selama percakapan.',
    aiNote: 'CLOSER adalah asisten AI dari Kickstartercash.Club, bukan orang sungguhan.',
    micDenied: 'Tanpa mikrofon, percakapan ini akan sangat sepihak. Izinkan akses mikrofon di browser dan mulai lagi, atau gunakan mode teks.',
    offline: 'Tidak ada koneksi internet. Begitu online lagi, kamu bisa mulai ulang.',
    sessionEnded: 'Percakapan berakhir tanpa diduga. Kamu bisa mulai lagi kapan saja.', retry: 'Coba lagi', you: 'Kamu', newChat: 'Percakapan baru',
  },
  ms: {
    start: 'Mula perbualan', connecting: 'Menyambung …', end: 'Tamatkan perbualan', ready: 'Sedia bila-bila kamu sedia.',
    listening: 'CLOSER mendengar', thinking: 'CLOSER berfikir', speaking: 'CLOSER bercakap',
    chooseLanguage: 'Pilih bahasa', searchLanguage: 'Cari bahasa …', voiceMode: 'Mod suara',
    textOnly: 'Teks sahaja untuk bahasa ini', textOnlyHint: 'Tiada suara untuk bahasa ini. Kamu menaip, CLOSER menjawab dalam teks. Atau gunakan versi teks di laman web dengan penterjemah.',
    typeMessage: 'Mesej kepada CLOSER …', send: 'Hantar', readAloud: 'Baca kuat', switchLanguage: 'Tukar bahasa',
    privacy: 'Jangan kongsi kata laluan, PIN atau butiran penuh kad atau log masuk semasa perbualan.',
    aiNote: 'CLOSER ialah pembantu AI Kickstartercash.Club, bukan orang sebenar.',
    micDenied: 'Tanpa mikrofon, perbualan ini akan sangat sehala. Benarkan akses mikrofon dalam pelayar dan mula semula, atau gunakan mod teks.',
    offline: 'Tiada sambungan internet. Sebaik sahaja dalam talian semula, kamu boleh mula semula.',
    sessionEnded: 'Perbualan tamat tanpa diduga. Kamu boleh mula semula bila-bila masa.', retry: 'Cuba lagi', you: 'Kamu', newChat: 'Perbualan baharu',
  },
  vi: {
    start: 'Bắt đầu trò chuyện', connecting: 'Đang kết nối …', end: 'Kết thúc trò chuyện', ready: 'Sẵn sàng khi bạn sẵn sàng.',
    listening: 'CLOSER đang lắng nghe', thinking: 'CLOSER đang suy nghĩ', speaking: 'CLOSER đang nói',
    chooseLanguage: 'Chọn ngôn ngữ', searchLanguage: 'Tìm ngôn ngữ …', voiceMode: 'Chế độ giọng nói',
    textOnly: 'Ngôn ngữ này chỉ hỗ trợ văn bản', textOnlyHint: 'Không có giọng nói cho ngôn ngữ này. Bạn gõ, CLOSER trả lời bằng văn bản. Hoặc dùng phiên bản văn bản trên trang web với trình dịch.',
    typeMessage: 'Tin nhắn cho CLOSER …', send: 'Gửi', readAloud: 'Đọc to', switchLanguage: 'Đổi ngôn ngữ',
    privacy: 'Không chia sẻ mật khẩu, mã PIN hay thông tin thẻ, đăng nhập đầy đủ trong cuộc trò chuyện.',
    aiNote: 'CLOSER là trợ lý AI của Kickstartercash.Club, không phải người thật.',
    micDenied: 'Không có micro thì cuộc trò chuyện sẽ rất một chiều. Hãy cho phép truy cập micro trong trình duyệt và bắt đầu lại, hoặc dùng chế độ văn bản.',
    offline: 'Không có kết nối internet. Khi trực tuyến trở lại, bạn có thể bắt đầu lại.',
    sessionEnded: 'Cuộc trò chuyện đã kết thúc bất ngờ. Bạn có thể bắt đầu lại bất cứ lúc nào.', retry: 'Thử lại', you: 'Bạn', newChat: 'Trò chuyện mới',
  },
  ja: {
    start: '会話を始める', connecting: '接続中 …', end: '会話を終了', ready: '準備ができたら始めましょう。',
    listening: 'CLOSERが聞いています', thinking: 'CLOSERが考えています', speaking: 'CLOSERが話しています',
    chooseLanguage: '言語を選ぶ', searchLanguage: '言語を検索 …', voiceMode: '音声モード',
    textOnly: 'この言語はテキストのみ', textOnlyHint: 'この言語には音声がありません。あなたが入力し、CLOSERがテキストで答えます。または、ウェブサイトの翻訳付きテキスト版をご利用ください。',
    typeMessage: 'CLOSERへのメッセージ …', send: '送信', readAloud: '読み上げ', switchLanguage: '言語を切り替える',
    privacy: '会話中にパスワード、暗証番号、カードやログインの完全な情報を共有しないでください。',
    aiNote: 'CLOSERはKickstartercash.ClubのAIアシスタントであり、実在の人物ではありません。',
    micDenied: 'マイクがないと一方的な会話になります。ブラウザでマイクの使用を許可してやり直すか、テキストモードをご利用ください。',
    offline: 'インターネットに接続されていません。オンラインに戻ったら再開できます。',
    sessionEnded: '会話が予期せず終了しました。いつでも再開できます。', retry: 'もう一度', you: 'あなた', newChat: '新しい会話',
  },
  ko: {
    start: '대화 시작', connecting: '연결 중 …', end: '대화 종료', ready: '준비되면 시작하세요.',
    listening: 'CLOSER가 듣고 있어요', thinking: 'CLOSER가 생각 중이에요', speaking: 'CLOSER가 말하고 있어요',
    chooseLanguage: '언어 선택', searchLanguage: '언어 검색 …', voiceMode: '음성 모드',
    textOnly: '이 언어는 텍스트만 가능', textOnlyHint: '이 언어는 음성이 지원되지 않습니다. 입력하면 CLOSER가 텍스트로 답합니다. 또는 웹사이트의 번역기가 있는 텍스트 버전을 이용하세요.',
    typeMessage: 'CLOSER에게 메시지 …', send: '보내기', readAloud: '소리 내어 읽기', switchLanguage: '언어 변경',
    privacy: '대화 중에 비밀번호, PIN, 카드 또는 로그인 정보 전체를 공유하지 마세요.',
    aiNote: 'CLOSER는 Kickstartercash.Club의 AI 어시스턴트이며 실제 사람이 아닙니다.',
    micDenied: '마이크 없이는 매우 일방적인 대화가 됩니다. 브라우저에서 마이크 접근을 허용하고 다시 시작하거나 텍스트 모드를 사용하세요.',
    offline: '인터넷 연결이 없습니다. 다시 온라인이 되면 시작할 수 있습니다.',
    sessionEnded: '대화가 예기치 않게 종료되었습니다. 언제든지 다시 시작할 수 있습니다.', retry: '다시 시도', you: '나', newChat: '새 대화',
  },
  zh: {
    start: '开始对话', connecting: '正在连接 …', end: '结束对话', ready: '你准备好了，我们就开始。',
    listening: 'CLOSER 在倾听', thinking: 'CLOSER 在思考', speaking: 'CLOSER 在说话',
    chooseLanguage: '选择语言', searchLanguage: '搜索语言 …', voiceMode: '语音模式',
    textOnly: '此语言仅支持文字', textOnlyHint: '此语言没有语音输出。你输入文字，CLOSER 以文字回答。也可以使用网站上带翻译的文字版本。',
    typeMessage: '发给 CLOSER 的消息 …', send: '发送', readAloud: '朗读', switchLanguage: '切换语言',
    privacy: '对话中请勿透露密码、PIN 码或完整的银行卡和登录信息。',
    aiNote: 'CLOSER 是 Kickstartercash.Club 的 AI 助手，不是真人。',
    micDenied: '没有麦克风，对话会非常单向。请在浏览器中允许麦克风访问后重新开始，或使用文字模式。',
    offline: '没有网络连接。重新联网后即可重新开始。',
    sessionEnded: '对话意外结束。你可以随时重新开始。', retry: '重试', you: '你', newChat: '新对话',
  },
};

/** Begrüßung (erster gesprochener Satz) je Basis-Sprache. CLOSER und „Kickstartercash Club" bleiben. */
export const GREETINGS: Record<string, string> = {
  de: 'Da bist du ja. Ich bin CLOSER, der digitale Assistent von Kickstartercash Club. Was wollen wir heute klären, verbessern oder endlich in Bewegung bringen?',
  en: 'There you are. I am CLOSER, the digital assistant of Kickstartercash Club. What shall we clarify, improve or finally set in motion today?',
  tr: 'İşte geldin. Ben CLOSER, Kickstartercash Club’ın dijital asistanıyım. Bugün neyi netleştirelim, geliştirelim ya da nihayet harekete geçirelim?',
  es: 'Ahí estás. Soy CLOSER, el asistente digital de Kickstartercash Club. ¿Qué aclaramos, mejoramos o ponemos por fin en marcha hoy?',
  fr: 'Te voilà. Je suis CLOSER, l’assistant numérique de Kickstartercash Club. Qu’est-ce qu’on clarifie, améliore ou met enfin en mouvement aujourd’hui ?',
  it: 'Eccoti. Sono CLOSER, l’assistente digitale di Kickstartercash Club. Cosa chiariamo, miglioriamo o mettiamo finalmente in moto oggi?',
  pt: 'Aí estás. Sou o CLOSER, o assistente digital do Kickstartercash Club. O que vamos esclarecer, melhorar ou finalmente pôr em movimento hoje?',
  nl: 'Daar ben je. Ik ben CLOSER, de digitale assistent van Kickstartercash Club. Wat gaan we vandaag ophelderen, verbeteren of eindelijk in beweging zetten?',
  pl: 'Jesteś. Nazywam się CLOSER, jestem cyfrowym asystentem Kickstartercash Club. Co dziś wyjaśnimy, ulepszymy albo wreszcie ruszymy z miejsca?',
  ru: 'Вот и ты. Я CLOSER, цифровой ассистент Kickstartercash Club. Что сегодня проясним, улучшим или наконец сдвинем с места?',
  uk: 'Ось і ти. Я CLOSER, цифровий асистент Kickstartercash Club. Що сьогодні з’ясуємо, покращимо або нарешті зрушимо з місця?',
  cs: 'Tady jsi. Jsem CLOSER, digitální asistent Kickstartercash Club. Co dnes vyjasníme, zlepšíme nebo konečně rozhýbeme?',
  sk: 'Tu si. Som CLOSER, digitálny asistent Kickstartercash Club. Čo dnes vyjasníme, zlepšíme alebo konečne rozhýbeme?',
  hu: 'Hát itt vagy. CLOSER vagyok, a Kickstartercash Club digitális asszisztense. Mit tisztázzunk, javítsunk vagy indítsunk végre el ma?',
  ro: 'Iată-te. Sunt CLOSER, asistentul digital al Kickstartercash Club. Ce clarificăm, îmbunătățim sau punem în sfârșit în mișcare astăzi?',
  bg: 'Ето те. Аз съм CLOSER, дигиталният асистент на Kickstartercash Club. Какво ще изясним, подобрим или най-после задвижим днес?',
  el: 'Να ’σαι. Είμαι ο CLOSER, ο ψηφιακός βοηθός της Kickstartercash Club. Τι θα ξεκαθαρίσουμε, θα βελτιώσουμε ή θα βάλουμε επιτέλους σε κίνηση σήμερα;',
  da: 'Der er du. Jeg er CLOSER, den digitale assistent fra Kickstartercash Club. Hvad skal vi afklare, forbedre eller endelig sætte i gang i dag?',
  sv: 'Där är du. Jag är CLOSER, den digitala assistenten från Kickstartercash Club. Vad ska vi reda ut, förbättra eller äntligen sätta igång idag?',
  no: 'Der er du. Jeg er CLOSER, den digitale assistenten fra Kickstartercash Club. Hva skal vi avklare, forbedre eller endelig sette i gang i dag?',
  fi: 'Siinähän sinä olet. Olen CLOSER, Kickstartercash Clubin digitaalinen avustaja. Mitä selvitämme, parannamme tai saamme vihdoin liikkeelle tänään?',
  hi: 'आ गए आप। मैं CLOSER हूँ, Kickstartercash Club का डिजिटल सहायक। आज हम क्या स्पष्ट करें, बेहतर बनाएँ या आख़िरकार शुरू करें?',
  id: 'Nah, kamu di sini. Saya CLOSER, asisten digital Kickstartercash Club. Apa yang ingin kita perjelas, perbaiki, atau akhirnya mulai gerakkan hari ini?',
  ms: 'Nah, kamu di sini. Saya CLOSER, pembantu digital Kickstartercash Club. Apa yang mahu kita jelaskan, perbaiki atau akhirnya gerakkan hari ini?',
  vi: 'Bạn đến rồi. Tôi là CLOSER, trợ lý số của Kickstartercash Club. Hôm nay chúng ta làm rõ, cải thiện hay cuối cùng bắt tay vào việc gì?',
  ja: 'お待ちしていました。私はCLOSER、Kickstartercash Clubのデジタルアシスタントです。今日は何をはっきりさせ、改善し、ついに動かしましょうか？',
  ko: '오셨군요. 저는 Kickstartercash Club의 디지털 어시스턴트 CLOSER입니다. 오늘은 무엇을 명확히 하고, 개선하고, 드디어 시작해 볼까요?',
  zh: '你来了。我是 CLOSER，Kickstartercash Club 的数字助理。今天我们要理清什么、改进什么，或者终于推动什么？',
};

/** Sprachname für die Prompt-Zeile („Antworte ausschließlich auf <Sprache>"), auf Deutsch. */
export function uiFor(lang: string): UiStrings {
  const base = lang.startsWith('zh') ? 'zh' : lang.split(/[-_]/)[0].toLowerCase();
  return UI[base] ?? UI.en;
}

export function greetingFor(lang: string): string | null {
  const base = lang.startsWith('zh') ? 'zh' : lang.split(/[-_]/)[0].toLowerCase();
  return GREETINGS[base] ?? null;
}

/** Begrüßung in der höflichen Form (Standard seit 01.11.2026). */
export const GREETINGS_POLITE: Record<string, string> = {
  de: 'Herzlich willkommen bei Kickstartercash Club! Ich bin CLOSER, der digitale Assistent der Plattform. Was möchten Sie heute klären, verbessern oder in Bewegung bringen?',
  en: 'Welcome to Kickstartercash Club! I am CLOSER, the digital assistant of the platform. What would you like to clarify, improve or set in motion today?',
  tr: 'Kickstartercash Club’a hoş geldiniz! Ben CLOSER, platformun dijital asistanıyım. Bugün neyi netleştirmek, geliştirmek ya da harekete geçirmek istersiniz?',
  es: '¡Bienvenido a Kickstartercash Club! Soy CLOSER, el asistente digital de la plataforma. ¿Qué le gustaría aclarar, mejorar o poner en marcha hoy?',
  fr: 'Bienvenue chez Kickstartercash Club ! Je suis CLOSER, l’assistant numérique de la plateforme. Que souhaitez-vous clarifier, améliorer ou mettre en mouvement aujourd’hui ?',
  it: 'Benvenuto in Kickstartercash Club! Sono CLOSER, l’assistente digitale della piattaforma. Cosa desidera chiarire, migliorare o mettere in moto oggi?',
  pt: 'Bem-vindo ao Kickstartercash Club! Sou o CLOSER, o assistente digital da plataforma. O que gostaria de esclarecer, melhorar ou pôr em movimento hoje?',
  nl: 'Welkom bij Kickstartercash Club! Ik ben CLOSER, de digitale assistent van het platform. Wat wilt u vandaag ophelderen, verbeteren of in beweging zetten?',
  pl: 'Witamy w Kickstartercash Club! Nazywam się CLOSER, jestem cyfrowym asystentem platformy. Co chcieliby Państwo dziś wyjaśnić, ulepszyć albo ruszyć z miejsca?',
  ru: 'Добро пожаловать в Kickstartercash Club! Я CLOSER, цифровой ассистент платформы. Что вы хотели бы сегодня прояснить, улучшить или сдвинуть с места?',
  uk: 'Ласкаво просимо до Kickstartercash Club! Я CLOSER, цифровий асистент платформи. Що ви хотіли б сьогодні з’ясувати, покращити або зрушити з місця?',
  cs: 'Vítejte v Kickstartercash Club! Jsem CLOSER, digitální asistent platformy. Co byste dnes chtěli vyjasnit, zlepšit nebo rozhýbat?',
  sk: 'Vitajte v Kickstartercash Club! Som CLOSER, digitálny asistent platformy. Čo by ste dnes chceli vyjasniť, zlepšiť alebo rozhýbať?',
  hu: 'Üdvözöljük a Kickstartercash Clubnál! CLOSER vagyok, a platform digitális asszisztense. Mit szeretne ma tisztázni, javítani vagy elindítani?',
  ro: 'Bine ați venit la Kickstartercash Club! Sunt CLOSER, asistentul digital al platformei. Ce ați dori să clarificați, să îmbunătățiți sau să puneți în mișcare astăzi?',
  bg: 'Добре дошли в Kickstartercash Club! Аз съм CLOSER, дигиталният асистент на платформата. Какво бихте искали да изясним, подобрим или задвижим днес?',
  el: 'Καλώς ήρθατε στην Kickstartercash Club! Είμαι ο CLOSER, ο ψηφιακός βοηθός της πλατφόρμας. Τι θα θέλατε να ξεκαθαρίσουμε, να βελτιώσουμε ή να βάλουμε σε κίνηση σήμερα;',
  da: 'Velkommen til Kickstartercash Club! Jeg er CLOSER, platformens digitale assistent. Hvad vil De gerne afklare, forbedre eller sætte i gang i dag?',
  sv: 'Välkommen till Kickstartercash Club! Jag är CLOSER, plattformens digitala assistent. Vad vill ni reda ut, förbättra eller sätta igång idag?',
  no: 'Velkommen til Kickstartercash Club! Jeg er CLOSER, plattformens digitale assistent. Hva vil De gjerne avklare, forbedre eller sette i gang i dag?',
  fi: 'Tervetuloa Kickstartercash Clubiin! Olen CLOSER, alustan digitaalinen avustaja. Mitä haluaisitte tänään selvittää, parantaa tai saada liikkeelle?',
  hi: 'Kickstartercash Club में आपका स्वागत है! मैं CLOSER हूँ, प्लेटफ़ॉर्म का डिजिटल सहायक। आज आप क्या स्पष्ट करना, बेहतर बनाना या शुरू करना चाहेंगे?',
  id: 'Selamat datang di Kickstartercash Club! Saya CLOSER, asisten digital platform ini. Apa yang ingin Anda perjelas, perbaiki, atau mulai gerakkan hari ini?',
  ms: 'Selamat datang ke Kickstartercash Club! Saya CLOSER, pembantu digital platform ini. Apa yang anda ingin jelaskan, perbaiki atau gerakkan hari ini?',
  vi: 'Chào mừng quý vị đến với Kickstartercash Club! Tôi là CLOSER, trợ lý số của nền tảng. Hôm nay quý vị muốn làm rõ, cải thiện hay bắt đầu điều gì?',
  ja: 'Kickstartercash Clubへようこそ。私はCLOSER、プラットフォームのデジタルアシスタントです。本日は何をはっきりさせ、改善し、動かしたいですか？',
  ko: 'Kickstartercash Club에 오신 것을 환영합니다! 저는 플랫폼의 디지털 어시스턴트 CLOSER입니다. 오늘 무엇을 명확히 하고, 개선하고, 시작하고 싶으신가요?',
  zh: '欢迎来到 Kickstartercash Club！我是 CLOSER，平台的数字助理。今天您想理清、改进或推动什么？',
};

/**
 * Die eine Frage nach der Anrede (höflich gestellt). Nur für Sprachen mit
 * Höflichkeits- und Du-Form; Englisch, Japanisch, Koreanisch bekommen keine Frage.
 */
export const ADDRESS_QUESTIONS: Record<string, string> = {
  de: 'Damit ich Sie so anspreche, wie es Ihnen angenehm ist: Möchten Sie lieber mit „Sie“ oder mit „du“ angesprochen werden?',
  tr: 'Size nasıl hitap etmemi istersiniz: „siz“ mi, yoksa „sen“ mi?',
  es: 'Para dirigirme a usted como prefiera: ¿prefiere que le hable de usted o de tú?',
  fr: 'Pour m’adresser à vous comme vous le souhaitez : préférez-vous le vouvoiement ou le tutoiement ?',
  it: 'Per rivolgermi a Lei come preferisce: preferisce che Le dia del Lei o del tu?',
  pt: 'Para me dirigir a si como preferir: prefere que o trate por „você“ ou por „tu“?',
  nl: 'Zodat ik u aanspreek zoals u dat prettig vindt: wilt u liever met „u“ of met „je“ worden aangesproken?',
  pl: 'Aby zwracać się do Państwa tak, jak jest Państwu wygodnie: woli Pan/Pani formę „Pan/Pani“ czy „ty“?',
  ru: 'Чтобы обращаться к вам так, как вам удобно: предпочитаете «вы» или «ты»?',
  uk: 'Щоб звертатися до вас так, як вам зручно: вам ближче «ви» чи «ти»?',
  cs: 'Abych vás oslovoval tak, jak je vám příjemné: chcete raději vykat, nebo tykat?',
  sk: 'Aby som vás oslovoval tak, ako je vám príjemné: chcete radšej vykať, alebo tykať?',
  hu: 'Hogy úgy szólítsam, ahogy Önnek kellemes: a magázást vagy a tegezést részesíti előnyben?',
  ro: 'Ca să mă adresez așa cum vă este plăcut: preferați să vă vorbesc cu „dumneavoastră“ sau cu „tu“?',
  bg: 'За да се обръщам към Вас както Ви е приятно: предпочитате „Вие“ или „ти“?',
  el: 'Για να σας απευθύνομαι όπως σας είναι ευχάριστο: προτιμάτε τον πληθυντικό ευγενείας ή τον ενικό;',
  da: 'For at tiltale Dem, som De foretrækker: vil De helst tiltales med „De“ eller „du“?',
  sv: 'För att tilltala er som ni föredrar: vill ni hellre bli tilltalad med „ni“ eller „du“?',
  no: 'For å tiltale Dem slik De foretrekker: vil De helst bli tiltalt med „De“ eller „du“?',
  fi: 'Jotta puhuttelen teitä teille sopivalla tavalla: haluatteko mieluummin teitittelyä vai sinuttelua?',
  hi: 'ताकि मैं आपको आपकी पसंद के अनुसार संबोधित करूँ: क्या आप „आप“ पसंद करेंगे या „तुम“?',
  id: 'Agar saya menyapa sesuai keinginan: Anda lebih suka disapa dengan „Anda“ atau „kamu“?',
  ms: 'Supaya saya menyapa mengikut keselesaan anda: anda lebih suka „anda“ atau „kamu“?',
  vi: 'Để tôi xưng hô theo ý quý vị: quý vị muốn tôi gọi trang trọng hay thân mật?',
  zh: '为了用您习惯的方式称呼您：您希望我用“您”还是“你”来称呼？',
};

/** Begrüßung je Modus: ask = höflich + Frage, sie = höflich, du = vertraut. */
export function greetingForMode(lang: string, mode: 'ask' | 'sie' | 'du', askAllowed: boolean): string | null {
  const base = lang.startsWith('zh') ? 'zh' : lang.split(/[-_]/)[0].toLowerCase();
  if (mode === 'du') return GREETINGS[base] ?? null;
  const polite = GREETINGS_POLITE[base] ?? null;
  if (!polite) return null;
  if (mode === 'ask' && askAllowed && ADDRESS_QUESTIONS[base]) {
    // Begrüßung ohne die eigene Abschlussfrage (letzter Satz), dann die Anrede-Frage als einzige Frage.
    const sentences = polite.match(/[^.!?。！？]+[.!?。！？]+/gu) ?? [polite];
    const intro = sentences.filter((x) => !/[?？]\s*$/u.test(x)).join('').replace(/[¿¡]\s*$/u, '').trim();
    return `${intro} ${ADDRESS_QUESTIONS[base]}`.replace(/\s+/g, ' ').trim();
  }
  return polite;
}

/** „Einen Moment, ich schaue kurz nach." – Ansage vor dem Live-Nachschlagen (neutral, ohne Du/Sie). */
export const LOOKUP_PHRASES: Record<string, string> = {
  de: 'Einen Moment, ich schaue kurz nach.',
  en: 'One moment, let me check that for you.',
  tr: 'Bir saniye, hemen bakıyorum.',
  fr: 'Un instant, je vérifie.',
  es: 'Un momento, lo compruebo.',
  it: 'Un attimo, controllo subito.',
  pt: 'Um momento, vou verificar.',
  nl: 'Een moment, ik kijk het even na.',
  pl: 'Chwileczkę, zaraz sprawdzę.',
  ru: 'Минутку, сейчас проверю.',
  uk: 'Хвилинку, зараз перевірю.',
  cs: 'Moment, hned se podívám.',
  sk: 'Moment, hneď sa pozriem.',
  hu: 'Egy pillanat, máris megnézem.',
  ro: 'Un moment, verific imediat.',
  bg: 'Един момент, ще проверя.',
  el: 'Μια στιγμή, το ελέγχω.',
  sv: 'Ett ögonblick, jag kollar.',
  da: 'Et øjeblik, jeg tjekker lige.',
  no: 'Et øyeblikk, jeg sjekker.',
  fi: 'Hetkinen, tarkistan.',
  ar: 'لحظة من فضلك، سأتحقق من ذلك.',
  he: 'רגע אחד, אני בודק.',
  hi: 'एक पल, मैं अभी देखता हूँ।',
  id: 'Sebentar, saya cek dulu.',
  ms: 'Sebentar, saya semak dulu.',
  vi: 'Một chút thôi, tôi kiểm tra ngay.',
  th: 'สักครู่นะคะ กำลังตรวจสอบ',
  ja: '少々お待ちください。確認します。',
  ko: '잠시만요, 확인해 보겠습니다.',
  zh: '请稍等，我查一下。',
  sw: 'Subiri kidogo, ninaangalia.',
};

export function lookupPhraseFor(lang: string): string {
  const base = lang.startsWith('zh') ? 'zh' : lang.split('-')[0];
  return LOOKUP_PHRASES[base] ?? LOOKUP_PHRASES.en;
}
