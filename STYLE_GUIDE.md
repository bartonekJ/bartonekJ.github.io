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
| `/jb-drill/help/` | Rozsáhlá uživatelská příručka | `jb-drill/help/index.html` + `docs.css` |
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

- `.docs-hero`: úvodní blok produktové stránky nebo příručky. Používej krátký `page-context`, `eyebrow`, titulek, stručný odstavec a CTA.
- `.docs-hero--jb-drill`: značkový vizuál JB_Drill. `.docs-hero--video` zapínej jen pro produktovou stránku s carousel videí; ovládání patří do `.jb-hero-slide-ui` a musí zůstat přístupné klávesnicí.
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

## Text pro nové vlákno

Před úpravou bybartonek.com si přečti `bybartonek-site/AGENTS.md` a `bybartonek-site/STYLE_GUIDE.md` (v samotném repozitáři webu jsou to `AGENTS.md` a `STYLE_GUIDE.md`) a ověř aktuální `styles.css` / `docs.css`. Manuál popisuje současný kód; historické důvody považuj za neznámé, pokud nejsou zaznamenané v části „Rozhodnutí a jejich důvody“. Zachovej stávající tokeny a vzory; nepřidávej další font nebo barvu bez důvodu. Po změně ověř dotčené stránky na desktopu i mobilu a zapiš nové potvrzené důvody do manuálu. Pracuj pouze v samostatném repozitáři `bybartonek-site`.
