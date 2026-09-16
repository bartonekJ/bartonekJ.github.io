# Hero atom — produkční vizuál a editor

Samostatný editor ladí procedurální vizuál, jehož atom je od 2026-09-16 použitý v pravé části hero na produkční homepage; produkční canvas a pozadí pokrývají celé hero.
Reference uživatele: `sources/Hero_Atom_concept.png` v nadřazeném workspace JB_Drill.
Potvrzený záměr a jeho důvody jsou v [STYLE_GUIDE.md](../../STYLE_GUIDE.md).

## Spuštění a ovládání

Z kořene repozitáře webu:

```sh
node experiments/hero-atom/serve.cjs
```

Otevři <http://127.0.0.1:4173/experiments/hero-atom/>. ES moduly vyžadují HTTP server, ne otevření souboru přes `file://`.

Produkční homepage je na <http://127.0.0.1:4173/> a načítá preset `experiments/bybartonek-hero-atom-2645671074.json`. Export z editoru se do produkce nepropíše automaticky; pro změnu produkčního nastavení nahraď tento soubor validním exportem stejné podporované verze nebo uprav cestu v kořenovém `hero-atom.js`.

Produkční canvas pokrývá celé hero. Funkce `layout` ponechává střed atomu ve středu původní pravé gridové buňky, ale pro měřítko desktopové kamery používá minimální referenční šířku 684 px. Pod 1440 px se proto atom spolu s pravým sloupcem nezmenšuje: zůstává zarovnaný vpravo a může zasahovat doleva pod text. Mobilní breakpoint do 760 px toto pravidlo nepoužívá a zachovává původní rám 380 px ve spodní části hero. Text je ve vyšší vrstvě než scéna.

Produkční základ kolem atomu je stejný jako v editoru (`#0b1011`). Background shader jej mezi přibližně 8 a 68 % šířky míchá do webového tokenu `--ink` na levém okraji. Maska ovlivňuje základ, mlhovinu a grid; prostorová geometrie ani HTML karty se nemaskují. Editor předává shodnou počáteční a okrajovou barvu, takže se v něm přechod neprojeví.

- **Ladit scénu** otevře panel vlevo, aby na desktopu zůstal atom vidět.
- **Pozastavit** zastaví obě vrstvy, karty, barevný cyklus i mlhovinu. Při zapnutém omezení pohybu se stránka načte pozastavená; pohyb lze výslovně spustit.
- **Export JSON / Načíst JSON** uloží a obnoví úplnou konfiguraci. Změny se automaticky neukládají do zdrojových souborů ani po obnovení stránky.
- Nové exporty mají verzi 6; import přijímá i verze 1–5. Doplní nové parametry, převede starší záblesk na samostatný výbuch a náklony X/Y/Z na prostorové natočení. U verzí 1–3 zůstává paleta sdílená. Starší verze 1–4 dostanou oba násobiče reakce stop/bodů nastavené na 1. Verze 1–5 mají po importu druhé dráhy vypnuté, aby nepřibyly automaticky; zapínají se v sekci **Vnitřní · druhé dráhy**. Hlavní orbity už vždy používají prostorový průřez.
- **Nový seed** vygeneruje jiné uspořádání. **Výchozí** obnoví hodnoty z `config.js`; čas scény pokračuje.
- Kurzor předává energii při pohybu v blízkosti prvků. Na dotykovém zařízení zůstává svislé scrollování; náklon se nečte.
- Karty a výbuch vznikají pouze při dostatečně silné reakci **vnitřních** elementů. Vnější obal reaguje na kurzor, ale jádro nenabíjí. V klidu se karty nezobrazují ani automaticky neopakují.
- **Easter egg:** uchop jádro levým tlačítkem a táhni. Otáčíš oběma obaly v prostoru, bez nabíjení jádra. Funguje i při pauze nebo vypnutém předávání energie; pohyb animace tím nespustíš. Myš může opustit scénu, puštění tlačítka nebo ztráta aktivního okna tah ukončí. Natočení se uloží v JSON. Gesto podporuje myš a pero, dotyk ponechává scrollování.
- **Výbuch jádra → Vyzkoušet výbuch** spustí samostatný světelný výbuch bez karty. Jde o výslovné spuštění náhledu, které obnoví i pozastavený pohyb.

## Konfigurace

