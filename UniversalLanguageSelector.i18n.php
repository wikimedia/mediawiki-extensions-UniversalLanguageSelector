<?php
/**
 * Internationalisation file for Universal Language Selector.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

$messages = array();

/**
 * English
 * @author santhosh
 * @author Amire80
 * @author Nike
 * @author Kunal Mehta
 * @author Niharika
 */
$messages['en'] = array(
	'UniversalLanguageSelector' => 'Universal Language Selector',
	'uls-desc' => 'Gives the user several ways to select a language and to adjust language settings',

	'uls-plang-title-languages' => 'Languages',
	'uls-ime-helppage' => 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:UniversalLanguageSelector/Input_methods/$1',
	'ext-uls-select-language-settings-icon-tooltip' => 'Language settings',
	'ext-uls-undo-language-tooltip-text' => 'Language changed from $1',
	'ext-uls-language-settings-preferences-link' => 'More language settings',
	'uls-betafeature-label' => 'Compact language links',
	'uls-betafeature-desc' => 'Show a shorter version of the language list, with just the languages that are more relevant to you.',
);

/** Message documentation (Message documentation)
 * @author Amire80
 * @author Kunal Mehta
 * @author Raymond
 * @author Shirayuki
 */
$messages['qqq'] = array(
	'UniversalLanguageSelector' => 'Extension name',
	'uls-desc' => 'Extension description',
	'uls-plang-title-languages' => 'A title for the are in the sidebar in which the interlanguage links are supposed to appear.
This title is shown when there are no interlanguage links there, but an icon that enables the ULS is shown.
{{Identical|Language}}',
	'uls-ime-helppage' => 'Target page for ime helps. Parameters:
* $1 - ime id. Intended for wiki local customization. e.g. cyrl-palochka',
	'ext-uls-select-language-settings-icon-tooltip' => 'A tooltip for the icon that shows the language selector.
{{Identical|Language settings}}',
	'ext-uls-undo-language-tooltip-text' => 'Text for the tooltip appearing when language is changed. Parameters:
* $1 - the previous language acronym',
	'ext-uls-language-settings-preferences-link' => 'Text for the link showin in user preference screen',
	'uls-betafeature-label' => 'Used as checkbox label for beta feature.

The description for this label is {{msg-mw|Uls-betafeature-desc}}.',
	'uls-betafeature-desc' => 'Description for the compact interlanguage links beta feature.

This description is for the checkbox label {{msg-mw|Uls-betafeature-label}}.',
);

/** Arabic (العربية)
 * @author Tarawneh
 * @author ترجمان05
 * @author زكريا
 */
$messages['ar'] = array(
	'UniversalLanguageSelector' => 'محدد اللغات الشامل',
	'uls-desc' => 'يمنح المستخدم عدة طرق لاختيار لغة، وضبط إعدادات اللغة',
	'uls-plang-title-languages' => 'لغات',
	'uls-preference' => 'شغل [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector محدد اللغات الشامل]',
	'ext-uls-select-language-settings-icon-tooltip' => 'إعدادات اللغة',
	'ext-uls-undo-language-tooltip-text' => 'غيرت اللغة من $1',
	'ext-uls-language-settings-preferences-link' => 'المزيد من إعدادات اللغة',
);

/** Aramaic (ܐܪܡܝܐ)
 * @author Basharh
 */
$messages['arc'] = array(
	'uls-plang-title-languages' => 'ܠܫܢ̈ܐ',
);

/** Algerian Spoken Arabic (جزائري)
 * @author Bachounda
 */
$messages['arq'] = array(
	'UniversalLanguageSelector' => 'محدد اللوغات الشامل',
	'uls-desc' => 'يجيب للمستخدم بزاف الطرق لتخيار لوغه، و تستاف باراميترات اللوغه',
	'uls-plang-title-languages' => 'لوغات',
);

/** Assamese (অসমীয়া)
 * @author Bishnu Saikia
 * @author Gitartha.bordoloi
 */
$messages['as'] = array(
	'UniversalLanguageSelector' => 'গোলকীয় ভাষা নিৰ্বাচক',
	'uls-desc' => 'ব্যৱহাৰকাৰীক ভাষা নিৰ্বাচন কৰিবলৈ আৰু ভাষাৰ ছেটিং সলাবলৈ বিভিন্ন উপায় দিয়ে',
	'uls-plang-title-languages' => 'ভাষাসমূহ',
);

/** Asturian (asturianu)
 * @author Xuacu
 */
$messages['ast'] = array(
	'UniversalLanguageSelector' => 'Selector universal de llingua',
	'uls-desc' => 'Ufre al usuariu delles maneres pa seleicionar una llingua y axustar la configuración de llingua',
	'uls-plang-title-languages' => 'Llingües',
	'ext-uls-select-language-settings-icon-tooltip' => 'Preferencies de llingua',
	'ext-uls-undo-language-tooltip-text' => 'La llingua camudó dende $1',
	'ext-uls-language-settings-preferences-link' => 'Más preferencies de llingua',
	'uls-betafeature-label' => 'Compactando enllaces interllingüísticos',
	'uls-betafeature-desc' => 'Amuesa una versión más curtia de la llista de llingües coles que son más relevantes pa vusté.',
);

/** Belarusian (Taraškievica orthography) (беларуская (тарашкевіца)‎)
 * @author Wizardist
 */
$messages['be-tarask'] = array(
	'UniversalLanguageSelector' => 'Унівэрсальны пераключальнік моваў',
	'uls-desc' => 'Дае карыстальніку некалькі спосабаў выбраць мову і зьмяніць моўныя налады',
	'uls-plang-title-languages' => 'Мовы',
);

/** Bengali (বাংলা)
 * @author Aftab1995
 * @author Bellayet
 */
$messages['bn'] = array(
	'UniversalLanguageSelector' => 'ইউনিভার্সাল ল্যাঙ্গুয়েজ সিলেক্টর',
	'uls-desc' => 'ব্যবহারকারীকে ভাষা নির্বাচন এবং ভাষা সম্পর্কিত সেটিং সমন্বয়ের বিভিন্ন উপায় দেয়',
	'uls-plang-title-languages' => 'ভাষা',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Universal_Language_Selector/bn ইউনিভার্সাল ল্যাঙ্গুয়েজ সিলেক্টর] সক্রিয় করো',
	'ext-uls-select-language-settings-icon-tooltip' => 'ভাষা সেটিং',
	'ext-uls-undo-language-tooltip-text' => '$1 হতে ভাষার পরিবর্তন',
	'ext-uls-language-settings-preferences-link' => 'আরও ভাষা সেটিং',
);

/** Breton (brezhoneg)
 * @author Y-M D
 */
$messages['br'] = array(
	'uls-select-content-language' => 'Dibab ar yezh',
);

