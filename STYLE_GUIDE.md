# Vizuální manuál webu byBartonek

Tento dokument průběžně zachycuje současný vizuální systém webu a důvody nových návrhových rozhodnutí. Je určený pro člověka i pro asistenta pracujícího v tomto repozitáři.

**Zdroj pravdy pro implementaci:** hodnoty a chování komponent jsou v `styles.css` a `docs.css`. Pokud se tento manuál od implementace liší, nejdřív ověř skutečný kód a při změně systému aktualizuj obojí. Manuál nenahrazuje kontrolu vykreslení stránky.

**Důležité k původu pravidel:** první verze manuálu vznikla kontrolou aktuálního kódu. Popisuje tedy, co web dnes používá, ale nedokládá, proč byla dřívější rozhodnutí učiněna. Historické důvody nepředpokládej. Potvrzené důvody přidávej do části [Rozhodnutí a jejich důvody](#rozhodnutí-a-jejich-důvody) až ve chvíli, kdy vyplynou z práce v tomto vlákně nebo je potvrdí uživatel.

## Struktura webu

Jde o statický web bez frameworku, buildu a externích runtime závislostí. Stránky jsou samostatné HTML soubory; sdílené styly a malé skripty zajišťují společnou značku, navigaci, patičku a chování produktové ukázky.

| Adresa | Účel | Hlavní soubor |
| --- | --- | --- |
| `/` | Hlavní prezentace značky a dvou oblastí: sportovní technologie a 3D design | `index.html` + `styles.css` |
| `/jb-drill/` | Představení produktu JB_Drill, jeho funkcí a platforem | `jb-drill/index.html` + `docs.css` + `jb-drill/hero.js` |
| `/support/` | Kontakty, podpora a doporučení pro hlášení chyb | `support/index.html` + `docs.css` |
| `/privacy/` | Obecné zásady soukromí webu | `privacy/index.html` + `docs.css` |
| `/jb-drill/privacy/` | Zásady soukromí produktu a požadavky na výmaz dat | `jb-drill/privacy/index.html` + `docs.css` |

`docs.css` začíná importem `styles.css`, takže dokumentační stránky dědí stejnou značku a komponenty. `script.js` aktualizuje rok v patičce. Kořenový `hero-atom.js` spouští procedurální vizuál homepage z lokálního JSON presetu a sdíleného rendereru v `experiments/hero-atom/`. `jb-drill/hero.js` ovládá video-carousel produktového hero; oba pohyblivé vizuály respektují nastavení omezení pohybu a viditelnost stránky.

## Vizuální principy

- **Praktická technická značka:** geometrické motivy, výrazná typografie a jasné popisky podporují témata sportu, měření a návrhu.
- **Tmavý úvod, světlé čtení:** hlavička a hero pracují s uhlově tmavým pozadím; delší obsah, karty a dokumentace používají světle šedé plochy.
- **Oranžová vede pozornost:** zvýrazňuje akci, aktivní stav, důležité slovo v titulku a drobné orientační prvky.
- **Výrazný titulek, klidný text:** displejové řezy jsou určené hlavně pro krátké nadpisy. Delší vysvětlení má zůstat dobře čitelné.
- **Barva rozlišuje oblast, ne každý prvek:** limetková, azurová a fialová doplňují oranžovou ve značkových pásech a rozlišení sportu a 3D návrhu. Nevytvářej z nich další konkurenční barvy tlačítek.

## Barevné tokeny

Používej pojmenované CSS proměnné ze `:root` v `styles.css`. Nevkládej znovu hex hodnotu, pokud už pro její účel existuje token.

| Token | Hodnota | Úloha a použití |
| --- | --- | --- |
| `--ink` | `#1d1d1c` | Hlavní tmavý základ: hlavička, hero, patička a výrazné nadpisy na světlém pozadí. |
| `--panel` | `#292927` | Měkčí tmavý panel, například citace. |
| `--panel-soft` | `#343431` | Tmavší povrch drobných značkových ikon. |
| `--paper` | `#d6d8d6` | Základní světlé pozadí stránek. |
| `--paper-bright` | `#e9ebe9` | Obsahové karty, dokumentační karty a právní panel. |
| `--surface` | `#f0f1ef` | Vnořené světlé plochy a skupiny produktů. |
| `--surface-hover` | `#e2e5e2` | Hover světlých odkazových karet. |
| `--line` | `#b9bfbb` | Jemné hranice, oddělovací linky a rámečky. |
| `--text` | `#1d2732` | Základní tmavý text na světlém pozadí. |
| `--muted` | `#687686` | Sekundární text na světlých plochách; nepoužívej pro hlavní nadpis. |
| `--warm-white` | `#fff6e4` | Hlavní světlý text na tmavém pozadí. |
| `--orange` | `#ff9309` | Hlavní značkový akcent, tmavý hover a primární tlačítko. |
| `--orange-soft` | `#ffb24e` | Světlejší hover primárního tlačítka. |
| `--orange-on-light` | `#f28800` | Čitelnější oranžová pro popisky na světlé ploše. |
| `--orange-deep` | `#e27600` | Hover oranžových textových odkazů na světlém pozadí. |
| `--lime` | `#8fdb00` | Doplňkový bod/pás, zejména sportovní strana značky. |
| `--cyan` | `#63bddf` | Doplňkový bod/pás pro 3D design a signální grafiku. |
| `--violet` | `#8d7bd3` | Doplňkový konec barevného spektra, ne běžný textový akcent. |

Na tmavém pozadí používej pro čtený text `--warm-white` nebo současné světle šedé hodnoty. Na světlém pozadí drž hlavní text u `--text`/`--ink` a sekundární u `--muted`. Oranžová `--orange` je nejsilnější na tmavém podkladu; na světlém pozadí používej pro drobný text `--orange-on-light` nebo `--orange-deep`. Přímé barvy mimo tokeny zůstávají pro specifické současné kontrastní detaily; pokud se jejich význam opakuje, převeď je na pojmenovaný token.

## Typografie

Fonty jsou lokálně uložené v `assets/fonts/` a role jsou definované v `styles.css`.

| Token | Rodina | Použití |
| --- | --- | --- |
| `--font-ui` | Smooch Sans Local | Výchozí text webu, navigace a krátké uživatelské popisky. Záložní fonty jsou uvedené v CSS. |
| `--font-display` | Alumni Sans SC Local | Velké titulky, nadpisy sekcí a číselné značky. Často používá lehkou váhu pro první část a tučnou váhu pro důraz. |
| `--font-brand` | Alumni Sans SC Local | Název značky a navigace; záměrně sdílí rodinu s display fontem. |
| `--font-product` | Oxanium Local | Produktové názvy, technické štítky a krátké horní popisky. Používej úsporně, ne pro dlouhé odstavce. |
| `--font-light-accent` | Goldman Documentation | Malé výrazně prostrkané štítky na světlém pozadí, například nadpis oblasti na homepage. |
| `--font-quote` | Poiret One Local | Jediný velký citát nebo klidnější výrok. |
| `--font-reading` | Verdana / Geneva / Arial | Delší tělo uživatelské příručky, kde má přednost pohodlné čtení. |

`Saira Extra Condensed Local` je v CSS zaregistrovaný, ale aktuálně se nepoužívá přes typografický token. Nezařazuj ho do nového vzoru bez záměrné vizuální změny.

### Hierarchie textu

| Textový styl | Současné nastavení | Použití |
| --- | --- | --- |
| Základní text | `--font-ui`, 17 px, váha 450, řádkování 1.55 | Běžný obsah a obecné UI. |
| Homepage hero | `--font-display`, `clamp(54px, 7.2vw, 114px)`, váha 200, řádkování 0.95; zvýrazněná část váha 900 | Krátké hlavní sdělení na homepage. |
| Dokumentační hero | `--font-display`, `clamp(46px, 6.3vw, 94px)`, váha 200; oranžová část váha 900 | Úvod produktu a uživatelské příručky. |
| Nadpis sekce homepage | `--font-display`, `clamp(38px, 5.3vw, 76px)`, váha 200 | Otevření hlavní obsahové sekce. |
| Nadpis sekce dokumentace | `--font-display`, `clamp(34px, 4vw, 55px)`, váha 900, řádkování 0.98 | Výrazný název tématu v průvodci. |
| Běžný dokumentační text | `--font-ui`, 18 px, váha 500, řádkování 1.28 | Texty dokumentačních a právních stránek mimo `.guide-body`. |
| Obsah `.guide-body` | `--font-reading`, 16 px, váha 400, řádkování 1.55 | Delší vysvětlení, seznamy a buňky tabulek; aktuálně jej používá produktová stránka i uživatelská příručka. |
| `eyebrow` na tmavém podkladu | `--font-product`, 11 px, váha 650, tracking `0.16em` | Krátký štítek nad titulkem. |
| `eyebrow` na světlém podkladu | `--font-light-accent`, 20 px, tracking `0.11em` | Označení hlavní světlé sekce; používá hodnoty `--light-accent-*`. |
| Text tlačítka | `--font-display`, 16 px, váha 800, tracking `0.03em` | Krátká akce v CTA. |
| Název produktu | `--font-product`, 22 px, váha 550 | Název položky v produktových skupinách. |

- Hero používá krátký horní štítek, velký řádkovaný titulek a stručný popis. Oranžovou zvýrazni jen část titulku, ne celý blok textu.
- Nadpisy homepage a dokumentace jsou převážně uppercase. Měkká a tučná váha společně vytvářejí důraz; nepřidávej další dekorativní font.
- `eyebrow` označuje oblast nebo kategorii. Na tmavém pozadí je oranžový a technický; na světlé ploše používá tmavší `--orange-on-light` a Goldman.
- Odstavce drž v běžném řezu. Pro delší nápovědu zachovej specifické pravidlo `.guide-body`, které přepíná odstavce, seznamy a buňky tabulek na `--font-reading`.
- Hero odstavec uživatelské příručky má zvláštní třídu `.user-guide-body` a čte se ve Verdana s řádkováním 1.7.
- Text v kartě má jasné pořadí: krátký název, jedna až několik vět vysvětlení a případně jeden odkaz.
- Aktuální texty webu jsou anglicky; zachovej jazyk stránky, pokud zadání výslovně nepožaduje lokalizaci.

## Komponenty a kdy je použít

### Společná navigace a patička

Používej `.site-header`, `.brand`, `.brand-logo`, `.brand-lockup`, `.site-nav` a `.site-footer`. Hlavička je lepkavá, tmavá a má tenký oranžový horní proužek. Navigace má odpovídat kontextu stránky; aktivní položka se označuje `aria-current="page"`. Patička nese značku, kontextové odkazy a rok. Nekopíruj alternativní hlavičku jen kvůli jedné stránce.

Na úzkých displejích se navigace záměrně zkracuje: homepage ponechá poslední položku, dokumentační stránky aktuální položku. Při přidávání stránky zkontroluj, že její aktuální odkaz zůstane viditelný a pojmenovaný.

### Tlačítka a odkazy

- `.button.button-primary`: hlavní další krok stránky, například „Explore the work“ nebo „Open user guide“. Obvykle nejvýše jeden hlavní cíl v jednom bloku.
- `.button.button-quiet`: druhá volba na tmavém hero, typicky kontakt nebo podpora.
- `.button.button-light`: světlé tlačítko uvnitř oranžového `contact-band`.
- `.product-link`: celý související produktový řádek je klikací plocha; hover mění plochu a posune ji jen lehce.
- Obsahové odkazy v nápovědě a právních kartách jsou podtržené, aby bylo jasné, že jde o odkazy.

Zachovej viditelný `:focus-visible`; hover nemá být jediným vodítkem interakce. Popisek CTA má pojmenovat výsledek akce, ne jen obecné „Klikni“.

### Homepage

- `.hero`: hlavní sdělení značky na tmavém pozadí. Text vlevo, procedurální interaktivní atom `.hero-visual.hero-atom` vpravo. Vizuál je podpůrný; nesmí soutěžit s titulkem. Jeho canvas, HTML karty a fallback zůstávají uvnitř původní pravé buňky hero.
- `.work` a `.section-heading`: přechod do světlého obsahu a úvod sekce.
- `.discipline-grid` s `.discipline-sport` a `.discipline-print`: dvě hlavní oblasti nabídky. Barevný horní proužek rozlišuje sport (`--orange` → `--lime`) a 3D (`--cyan` → `--violet`). Číslo oblasti je dekorativní, ne další primární text.
- `.product-groups`, `.product-group`, `.product-list`, `.product-link`: seskupení konkrétních nástrojů uvnitř oblasti. Ikony mají sdílet rozměr a tmavý podklad.
- `.print-feature`: hlavní ukázka 3D modelu; obrázek má mít dost prostoru a správný poměr stran.
- `.pull-quote`: samostatný tmavý pás pro krátký značkový výrok.
- `.contact-band`: výrazná oranžová závěrečná výzva s jedním světlým CTA.

### Produkt a dokumentace

- `.docs-hero`: úvodní blok produktové stránky nebo příručky. Používej krátký `page-context`, titulek, stručný odstavec a CTA. Volitelný `eyebrow` ponech jen tam, kde přidává skutečnou orientační informaci a neopakuje další marketingové sdělení.
- `.docs-hero--jb-drill`: značkový vizuál JB_Drill. Na produktové stránce je jméno JB_Drill v horním `page-context` větší než drobný text „Product Overview“, aniž by konkurovalo hlavnímu sloganu; specifické pravidlo `.product-body` nemění štítek v Help. `.docs-hero--video` zapínej jen pro produktovou stránku s carousel videí; ovládání patří do `.jb-hero-slide-ui` a musí zůstat přístupné klávesnicí.
- `.product-view-switcher`: pouze dvojice kompaktních odkazových záložek Overview a Features bezprostředně pod produktovým Hero; při scrollování zůstávají připnuté pod sdílenou hlavičkou. Každá záložka vyplňuje svou polovinu šířky obrazovky: aktivní má světlé pozadí a oranžový horní proužek přes celou polovinu, neaktivní tmavé pozadí. Boční rámečky nejsou; barevný předěl ploch je jen uprostřed. Nápis Overview je zarovnaný se začátkem obsahového sloupce, jeho malé číslo je na desktopu v levém odsazení; na mobilu se čísla skrývají. `product-view.js` přepíná panely Overview/Features podle URL hashe; výchozí Overview zachovává stávající obsah. Download je samostatná stránka dostupná z tlačítka v Hero, ne třetí poloha přepínače. Tento vzor patří zatím jen na `/jb-drill/`.
- `.overview-core-grid` / `.overview-core-card`: stručné hlavní schopnosti v Overview hned po úvodu „THE IDEA“. Na desktopu dvě karty vedle sebe; pátá karta Library zabírá celou šířku mezi dvěma dvojicemi nad ní a poslední dvojicí pod ní. Na mobilu je jeden sloupec. Textové karty mají kompaktní svislé odsazení a těsnější mezery mezi štítkem, názvem a popisem. Každá je celý přístupný odkaz na odpovídající Overview podsekci a hover/focus proto jemně zvedne kartu a zvýrazní její obrys. Library i PDF/MP4 vedou do společné podsekce Library, Sessions & Exports. Sekci oddělují stejné tenké linky jako úvod. Features je vyhrazené pro pozdější detailnější ukázky dílčích funkcí a QOL, ne pro opakování těchto karet.
- `.overview-feature-section`, `.overview-preview-card` a `.overview-video-dialog`: šest podsekcí produktového Overview používá na desktopu střídavý dvousloupcový story layout. Nadpis je přes celou šířku, pod ním se střídá video karta vlevo / text vpravo a text vlevo / video karta vpravo. Na mobilu se každá podsekce skládá do pořadí nadpis, text, video. Karta má zaoblené rohy, tmavou hlavičku s bílým názvem a světlé tělo kolem náhledu a popisu. Hover/focus převádí hlavičku na stejný světlý podklad jako tělo karty a přidává oranžový horní proužek navazující na obrys karty. Celá karta je odkaz na soubor MP4 pro případ vypnutého JavaScriptu; při běžném použití se otevře společný přehrávač s krátkou animací z pozice karty. Video se načítá až při otevření. Dialog má vlastní zavření, play/pause a časovou osu; kliknutí na obraz přepíná pauzu a po přirozeném dohrání se přehrávač vrátí do karty. Na mobilním viewportu první tap otevře náhled s tlačítkem `Play fullscreen`; až tento explicitní druhý tap vyvolá skutečný browser fullscreen na kořeni stránky a požádá zařízení o landscape orientaci. Ve fullscreenu zůstane pouze play/pause a časová osa. Při `prefers-reduced-motion` přechodové animace vynechává.
- `.docs-shell`: dokumentační rozvržení s `.docs-page-title`, navigací `.docs-toc` a článkem `.docs-content`. U delších příruček je TOC užitečný; krátké stránky ho nepotřebují.
- `.docs-section`: samostatné téma s horním štítkem, jedním hlavním nadpisem a souvisejícím textem.
- `.step-grid` / `.step-card`: posloupnost očíslovaných kroků. `.feature-grid` / `.feature-card`: rovnocenné vlastnosti. `.gesture-grid` / `.gesture-card`: ovládání nebo gesta, s klávesou či gestem v krátkém štítku.
- `.notice-card`: důležité, ale ne hlavní sdělení; oranžová levá hrana upozorní bez použití dalšího alarmového stylu.
- `.docs-table`: porovnání nebo husté dvojice název/opis. Na mobilu se každý řádek skládá svisle. Nepoužívej tabulku jen kvůli vizuálnímu zarovnání běžných odstavců.

### Podpora a právní stránky

- `.legal-wrap` a `.legal-card`: úzký čitelný sloupec pro support a privacy texty. Nepřidávej do nich produktový hero, pokud stránka nemá skutečnou prezentační roli.
- `.support-grid` a `.support-box`: paralelní kontaktní kanály nebo odkazy. Všechny karty mají stejnou vizuální váhu.
- `.privacy-callout`: pouze pro důležité upozornění nebo konkrétní požadavek na výmaz; není to běžná zvýrazňovací karta.
- `.legal-meta`: datum účinnosti nebo aktualizace. Má zůstat sekundární a vizuálně nenápadné.

## Tvary a hloubka

Základní zakulacení je token `--radius` (`18px`) a základní stín token `--shadow` (`0 18px 50px rgba(21, 30, 38, 0.11)`). Použij je pro větší karty a panely. Hustší komponenty dokumentace mají vlastní menší rádiusy (zpravidla 6–14 px) a jemnější stín; ponech jejich lokální hodnoty, místo sjednocení všech prvků na jeden velký radius. Hranice mezi světlými plochami obvykle používají `--line`.

## Responzivita a pohyb

Hlavní styly používají breakpointy `1050px` a `760px`; dokumentační styly navíc skládají TOC od `900px`. Zachovej tento systém, pokud nový obsah neprokáže skutečnou potřebu dalšího bodu.

Na mobilu se hlavní hero skládá pod sebe, karty a produktové skupiny přecházejí do jednoho sloupce, TOC se přesune nad text a tabulky se změní na bloky. Produktové video se přesune pod úvodní text. Po každé vizuální změně ověř alespoň desktop a šířku kolem 390 px; kontroluj ořez textu, šířku CTA, pořadí navigace, obrázky a karty.

Respektuj `prefers-reduced-motion`: homepage omezuje přechody a scrollování, produktový carousel při této volbě video nepřehrává. Nepřidávej automatický pohyb bez ovládání nebo alternativního statického stavu.

## Postup při změně webu

1. Najdi stránku a její existující komponentu v HTML; nejdřív znovu použij současnou strukturu.
2. Pro barvu, typografii, rámeček a povrch použij existující proměnnou nebo komponentní třídu.
3. Pokud se opakuje nový účel barvy či textu, pojmenuj jej jako token v `:root` a zapiš jej sem. Jednorázový dekorativní detail může zůstat lokální.
4. Zachovej sémantické HTML, popisky tlačítek, `aria-current`, `:focus-visible`, poměry stran obrázků a pravidla omezení pohybu.
5. Zkontroluj dotčenou stránku v desktopové i mobilní šířce. U produktového hero ověř i statický fallback a ovládání carouselu.
6. Aktualizuj tento manuál, pokud změna upravila barvy, typografické role, komponentu nebo její doporučené použití.
7. Pokud padlo nové návrhové rozhodnutí, zapiš také jeho důvod a rozsah v následující části, dokud je kontext čerstvý.

## Rozhodnutí a jejich důvody

Tato část bude postupně doplňována při dalších úpravách. Zatím sem nepřenášíme domnělé důvody starších rozhodnutí. Zapisuj jen důvody, které uživatel výslovně uvedl nebo které společně potvrdíme během práce.

Pro každé netriviální rozhodnutí přidej krátký záznam:

```text
Datum:
Oblast / komponenta:
Rozhodnutí:
Důvod:
Kde se používá / výjimky:
Související soubory:
```

### 2026-09-19 — Přepínání Overview a Features pod JB_Drill Hero

- Rozhodnutí: produktová stránka má jeden společný Hero a pod ním výrazný dvoupolohový přepínač `Overview | Features`; přepínání mění obsah bez procházení dlouhé stránky a zachovává přímé odkazy přes URL hash. `Download` v Hero vede do připraveného bloku pro obchody. Help zůstává dostupný v patičce, ale horní navigace místo něj ukazuje Features.
- Důvod potvrzený uživatelem: Overview má být poutavá reklama na první pohled, Features podrobnější přesvědčení již zaujatého návštěvníka. Nyní chce nejprve vidět rozvržení a vzhled přepínače, nikoli finální texty a videa.
- Rozsah: `/jb-drill/` (`jb-drill/index.html`, `jb-drill/product-view.js`, `docs.css`). Současný obsah Overview je dočasně zachovaný; obsah Features a odkazy na obchody jsou provizorní a nesmějí být považované za schválený finální copywriting.

### 2026-09-20 — Kompaktní připnutý přepínač produktu

- Rozhodnutí: přepínač Overview/Features má přibližně poloviční výšku oproti první variantě a po odscrollování Hero zůstává přímo pod horní lištou. Vedlejší podtitulky záložek byly odstraněny, aby přepínač nezabíral místo obsahu. Kotvy a boční navigace obsahu respektují kombinovanou výšku obou připnutých lišt.
- Důvod potvrzený uživatelem: původní záložky byly příliš vysoké a po opuštění Hero zmizely, přestože mají umožnit kdykoli přepnout mezi prodejním Overview a Features.
- Rozsah: pouze `/jb-drill/` (`jb-drill/index.html`, `docs.css`); sdílená horní lišta a ostatní stránky zůstávají beze změny.

### 2026-09-20 — Barevný přechod přepínače jen uprostřed

- Rozhodnutí: plochy Overview a Features se táhnou bez ohraničení od středové hranice až k protějšímu okraji viewportu. Aktivní/neaktivní stav určuje světlá/tmavá plocha, bez horní oranžové linky a bez dojmů samostatných obdélníkových karet. Text zůstává přibližně zarovnaný se současným obsahem.
- Důvod potvrzený uživatelem: ohraničení po stranách a horní hrana způsobovaly, že aktivní pohled vypadal jako obdélník vystupující vzhůru; chce barevný předěl pouze mezi oběma pohledy.
- Rozsah: pouze přepínač na `/jb-drill/` (`docs.css`); jeho výška, sticky chování a obsah panelů se nemění. Horní proužek byl následně vrácen podle následujícího rozhodnutí.

### 2026-09-20 — Horní proužek přes celou aktivní polovinu

- Rozhodnutí: oranžový horní proužek se vrací, ale nyní vede od středové hranice až k vnějšímu okraji aktivní poloviny. Je kreslen dovnitř plochy, takže nemění výšku připnutého přepínače.
- Důvod potvrzený uživatelem: po odstranění bočních hranic a roztažení barev až k okrajům se mu řešení líbí; horní oranžový akcent chce zachovat v novém celoplošném uspořádání.
- Rozsah: pouze aktivní záložka přepínače na `/jb-drill/` (`docs.css`).

### 2026-09-20 — Testovací video karty v Overview

- Rozhodnutí: úvodní blok Overview zachovává malý oranžový štítek, úderný nadpis a šedý popis. Čtyři dosavadní karty nahrazují video karty v pořadí tučný název → statický thumbnail → krátký popis. Každá používá právě jeden ze současných Hero klipů; pro test jsou vybrány umístění, kreslení, Tactics a sestavení session. Kliknutí kartu rychle rozbalí do přehrávače; po dokončení se sbalí. Kliknutí během přehrávání pauzuje a ponechá ji otevřenou; ruční zavření je nahoře a ovládání s posuvníkem dole.
- Důvod potvrzený uživatelem: líbí se mu současná hierarchie úvodu a čtveřice obdélníků, ale karty mají na první pohled ukázat produkt v akci. Boční navigaci si může později přát vrátit, takže je na produktové stránce pouze skrytá, ne odstraněná.
- Rozsah: pouze `/jb-drill/` (`jb-drill/index.html`, `jb-drill/overview-video.js`, `docs.css`, poster snímky v `assets/jb-drill-hero/`). Stávající Hero videa zůstávají beze změny; výběr a texty karet jsou provizorní pro posouzení vzhledu a interakce.

### 2026-09-20 — Jedna video karta na podsekci a hlavička podle přepínače

- Rozhodnutí: původní čtveřice karet pod prvním sdělením byla rozložena po jedné do všech šesti prozatímních podsekcí Overview. Jedna ukázka Hero se dočasně opakuje, protože teď se posuzuje vizuální rytmus, nikoli finální obsah. Karta zůstává široká jako jedna buňka původní dvojice. Horní rohy jsou ostré; tmavá hlavička s bílým titulkem při hoveru/focusu přejde do světle šedé, s oranžovým proužkem navazujícím na oranžový obrys karty. Thumbnail je odsazen uvnitř světlého těla. Dřívější textová čtveřice ve Smart drawing i výčet v Training sessions jsou pro jednotný vizuální rytmus provizorně shrnuty do šedého odstavce mezi titulkem a kartou.
- Důvod potvrzený uživatelem: s video kartami chce šetřit — v jedné podsekci nejvýše dvě, spíše jednu. Vizuál hlavičky má navazovat na přepínač Overview/Features nad obsahem. Názvy sekcí, texty i přiřazení videí jsou stále provizorní.
- Rozsah: pouze `/jb-drill/` (`jb-drill/index.html`, `docs.css`, `assets/jb-drill-hero/shot-01-poster.webp`). Komponenta přehrávače a videa samotná se nemění.

### 2026-09-20 — Korekce rohů a hoveru video karet

- Rozhodnutí: horní rohy karty se vracejí k původnímu zaoblení. Při hoveru/focusu používá hlavička přesně stejný světlý podklad jako tělo karty (`--paper-bright`); oranžový horní proužek a obrys zůstávají.
- Důvod potvrzený uživatelem: požadavek na ostré horní rohy byl omyl a předchozí hover odstín hlavičky neodpovídal barvě karty.
- Rozsah: pouze video karty Overview na `/jb-drill/` (`docs.css`).

### 2026-09-20 — Jedna osa pro Overview, obchodní blok a obsah

- Rozhodnutí: karta s odkazy na obchody má stejnou vnější šířku a vodorovnou pozici jako sloupec textu Overview. Slovo Overview v připnutém přepínači začíná na stejné levé ose; číslo zůstává před ním na širších obrazovkách a na mobilu se skrývá. Pravý okraj prvků přepínače je rovněž zarovnán k obsahu, zatímco plochy záložek zůstávají přes celé poloviny obrazovky.
- Důvod potvrzený uživatelem: předchozí rozdílné šířky a začátky bloku i přepínače působily rozházeně a vizuálně rušně.
- Rozsah: pouze produktová stránka `/jb-drill/` (`docs.css`); ostatní stránky a chování přepínání se nemění.

### 2026-09-20 — Úvodní sdělení Overview pro trenéry

- Rozhodnutí: první podsekce Overview ponechává oranžový štítek „THE IDEA“, ale hlavní nadpis mění na „Built for coaches who create.“ a pod ním používá obecnější text o přirozené tvorbě, automatizaci rutiny a sdílení před tréninkem. Název JB_Play se v úvodu ještě neobjevuje; bude vysvětlen až později. Jde o pracovní copy k vizuálnímu posouzení, ne o definitivní schválení celého Overview.
- Důvod potvrzený uživatelem: úvod má být poutavý a srozumitelný i člověku, který dosud nezná jednotlivé produkty; zachovat chce štítek „THE IDEA“, zatímco heslo „Think about hockey, not software“ si prozatím ponechává jako hodnotný princip pro další práci.
- Rozsah: pouze první podsekce `/jb-drill/` (`jb-drill/index.html`); styly a ostatní podsekce se nemění.

### 2026-09-20 — Textový úvod bez videokarty

- Rozhodnutí: z první podsekce „THE IDEA“ je odebrána video karta, která má patřit až do pozdějších obsahových podsekcí. Text úvodu zatím zůstává pracovní; uživatel vybírá silnější nadpis a druhý oddělený odstavec o rychlosti kreslení před další úpravou copy.
- Důvod potvrzený uživatelem: první blok má nejdřív poutavě uvést smysl produktu, ne hned ukázat video. Předchozí nadpis „Built for coaches who create“ podle něj sám o sobě není dostatečně nosný a rychlost tvorby je podceněná.
- Rozsah: pouze první podsekce `/jb-drill/` (`jb-drill/index.html`); pozdější video karty a přehrávač zůstávají.

### 2026-09-20 — Úvod, který drží tempo s trenérem

- Rozhodnutí: v „THE IDEA“ se pracovní nadpis mění na „A tool that keeps up with you.“ První odstavec zachovává motiv trenéra tvořícího vlastní cvičení, přirozeného kreslení a méně vysvětlování u tabule. Druhý, odsazený odstavec uzavírá rychlost přes kontrast papírové skici a hotového drillu: „Paper is fast for a sketch. JB_Drill stays fast all the way to a finished drill.“ Celý textový úvod odděluje od následující podsekce tenká linka v tokenu `--line` s prostorem po obou stranách.
- Důvod potvrzený uživatelem: úvod má být nosnější a výslovně ukázat, že JBD nezpomaluje nápady a zůstává rychlé i při dokončování drillu. Samotné „Built for coaches who create“ patří spíše do vysvětlujícího textu než do hlavního titulku.
- Rozsah: pouze první podsekce `/jb-drill/` (`jb-drill/index.html`, `docs.css`); další karty, sdílený dokumentační styl a přepínač zůstávají beze změny.

### 2026-09-20 — „Finally, software that helps“ bez přímého oslovení

- Rozhodnutí: uživatel vybral pro „THE IDEA“ nadpis „Finally, software that helps.“ jako stručné vyjádření hlavního důvodu vzniku JB_Drill. První odstavec je převeden důsledně do třetí osoby: cílí na trenéry tvořící vlastní cvičení, popisuje přirozené kreslení, automatizaci opakované práce a sdílení před tréninkem. Oddělený odstavec o rychlosti od skici k hotovému drillu i tenká dělicí linka zůstávají.
- Důvod potvrzený uživatelem: nemá rád přímé oslovení čtenáře, ale chce, aby nadpis sebevědomě vystihl skutečný přínos nástroje, který při přípravě pomáhá místo zpomalování. „Finally“ vyjadřuje úlevu po zkušenosti s těžkopádnými editory.
- Rozsah: pouze první podsekce `/jb-drill/` (`jb-drill/index.html`); bez změny stylů a ostatních sekcí.

### 2026-09-20 — Hlavní čtveřice v Overview, detaily ve Features

- Rozhodnutí: čtyři textové karty Smart drawing, Animate, Tactics a JB_Play se přesouvají z Features do Overview hned za „THE IDEA“. Uvádí je „WHAT'S IN THE BOX“ a pracovní nadpis „From first sketch to shared play.“; pod kartami je stejná jemná dělicí linka jako za úvodem. Features zatím obsahuje pouze krátký úvod pro budoucí drobnější funkce a QOL ukázky. Jeho obsahová osa se shoduje s Overview, aby přepnutí nepůsobilo jako posun stránky.
- Důvod potvrzený uživatelem: Overview má rychle představit čtyři zásadní oblasti produktu. Features nemá stejnou čtveřici opakovat v kartách, ale později podrobněji ukázat menší praktické funkce a části těchto velkých oblastí.
- Rozsah: `/jb-drill/` (`jb-drill/index.html`, `docs.css`); finální texty a obsah Features se budou dál navrhovat.

### 2026-09-20 — Rozšíření hlavních schopností o Paint, Library a export

- Rozhodnutí: Overview nyní krátce ukazuje sedm oblastí v pořadí Smart drawing, Paint, Animate, Tactics, Library, PDF & MP4 a JB_Play. Paint je skutečný název módu v aplikaci; karta jeho přínos vysvětluje jako rychlé volné poznámky na ledě při zápase nebo při rozmyšlení prostorového cvičení, aniž by „Sketch“ vydávala za název módu. Library zdůrazňuje uchování vlastního trenérského know-how a sestavení session ze zachovaných drillů. PDF a MP4 zmiňují klubovou identitu. Poslední karta JB_Play přes celou šířku uzavírá cestu od kreslení ke sdílení; na mobilu se všechny karty řadí pod sebe.
- Důvod potvrzený uživatelem: tyto tři přínosy mají být viditelné už v Overview, protože jsou samy o sobě důležitou součástí produktu. Features se nadále soustředí na dílčí a QOL funkce.
- Rozsah: `/jb-drill/` (`jb-drill/index.html`, `docs.css`); bez změny funkcí webu nebo aplikace.

### 2026-09-20 — Pořadí hlavních schopností podle důležitosti

- Rozhodnutí: sedm karet v Overview jde nyní v pořadí Smart drawing, Animate, Tactics, Library, JB_Play, Paint, PDF & MP4. JB_Play zůstává přes celou šířku, ale je páté, nikoli poslední; Paint a export tvoří závěrečnou dvojici. Číslování i slovní štítky sledují nové pořadí.
- Důvod potvrzený uživatelem: core schopnosti mají být seřazeny podle významu pro produkt, nikoli podle posloupnosti použití nebo přesné shody všech marketingových titulků s názvy funkcí v aplikaci.
- Rozsah: pouze pořadí a popisky karet v `/jb-drill/` (`jb-drill/index.html`); vzhled komponenty zůstává stejný.

### 2026-09-20 — JB_Play před Library bez změny rozvržení

- Rozhodnutí: ve stávající sedmikartové mřížce se prohodil pouze obsah pozic 04 a 05. JB_Play je nyní čtvrté a Library pátá, celá šířka stále patří páté kartě. Ostatní karty i rozvržení zůstaly stejné.
- Důvod potvrzený uživatelem: Animate a Tactics jsou stejně důležité cesty k hotové ukázce, po nich následuje sdílení přes JB_Play. Library patří v pořadí až za ně; uživatel nechce kvůli tomu zavádět tři karty vedle sebe ani jiné seskupení.
- Rozsah: `/jb-drill/` (`jb-drill/index.html`, `STYLE_GUIDE.md`); žádná změna CSS.

### 2026-09-20 — Platformy v úvodu a výraznější jméno v Hero

- Rozhodnutí: závěr „THE IDEA“ před dosavadní finální větou krátce jmenuje dotykové ovládání na Android tabletech, editaci myší a klávesnicí na Windows PC a společný formát drillů. V Hero produktové stránky je JB_Drill v původním kontextovém štítku zvětšený a světlejší; „Product Overview“ zůstává menší oranžové upřesnění. Hlavní slogan a Hero Help se nemění.
- Důvod potvrzený uživatelem: dvě odlišná pohodlná prostředí práce jsou důležitou výhodou, která má být jasná už v úvodu. Název produktu byl naopak v Hero příliš malý a v konkurenci sloganu se ztrácel.
- Rozsah: produktová stránka `/jb-drill/` (`jb-drill/index.html`, `docs.css`); bez změny ostatních stránek a bez tvrzení o automatické synchronizaci či licencování.

### 2026-09-20 — Platformová věta skutečně až na konci úvodu

- Rozhodnutí: věta o tabletu a PC následuje v „THE IDEA“ až po větě „Paper is fast for a sketch…“. Je oddělená malým odstupem, celá kurzivou a její písmo je o 2 px větší než běžný text této sekce (18 místo 16 px).
- Důvod potvrzený uživatelem: informace o platformách má být skutečným posledním sdělením úvodu a mírně vystoupit z okolního textu; předchozí vložení před větu o papírové skice neodpovídalo zamýšlenému pořadí.
- Rozsah: pouze úvod Overview na `/jb-drill/` (`jb-drill/index.html`, `docs.css`); Hero a ostatní texty se nemění.

### 2026-09-20 — Samostatný Download a typografické názvy pohledů

- Rozhodnutí: provizorní obchodní karta z Overview mizí. Na jejím místě a v panelu Features stojí příslušný název „JB_Drill Overview“ / „JB_Drill Features“ s tenkým názvem produktu a tučným označením pohledu, ve stejné velikosti a fontu jako dosavadní „User Guide“ v dokumentaci. Download má samostatnou cestu `/jb-drill/download/`, na kterou vede primární tlačítko společného Hero; nepřidává se jako třetí záložka ani jako další odkaz do patičky produktové stránky. Staré lokální `#download` přesměruje na novou cestu.
- Důvod potvrzený uživatelem: Overview a Features jsou dva pohledy na produkt, zatímco Download má pojmout i vysvětlení licencování a skutečnosti, že Personal/Pro stačí koupit jen na jedné platformě. Velký název nemá přebírat výšku původní obchodní karty; má navazovat na vyzkoušenou tenko-tučenou typografii příručky.
- Rozsah: `/jb-drill/` a `/jb-drill/download/` (`jb-drill/index.html`, `jb-drill/product-view.js`, `jb-drill/download/index.html`, `docs.css`). Download zatím ukazuje neaktivní místa pro obchody a pouze ověřené limity Free, Personal a Pro podle aktuálního produktového helpu; ceny ani funkční obchodní odkazy nejsou vymyšlené.

### 2026-09-20 — Kratší podtržítko jen v tenkých titulcích

- Rozhodnutí: v titulcích „JB_Drill Overview“, „JB_Drill Features“ a „JB_Drill Download“ je znak `_` oddělený do vlastního inline prvku. Je vodorovně zmenšený na třetinu a má tomu odpovídající šířku v rozvržení, takže zbytek názvu nezůstává nepřirozeně odsunutý. Vertikální tloušťka znaku a textový obsah titulku zůstávají; běžné výskyty názvu JB_Drill se nemění.
- Důvod potvrzený uživatelem: tenký řez display fontu má příliš dlouhé podtržítko a ruší vyvážení nadpisů. Jde o lokální typografickou korekci, ne o změnu fontu nebo názvu produktu.
- Rozsah: tři velké titulky na `/jb-drill/` a `/jb-drill/download/` (`jb-drill/index.html`, `jb-drill/download/index.html`, `docs.css`).

### 2026-09-20 — Kompaktnější karty hlavních funkcí

- Rozhodnutí: u sedmi karet v Overview jsou výrazně menší horní a dolní odsazení, odstupy mezi štítkem, nadpisem a popisem i řádkování popisu; zmenšila se také mezera mezi kartami a odstup mřížky od nadpisu. Po prvním zkrácení uživatel požádal o ještě úspornější variantu, proto mají karty nyní svislé odsazení 10 px a mezery v mřížce 8 px. Velikost nadpisů, dvousloupcové rozvržení a pořadí karet zůstávají.
- Důvod potvrzený uživatelem: tento blok má být jen rychlý přehled hlavních schopností a dosavadní výška zabírala téměř celou stránku; první kompaktnější varianta byla lepší, ale stále ještě zbytečně vysoká.
- Rozsah: pouze karty hlavních funkcí v Overview na `/jb-drill/` (`docs.css`); ostatní karty a obsah webu se nemění.

### 2026-09-20 — Nejsilnější ukázka první v produktovém Hero

- Rozhodnutí: v Hero carouselu se prohazuje první a třetí klip. FastDrillDrawing se načítá jako první, EasyCurveEdit se přesouvá na třetí pozici; přístupné názvy a viditelný popisek sledují nové pořadí. Video soubory ani samostatné video karty v Overview se nemění.
- Důvod potvrzený uživatelem: nejlepší ukázka má být vidět hned při načtení stránky.
- Rozsah: pouze Hero carousel na `/jb-drill/` (`jb-drill/index.html`).

### 2026-09-25 — Finální Hero Art jako úvod carouselu

- Rozhodnutí: první položkou produktového Hero carouselu je finální fotografický JB_Drill Hero Art bez vloženého textového loga. Statický obraz je připravený jako desetisekundový klip ve stejném poměru 2:1, rozlišení 1280 × 640 a dvojici formátů AV1 WebM / H.264 MP4 jako ostatní položky, takže používá stejné přechody, progress bar a fallback. Dosavadních pět ukázek následuje v nezměněném pořadí a délce. Textové jméno JB_Drill v kontextovém štítku Hero současně nahrazuje originální bílé SVG wordmark logo dodané uživatelem; „Product Overview“ zůstává samostatný oranžový kontext.
- Důvod potvrzený uživatelem: nový Hero Art má být první obraz, který návštěvník po načtení produktové stránky uvidí; deset sekund mu dává klidný prostor bez zbytečně dlouhého zastavení carouselu. Použití bezejmenné fotografie a originálního SVG v kontextovém štítku zabraňuje souběhu dvou log a zachovává skutečný tvar značky místo fontové aproximace.
- Rozsah: pouze Hero carousel a kontextový štítek na `/jb-drill/` (`jb-drill/index.html`, `docs.css`, `assets/JB_Drill_Logo_white.svg`, `assets/jb-drill-hero/shot-00.webm`, `assets/jb-drill-hero/shot-00.mp4`).

### 2026-09-16 — Záměr interaktivního atomu v hlavním hero

Stav: původní záměr, následně implementovaný a upřesněný v dalších záznamech této části. Aktuální produkční rozhodnutí popisuje záznam „Integrace procedurálního atomu do homepage“.

- Rozsah: pravá vizuální část hero na úvodní stránce (`index.html`), nikoli produktový hero JB_Drill.
- Reference: `F:\_3dprinter\_JB_Drill\sources\Hero_Atom_concept.png` v nadřazeném workspace. Horní dvojice ukazuje plošší variantu, spodní prostorovou; levé návrhy mají světle modrý tint, pravé oranžový. Uživatel zatím preferuje spodní prostorovou variantu; jde o předběžnou preferenci.
- Atom i prvky pozadí mají vznikat procedurálně v reálném čase, bez předrenderovaného obrázku. Důvod uživatele: jednotlivé prvky musí mít vlastní pohyb a reagovat na návštěvníka.
- Světelné body i textové karty (např. IDEA → TOOL a PRACTICE → TOOL) mají obíhat po drahách, každý prvek s vlastní úhlovou rychlostí.
- Přejetí kurzorem skrz atom má prvky zrychlit; poté se mají plynule vrátit k původní rychlosti.
- Požadovaný pokročilý efekt: velmi pomalá, plynulá změna barevného tintu společná obíhajícím prvkům a světlu v jemné mlhovině na pozadí. Přesná paleta ani délka cyklu zatím nebyly potvrzené.
- Reakce na náklon mobilního zařízení je námět na později; aktuálně se posuzuje pouze proveditelnost.

### 2026-09-16 — Dvě vrstvy atomu a laditelný prototyp

Potvrzeno uživatelem: prostorová varianta, samostatný funkční prototyp a navržené procedurální řešení. Nové zadání zpřesňuje původní záznam výše:

- Vnitřní dráhy a elementy mají být výraznější, vnější tvoří jemnější prostorový obal. Každá vrstva má vlastní počty, geometrii, rychlosti a světelné parametry. Důvod: zachovat hierarchii patrnou v obrazovém konceptu.
- Pozadí obsahuje jemný bodový grid a procedurální mlhovinu osvětlenou zprava.
- Vizuální parametry a náhodné odchylky se soustředí do pojmenované konfigurace. Důvod uživatele: snadné další ladění vizuálu. Pevný seed umožňuje opakovat stejnou geometrii.
- Karty zůstávají natočené k návštěvníkovi. Uživatel navrhl, že mohou vznikat v jádru místo obíhání. Prototyp zkouší vznik u jádra, pomalý odlet do tří směrů, setrvání a rozplynutí. Tento konkrétní životní cyklus je návrh k vizuálnímu posouzení, nikoli finálně schválené chování.
- Náklon mobilu je výslovně odložený jako případné pozdější rozšíření.

Implementace studie: `experiments/hero-atom/`, vstupní nastavení v `config.js`, popis parametrů a spuštění v tamním `README.md`. Samostatná stránka používá lokální Three.js 0.180.0, bez buildu a bez obrázkových textur scény. Textové billboardy jsou HTML promítané z prostorových pozic. Panel ladění patří pouze do studie. Tento odstavec zachycuje stav před pozdější produkční integrací; aktuální homepage už sdílený renderer používá.

Ověření prototypu: desktop 1440 px a mobilní viewport 390 px; ovládání parametrů, opakovatelnost seedu, export/import JSON včetně odmítnutí chybných hodnot, akcelerace a útlum, pauza, `prefers-reduced-motion`, zastavení mimo viewport, obnova WebGL kontextu a náhradní stav bez WebGL. Výkon na fyzickém telefonu zatím není ověřený.

### 2026-09-16 — Varianty mlhoviny a karty vyvolané interakcí

Nové potvrzené zadání uživatele pro editor prototypu:

- Umožnit porovnat více matematických šumů mlhoviny. Editor nyní nabízí původní value fBm, gradientní Perlinův typ, jeho varianty Ridged a Billow a buněčný Worley. Produkční web má později obsahovat jen vybranou variantu; samotný výběr zatím nepadl.
- Rozšířit nedostačující rozsahy: intenzita trailů 0–12 (původně 0–1), síla impulzu 0–40 (původně 0–4), maximální přídavná rychlost 1–100× základní rychlosti (původně 1–10×). Traily přidávají světlo aditivně, takže zvýšení nad 1 se skutečně projeví v renderu. Výchozí intenzita vnitřních stop byla zvýšena na 1,6; jejich šířku lze ladit zvlášť.
- Karty už nemají vznikat samovolně. Silná interakce s obíhajícími elementy nabije jádro; následuje záblesk a emise náhodného celého slovního spojení. Důvod uživatele: karta má být výsledkem toho, že návštěvník soustavu výrazně rozhýbe.
- Práh energie, útlum nabití, rozestup mezi emisemi, maximum živých karet, síla/délka záblesku a odchylka směru jsou součástí konfigurace. Bez nového impulzu další karta nevznikne; dosavadní automatická smyčka byla nahrazena jednorázovou životností karty.

Slovní zásobník šesti spojení a konkrétní číselné hodnoty jsou pracovní návrh k dalšímu ladění. Změny zůstávají v `experiments/hero-atom/`. Import starších JSON nastavení verze 1 doplní nová pole; export používá verzi 2. Ověřeny byly vykreslené rozdíly šumů, vyšší intenzity, emise/útlum/pauza, záblesk, životnost a mobilní rozvržení.

### 2026-09-16 — Měkký rozpínající se výbuch jádra

Uživatel odmítl tvrdý falloff původního záblesku a požaduje intenzivní střed, exponenciální pokles světla a výbuch, který se při slábnutí dál zvětšuje. Dosah má být nastavitelný a může přesáhnout vnější dráhy, například na dvojnásobek.

Prototyp proto odděluje trvalé jádro od světelného výbuchu. Výbuch má samostatný analytický shader přes canvas bez kruhové hranice a bez velikostního limitu bodového shaderu. Exponenciálně klesá s časem i vzdáleností; radius se současně plynule přibližuje cíli. Nová emise neresetuje starší výbuch.

Parametry jsou v `config.js` ve skupině `burst` a v editoru pod „Výbuch jádra“: intenzita, počáteční/cílový radius, doba rozpínání, časový útlum a prostorový falloff. Výchozí cílový radius 2× vnější obal, rozsah do 4×; konkrétní výchozí čísla zůstávají návrhem pro ladění. Tlačítko „Vyzkoušet výbuch“ slouží jen editoru a vytvoří světlo bez karty. Export má verzi 3, starší nastavení verzí 1 a 2 lze načíst.

Ověřeno: radius roste přes vnější obal při současném poklesu intenzity, dva výbuchy se nezávisle překrývají, pauza zastaví i světlo a změna falloffu se projeví v renderu. Vizuálně zkontrolované rané, střední a pozdní fáze i mobilní rozvržení.

### 2026-09-16 — Vnitřní obal probouzí jádro, nezávislé barvy a přímé otáčení

Potvrzené zadání uživatele pro prototyp:

- Výbuch a karta mají vznikat pouze reakcí vnitřního obalu. Vnější elementy lze kurzorem zrychlovat, ale jádro neprobudí. Energie i její normalizace proto počítají jen pohybující se vnitřní elementy. Rozsah prahu energie je rozšířen z 0,1–15 na 0,1–100; horní hodnota je implementační volba pro další ladění.
- Uživatel potřebuje ladit barvy částic bez nežádoucího posunu odstínu mlhoviny. Uvedený důvod: aditivně míchané elementy působí méně sytě, takže společná paleta neumožňuje naladit obojí. Navržené řešení v editoru kombinuje nezávislou paletu mlhoviny (s volitelným sdílením), vlastní sytost mlhoviny a sytost i bílou příměs u obou obalů. Čas pomalého barevného cyklu je společný. Konkrétní barvy a nové hodnoty nejsou finálně vybrané; výchozí vzhled zůstává zachovaný.
- Slidery náklonu celé soustavy nahrazuje Easter egg: kliknutí a tažení za jádro otáčí oběma obaly. Tah funguje i v pauze a nepředává energii částicím. Natočení se ukládá do JSON, pozadí a čitelné billboardy zůstávají ve své kompozici. Náklon jednotlivých drah zůstává konfigurovatelný. Dotykové scrollování se nemění; náklon telefonu je nadále odložený.

Implementace: `experiments/hero-atom/config.js`, `atom.js`, `shaders.js`, `editor.js` a tamní `README.md`. Export má verzi 4; import verzí 1–3 převádí staré náklony a zachová původní sdílenou paletu. Rozsah změn je stále samostatný editor prototypu.

Ověřeno: vnější obal reaguje bez emise, vnitřní spouští výbuch a kartu; oddělené palety, sdílení a nové světelné parametry mění vykreslené pixely; tah funguje v pauze, ukončí se mimo scénu i při ztrátě aktivního okna a uloží se do JSON. Regresní kontrola prošla včetně starších importů, mobilního rozvržení a dotykového scrollování. Vizuálně ověřen desktop 1440 px, nezávislá oranžová soustava s modrou mlhovinou a mobilní viewport 390 px včetně nových ovladačů.

### 2026-09-16 — Prodloužení stop a zesílení bodů při impulzu

Uživatel požaduje, aby se při impulzu prodlužovaly stopy a jemně rostla intenzita elementů na jejich začátku. Obě reakce mají mít samostatný násobič: 1 zachová dosavadní chování a 1,1 znamená 10 % navíc.

Implementace přidává pro každý obal `trailImpulseMultiplier` a `elementImpulseMultiplier` (rozsah 1–5, krok 0,01). Nastavený násobek se dosáhne při maximálním přidaném zrychlení částice; slabší impulzy se promítnou poměrně a oba efekty odezní spolu s rychlostí. Tato normalizace a výchozí hodnoty 2× pro délku a 1,15× pro světlo jsou implementační návrh pro další ladění. Jas se mění v bodovém shaderu, geometrická velikost bodu zůstává zachovaná. Vnější obal ani tyto nové efekty nenabíjejí jádro.

Rozsah: editor `experiments/hero-atom/`, zejména `config.js`, `atom.js`, `shaders.js`, `editor.js`. Export verze 5; import verzí 1–4 doplní násobiče 1 a zachová původní vzhled uložených nastavení. Podrobnosti výpočtu jsou v README prototypu.

Ověřeno: násobič 1 je neutrální i při plném impulzu; 1,1 prodlouží stopu 24° na 26,4° a zvýší světelnou intenzitu na 1,1×. Změny se projevují ve vykreslených pixelech, oba efekty s impulzem slábnou a obaly lze nastavit nezávisle. Prošla regresní kontrola včetně importů a mobilu; vizuálně zkontrolovány klidové/prodloužené stopy na desktopu a nové ovladače při šířce 390 px.

### 2026-09-16 — Objemové orbity a technické druhé dráhy

Potvrzené zadání uživatele:

- Ploché dráhy při určitých úhlech mizí. Mají dostat prostorovou tloušťku; změna se týká drah, nikoli geometrie trailů nebo elementů. Hlavní orbity obou obalů jsou proto skutečné tenké tory s kulatým průřezem.
- Každá vnitřní dráha má mít druhou soustřednou kružnici s kladným či záporným posunem poloměru. Důvod uživatele: techničtější vzhled. Druhá dráha má vlastní styl čáry, intenzitu a tloušťku, ale stejnou barvu jako rodič.

Implementační návrh pro editor: skupina `innerCompanion` nabízí plnou, čárkovanou, tečkovanou, čerchovanou a dvojitě čerchovanou čáru, počet opakování vzoru a odstup −40 až +40 % rodičovského poloměru. Relativní odstup zajišťuje platnou soustřednou kružnici i u nejmenších náhodných orbit. Výchozí čerchovaná varianta je jemnější a o 5 % vně rodiče; konkrétní nastavení je k dalšímu ladění. Druhé dráhy nevytvářejí nové částice, traily ani zdroj energie.

Rozsah: `experiments/hero-atom/`, nový modul `orbit-geometry.js`, samostatný shader drah a ovládání v editoru. Všechny doplňkové kružnice se vykreslí jednou společnou dávkou. Export používá verzi 6; import verzí 1–5 ponechá doplňkové dráhy vypnuté, aby se do uložené kompozice nepřidaly automaticky. Objemový průřez hlavních drah se používá ve všech konfiguracích.

Ověřeno: dráha je vykreslená při natočení 89,9°, 90° i 90,1°; všech pět stylů má odlišné vykreslení a odstup, jas, tloušťka i hustota fungují samostatně. Úpravy druhých drah nemění pozice elementů ani reakci stop. Prošla regresní kontrola včetně importu verzí 1–5, rotace, impulzů, výbuchů a obnovy WebGL. Vizuálně zkontrolován desktop 1440 px, pohled přesně z boku, vzory a mobil 390 px včetně panelu.

### 2026-09-16 — Integrace procedurálního atomu do homepage

Uživatel schválil přesun konkrétního exportu `experiments/bybartonek-hero-atom-2645671074.json` z editoru do pravé části hlavního hero. Výslovně požaduje neměnit velikost hero; velikost samotné scény se může později ladit podle výsledku v nižším produkčním viewportu. Uživatel také upozornil na rozdílnou tmavou barvu editoru a hero a navrhl přechod nebo sjednocení pozadí.

Produkční implementace zachovává beze změny `.hero` grid a `min-height: min(780px, calc(100svh - 78px))`. Původní statické CSS kružnice, signály a tři stále viditelné karty nahradil canvas, promítané HTML karty a textový fallback. Výchozí měřítko presetu zůstává 1; toto je první produkční velikost k vizuálnímu posouzení, ne definitivně uzamčené číslo.

Po první kontrole uživatel odmítl sjednocení pozadí s `--ink`, protože ubralo scéně kontrast. Finální scéna proto používá kolem atomu původní tmavý základ editoru `#0b1011`. Pouze procedurální pozadí se velmi pozvolna vodorovně míchá do existujícího `--ink` na levé straně hero; mlhovina i grid se rozpouštějí společně se základem. Přechod probíhá přibližně mezi 8 a 68 % šířky. Maska se netýká drah, částic, jádra, výbuchu ani karet.

Canvas nyní překrývá celé hero. Produkční vstup používá střed původní pravé gridové buňky jako střed soustavy, ale její zužování už nesmí zmenšovat atom: desktopový virtuální rám má minimální šířku 684 px, která odpovídá pravé buňce při referenčním viewportu 1440 px. Při užším desktopu atom zůstává zarovnaný vpravo a ve stejné velikosti, i když se vpravo ořízne a jeho dráhy zasáhnou doleva pod text. Toto pravidlo platí pouze nad breakpointem 760 px. Mobilní virtuální rám zůstává beze změny jako původní spodní prostor vysoký 380 px, zatímco canvas pokračuje i za textem. Textový blok má vlastní pozicovanou vrstvu `z-index: 2`, scéna je ve vrstvě 1 a spodní barevný proužek ve vrstvě 3. Dráhy proto mohou zasahovat pod text a tlačítka, ale obsah hero zůstává vždy čitelný a ovladatelný.

Renderer, shadery, geometrie a lokální Three.js se sdílejí z `experiments/hero-atom/`; kořenový `hero-atom.js` je pouze produkční vstup, načtení/validace presetu, výpočet virtuálního rámu, předání barev pozadí, stav a fallback. Homepage nepřidává framework, build ani externí runtime požadavek. Při `prefers-reduced-motion` se scéna načte staticky; otáčení za jádro zůstává dostupné myší/perem. Na dotykovém zařízení renderer neblokuje vertikální scroll.

Ověřeno bez změny rozměrů hero: 1440×780 px při viewportu 1440×900, 1000×722 px při 1000×800 a přibližně 390×786 px na mobilu, kde výška stále odpovídá výšce textu plus původních 380 px pro vizuál. Canvas pokaždé kopíruje celé hero, atom zůstává vystředěný v původní pravé nebo spodní oblasti a stránka nemá horizontální přesah. Vizuálně zkontrolován široký desktop, 1000 px, 800 px, hrana desktopu 761 px, mobilní hrana 760 px a mobil 390 px. Automaticky se porovnává projekční rozměr částic mezi 1440 a 800 px s tolerancí 4 % a ověřuje se jejich zásah pod text. Dále se kontroluje pozice středu, vrstvení textu, preset 7/33 vnějších a 5/7 vnitřních drah/elementů, devět draw calls, lokální zdroje, emise a karta uvnitř scény, rotace jádra, nezměněné mobilní rozvržení, omezení pohybu a fallback bez WebGL.

Související soubory: `index.html`, `styles.css`, `hero-atom.js`, `experiments/bybartonek-hero-atom-2645671074.json`, sdílený renderer v `experiments/hero-atom/` a jeho README.

### 2026-09-16 — ShakyCam v editoru a produkci

Uživatel nejprve chtěl v editoru vyzkoušet nepravidelné jemné chvění kamery přes celou scénu. Při výbuchu se má kamera zatřást výrazněji a plynule se vrátit k jemnému klidovému pohybu. Po doladění byl 16. září 2026 uložený preset verze 9 výslovně schválen i pro produkční homepage.

Editor přidává skupinu `cameraShake`. Po první zkoušce uživatel požaduje větší rozdíl mezi oběma složkami: klid i výbuch proto mají dvě samostatné amplitudy A/B a dvě frekvence A/B. Klid používá dvě hladké noise vrstvy, nikoli krátkou sinusovou smyčku; vrstva B má posun vzorkovací souřadnice. Výbuch používá dvě skutečné sinusové složky, takže jeho vrstva B má periodický fázový posun ve stupních. Obě výbuchové vrstvy sdílejí krátký náběh a exponenciální doznění. Výchozí klidové amplitudy 0,48/0,22 px a výbuchové amplitudy 13/5 px jsou pracovní návrh pro ladění.

Posun je součást projekce kamery a stejné skutečné vychýlení dostává procedurální pozadí. Mlhovina, grid, orbity, elementy, jádro, světelný výbuch a HTML billboardy se proto pohybují společně; hit test jádra sleduje jeho obrazovou polohu. Pauza chvění zmrazí. Export používá verzi 9. Import verzí 1–6 doplní parametry s `enabled: false`, aby staré soubory nezměnily pohyb bez výslovného rozhodnutí. Import verzí 7 a 8 rozdělí původní společné hodnoty do A/B vrstev se stejným přibližným výsledkem.

Schválený produkční preset používá klidové vrstvy A/B `5,4 px @ 0,7` a `2,6 px @ 7,6`, posun B `−39,7`; výbuchové vrstvy `36 px @ 9,5 Hz` a `17 px @ 15,5 Hz`, fázi B `−51°` a doznění `0,4 s`. Tohle jsou záměrně výraznější hodnoty vybrané uživatelem v editoru, nikoli výchozí hodnoty nového presetu. Omezení pohybu scénu při načtení pozastaví stejně jako dříve.

Ověřeno automaticky: vypnutý efekt má nulový posun, zapnutý mění celý canvas, klidové vzorky se plynule a nepravidelně mění, výbuch zvýší amplitudu a jeho obálka odezní zpět ke klidové úrovni. Produkční regrese navíc kontroluje preset verze 9 se zapnutým ShakyCam, interakci s jádrem na jeho právě posunuté obrazové pozici, omezení pohybu a mobilní layout.

### 2026-09-16 — Dotyk a výkon Hero atomu

Na telefonu se scéna chovala plynule, ale na výkonnějším Idea Tab Pro klesala pod přibližně 30 FPS. Důvodem není počet elementů: tablet má 3K/144Hz displej, dostává desktopový limit pixel ratio 2 a plnoobrazovkový Worley shader proto počítal šest cloud i warp oktáv přes několik milionů pixelů až 144krát za sekundu. Uživatel upřednostňuje plné interní rozlišení a souhlasí se změnou konkrétního tvaru mlhoviny i adaptivním snížením její výpočetní složitosti.

Renderer používá `high-performance`, nejvýše 60 renderovaných FPS a aritmetický hash bez drahých trigonometrických operací. Po dvousekundovém zahřátí měří FPS ve dvousekundových oknech. Pod 50 FPS přechází během jedné návštěvy pouze směrem `full → balanced → reduced`; pixel ratio zůstává beze změny. Stupně používají 6/6, 4/3 a 2/1 cloud/warp oktáv pro schválený šestivrstvý preset. Až `reduced` mění orbity z 192×8 na 128×6 a minimální trail z 28 na 20 segmentů. Editor ukazuje FPS a stupeň, aby šel výsledek posoudit na fyzickém tabletu.

Na dotyku funguje swipe i tap. Swipe používá stejnou dráhovou fyziku jako kurzor; tap pouze vloží bodový impulz a neobchází podmínku energie vnitřního obalu. Převážně svislý tah mimo jádro scrolluje. Jádro sleduje 56px neviditelný hit target s vlastním `touch-action: none`: tap zůstává impulzem, pohyb nad 8 px otáčí soustavou. Zbytek scény zachovává `pan-y pinch-zoom`, další prsty se ignorují a náklon zařízení zůstává mimo rozsah.

Preset a jeho export zůstávají ve verzi 9, protože gesta i výkonové stupně jsou runtime pravidla. Diagnostika `snapshot()` nově uvádí FPS, stupeň, efektivní oktávy, segmentaci a pixel ratio. Automatická regrese ověřuje všechny tři stupně, mobilní DPR, limit 60 FPS, tap, swipe, scroll, druhý prst, rotaci a hit target při ShakyCamu. Reálným akceptačním bodem je ustálených alespoň 50 FPS na Idea Tab Pro; pokud je ani `reduced` nedosáhne, rozlišení se bez nového výslovného rozhodnutí nesnižuje.

### 2026-09-21 — Pracovní studie stránky JB_Drill Features

Uživatel požaduje nejprve porovnat několik způsobů, jak na samostatné stránce Features prezentovat menší unikátní funkce a workflow detaily. Nejde zatím o finální strukturu ani schválený výběr funkcí. Přepínač tří konceptů je proto pouze dočasný pracovní nástroj přímo ve stránce:

- **Feature Stories** seskupují několik souvisejících detailů do tří velkých, video-led bloků. Varianta testuje klidnější stránku s menším počtem zapamatovatelných sdělení.
- **Feature Catalog** používá jedno úvodní video a hustší síť dvanácti kompaktních karet. Varianta testuje rychlou skenovatelnost a možnost ukázat šíři nástrojů.
- **Friction Removed** staví vždy vedle sebe známou repetitivní práci a způsob, jakým ji JB_Drill odstraňuje. Varianta testuje komunikaci přínosu před názvem mechanismu.

Seznam záměrně nerozmělňuje velké Core Features z Overview. Po upřesnění uživatelem staví hlavně na konkrétních hokejových automatikách: Bank Pass, Rim Pass, automatický Saucer Pass a skok přes hokejku, sebrání puku z ledu nebo hromádky, Finesse a její automatické vložení, Toe Drag Release s automatickým zamířením, generovaný Punch Turn, techniky měnící existující jízdu, board alignment, automatické fronty a symetrie. Samostatnou skupinu tvoří Drill Notes, exportní identita a kompletní PDF s nákresem, poznámkami, seznamem vybavení a klubovým logem. Původně navržené obecnější QOL funkce zůstávají použitelné jako doplňkový obsah, ale nemají vytlačit tyto charakteristické schopnosti. Použité klipy a postery z existujícího hero jsou pouze vizuální placeholdery pro posouzení formátu; před publikací musí být nahrazené demonstracemi odpovídajícími konkrétním textům.

Studie znovu používá současné tokeny, video kartu a modal bez nové barvy, fontu nebo externí závislosti. Ovládání variant funguje jako přístupný tablist i z klávesnice a responzivně přechází z dvou nebo tří sloupců na jeden. Finální stránka má po rozhodnutí uživatele obsahovat jen jeden vybraný formát; přepínač a ostatní varianty se odstraní.

### 2026-09-29 — Čitelnost podpůrných textů na stránkách JB_Drill

Marketingové stránky Overview, Features a Download rozlišují dvě jasné textové role. Šedý doprovodný text mimo karty používá `--font-reading` (Verdana) ve velikosti 13 px a s řádkováním 1.55. Popisy uvnitř všech karet používají jednotně `--font-ui` (Smooch Sans) v 15 px a s řádkováním 1.28. Na světlém pozadí obě role používají čitelnější odstín `#556472`. Obsah kompaktních Features karet se ve fixní výšce centruje jako celek, aby jednořádkový i dvouřádkový popis působil opticky vyváženě.

Důvod: po kontrole stránky při skutečném 100% zoomu uživatel zvolil pro Verdanu zkušebně 13 px. Verdana se nemá používat uvnitř karet; doprovodné odstavce mají zůstat klidné a kompaktní, zatímco karty musí mít jednotný Smooch Sans. Rozsah rozhodnutí: `docs.css`, produktové stránky JB_Drill Overview, Features a Download včetně jejich karet.

Download používá kolem všech dělicích linek výrazný symetrický svislý prostor: 32 px v běžném desktopovém i mobilním rozvržení a 40 px na desktopu od výšky 1100 px. Čitelné oddělení sekcí má přednost před dřívějším požadavkem vměstnat každou desktopovou výšku bez scrollování.

### 2026-09-29 — Veřejný Windows download

Windows karta na Download stránce je po publikaci aplikace aktivní odkaz na veřejný Microsoft Store listing `9NFF5QHLBM3B`; celá karta je klikací a stav popisuje jako dostupný. Dělicí linky mají kolem sebe velký a symetrický svislý prostor, aby jednotlivé bloky nepůsobily stlačeně.

### 2026-10-01 — Veřejný Android download

Po produkčním vydání JB_Drill na Google Play je také Android karta na Download stránce aktivní odkaz na veřejný listing balíčku `cz.jbdrill.app`. Obě platformy používají stejnou klikací komponentu a stav „Available now“, protože uživatel si má vybrat obchod podle zařízení v ruce; dřívější neaktivní stav „Coming soon“ se už nepoužívá.

### 2026-09-29 — Navigační karty a střídavý Overview příběh

Sedm kompaktních karet v úvodním přehledu funguje jako navigace na konkrétní podsekce s videem. Samotné podsekce přebírají klidnější princip původní varianty Feature Stories: společný nadpis a pod ním vedle sebe vysvětlující text a video karta, jejichž strany se po sekcích střídají. Na mobilu zůstává stabilní pořadí text před videem. Uživatel zvolil tento rytmus, aby Overview nebylo jen dlouhou svislou řadou textu a samostatných karet, ale návštěvníka vedlo od rychlého přehledu přímo k jednotlivým ukázkám.

### 2026-09-29 — JB_Play v produktové navigaci

Hlavičky stránek JB_Drill obsahují přímý odkaz `JB_Play` na `https://play.bybartonek.com/`. JB_Play není pouze cíl sdílených odkazů, ale samostatně použitelný online přehrávač pro otevírání vyexportovaných souborů, proto má být dostupný přímo z produktového webu. Odkaz používá existující styl `.site-nav`; nepřidává novou variantu navigace. Na úzkých displejích zůstává zachováno současné pravidlo, které ukazuje jen aktivní položku dané stránky.

### 2026-09-29 — Odstranění samostatného webového Help

Veřejná stránka `/jb-drill/help/` a všechny odkazy na ni jsou odstraněné. Detailní a aktuální nápovědu poskytuje přímo aplikace JB_Drill; stará webová kopie by obsah duplikovala a zabírala místo bez jasného účelu. Support zůstává samostatnou kontaktní stránkou bez karty Documentation a bez odkazu Help. Toto rozhodnutí nahrazuje starší zmínky o dostupnosti Help v produktové patičce; vestavěné nápovědy v aplikaci se netýká.

### 2026-09-29 — Hotová videa pro Features Chapter 01

Všechny čtyři karty kapitoly `Rink intelligence` používají vlastní krátkou demonstraci: Bank Pass, Rim Pass, Board alignment a Puck pickup. Karty přebírají existující chování mediální karty — na desktopu se při hoveru nebo focusu rozšíří o náhled, kliknutí či aktivace klávesnicí otevře společný video modal a po dohrání se modal zavře. Rozšířená karta zabírá pouze původní kartu plus pevnou šířku náhledu, ne celý sousední slot; část sousední karty tak zůstává viditelná a přímo dosažitelná kurzorem. Na mobilu skrytý náhled nesmí rezervovat žádnou výšku; zobrazí se až při hoveru nebo focusu. Kapitoly bez hotových videí zůstávají statické a nesmí dostat nesouvisející placeholder pouze kvůli jednotnému vzhledu.

Pokud uživatel neurčí jinak, poster pro nové Features video se vytváří z posledního použitelného snímku videa. Před exportem je třeba ověřit, že konec není černý nebo přechodový snímek. Náhledová plocha má poměr 16:9 a zachovává dnešní vertikální rozměr; celý poster se do ní vejde pomocí `object-fit: contain`, takže se obsah snímku neořezává.

Kapitola `Action intelligence` používá stejný vzor pro Automatic Saucer Pass, Automatic stick jump, Automatic Finesse a Generated Punch Turn. Po zmenšení rozbalené karty už pomalý lineární pohyb není potřeba: geometrie karty se mění za 210 ms s výraznou ease-out křivkou `cubic-bezier(0.16, 1, 0.3, 1)` a náhled se prolíná za 140 ms. Zrychlení nesmí měnit ochrannou hover oblast ani způsobit návrat problikávání na hraně karty.

Kapitola `Techniques on the route` používá vlastní demonstrace pro Technique drag & drop, Pivot & Transition, Toe Drag Release a Finesse editing. Stejně jako předchozí kapitoly bere výchozí poster z posledního použitelného snímku a používá společný 16:9 náhled, rozbalení i video modal; nevytváří vlastní variantu karty.

### 2026-09-30 — Klidnější JB_Drill Hero bez vedlejšího sloganu

Z produktového Hero byl odstraněn oranžový řádek „Built on the ice, not around a menu“. Hero nadále obsahuje značku s kontextem Product Overview, hlavní slogan, stručný popis a akce. Důvod potvrzený uživatelem: stránka už používá dostatek krátkých marketingových sloganů a další věta pod logem začala vizuálně i významově přebývat. Změna se týká pouze `/jb-drill/`; obecná komponenta `eyebrow` zůstává dostupná tam, kde skutečně pomáhá orientaci.

### 2026-09-30 — Dokončení Features a mobilní fullscreen videa

Kapitoly `Direct editing` a `Repeat and present` používají vlastní videa a výchozí postery z posledního použitelného snímku stejně jako první tři kapitoly. Poslední karta `Deliver / Complete PDF handouts` byla odstraněna, protože stejný výsledek už ukazuje předchozí video `Brand / Export identity`. Po zapojení videí ve všech pěti kapitolách zmizela také dočasná poznámka o rozpracované stránce.

Společný přehrávač Overview a Features na mobilním viewportu nejprve otevře běžný náhled s tlačítkem `Play fullscreen`. Tlačítko druhým explicitním tapem požádá o browser fullscreen na samostatné mobilní video vrstvě a poté o uzamčení landscape orientace. Před žádostí se video a vlastní play/pause s časovou osou fyzicky přesunou z `<dialog>` do této černé vrstvy pod `<body>` a dialog se skutečně zavře metodou `close()`. Je to nutné kvůli ověřenému chování Android Chrome na OnePlus 7T Pro: video uvnitř otevřeného dialogu podle DOM běželo, ale hardwarový compositor vykresloval pouze černou plochu. Pouhé odebrání atributu `open` navíc ponechávalo neviditelnou dialogovou top layer, která po návratu blokovala tapy na přepínač Overview / Features. Samostatná vrstva obraz vykresluje správně, skryje zbytek stránky a po dohrání nebo opuštění fullscreenu se video s ovládáním vrátí do dialogu. Mobilní Chrome může ignorovat hint `navigationUI: hide` a ponechat své systémové lišty; web je nemůže vynutit, aniž by použil nativní video přehrávač s jeho vlastním ovládáním. Desktopový modal zůstává beze změny.

Mobilní hlavička používá jedno standardní hamburger tlačítko a rozbalovací panel se všemi odkazy. Původní řešení pouze skrývalo všechny odkazy kromě posledního nebo aktuálního, takže navigace byla na telefonu neúplná. Menu se zavře po výběru odkazu, tapnutí mimo hlavičku, klávese Escape nebo návratu na desktopovou šířku. Při fullscreenu videa se ostatní části stránky neskrývají pomocí `visibility: hidden`; samostatná neprůhledná vrstva je zakryje sama.

### 2026-10-01 — Desktopový koncept aktualit napříč produkty

Aktuality jsou společný obsahový systém značky, nikoli další záložka uvnitř přepínače Overview / Features. Homepage proto používá na spodním okraji Hero samostatný tmavý pás s nejvýše pěti nejnovějšími položkami napříč produkty; produktová stránka odkazuje na vlastní archiv `/jb-drill/updates/`. Každá položka má vlastní statickou URL `/updates/<slug>/`, aby šla přímo sdílet a měla vlastní title, description, canonical a Open Graph metadata.

Pás je součástí toku Hero, ale nesmí zvětšit jeho původní výšku. Hero proto zachovává původní limit 780 px / dostupnou výšku viewportu. Hlavní titulek používá v této variantě menší skutečnou sazbu a procedurální atom menší projekční rám; obsah se tedy nesmí pouze oříznout hranou pásu. Nadpis „What's new / Latest from byBartonek“ zůstává na stejné 7vw levé ose jako hlavní sdělení. Přímo pod ním je na stejné ose také navigátor carouselu. Stejnou osu používá i skutečný text první viditelné novinky: viewport carouselu proto začíná na `7vw − 18px`, protože samotná karta má 18px vnitřní odsazení. Vodorovná dělicí linka se nepoužívá. Feed, jeho navigátor i jednotlivé položky jsou plně průhledné a procedurální pozadí Hero proto pokračuje bez přerušení i pod carouselem. Samotné položky nemají obrys, radius ani vlastní kartový podklad. Thumbnail zabírá 56 % šířky karty, leží zprava pod textovou částí a jeho levá polovina se pomocí alfa masky plynule rozpouští do pozadí; jde o stejný princip vizuálního překryvu jako mezi Hero textem a atomem, nikoli o další sloupec nebo mezeru. Jednotlivé novinky odděluje jen 1px oranžová čára vysoká přesně jako obsah novinky, nikoli přes celý pás. Čára stojí uprostřed 36px mezery, takže má z obou stran 18px volného prostoru. Šedé shrnutí používá čitelnou 15px sazbu `--font-ui`, shodnou s textovou rolí kompaktních feature karet.

Jedna až tři položky vyplní dostupnou šířku v jednom řádku. Čtyři nebo pět položek ukazují tři novinky a posouvají se cyklicky vždy o jednu po pěti sekundách. Automatika se zastavuje při hoveru, focusu, ručním ovládání, skryté kartě prohlížeče a při `prefers-reduced-motion`; šipky, indikátory a klávesy vlevo/vpravo zůstávají dostupné ručně. Položka může být textová nebo mít obrazový náhled a celý její povrch je odkazem na detail.

Archiv používá dvousloupcový master-detail layout: vlevo je sticky seznam od nejnovější položky, vpravo plný článek. Přechod mezi položkami používá běžné statické odkazy, takže se URL a metadata skutečně mění, přesto stránka vizuálně zůstává ve stejném systému. Obsah vzniká v kolekci `_updates` jako Markdown a GitHub Pages jej generuje nativním Jekyllem; existující HTML stránky se kvůli tomu nepřepisují do frameworku a nepřidává se vlastní deployment workflow.

Desktopový vzhled byl uživatelem schválen 1. října 2026 na lokální větvi `codex/updates-desktop`. Pět položek zůstává výslovně fiktivním obsahem označeným jako náhled a před publikací větve se musí nahradit nebo odstranit. Mobilní podoba homepage pásu je zatím skrytá a mobilní layout archivu je pouze bezpečný jednosloupcový fallback; finální mobilní návrh vznikne samostatně.

Po schválení vzhledu přibyla kořenová konfigurace `.pages.yml`. Pages CMS upravuje přímo Markdown soubory v `_updates`, ukládá obrázky do `assets/updates/` a nabízí všechna pole používaná šablonou včetně galerie a CTA. Nová položka má `published: false`; koncept tedy existuje jako běžný Git commit, ale Jekyll ho nevystaví. Přepnutí `Published` a uložení vytvoří publikační commit a standardní GitHub Pages build bez vlastní databáze, účtového serveru nebo dalšího deployment workflow. Velká videa zůstávají mimo CMS.

Samostatný YouTube odkaz vložený do těla aktuality se na webu převádí na responzivní nativní YouTube player v poměru 16:9 a privacy-enhanced režimu `youtube-nocookie`. Video se přehrává přímo v článku a standardní ovládání i odkaz na YouTube zajišťuje samotný YouTube player; web kolem něj nevytváří vlastní thumbnail, play tlačítko ani další externí odkaz. Důvod potvrzený uživatelem: přehrávání má odpovídat přirozenému vloženému videu známému z Google Play a nemá návštěvníka odvést z článku hned prvním kliknutím. Bez JavaScriptu zůstává původní textový YouTube odkaz funkční.

## Text pro nové vlákno

Před úpravou bybartonek.com si přečti `bybartonek-site/AGENTS.md` a `bybartonek-site/STYLE_GUIDE.md` (v samotném repozitáři webu jsou to `AGENTS.md` a `STYLE_GUIDE.md`) a ověř aktuální `styles.css` / `docs.css`. Manuál popisuje současný kód; historické důvody považuj za neznámé, pokud nejsou zaznamenané v části „Rozhodnutí a jejich důvody“. Zachovej stávající tokeny a vzory; nepřidávej další font nebo barvu bez důvodu. Po změně ověř dotčené stránky na desktopu i mobilu a zapiš nové potvrzené důvody do manuálu. Pracuj pouze v samostatném repozitáři `bybartonek-site`.