Jediným zdrojem výchozích hodnot je `DEFAULT_CONFIG` v [config.js](config.js).
`CONTROL_GROUPS` popisuje rozsahy editoru a validace importu. Výchozí čísla jsou první výtvarný návrh, nikoli závazné designové tokeny celého webu.

| Skupina | Nastavení a význam |
| --- | --- |
| `seed` | Celé číslo určující náhodné rozložení drah a posloupnost výběru karet. Náhoda se vzorkuje při konstrukci geometrie nebo při emisi karty, nikdy každý snímek. |
| `scene` | Měřítko, pomalé otáčení soustavy a limit rozlišení. `orientation` je jednotkový quaternion `[x,y,z,w]` ukládaný tažením za jádro; nemá slidery. |
| `inner`, `outer` | Shodné nezávislé sady parametrů obou vrstev; podrobnosti níže. |
| `innerCompanion` | Druhá soustředná dráha ke každé vnitřní orbitě: zapnutí, kladný/záporný odstup v procentech poloměru rodiče, styl a hustota vzoru, vlastní intenzita a tloušťka. Barvu i rovinu dědí od rodiče. |
| `core` | Velikost a záře světelného jádra. |
| `burst` | Samostatný výbuch: počáteční intenzita, počáteční/cílový radius, doba rozpínání, časový útlum a prostorový exponenciální falloff. Radius se udává jako násobek vnějšího obalu. |
| `background` | Typ šumu, počet vrstev (`octaves`, 1–6), deformace souřadnic (`warp`, 0–5); rozestup, velikost a jas gridu; intenzita, detail a rychlost mlhoviny; pozice světla. X roste doprava, Y nahoru, jednotka odpovídá šířce/výšce scény. |
| `color` | Paleta soustavy (dráhy, elementy, jádro, výbuch, šipky karet); zapnutí cyklu, jeho délka a společný barevný poměr. `mix: 0` = teplá, `1` = studená. Při vypnutém cyklu nastavuje pevný tint. |
| `nebulaColor` | Vlastní teplá/studená paleta mlhoviny a gridu, sytost 0–3. `linked` může převzít paletu soustavy; vlastní barvy se přitom neztratí. Čas a poměr přechodu sdílí s `color`; sytost je vždy nezávislá. Výchozí nastavení má oddělené palety se stejnými počátečními barvami. |
| `interaction` | Zapnutí, dosah v CSS pixelech, síla (0–40), čas útlumu a maximální přídavná rychlost (1–100). `maxBoost: 5` dovoluje až šestinásobek základní rychlosti. |
| `cards` | Zapnutí, maximum současných karet, práh a útlum energie, rozestup výbojů, životnost karty, vzdálenost a odchylka směru odletu, počáteční měřítko, velikost písma a krytí. `messages` obsahuje 1–32 celých slovních spojení s preferovanými směry; lze je změnit v kódu nebo JSON. |

### Parametry obou vrstev