/** Catalan (català)
 * @author Vriullop
 */
$messages['ca'] = array(
	'UniversalLanguageSelector' => 'Selector universal de llengua',
	'uls-desc' => "Dóna a l'usuari diverses maneres per seleccionar una llengua i ajustar la seva configuració",
	'uls-plang-title-languages' => 'Llengües',
	'ext-uls-language-settings-preferences-link' => 'Més configuracions de llengua',
);

/** Chechen (нохчийн)
 * @author Умар
 */
$messages['ce'] = array(
	'uls-desc' => 'Декъашхойн таро хуьлуьйту масийтта кепара мотт харжа а мотт дIахIотто а',
	'uls-plang-title-languages' => 'Меттанаш',
	'uls-preference' => 'Латайе [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Меттанаш универсальни дӀасатухург]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Мотт дIахIоттор',
	'ext-uls-undo-language-tooltip-text' => 'Хьалхара мотт: $1',
	'ext-uls-language-settings-preferences-link' => 'Кхин мотт дIахIоттор',
);

/** Sorani Kurdish (کوردی)
 * @author Calak
 */
$messages['ckb'] = array(
	'UniversalLanguageSelector' => 'ھەڵبژاردنی زمانی گەردوونی',
	'uls-desc' => 'ڕێگای جۆربەجۆر بۆ بەکارھێنەر بۆ ھەڵبژاردنی زمان و جێبەجێکردنی ڕێکخستنەکانی زمان دخاتە ڕوو.',
	'uls-plang-title-languages' => 'زمانەکان',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector ULS] چالاک بکە',
	'ext-uls-select-language-settings-icon-tooltip' => 'ڕێکخستنەکانی زمان',
	'ext-uls-undo-language-tooltip-text' => 'زمان گۆڕدرا لە $1',
	'ext-uls-language-settings-preferences-link' => 'ڕێکخستنەکانی زیاتری زمان',
);

/** Czech (čeština)
 * @author Mormegil
 */
$messages['cs'] = array(
	'UniversalLanguageSelector' => 'Univerzální výběr jazyka',
	'uls-desc' => 'Nabízí uživateli několik způsobů volby jazyka a úpravy jazykových nastavení',
	'uls-plang-title-languages' => 'Jazyky',
	'uls-preference' => 'Zapnout [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Univerzální výběr jazyka]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Jazyková nastavení',
	'ext-uls-undo-language-tooltip-text' => 'Jazyk změněn z $1',
	'ext-uls-language-settings-preferences-link' => 'Další jazyková nastavení',
);

/** Church Slavic (словѣньскъ / ⰔⰎⰑⰂⰡⰐⰠⰔⰍⰟ)
 * @author ОйЛ
 */
$messages['cu'] = array(
	'UniversalLanguageSelector' => 'вьсѥобьщии ѩꙁꙑчьнъ иꙁборъ',
	'uls-desc' => 'Срѣдьство дѣлꙗ польꙃєватєльска оустроѥниꙗ ѩꙁꙑка и съвѧꙁанъ вєщии',
	'uls-plang-title-languages' => 'ѩꙁꙑци',
);

/** Welsh (Cymraeg)
 * @author Lloffiwr
 * @author Robin Owain
 */
$messages['cy'] = array(
	'UniversalLanguageSelector' => 'Cyfun-ddewisydd Iaith',
	'uls-desc' => "Yn cynnig sawl ffordd i'r defnyddiwr allu dewis iaith a newid gosodiadau iaith",
	'uls-plang-title-languages' => 'Ieithoedd',
	'uls-preference' => "Gosod yr [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector ''Universal Language Selector'']",
	'ext-uls-select-language-settings-icon-tooltip' => 'Gosodiadau iaith',
	'ext-uls-undo-language-tooltip-text' => 'Newidiwyd yr iaith o $1',
	'ext-uls-language-settings-preferences-link' => 'Rhagor o osodiadau iaith',
);

/** Danish (dansk)
 * @author Byrial
 * @author Cgtdk
 * @author Christian List
 * @author Peter Alberti
 */
$messages['da'] = array(
	'UniversalLanguageSelector' => 'Universel sprogvælger',
	'uls-desc' => 'Giver brugeren forskellige måder at vælge et sprog og at justere indstillingerne for sproget',
	'uls-plang-title-languages' => 'Sprog',
	'uls-preference' => 'Aktivér den [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector universelle sprogvælger]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Sprogindstillinger',
	'ext-uls-undo-language-tooltip-text' => 'Sprog ændret fra $1',
	'ext-uls-language-settings-preferences-link' => 'Flere sprogindstillinger',
);

/** German (Deutsch)
 * @author Kghbln
 * @author MF-Warburg
 * @author Metalhead64
 */
$messages['de'] = array(
	'UniversalLanguageSelector' => 'Universelle Sprachauswahl',
	'uls-desc' => 'Ermöglicht verschiedene Wege, eine Sprache auszuwählen und Spracheinstellungen anzupassen',
	'uls-plang-title-languages' => 'Sprachen',
	'ext-uls-select-language-settings-icon-tooltip' => 'Spracheinstellungen',
	'ext-uls-undo-language-tooltip-text' => 'Sprache geändert von $1',
	'ext-uls-language-settings-preferences-link' => 'Weitere Spracheinstellungen',
	'uls-betafeature-label' => 'Kompaktere Interlanguage-Links',
	'uls-betafeature-desc' => 'Zeigt eine kürzere Version der Sprachenliste mit den Sprachen an, die für dich mehr von Bedeutung sind.',
);

/** Zazaki (Zazaki)
 * @author Gorizon
 * @author Marmase
 * @author Mirzali
 */
$messages['diq'] = array(
	'UniversalLanguageSelector' => 'Zıwan Weçınıtoğo Universal',
	'uls-plang-title-languages' => 'Zıwani',
	'ext-uls-select-language-settings-icon-tooltip' => 'Eyarê zıwani',
	'ext-uls-language-settings-preferences-link' => 'Dahana véşi zıwani',
);

/** Lower Sorbian (dolnoserbski)
 * @author Michawiki
 */
$messages['dsb'] = array(
	'UniversalLanguageSelector' => 'Uniwersalny wuběrk rěcow',
	'uls-desc' => 'Dawa wužywarjeju wšake metody, aby rěc wubrał a rěcne nastajenja pśiměrił',
	'uls-plang-title-languages' => 'Rěcy',
	'ext-uls-select-language-settings-icon-tooltip' => 'Rěcne nastajenja',
	'ext-uls-undo-language-tooltip-text' => 'Rěc $1 změnjona',
	'ext-uls-language-settings-preferences-link' => 'Dalšne rěcne nastajenja',
	'uls-betafeature-label' => 'Wěcej kompaktne mjazyrěcne wótkaze',
	'uls-betafeature-desc' => 'Pokazujo krotšu wersiju rěcneje lisćiny z rěcami, kótarež su relewantne za tebje.',
);

/** Divehi (ދިވެހިބަސް)
 * @author Ushau97
 */
$messages['dv'] = array(
	'UniversalLanguageSelector' => 'ޔުނިވާސަލް ލޭންގުއޭޖް ސިލެކްޓަރ',
);

/** Greek (Ελληνικά)
 * @author Glavkos
 * @author Protnet
 */
$messages['el'] = array(
	'UniversalLanguageSelector' => 'Καθολικός Επιλέκτης Γλώσσας',
	'uls-desc' => 'Προσφέρει στο χρήστη μια σειρά από τρόπους να επιλέξει γλώσσα και να προσαρμόσει τις γλωσσικές ρυθμίσεις',
	'uls-plang-title-languages' => 'Γλώσσες',
);

/** Esperanto (Esperanto)
 * @author KuboF
 * @author Yekrats
 */
$messages['eo'] = array(
	'UniversalLanguageSelector' => 'Universala lingvo-elektilo',
	'uls-desc' => 'Proponas al uzanto kelkajn manierojn por elekti lingvon kaj modifi lingvajn agordojn',
	'uls-plang-title-languages' => 'Lingvoj',
);

/** Spanish (español)
 * @author Armando-Martin
 * @author Ovruni
 * @author Peter Bowman
 */
$messages['es'] = array(
	'UniversalLanguageSelector' => 'Selector universal de idiomas',
	'uls-desc' => 'Ofrece al usuario varias formas para seleccionar un idioma y ajustar su configuración',
	'uls-plang-title-languages' => 'Idiomas',
	'uls-preference' => 'Activar el [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector selector universal de idiomas]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Opciones de idioma',
	'ext-uls-undo-language-tooltip-text' => 'El idioma cambió de $1',
	'ext-uls-language-settings-preferences-link' => 'Más opciones de idioma',
);

/** Estonian (eesti)
 * @author Pikne
 */
$messages['et'] = array(
	'UniversalLanguageSelector' => 'Universaalne keelevalija',
	'uls-desc' => 'Võimaldab kasutajal mitmel viisil keelt valida ja keelesätteid kohandada.',
	'uls-plang-title-languages' => 'Keeled',
	'uls-preference' => 'Kasuta [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector universaalset keelevalijat]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Keelesätted',
	'ext-uls-undo-language-tooltip-text' => 'Keel vahetatud, enne: $1',
	'ext-uls-language-settings-preferences-link' => 'Veel keelesätteid',
);

/** Basque (euskara)
 * @author An13sa
 */
$messages['eu'] = array(
	'uls-select-content-language' => 'Hizkuntza aukeratu',
);

/** Persian (فارسی)
 * @author Calak
 * @author Mjbmr
 * @author Reza1615
 */
$messages['fa'] = array(
	'UniversalLanguageSelector' => 'انتخاب زبان جهانی',
	'uls-desc' => 'به کاربر راه‌های مختلفی برای انتخاب زبان و تنظیم تنظیمات زبان  می‌دهد',
	'uls-plang-title-languages' => 'زبان‌ها',
);

/** Finnish (suomi)
 * @author Nike
 * @author Stryn
 */
$messages['fi'] = array(
	'UniversalLanguageSelector' => 'Suuri kielenvalitsin',
	'uls-desc' => 'Tarjoaa useita tapoja valita kieli ja asettaa kieliasetukset',
	'uls-plang-title-languages' => 'Kielet',
	'uls-preference' => 'Ota käyttöön [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Universal Language Selector]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Kieliasetukset',
	'ext-uls-undo-language-tooltip-text' => 'Kieli vaihdettu kielestä $1',
	'ext-uls-language-settings-preferences-link' => 'Lisää kieliasetuksia',
);

/** French (français)
 * @author Gomoko
 * @author Ltrlg
 * @author Metroitendo
 * @author Tititou36
 * @author Urhixidur
 * @author Wyz
 */
$messages['fr'] = array(
	'UniversalLanguageSelector' => 'Sélecteur de Langue Universel',
	'uls-desc' => 'Donne à l’utilisateur plusieurs manières de sélectionner une langue et d’ajuster les paramètres de langue',
	'uls-plang-title-languages' => 'Langues',
	'ext-uls-select-language-settings-icon-tooltip' => 'Paramètres de langue',
	'ext-uls-undo-language-tooltip-text' => 'Langue modifiée de $1',
	'ext-uls-language-settings-preferences-link' => 'Plus de paramètres de langue',
	'uls-betafeature-label' => 'Compactage des liens interlangues',
	'uls-betafeature-desc' => 'Affiche une version raccourcie de la liste des langues avec les langues les plus pertinentes pour vous.',
);

/** Northern Frisian (Nordfriisk)
 * @author Murma174
 */
$messages['frr'] = array(
	'UniversalLanguageSelector' => 'Universal Language Selector',
	'uls-desc' => 'Maaget det mögelk, en spriak ütjtuschüken an spriakiinstelangen tu feranrin',
	'uls-plang-title-languages' => 'Spriaken',
);

/** Friulian (furlan)
 * @author Klenje
 */
$messages['fur'] = array(
	'uls-select-content-language' => 'Sielç la lenghe',
);

/** Galician (galego)
 * @author Toliño
 */
$messages['gl'] = array(
	'UniversalLanguageSelector' => 'Selector universal de linguas',
	'uls-desc' => 'Dá ao usuario varios xeitos de seleccionar unha lingua e de axustar as preferencias da mesma',
	'uls-plang-title-languages' => 'Linguas',
	'uls-preference' => 'Activar o [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector selector universal de linguas]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Opcións de lingua',
	'ext-uls-undo-language-tooltip-text' => 'A lingua cambiou desde o $1',
	'ext-uls-language-settings-preferences-link' => 'Máis opcións de lingua',
);

/** Goan Konkani (कोंकणी/Konknni )
 * @author The Discoverer
 */
$messages['gom'] = array(
	'uls-plang-title-languages' => 'Bhaso',
);

/** Goan Konkani (Latin script) (Konknni)
 * @author The Discoverer
 */
$messages['gom-latn'] = array(
	'uls-plang-title-languages' => 'Bhaso',
);

/** Swiss German (Alemannisch)
 * @author Als-Holder
 */
$messages['gsw'] = array(
	'uls-preference' => 'Di [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector universäll Sprochuuswahl] aktiviere',
);

/** Gujarati (ગુજરાતી)
 * @author KartikMistry
 */