| Parametr | Jednotka / chování |
| --- | --- |
| `orbitCount` / `elementCount` | Nezávislé počty. Elementy se rozdělí mezi dostupné dráhy; nulový počet drah vypne i jejich elementy. |
| `radius` / `radiusSpread` | Poloměr ve světových jednotkách a absolutní odchylka ±. Výchozí vnitřní poloměr je 1,52. |
| `angle` / `angleSpread` | Základní náklon a náhodná odchylka ± ve stupních; doplňkový náklon druhé osy používá 45 % této odchylky. |
| `azimuth` / `azimuthSpread` | Natočení celé sady drah v rovině obrazu a jeho odchylka ±. Dráhy jsou základně rozložené po vějíři 180°. |
| `orbitOpacity` / `lineWidth` | Jas a poloměr kulatého průřezu dráhy ve světových jednotkách. Zadní část se dále tlumí podle hloubky. `lineWidth` je historicky také základní pološířka stopy před násobením `trailWidth`; samotná změna geometrie drah toto nastavení stop nemění. |
| `elementSize` / `sizeSpread` | Velikost světelného bodu a relativní odchylka ±; `0.4` znamená až ±40 %. |
| `speed` / `speedSpread` | Úhlová rychlost ve stupních za sekundu a relativní odchylka ±. |
| `glow` | Intenzita širokého světelného hala; jasné jádro bodu zůstává zachováno. |
| `trailDegrees` / `trailOpacity` | Délka světelné stopy jako úhel na dráze a násobek světelné intenzity 0–12. Historický název `trailOpacity` zůstává pro kompatibilitu; parametr nyní násobí emitované světlo při aditivním míchání, nikoli průhlednost. |
| `trailWidth` | Šířka stopy jako násobek šířky dráhy (0,5–8). |
| `trailImpulseMultiplier` | Maximální násobek délky stopy při impulzu (1–5, krok 0,01). 1 = beze změny, 1,1 = až +10 %. Výchozí pracovní hodnota 2. |
| `elementImpulseMultiplier` | Maximální násobek světelné intenzity elementu při impulzu (1–5, krok 0,01). 1 = beze změny, 1,1 = až +10 %. Násobí světlo bodu včetně středu a hala, nemění jeho geometrickou velikost ani intenzitu stopy. Výchozí pracovní hodnota 1,15. |
| `whiteFraction` | Pravděpodobnost bílé namísto barevné částice (0–1). |
| `saturation` | Sytost barev daného obalu (0–3). 0 = odstíny šedi, 1 = původní barvy, vyšší hodnoty zesilují rozdíly barevných kanálů vůči jasu. Aplikuje se před aditivním mícháním. |
| `coreWhiteness` | Bílá příměs středu barevného elementu (0–1); 0 = barevný střed, 1 = původní téměř bílý střed. Výslovně bílé elementy určené `whiteFraction` si bílý střed ponechají. |
| `lineWhiteness` / `trailWhiteness` | Bílá příměs drah / stop (0–1). Snížení zvýrazní základní barvu bez změny nastavené intenzity. |

Nulová odchylka vypíná příslušnou náhodnost. Seed opakuje geometrii a počáteční fáze; výsledný snímek navíc závisí na čase animace, natočení a interakci. Změna parametrů vrstvy zachovává aktuální fáze stávajících elementů. Nový seed fáze znovu vygeneruje.

### Prostorové a zdvojené dráhy

Hlavní dráhy obou obalů už nejsou ploché pásky. Každá je tenký torus s kruhovým průřezem, takže při pohledu v rovině dráhy neztratí celou promítanou plochu. Průřez má osm segmentů, kružnice 192; geometrie se sestaví při změně konfigurace a za běhu se pouze otáčí. Povrch má jemný přechod ke kraji a hloubkový útlum. Traily zůstávají samostatné ploché pásky a elementy používají dosavadní bodový shader.

Sekce **Vnitřní · druhé dráhy** přidává právě jednu doplňkovou kružnici ke každé skutečné vnitřní orbitě, včetně jejího náhodného natočení a poloměru. Má stejný střed a rovinu, samostatný prostorový průřez a vlastní jas. Nevytváří další obíhající elementy, stopy ani zdroj energie. Vnější obal se nezdvojuje.

| Parametr `innerCompanion` | Význam |
| --- | --- |
| `enabled` | Zapnutí celé sady druhých drah. Nulový počet vnitřních orbit vypne i jejich doplňkové kružnice. |
| `radiusOffset` | −40 až +40 % skutečného rodičovského poloměru, krok 0,5 %. `R2 = R1 × (1 + offset / 100)`. Mínus = dovnitř, plus = ven, 0 = překrytí. Relativní odstup zůstává platný i u nejmenších náhodných orbit. |
| `style` | `solid` plná; `dashed` čárkovaná; `dotted` tečkovaná; `dash-dot` čerchovaná; `dash-dot-dot` dvojitě čerchovaná. Vzor vzniká matematicky v shaderu. |
| `repeats` | Počet celých opakování vzoru kolem kružnice (4–64). U plné čáry se nepoužívá. Celý počet zajišťuje návaznost vzoru v místě uzavření kružnice. |
| `intensity` | Jas/krytí druhé dráhy (0–1), nezávislé na jasu rodiče. |
| `lineWidth` | Poloměr jejího prostorového průřezu (0,001–0,025). Nemění šířku rodičovské dráhy, trailů ani velikost elementů. |

Výchozí návrh je čerchovaná linka o 5 % vně rodiče, 24 opakování, intenzita 0,24 a průřez 0,004. Paleta, její cyklus, sytost a bílá příměs jsou společné s hlavními vnitřními dráhami; druhá dráha nemá vlastní barevnou odchylku. Tyto hodnoty jsou pracovní nastavení pro technický vzhled, nikoli nové celowebové tokeny.