$messages['gu'] = array(
	'UniversalLanguageSelector' => 'યુનિવર્સલ લેંગ્વેજ સિલેક્ટર',
	'uls-desc' => 'સભ્યને ભાષા પસંદગી અને ગોઠવણીઓ માટેનાં અનેક માર્ગો પૂરા પાડે છે',
	'uls-plang-title-languages' => 'ભાષાઓ',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Universal Language Selector] સક્રિય કરો',
	'ext-uls-select-language-settings-icon-tooltip' => 'ભાષા સુયોજનો',
	'ext-uls-undo-language-tooltip-text' => '$1 માંથી ભાષા બદલવામાં આવી',
	'ext-uls-language-settings-preferences-link' => 'વધુ ભાષા સુયોજનો',
);

/** Hebrew (עברית)
 * @author Amire80
 * @author Guycn2
 */
$messages['he'] = array(
	'UniversalLanguageSelector' => 'בורר השפות העולמי',
	'uls-desc' => 'נותן למשתמשים מספר דרכים לבחור שפה ולכוונן את הגדרות השפה',
	'uls-plang-title-languages' => 'שפות',
	'uls-preference' => 'הפעלת [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector בורר השפות האוניברסלי]',
	'ext-uls-select-language-settings-icon-tooltip' => 'הגדרות שפה',
	'ext-uls-undo-language-tooltip-text' => 'השפה השתנתה מ{{GRAMMAR:תחילית|$1}}',
	'ext-uls-language-settings-preferences-link' => 'הגדרות שפה נוספות',
);

/** Hindi (हिन्दी)
 * @author Siddhartha Ghai
 */
$messages['hi'] = array(
	'UniversalLanguageSelector' => 'वैश्विक भाषा चुनावकर्ता',
	'uls-desc' => 'सदस्य को भाषा चुनने और भाषा विकल्प बदलने के कई तरीके देता है',
	'uls-plang-title-languages' => 'भाषाएँ',
	'ext-uls-select-language-settings-icon-tooltip' => 'भाषा विकल्प',
	'ext-uls-undo-language-tooltip-text' => 'भाषा $1 से बदली गयी',
	'ext-uls-language-settings-preferences-link' => 'अधिक भाषा विकल्प',
);

/** Croatian (hrvatski)
 * @author MaGa
 * @author SpeedyGonsales
 */
$messages['hr'] = array(
	'uls-plang-title-languages' => 'jezične postavke',
	'uls-preference' => 'Omogući [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Universal Language Selector]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Jezične postavke',
	'ext-uls-undo-language-tooltip-text' => 'Jezik promijenjen, prethodno je bio postavljen $1',
	'ext-uls-language-settings-preferences-link' => 'Više jezičnih postavki',
);

/** Upper Sorbian (hornjoserbsce)
 * @author Michawiki
 */
$messages['hsb'] = array(
	'UniversalLanguageSelector' => 'Uniwersalny wuběr rěčow',
	'uls-desc' => 'Dawa wužiwarjej wšelake metody, zo by rěč wubrał a rěčne nastajenja přiměrił',
	'uls-plang-title-languages' => 'Rěče',
	'ext-uls-select-language-settings-icon-tooltip' => 'Rěčne nastajenja',
	'ext-uls-undo-language-tooltip-text' => 'Rěč $1 změnjena',
	'ext-uls-language-settings-preferences-link' => 'Dalše rěčne nastajenja',
	'uls-betafeature-label' => 'Bóle kompaktne mjezyrěčne wotkazy',
	'uls-betafeature-desc' => 'Pokazuje krótšu wersiju rěčneje lisćiny z rěčemi, kotrež su relewantne za tebje.',
);

/** Hungarian (magyar)
 * @author BáthoryPéter
 */
$messages['hu'] = array(
	'uls-plang-title-languages' => 'Nyelvek',
);

/** Armenian (Հայերեն)
 * @author Xelgen
 */
$messages['hy'] = array(
	'UniversalLanguageSelector' => 'Լեզվական նախընտրանքներ',
	'uls-desc' => 'Օգտագործողին թույլ է տալիս մի քանի եղանակաով ընտրել լեզուներ և լեզվական կարգավորումներ',
	'uls-plang-title-languages' => 'Լեզուներ',
);

/** Interlingua (interlingua)
 * @author McDutchie
 */
$messages['ia'] = array(
	'UniversalLanguageSelector' => 'Selector universal de lingua',
	'uls-desc' => 'Da al usator plure manieras de seliger un lingua e adjustar le configuration de lingua',
	'uls-plang-title-languages' => 'Linguas',
	'uls-preference' => 'Activar le [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector selector universal de lingua]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Configuration de lingua',
	'ext-uls-undo-language-tooltip-text' => 'Lingua cambiate ab $1',
	'ext-uls-language-settings-preferences-link' => 'Altere parametros de lingua',
);

/** Indonesian (Bahasa Indonesia)
 * @author Iwan Novirion
 */
$messages['id'] = array(
	'UniversalLanguageSelector' => 'Pilihan Bahasa Universal',
	'uls-desc' => 'Memberikan pengguna beberapa cara untuk memilih bahasa dan menyesuaikan pengaturan bahasa',
	'uls-plang-title-languages' => 'Bahasa',
);

/** Iloko (Ilokano)
 * @author Lam-ang
 */
$messages['ilo'] = array(
	'UniversalLanguageSelector' => 'Unibersal a Pagpilian ti Pagsasao',
	'uls-desc' => 'Mangited ti agar-aramat kadagiti nadumaduma a pamay-an ti panagpili ti maysa a pagsasao ken ti panagbaliw kadagiti pannakaidisso ti pagsasao',
	'uls-plang-title-languages' => 'Dagiti pagsasao',
);

/** Italian (italiano)
 * @author Beta16
 * @author Darth Kule
 */
$messages['it'] = array(
	'UniversalLanguageSelector' => 'Selettore universale della lingua',
	'uls-desc' => 'Fornisce agli utenti diversi modi di selezionare una lingua e sistemare le impostazioni della lingua',
	'uls-plang-title-languages' => 'Lingue',
	'ext-uls-select-language-settings-icon-tooltip' => 'Impostazioni per la lingua',
	'ext-uls-undo-language-tooltip-text' => 'Lingua modificata da $1',
	'ext-uls-language-settings-preferences-link' => 'Ulteriori impostazioni per la lingua',
	'uls-betafeature-label' => 'Compatta collegamenti interlinguistici',
	'uls-betafeature-desc' => "Mostra una versione ridotta dell'elenco delle lingue, con quelle più rilevanti per te.",
);

/** Japanese (日本語)
 * @author Shirayuki
 */
$messages['ja'] = array(
	'UniversalLanguageSelector' => 'ユニバーサル言語選択',
	'uls-desc' => '言語を選択するため/言語設定を調整するための、いくつかの方法を利用者に提供する',
	'uls-plang-title-languages' => '言語',
	'ext-uls-select-language-settings-icon-tooltip' => '言語の設定',
	'ext-uls-undo-language-tooltip-text' => '言語を$1から変更しました。',
	'ext-uls-language-settings-preferences-link' => '言語のその他の設定',
	'uls-betafeature-label' => '言語間リンクを短縮',
);

/** Georgian (ქართული)
 * @author David1010
 * @author გიორგიმელა
 */
$messages['ka'] = array(
	'UniversalLanguageSelector' => 'ენების უნივერსალური გადამრთველი',
	'uls-desc' => 'აძლევს მომხმარებელს ენის არჩევისა და კონფიგურაციის საშუალებას',
	'uls-plang-title-languages' => 'ენები',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector ენების უნივერსალური გადამრთველის] ჩართვა',
	'ext-uls-select-language-settings-icon-tooltip' => 'ენის პარამეტრები',
	'ext-uls-undo-language-tooltip-text' => 'წინა ენა: $1',
	'ext-uls-language-settings-preferences-link' => 'მეტი ენის პარამეტრები',
);

/** Kazakh (Cyrillic script) (қазақша (кирил)‎)
 * @author Arystanbek
 */
$messages['kk-cyrl'] = array(
	'UniversalLanguageSelector' => 'Әнбебаб тіл таңдаушы',
	'uls-plang-title-languages' => 'Тілдер',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Әмбебап тіл таңдаушыны] қосу',
	'ext-uls-select-language-settings-icon-tooltip' => 'Тіл баптаулары',
	'ext-uls-undo-language-tooltip-text' => '$1 дегеннен тіл өзгертілді',
	'ext-uls-language-settings-preferences-link' => 'Қосымша тіл баптаулары',
);

/** Kannada (ಕನ್ನಡ)
 * @author Akoppad
 */
$messages['kn'] = array(
	'uls-desc' => 'ಬಳಕೆದಾರರಿಗೆ ಭಾಷೆಯನ್ನು ಆರಿಸಲು ಮತ್ತು ಭಾಷೆಯ ವ್ಯವಸ್ಥೆಗಳನ್ನು ಹೊಂದಿಸಲು ಹಲವಾರು ಮಾರ್ಗಗಳನ್ನು ನೀಡುತ್ತದೆ',
	'uls-plang-title-languages' => 'ಭಾಷೆಗಳು',
);

/** Korean (한국어)
 * @author Freebiekr
 * @author Kwj2772
 * @author Priviet
 * @author 아라
 */
$messages['ko'] = array(
	'UniversalLanguageSelector' => '일반 언어 선택기',
	'uls-desc' => '사용자에게 언어를 선택하고 언어 설정을 바꾸는 몇 가지 방법을 제공합니다',
	'uls-plang-title-languages' => '언어',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector 일반 언어 선택기]를 활성화',
	'ext-uls-select-language-settings-icon-tooltip' => '언어 설정',
	'ext-uls-undo-language-tooltip-text' => '$1에서 언어가 바뀌었습니다',
	'ext-uls-language-settings-preferences-link' => '자세한 언어 설정',
);

/** Karachay-Balkar (къарачай-малкъар)
 * @author Iltever
 */
$messages['krc'] = array(
	'uls-plang-title-languages' => 'Тилле',
);

/** Colognian (Ripoarisch)
 * @author Purodha
 */
$messages['ksh'] = array(
	'UniversalLanguageSelector' => 'Alljemein Schproochewahl',
	'uls-desc' => 'Jit dä Metmaachere ongerscheidlejje Müjjeleschkeite, en Schprooch ußzewähle un Enschtällonge für Schprooche ze maache.',
);

/** Kurdish (Latin script) (Kurdî (latînî)‎)
 * @author Ghybu
 */
$messages['ku-latn'] = array(
	'uls-plang-title-languages' => 'Ziman',
);

/** Kyrgyz (Кыргызча)
 * @author Викиней
 */
$messages['ky'] = array(
	'UniversalLanguageSelector' => 'Универсалдуу тил тандагычтар',
	'uls-desc' => 'Колдонуучуга тил тандоонун бир нече жолун берип, тил ырастоолорду аткарууга мүмкүн кылат.',
	'uls-plang-title-languages' => 'Тилдер',
);

/** Latin (Latina)
 * @author Autokrator
 */
$messages['la'] = array(
	'UniversalLanguageSelector' => 'Lectio linguarum universalis',
	'uls-plang-title-languages' => 'Linguis aliis',
);

/** Ladino (Ladino)
 * @author Menachem.Moreira
 */
$messages['lad'] = array(
	'uls-plang-title-languages' => 'Lenguas',
);

/** Luxembourgish (Lëtzebuergesch)
 * @author Robby
 */
$messages['lb'] = array(
	'UniversalLanguageSelector' => 'Universell Auswiel vun der Sprooch',
	'uls-desc' => "Gëtt dem Benotzer verschidde Méiglechkeete fir eng Sprooch erauszesichen an d'Parameter vun der Sprooch festzeleeën",
	'uls-plang-title-languages' => 'Sproochen',
);

/** لوری (لوری)
 * @author Mogoeilor
 */
$messages['lrc'] = array(
	'uls-plang-title-languages' => 'زونا',
	'ext-uls-select-language-settings-icon-tooltip' => 'تنظيمات زون',
	'ext-uls-language-settings-preferences-link' => 'میزونکاری زونیا بیشتر',
);

/** Lithuanian (lietuvių)
 * @author Mantak111
 */
$messages['lt'] = array(
	'UniversalLanguageSelector' => 'Universalus kalbų rinkiklis',
	'uls-desc' => 'Suteikia vartotojui keliais būdais, pasirinkti kalbą ir sureguliuoti kalbos parametrus.',
	'uls-plang-title-languages' => 'Kalbos',
);

/** Latvian (latviešu)
 * @author Papuass
 */
$messages['lv'] = array(
	'UniversalLanguageSelector' => 'Universālā valodas izvēle',
	'uls-desc' => 'Ļauj lietotājam dažādos veidos izvēlēties valodu un pielāgot valodas iestatījumus',
	'uls-plang-title-languages' => 'Valodas',
);

/** Minangkabau (Baso Minangkabau)
 * @author Iwan Novirion
 */
$messages['min'] = array(
	'UniversalLanguageSelector' => 'Piliahan Bahaso Universal',
	'uls-desc' => 'Mangagiah pangguno caro untuak mamiliah bahaso dan manyasuaian pangaturannyo',
	'uls-plang-title-languages' => 'Bahaso',
);

/** Macedonian (македонски)
 * @author Bjankuloski06
 */