Tečky mají délku podél kružnice odvozenou z průměru průřezu, nikoli pevný podíl rozestupu mezi značkami. Zvyšování počtu opakování proto primárně zahušťuje vzor. Na velmi hustém vzoru má velikost tečky horní mez, aby se nespojovala se sousední čárkou.

### Stopy a jas při impulzu

Oba obaly mají vlastní dvojici násobičů. Každý element reaguje na své aktuální přidané zrychlení, nikoli na celkové nabití jádra nebo poslední pohyb myši. Síla vizuální reakce je `p = boost / interaction.maxBoost`, omezená na 0–1. Výsledný násobek je `1 + (nastavený násobek − 1) × p`. Hodnota 1,1 proto přidá při plném impulzu 10 %, při polovičním 5 % a v klidu nic.

Délka stopy i světlo sledují stejný exponenciální útlum jako rychlost. Pauza je zmrazí; otáčení za jádro samo žádný impulz nevytváří. Nulová základní rychlost vizuální reakci vypne a nulová délka stopy zůstane nulová. Světlo se násobí před převodem barev pro displej, takže změna o 10 % znamená intenzitu světla, ne nutně o 10 % světlejší výsledný pixel.

Delší stopy mají podle maximální délky hustší geometrii, aby při prodloužení nebyly hranaté. Maximální nastavitelný oblouk je 350° (základních 70° × 5); nedochází k opakovanému obtáčení a sčítání téže stopy přes sebe. Tyto parametry nemění pravidlo, že vnější obal jádro neprobouzí.

### Ladění barev

Mlhovinu nastavuj v **Barvy mlhoviny**, částice a dráhy v **Barvy soustavy a cyklus**. Společný pomalý cyklus zachová souhru, ale každá paleta může mít jiné odstíny. Sdílení lze kdykoli zapnout.

Pokud barevný bod vypadá příliš bíle, nejprve sniž **Bílý střed barevných elementů** a případně **Podíl bílých elementů**. U drah a stop sniž jejich bílou příměs. Pak dolaď **Sytost barev obalu**, například kolem 1,2–1,8. Jde o pracovní doporučení, nikoli nový výchozí vzhled. Velmi intenzivní aditivní světlo se při překryvu může stále zesvětlit; sytost není náhradou za nastavení intenzity. Mlhovina má vlastní sytost a těmito úpravami obalů se nemění.

Otáčení za jádro používá přírůstkové quaterniony bez omezení úhlů. Během tahu se pozastaví automatické otáčení celé soustavy, oběhy pokračují podle stavu pauzy. Při začátku tahu se dosavadní automatický náklon zahrne do uložené orientace; nové nastavení proto zachová ručně zvolenou polohu. Karty zůstávají čitelné billboardy ve svých směrech odletu, pozadí se neotáčí.

## Varianty šumu mlhoviny

V editoru je pět variant. Ridged a Billow jsou transformace gradientního šumu; nejsou to další nezávislé základní algoritmy.

| `noiseType` | Vzhled / výpočet |
| --- | --- |
| `value` | Původní fBm: interpolované náhodné hodnoty na mřížce, vrstvené v různých měřítkách. |
| `perlin` | Perlinův typ gradientního šumu: jednotkové náhodné směry, skalární součiny a kvintická interpolace. |
| `ridged` | Hřebeny `(1 − abs(noise))²`; výraznější vláknité struktury. |
| `billow` | Absolutní hodnota gradientního šumu; oblejší shluky. |
| `worley` | Buněčný šum podle vzdálenosti k nejbližšímu bodu. Omezený jitter bodů dovoluje prohledávat sousedství 3×3. |

Všechny varianty používají stejnou pozici světla a paletu. Deformace souřadnic vychází z value noise; hodnota `warp: 0` ji vypíná při vzorkování základního šumu. Při porovnávání pomůže zastavit scénu a ponechat stejný tint, intenzitu i měřítko. V produkční verzi má po výběru zůstat jen vybraná varianta; tento přepínač slouží k ladění v editoru.