$messages['mk'] = array(
	'UniversalLanguageSelector' => 'Универзален избирач на јазици',
	'uls-desc' => 'Му дава на корисникот неколку начини за избор на јазик и прилагодување на јазичните поставки',
	'uls-plang-title-languages' => 'Јазици',
	'ext-uls-select-language-settings-icon-tooltip' => 'Јазични поставки',
	'ext-uls-undo-language-tooltip-text' => 'Јазикот сменет од изворниот $1',
	'ext-uls-language-settings-preferences-link' => 'Уште јазични поставки',
	'uls-betafeature-label' => 'Збивање на меѓујазичните врски',
	'uls-betafeature-desc' => 'Прикажува скратена верзија на јазичните врски, односно само оние јазици што се однесуваат на вас',
);

/** Malayalam (മലയാളം)
 * @author Praveenp
 * @author Santhosh.thottingal
 */
$messages['ml'] = array(
	'UniversalLanguageSelector' => 'ആഗോള ഭാഷാസഹായി',
	'uls-desc' => 'ഭാഷ തിരഞ്ഞെടുക്കുന്നതിനും സജ്ജീകരിക്കുന്നതിനുമുള്ള സംവിധാനം',
	'uls-plang-title-languages' => 'ഭാഷകൾ',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector യൂണിവേഴ്സൽ ലാങ്വേജ് സെലക്റ്റർ] സജ്ജമാക്കുക',
	'ext-uls-select-language-settings-icon-tooltip' => 'ഭാഷാ സജ്ജീകരണങ്ങൾ',
	'ext-uls-undo-language-tooltip-text' => 'ഭാഷ മാറിയിരിക്കുന്നു. പഴയ ഭാഷ: $1',
	'ext-uls-language-settings-preferences-link' => 'കൂടുതൽ ഭാഷാസജ്ജീകരണങ്ങൾ',
);

/** Marathi (मराठी)
 * @author Mahitgar
 * @author V.narsikar
 */
$messages['mr'] = array(
	'UniversalLanguageSelector' => 'वैश्विक भाषा वरणित्र',
	'uls-desc' => 'सदस्यांना भाषा निवडण्याचे आणि त्यांची मांडणी अनुकूल करण्याचे अनेक मार्ग उपलब्ध करते',
	'uls-plang-title-languages' => 'भाषा',
	'uls-preference' => '[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector वैश्विक भाषा वरणित्र ] सक्षम करा.',
	'ext-uls-select-language-settings-icon-tooltip' => 'भाषा सेटींग्स',
	'ext-uls-undo-language-tooltip-text' => '$1 पासुन भाषा बदलली',
	'ext-uls-language-settings-preferences-link' => 'अधिकचे भाषा मांडणी पर्याय',
);

/** Malay (Bahasa Melayu)
 * @author Anakmalaysia
 */
$messages['ms'] = array(
	'UniversalLanguageSelector' => 'Pemilih Bahasa Sejagat',
	'uls-desc' => 'Membolehkan pengguna memilih bahasa dan mengubah tetapan bahasa dengan pelbagai cara',
	'uls-plang-title-languages' => 'Bahasa',
);

/** Neapolitan (Napulitano)
 * @author Chelin
 */
$messages['nap'] = array(
	'UniversalLanguageSelector' => 'Selettore annevierziale d"a lengua',
	'uls-plang-title-languages' => 'Lengue',
);

/** Norwegian Bokmål (norsk bokmål)
 * @author Danmichaelo
 */
$messages['nb'] = array(
	'UniversalLanguageSelector' => 'Universal språkvelger',
	'uls-desc' => 'Gir brukeren flere måter å velge språk på og endre språkinnstillinger',
	'uls-plang-title-languages' => 'Språk',
);

/** Dutch (Nederlands)
 * @author Siebrand
 * @author Sjoerddebruin
 */
$messages['nl'] = array(
	'UniversalLanguageSelector' => 'Universele taalkiezer',
	'uls-desc' => 'Biedt gebruikers verschillende mogelijkheden om een taal te kiezen en bijbehorende instellingen aan te passen',
	'uls-plang-title-languages' => 'Talen',
	'ext-uls-select-language-settings-icon-tooltip' => 'Taalinstellingen',
	'ext-uls-undo-language-tooltip-text' => 'Taal gewijzigd van $1',
	'ext-uls-language-settings-preferences-link' => 'Meer taalinstellingen',
	'uls-betafeature-label' => "Lijst van interwiki's inkorten",
);

/** Norwegian Nynorsk (norsk nynorsk)
 * @author Njardarlogar
 */
$messages['nn'] = array(
	'UniversalLanguageSelector' => 'Universell språkveljar',
	'uls-desc' => 'Gjev brukaren fleire måtar å velja eit språk på og dessutan å endra språkinnstillingane',
	'uls-plang-title-languages' => 'Språk',
);

/** Ossetic (Ирон)
 * @author Bouron
 */
$messages['os'] = array(
	'UniversalLanguageSelector' => 'Универсалон æвзагæвзарæн',
	'uls-desc' => 'Архайæгæн дæтты цалдæр фадат æвзаг равзарынæн æмæ йын уаг сæвæрынæн',
);

/** Punjabi (ਪੰਜਾਬੀ)
 * @author Babanwalia
 */
$messages['pa'] = array(
	'UniversalLanguageSelector' => 'ਵਿਸ਼ਵ-ਵਿਆਪੀ ਭਾਸ਼ਾ ਚੋਣਕਾਰ',
	'uls-desc' => 'ਵਰਤੋਂਕਾਰ ਨੂੰ ਭਾਸ਼ਾਂ ਚੁਣਨ ਅਤੇ ਭਾਸ਼ਾ ਸੈਟਿੰਗਾਂ ਠੀਕ ਕਰਨ ਲਈ ਕਈ ਤਰੀਕੇ ਸੌਂਪਦਾ ਹੈ',
	'uls-plang-title-languages' => 'ਭਾਸ਼ਾਵਾਂ',
);

/** Polish (polski)
 * @author BeginaFelicysym
 * @author Peter Bowman
 * @author WTM
 */
$messages['pl'] = array(
	'UniversalLanguageSelector' => 'Uniwersalny Selektor Języka',
	'uls-desc' => 'Daje użytkownikowi kilka sposobów, aby wybrać język i dostosować ustawienia języka',
	'uls-plang-title-languages' => 'Języki',
	'uls-preference' => 'Włącz [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector uniwersalny selektor języków]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Ustawienia języka',
	'ext-uls-undo-language-tooltip-text' => 'Poprzedni język: $1',
	'ext-uls-language-settings-preferences-link' => 'Więcej ustawień języka',
);

/** Piedmontese (Piemontèis)
 * @author Borichèt
 * @author Dragonòt
 */
$messages['pms'] = array(
	'UniversalLanguageSelector' => 'Seletor Universal ëd Lenga',
	'uls-desc' => "A dà a l'utent vàire manere ëd selessioné na lenga e ëd sistemé j'ampostassion ëd lenga",
	'uls-plang-title-languages' => 'Lenghe',
	'uls-preference' => 'Ativé ël [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Seletor universal ëd lenghe]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Paràmeter ëd lenga',
	'ext-uls-undo-language-tooltip-text' => 'Lenga cangià da $1',
	'ext-uls-language-settings-preferences-link' => "Pi d'ampostassion ëd lenga",
);