Algoritmické podklady: [Ken Perlin — Improved Noise](https://mrl.cs.nyu.edu/~perlin/noise/), [The Book of Shaders — value a gradientní šum](https://thebookofshaders.com/11/), [buněčný šum](https://thebookofshaders.com/12/). Místní shader je vlastní 2D implementace; nepoužívá textury ani stažené noise knihovny.

## Karty jako produkt interakce

Původní automatický cyklus je nahrazen emisí po skutečném předání energie kurzorem. Součet přírůstků rychlosti pohybujících se **vnitřních** elementů, normalizovaný odmocninou jejich počtu, plní zásobník energie. Vnější elementy se zrychlují stejně jako dřív, ale neovlivňují energii ani její normalizaci. Zásobník exponenciálně klesá (`energyDecay`). Karta vznikne až při překročení `triggerEnergy` (rozsah **0,1–100**), po uplynutí `cooldown` a při volném místě do limitu `count`. Musí přitom přijít nový impulz; zbytková energie sama další kartu nevytvoří. Elementy s nulovou rychlostí emisi nenabíjejí. Tažení za jádro neposílá impulzy žádnému obalu. Dosah kurzoru zůstává platný: projde-li gesto u vnější částice zároveň blízko vnitřních elementů, může jim energii předat.

Při emisi vznikne samostatný rozpínající se světelný výbuch (`burst`). Za 0,1 s se objeví karta s náhodným celým spojením z `messages`. Bezprostředně se neopakuje stejné spojení, pokud je v zásobníku víc možností. Výchozí texty: PROBLEM → TOOL, IDEA → TOOL, PRACTICE → TOOL, IDEA → PROTOTYPE, NEED → SOLUTION, EXPERIENCE → TOOL.

Karta zpomaluje směrem k cílové pozici, zůstane čitelná a rozplyne se. `cycleSeconds` nyní znamená životnost jedné emise, nikoli opakující se smyčku; již emitovaná karta si drží životnost platnou v okamžiku vzniku. Směr vychází z daného spojení (0° doprava, 90° nahoru), s nastavitelnou odchylkou. Pokud je tento směr obsazený, použije se volnější sektor. Limit se týká živých karet, nikoli počtu spojení v zásobníku.

Billboardy jsou skutečný HTML text s existujícím fontem webu. Pozice se každý snímek promítají z prostoru. Při mobilní šířce se karty zmenší a jejich poloha se omezí hranicemi scény.

## Rozpínající se výbuch

Výbuch je samostatná analytická světelná vrstva přes celý canvas, nezávislá na bodovém shaderu částic a na trvalém jádru. Nemá kruhový ořez, velikostní limit point spritu ani pevnou hranici. Jasný malý střed přechází do širokého hala; obě složky mají exponenciální prostorový útlum. Jediným ořezem jsou hranice scény.

Referenční vnější obal je `(outer.radius + outer.radiusSpread) × scene.scale`. `startRadius` a `radius` jsou násobky tohoto obalu. Výchozí cílový radius je **2×**, rozsah 0,5–4×. Radius označuje charakteristické měřítko světla, nikoli viditelný okraj; intenzita plynule pokračuje i za něj.

- Rozpínání: `R(t) = R0 + (Rmax − R0) × (1 − exp(−3t / expansionSeconds))`. Po nastavené době dosáhne přibližně 95 % rozpětí a dál se přibližuje cíli.
- Časový útlum: `I(t) = intensity × (1 − exp(−t / 0.02)) × exp(−t / decaySeconds)`. Krátký náběh změkčí začátek; potom intenzita klesá i při dalším rozpínání.
- Prostorový útlum hala: `exp(−falloff × vzdálenost / R(t))`. Vyšší `falloff` soustředí světlo blíž středu.

Nový výbuch nepřepočítá starší výbuch od začátku. Vrstvy se překrývají, sdílejí aktuální parametry editoru a zanikají až pod zanedbatelnou intenzitou. Pauza zastaví i jejich čas. `intensity: 0` potlačí světelný efekt, ale nemění pravidla pro vznik karet.

## Renderování a soubory

- `atom.js`: geometrie obou vrstev, fáze pohybu, impulz kurzoru a exponenciální útlum, billboardy, pauza a životní cyklus rendereru.
- `orbit-geometry.js`: dávková geometrie skutečných torů, kulatý průřez, normály povrchu a soustředné doplňkové kružnice.
- `shaders.js`: procedurální vrstvený šum mlhoviny, světlo zprava, bodový grid, dráhy a světelné body. Scéna neobsahuje obrázkové textury; mlhovina je plošný shader s dojmem hloubky, nikoli objemová simulace plynu.
- `editor.js`: panel, import/export a spuštění. Data importu procházejí validací; texty se vkládají přes `textContent`.
- `prototype.css`: styly této studie nad sdíleným CSS webu. Změny pozadí a kompozice zde nezasahují produkční stránky.
- `vendor/`: Three.js **0.180.0** (`three.module.min.js`, `three.core.min.js`) a MIT licence. Soubory pocházejí z balíčku `three@0.180.0` na jsDelivr; za běhu se načítají lokálně a nevyžadují CDN. Aktualizuj oba moduly společně.
- Kořenový `hero-atom.js`: malý produkční vstup. Načte validovaný JSON preset, zjistí token `--ink`, určí virtuální rám původní pravé/spodní oblasti, spustí sdílený renderer a při chybě zobrazí textový fallback.
- Kořenové `index.html` a `styles.css`: produkční canvas přes celé `.hero`, HTML billboardy, vrstvení textu nad scénou a zachování původní výšky layoutu.

Klidová scéna používá devět draw calls při zapnutých druhých drahách, osm bez nich: pozadí, tři dávky pro každou vrstvu, jádro a případně jedna společná dávka doplňkových kružnic. Aktivní výbuchy přidají jednu společnou světelnou vrstvu. Pozadí má vlastní barvu; geometrie vychází z palety soustavy s úpravami obou obalů. Rozlišení má strop, na úzkých displejích nejvýše 1,25×. Renderer se zastavuje mimo viewport a v neaktivní kartě prohlížeče. Bez WebGL 2 se zobrazí textový náhradní stav. Obnova ztraceného WebGL kontextu znovu spustí vykreslování.

## Ověření

Výbuch má navíc kontrolu růstu radiusu za vnější obal, současného poklesu intenzity, nezávislého překrytí dvou emisí, pauzy, změny vykresleného falloffu a náhledu bez vzniku karty. Migrace importu se ověřuje pro verze 1–5. Kontroluje se také silná reakce samotného vnějšího obalu bez nabití jádra, nové barevné parametry ve skutečných pixelech, sdílení/oddělení palet a otáčení skutečným zachyceným ukazatelem včetně ukončení tahu mimo scénu a uložení orientace. U reakce stop a bodů se ověřuje přesné +10 % při maximálním impulzu, neutrální hodnota 1 i při aktivním impulzu, nezávislost obalů, změna skutečných pixelů při stejné fázi a plynulý návrat při útlumu.

Prostorové dráhy mají kontrolu viditelnosti v renderu zepředu i při natočení 89,9°, 90° a 90,1°. Doplňkové kružnice mají kontrolu pěti rozdílných vykreslených vzorů, kladného/záporného/nulového odstupu, změny intenzity, tloušťky a hustoty, vypnutí a zachování pozic elementů i délky a jasu jejich stop.

Při spuštěném preview serveru:

```sh
node experiments/hero-atom/verify.cjs
```

Ověření používá vývojový Playwright (v tomto workspace už je v nadřazeném projektu) a Edge. Jinde lze nastavit `EDGE_PATH`. Playwright ani Node nejsou potřeba v publikovaném webu.

Kontroluje skutečně odlišné pixely pěti šumů, růst intenzity trailů nad 1, vysoké impulzy, práh emise, záblesk, rozestupy, neopakování slovního spojení a zánik karty bez smyčky. Dále kompatibilitu starších exportů, lokální zdroje bez rasterů, omezení pohybu, živé parametry, seed, validaci JSON, útlum, pauzu, zastavení mimo viewport, obnovu WebGL, mobilní rozvržení a náhradní stav bez WebGL. Vizuálně byly zkontrolované varianty mlhoviny, výboj, karta po odletu, desktop a viewport 390 px. Reálný výkon a spotřebu je stále potřeba ověřit na fyzickém telefonu.

Produkční integraci ověřuje samostatný smoke test:

```sh
node experiments/hero-atom/verify-home.cjs
```

Kontroluje načtení konkrétního presetu, původní výšku hero 780 px a mobilní prostor 380 px, canvas přes celé hero, zachovanou pravou polohu a téměř shodný projekční rozměr desktopového atomu při 1440 a 800 px, zásah scény pod text, nezměněné mobilní rozvržení, text nad scénou, nulový horizontální přesah, pouze lokální runtime soubory, emisi skutečným gestem, hranice karty, otáčení za jádro, `prefers-reduced-motion` a fallback bez WebGL.