/** Pashto (پښتو)
 * @author Ahmed-Najib-Biabani-Ibrahimkhel
 */
$messages['ps'] = array(
	'UniversalLanguageSelector' => 'نړېوال ژبټاکونکی',
	'uls-plang-title-languages' => 'ژبې',
);

/** Portuguese (português)
 * @author Fúlvio
 */
$messages['pt'] = array(
	'UniversalLanguageSelector' => 'Seletor Universal de Idiomas',
	'uls-desc' => 'Fornece ao utilizador várias maneiras de selecionar um idioma e ajustar suas configurações.',
	'uls-plang-title-languages' => 'Idiomas',
	'ext-uls-select-language-settings-icon-tooltip' => 'Configurações de idioma',
	'ext-uls-undo-language-tooltip-text' => 'Idioma alterado para $1',
	'ext-uls-language-settings-preferences-link' => 'Mais configurações de idioma',
);

/** Brazilian Portuguese (português do Brasil)
 * @author Jaideraf
 */
$messages['pt-br'] = array(
	'UniversalLanguageSelector' => 'Seletor universal de idiomas',
	'uls-desc' => 'Oferece ao usuário várias maneiras para selecionar um idioma e ajustar as configurações de idioma',
	'uls-plang-title-languages' => 'Idiomas',
);

/** Quechua (Runa Simi)
 * @author AlimanRuna
 */
$messages['qu'] = array(
	'uls-plang-title-languages' => 'Rimaykuna',
);

/** Romanian (română)
 * @author Minisarm
 */
$messages['ro'] = array(
	'UniversalLanguageSelector' => 'Selector universal de limbi',
	'uls-desc' => 'Oferă utilizatorului mai multe modalități de a selecta o limbă și de a modifica setările de limbă',
	'uls-plang-title-languages' => 'Limbi',
);

/** tarandíne (tarandíne)
 * @author Joetaras
 */
$messages['roa-tara'] = array(
	'UniversalLanguageSelector' => 'Scacchiatore Universale de Lènghe',
	'uls-desc' => "Dèje diverse mode a l'utende de scacchià 'na lènghe e de consiglià le 'mbostaziune d'a lènghe",
	'uls-plang-title-languages' => 'Lènghe',
	'uls-preference' => "Abbilite 'u [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Selettore de Lènghe Universale]",
	'ext-uls-select-language-settings-icon-tooltip' => "'Mbostaziune de lènghe",
	'ext-uls-undo-language-tooltip-text' => 'Lènghe cangiate da $1',
	'ext-uls-language-settings-preferences-link' => "Otre 'mbostaziune d'a lènghe",
);

/** Russian (русский)
 * @author Amire80
 * @author Okras
 * @author Putnik
 */
$messages['ru'] = array(
	'UniversalLanguageSelector' => 'Универсальный переключатель языков',
	'uls-desc' => 'Даёт пользователю несколько способов выбрать язык и произвести установки языка',
	'uls-plang-title-languages' => 'Языки',
	'ext-uls-select-language-settings-icon-tooltip' => 'Установки языка',
	'ext-uls-undo-language-tooltip-text' => 'Предыдущий язык: $1',
	'ext-uls-language-settings-preferences-link' => 'Дополнительные установки языка',
	'uls-betafeature-label' => 'Сжатие ссылок на другие языковые разделы',
	'uls-betafeature-desc' => 'Показывает сокращенный вариант списка языков с языками, которые являются более актуальными для вас.',
);

/** Scots (Scots)
 * @author John Reid
 */
$messages['sco'] = array(
	'uls-betafeature-label' => 'Compactin interlei links',
	'uls-betafeature-desc' => 'Displeys ae shorter version o the leid leet wi the lieds that ar mair relevant til ye.',
);

/** Sinhala (සිංහල)
 * @author පසිඳු කාවින්ද
 */
$messages['si'] = array(
	'UniversalLanguageSelector' => 'විශ්ව භාෂා වරකය',
	'uls-plang-title-languages' => 'භාෂාවන්',
);

/** Slovak (slovenčina)
 * @author KuboF
 */
$messages['sk'] = array(
	'UniversalLanguageSelector' => 'Univerzálny výber jazyka',
	'uls-desc' => 'Ponúka používateľovi niekoľko spôsobov výberu jazyka a úpravy jazykových nastavení',
	'uls-plang-title-languages' => 'Jazyky',
);

/** Slovenian (slovenščina)
 * @author Dbc334
 */
$messages['sl'] = array(
	'UniversalLanguageSelector' => 'Vsesplošni izbirnik jezika',
	'uls-desc' => 'Daje uporabniku več načinov izbire jezika in prilagoditve jezikovnih nastavitev',
	'uls-plang-title-languages' => 'Jeziki',
	'uls-preference' => 'Omogoči [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Vsesplošni izbirnik jezika]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Nastavitve jezika',
	'ext-uls-undo-language-tooltip-text' => 'Sprememba jezika iz $1',
	'ext-uls-language-settings-preferences-link' => 'Več jezikovnih nastavitev',
);

/** Serbian (Cyrillic script) (српски (ћирилица)‎)
 * @author Milicevic01
 * @author Милан Јелисавчић
 */
$messages['sr-ec'] = array(
	'UniversalLanguageSelector' => 'Универзални језички изборник',
	'uls-desc' => 'Даје кориснику неколико начина да изабере језик и да прилагоди поставке језика',
	'uls-plang-title-languages' => 'Језици',
	'ext-uls-select-language-settings-icon-tooltip' => 'Подешавања језика',
	'ext-uls-undo-language-tooltip-text' => 'Језик промењен са $1',
	'ext-uls-language-settings-preferences-link' => 'Додатне језичке поставке',
);

/** Serbian (Latin script) (srpski (latinica)‎)
 * @author Milicevic01
 */
$messages['sr-el'] = array(
	'uls-plang-title-languages' => 'Jezici',
	'ext-uls-select-language-settings-icon-tooltip' => 'Podešavanja jezika',
	'ext-uls-undo-language-tooltip-text' => 'Jezik promenjen sa $1',
	'ext-uls-language-settings-preferences-link' => 'Dodatne jezičke postavke',
);

/** Swedish (svenska)
 * @author Lokal Profil
 * @author WikiPhoenix
 */
$messages['sv'] = array(
	'UniversalLanguageSelector' => 'Universal språkväljare',
	'uls-desc' => 'Ger användaren flera sätt att välja ett språk på och justera språkinställningar',
	'uls-plang-title-languages' => 'Språk',
	'ext-uls-select-language-settings-icon-tooltip' => 'Språkinställningar',
	'ext-uls-undo-language-tooltip-text' => 'Språk ändrades från $1',
	'ext-uls-language-settings-preferences-link' => 'Fler språkinställningar',
	'uls-betafeature-label' => 'Kompakterar språklänkar',
	'uls-betafeature-desc' => 'Visar en kortare version av språklistan med de språk som är mer relevanta för dig.',
);

/** Tamil (தமிழ்)
 * @author Logicwiki
 */
$messages['ta'] = array(
	'UniversalLanguageSelector' => 'உலகளாவிய மொழி தேர்வுக் கருவி',
	'uls-desc' => 'பயனருக்கு மொழியை மாற்றவும் மொழி அமைப்புகளை மாற்றவும் செய்ய பல வழிகளை தருகின்றது',
);

/** Telugu (తెలుగు)
 * @author Arjunaraoc
 */
$messages['te'] = array(
	'uls-plang-title-languages' => 'భాషలు',
);

/** Tagalog (Tagalog)
 * @author AnakngAraw
 * @author Sky Harbor
 */
$messages['tl'] = array(
	'UniversalLanguageSelector' => 'Unibersal na Pampili ng Wika',
	'uls-desc' => 'Nagbibigay sa tagagamit ng ilang mga paraan upang makapili ng isang wika at upang mabago ang mga katakdaan ng wika',
);

/** Turkish (Türkçe)
 * @author Emperyan
 * @author Incelemeelemani
 */
$messages['tr'] = array(
	'UniversalLanguageSelector' => 'Evrensel Dil Seçimi',
	'uls-desc' => 'Kullanıcının bir dil seçmesi ve dil ayarlarını değiştirmesi için seçenekler sağlar.',
	'uls-plang-title-languages' => 'Diller',
);

/** Ukrainian (українська)
 * @author Andriykopanytsia
 * @author RLuts
 * @author Steve.rusyn
 * @author SteveR
 */
$messages['uk'] = array(
	'UniversalLanguageSelector' => 'Універсальний вибір мови',
	'uls-desc' => 'Надає користувачу декілька способів вибрати мову та налаштувати мовні параметри.',
	'uls-plang-title-languages' => 'Мови',
	'uls-preference' => 'Увімкнути
[https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Універсальний перемикач мов]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Налаштування мови',
	'ext-uls-undo-language-tooltip-text' => 'Мову змінено з $1',
	'ext-uls-language-settings-preferences-link' => 'Додаткові налаштування мови',
);

/** Urdu (اردو)
 * @author Muhammad Shuaib
 * @author පසිඳු කාවින්ද
 */
$messages['ur'] = array(
	'UniversalLanguageSelector' => 'آلہ برائے انتخاب عالمی زبان',
	'uls-desc' => 'صارف کو زبان کے انتخاب اور زبان کی ترتیبات کی تنظیم کے لیے متعدد راہیں فراہم کرتا ہے',
	'uls-plang-title-languages' => 'زبانیں',
	'ext-uls-select-language-settings-icon-tooltip' => 'زبان کی ترتیبات',
	'ext-uls-undo-language-tooltip-text' => '$1 سے زبان تبدیل ہوگئی',
	'ext-uls-language-settings-preferences-link' => 'مزید ترتیبات زبان',
);

/** Uzbek (oʻzbekcha)
 * @author CoderSI
 */
$messages['uz'] = array(
	'uls-plang-title-languages' => 'Tillar',
);

/** vèneto (vèneto)
 * @author GatoSelvadego
 */
$messages['vec'] = array(
	'UniversalLanguageSelector' => 'Sełetor universałe de ła lengua',
	'uls-desc' => 'Fornise ai utenti difarenti modi de sełesionar na lengua e de sistemar łe inpostasion de ła lengua',
	'uls-plang-title-languages' => 'Lengue',
);

/** Vietnamese (Tiếng Việt)
 * @author Minh Nguyen
 * @author Vinhtantran
 */
$messages['vi'] = array(
	'UniversalLanguageSelector' => 'Bộ lựa chọn Ngôn ngữ Phổ quát',
	'uls-desc' => 'Trình bày giao diện để lựa chọn ngôn ngữ và điều chỉnh các tùy chọn ngôn ngữ',
	'uls-plang-title-languages' => 'Ngôn ngữ',
	'uls-preference' => 'Bật tính năng [https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector Lựa chọn Ngôn ngữ Toàn thể]',
	'ext-uls-select-language-settings-icon-tooltip' => 'Tùy chọn ngôn ngữ',
	'ext-uls-undo-language-tooltip-text' => 'Đã đổi ngôn ngữ từ $1',
	'ext-uls-language-settings-preferences-link' => 'Thêm tùy chọn ngôn ngữ',
);

/** Yiddish (ייִדיש)
 * @author פוילישער
 */
$messages['yi'] = array(
	'UniversalLanguageSelector' => 'אוניווערסאלע שפראך־אויסוואל',
	'uls-desc' => 'גיט דעם באניצער עטלעכע וועגן אויסצוקלויבן א שפראך און אנצופאסן שפראך־איינשטעלונגען',
	'uls-plang-title-languages' => 'שפּראַכן',
);

/** Simplified Chinese (中文（简体）‎)
 * @author Li3939108
 * @author Liuxinyu970226
 * @author Shirayuki
 * @author Xiaomingyan
 */
$messages['zh-hans'] = array(
	'UniversalLanguageSelector' => '全球语言选择器',
	'uls-desc' => '为用户提供多种方法来选择语言和调整语言设置',
	'uls-plang-title-languages' => '语言',
	'ext-uls-select-language-settings-icon-tooltip' => '语言设置',
	'ext-uls-undo-language-tooltip-text' => '语言已更改自$1',
	'ext-uls-language-settings-preferences-link' => '更多语言设置',
	'uls-betafeature-label' => '压缩跨语言链接',
	'uls-betafeature-desc' => '显示与您使用的语言相关语言列表的较短版本。',
);

/** Traditional Chinese (中文（繁體）‎)
 * @author Justincheng12345
 * @author Liuxinyu970226
 * @author Simon Shek
 */
$messages['zh-hant'] = array(
	'UniversalLanguageSelector' => '通用語言選擇器',
	'uls-desc' => '為用戶提供多種方法來選擇語言和調整語言設置',
	'uls-plang-title-languages' => '語言',
	'ext-uls-select-language-settings-icon-tooltip' => '語言設定',
	'ext-uls-undo-language-tooltip-text' => '語言已從$1更改',
	'ext-uls-language-settings-preferences-link' => '更多語言設定',
	'uls-betafeature-label' => '壓縮跨語言連接',
	'uls-betafeature-desc' => '顯示與您使用語言相關語言列表之較短版本。',
);
