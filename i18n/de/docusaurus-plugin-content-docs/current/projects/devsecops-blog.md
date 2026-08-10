---
id: devsecops-blog
title: "Diese Seite"
sidebar_label: "Diese Seite"
sidebar_position: 5
description: "Wie diese Seite gebaut ist und was sie erzwingt: keine Third-Party-Requests, ein Build, der an einem kaputten Link scheitert, und ein Dependency-Gate, dessen Ausnahmen ablaufen."
keywords: [docusaurus, github pages, csp, self-hosted fonts, ci security, detect-secrets]
---

# Diese Seite

:::info[Live]
[pascal-nehlsen.de](https://pascal-nehlsen.de). Du liest sie gerade.
:::

Eine Docusaurus-Seite auf GitHub Pages. Das ist unspektakulär, und das meiste,
was auf einer solchen Seite üblicherweise steht (wie man den Dev-Server startet,
was ein Static-Site-Generator ist), gehört in die
[README](https://github.com/PascalNehlsen/devsecops-blog) und nicht hierher.

Aufschreiben lohnt sich das, was der Build mich nicht falsch machen lässt, und
wie es dazu kam.

## Drei Zusagen

Jede davon wird geprüft und nicht behauptet, und nur deshalb lohnt es, sie
hinzuschreiben.

**Keine Third-Party-Requests.** Kein Font-CDN, keine Analytics, keine gehostete
Suche, kein eingebettetes Widget, kein verlinkter Avatar. Öffne den
Netzwerk-Tab: jeder Request geht an diesen Origin.
`scripts/check-no-third-party.mjs` durchsucht das gebaute HTML und CSS nach
Attributen, die Ressourcen laden, und lässt den Build scheitern, wenn eines
davon woanders hinzeigt. Ausgehende `<a href>`-Links werden ignoriert, denn ein
Link ist Navigation und kein Abruf, den der Browser beim Laden macht.

Die Prüfung hat sich beim ersten Lauf verdient, indem sie drei
shields.io-Badges auf einer Projektseite fand, die bei jedem Besuch von einem
externen Host geladen wurden.

Diese Zusage ist auch der Grund, warum die Content-Security-Policy
`script-src 'self'` ohne Ausnahmen sein kann.

**Nichts auf der Seite, was nicht stimmt.** Metriken verlinken auf den
Aufschrieb, der sie dokumentiert. Security-Übungen sind als Übungen
gekennzeichnet. Die Wissensbasis sagt, welche Themen sie nicht abdeckt. Wo ein
Projekt eine Einschränkung hat, die man kennen sollte, steht sie da.

**Jede Prüfung, die blockieren kann, blockiert.** `onBrokenLinks`,
`onBrokenAnchors`, `onBrokenMarkdownLinks`, `onInlineTags` und
`onUntruncatedBlogPosts` stehen alle auf `throw`. Ein kaputter interner Link
lässt den Build scheitern, statt in Produktion zu landen. Ein Blogpost mit einem
Tag, das nicht im Vokabular steht, lässt den Build scheitern, statt eine
doppelte Tag-Seite anzulegen.

## Die Pipeline

Vier Workflows, alle Actions auf Commit-SHAs gepinnt statt auf Tags, weil ein
Tag auf anderen Code umgehängt werden kann.

| Workflow | Auslöser | Was er tut |
| --- | --- | --- |
| `test.yaml` | PRs und `main` | Typecheck, Build (der auch die Linkprüfung ist), Third-Party-Prüfung |
| `security.yml` | PRs, `main`, wöchentlich | Dependency-Gate, Secret-Scan, Dependency Review |
| `main.yml` | Push auf `main` | Ruft den Deploy-Workflow auf |
| `deploy.yaml` | aufgerufen oder manuell | Bauen, prüfen, Artefakt hochladen, nach Pages ausrollen |

Der wöchentliche Lauf des Security-Workflows existiert, weil eine am Dienstag
veröffentlichte Schwachstelle nicht auf den nächsten Commit warten sollte, und
dieses Repository kann wochenlang ohne einen bleiben.

### Das Dependency-Gate

`pnpm audit --audit-level=high` wäre die naheliegende Antwort und reicht nicht
ganz. Als ich es einbaute, existierten vier High-Advisories. Drei wurden durch
einen Audit-Fix behoben. Die vierte, `serialize-javascript`, ist nur über
Webpack-Plugins innerhalb von `@docusaurus/bundler` zur Build-Zeit erreichbar,
wo sie die eigene Ausgabe dieser Seite serialisiert und keine fremde Eingabe,
und das einzige vorgeschlagene Mittel ist, `@docusaurus/core` um fünf
Minor-Versionen zurückzustufen. Das ist ein Downgrade, keine Behebung.

Also ist das Gate ein Script, und eine Ausnahme braucht drei Dinge:

1. **Eine schriftliche Begründung.** "Bekanntes Problem" ist keine Begründung.
2. **Ein Ablaufdatum.** Danach scheitert der Build wieder, die Entscheidung wird
   also ein zweites Mal getroffen, statt die Person zu überleben, die sie
   getroffen hat.
3. **Sie muss noch nötig sein.** Eine Ausnahme, die zu keinem Advisory mehr
   passt, lässt den Build ebenfalls scheitern. Sonst wächst die Liste nur, und
   eine lange Allowlist ist von "kein Gate" nicht zu unterscheiden.

Die dritte Regel ist die, die ich behalten würde, wenn ich nur eine behalten
dürfte. Allowlists verrotten leise.

### Warum pnpm

Der Paketmanager ist Teil der Lieferkette, also bekommt er eine Entscheidung
statt eines Defaults.

npm hebt jede transitive Abhängigkeit in ein flaches `node_modules`, womit Code
Pakete importieren kann, die das Manifest nie deklariert hat. Genau das gab es
hier: eine Komponente nutzte `@types/react`, ohne davon abzuhängen, und es fiel
niemandem auf, bis pnpms strenger Baum es nicht mehr auflösen wollte. Eine nicht
deklarierte Abhängigkeit ist eine, die niemand prüft, weil niemand weiß, dass
sie da ist.

pnpm blockiert außerdem `postinstall`-Scripte, solange sie nicht einzeln
freigegeben sind. Ein Postinstall-Hook führt beliebigen Code auf jeder Maschine
aus, die installiert, CI eingeschlossen, und npm führt sie alle ungefragt aus.

Ein Nebeneffekt, der festgehalten werden sollte: npm meldete 26 Advisories gegen
diesen Baum, pnpm meldet 3. Der Unterschied liegt nicht daran, dass eines
großzügiger wäre. npm hat dasselbe Advisory einmal pro gehobenem Pfad gezählt.

### Secrets

`detect-secrets` läuft gegen eine committete Baseline über die vollständige
Historie, denn ein Credential, das committet und dann entfernt wurde, ist
trotzdem geleakt. Nur neue Findings schlagen fehl. Die Baseline enthält
derzeit sechs Werte, alle Beispielstrings aus Dokumentation über
Secrets-Verwaltung, und jeder wurde gelesen, bevor er akzeptiert wurde, statt
sie im Block abzunicken.

## Schriften, Suche und die CSP

Zwei Entscheidungen tragen die No-Third-Party-Zusage.

**Schriften sind selbst gehostet.** Acht `woff2`-Dateien, Latin-Subset, rund
212 KB zusammen, mit ihren OFL-Lizenzen nach `static/fonts/` gelegt statt zur
Build-Zeit aufgelöst, damit ausgeliefert wird, was geprüft wurde. Ein Request an
`fonts.gstatic.com` würde die IP jeder Besucherin an einen Dritten verraten und
würde `font-src` zwingen, einen externen Host zuzulassen.

**Die Suche läuft im Browser.** `@easyops-cn/docusaurus-search-local` baut zur
Compile-Zeit einen lunr-Index. Algolia DocSearch bedeutete eine Bewerbung, eine
Freigabe, einen extern getakteten Crawler und einen Request an fremde Server bei
jeder Anfrage. Für fünf Beiträge und zweiunddreißig Dokumente ist der Index rund
1,1 MB pro Sprache, wird beim ersten Gebrauch nachgeladen, und eine Besucherin
lädt immer nur den der Sprache, die sie liest.

Beide Indizes werden mit je einem einzelnen Stemmer gebaut und nicht mit einem
kombinierten. Das Plugin schaltet auf `lunr.multiLanguage`, sobald mehr als eine
Sprache gelistet ist, was dem englischen Index einen deutschen Stemmer
mitgäbe, für den er keinen Inhalt hat, auf Kosten der Präzision. Der deutsche
Stemmer und seine Stopwords kommen aus `lunr-languages`, einer Abhängigkeit des
Suchplugins: die deutsche Suche kostet also null Third-Party-Requests, und genau
das hält die Zusage oben in beiden Sprachen wahr.

## Zwei Sprachen

Die Seite wird auf Englisch und Deutsch gebaut: `docusaurus build` läuft einmal
pro Locale, Englisch an der Wurzel, Deutsch unter `/de/`. Englisch bleibt die
Standardsprache, damit keine je indexierte URL umzieht.

Drei Dinge waren das Aufschreiben wert, weil in allen drei Fällen ein grüner
Build nichts beweist:

- **Die Sitemap-Ausschlüsse gelten pro Locale.** Routenpfade tragen `baseUrl`,
  und im deutschen Build ist das `/de/`, also greift ein Muster wie
  `/blog/tags/**` bei `/de/blog/tags/terraform` stillschweigend nicht. Ohne
  Locale-Präfix wäre jede Seite, die diese Site bewusst aus der Sitemap hält,
  für die halbe Sammlung wieder aufgetaucht. Es gibt eine Sitemap pro Locale,
  und `robots.txt` nennt beide.
- **Die Feed-Links gelten pro Locale.** Sie nutzen `pathname://`, was neben
  allem anderen auch `baseUrl` umgeht, also hätte der deutsche Footer den
  englischen Feed beworben, während `/de/blog/rss.xml` unverlinkt im Build lag.
- **Links über Locale-Grenzen brauchen ebenfalls `pathname://`.** Ein Build
  kennt nur die Routen der Locale, die er gerade baut, also lässt ein einfacher
  Link vom englischen Impressum auf `/de/impressum` den Build an
  `onBrokenLinks: 'throw'` scheitern.

Die Legal-Seiten sind die einzige Stelle, an der die deutsche Fassung das
Original ist: § 5 DDG und Art. 13 DSGVO richten sich an deutsches Publikum, und
die verbindliche Fassung eines Impressums ist die deutsche. Das englische
`/impressum` und `/datenschutz` sind Übersetzungen mit Vorrangklausel und Link
auf den deutschen Text.

## Theming

Farben, Typografie, Abstände und Bewegung liegen in `src/css/tokens.css` in zwei
Schichten: themeunabhängige Primitive, dann semantische Farben pro Theme,
gebrückt auf die `--ifm-*`-Variablen, die Infima tatsächlich liest. Kein
Komponenten-Stylesheet enthält ein Farbliteral.

Zwei Dinge daraus sind festzuhalten.

**Kontrastverhältnisse werden gerechnet, nicht geschätzt.** Sie stehen als
Kommentar neben den Werten. Der Akzent im Light-Mode ist `#15803D`, weil das das
hellste Grün ist, das auf allen drei hellen Flächen 4,5:1 schafft; das
`#22C55E` aus dem Dark-Mode liegt auf Weiß bei 2,28:1 und ist dort unbenutzbar.
Ein Token, `--c-text-dim`, verfehlt AA für Fließtext in beiden Themes und ist
als rein dekorativ dokumentiert, statt still verwendet zu werden.

**Infimas Variablen sind unter `html[data-theme='dark']` deklariert.**
Selektor-Spezifität `(0,1,1)`. Eine Token-Schicht, die als
`[data-theme='dark']` geschrieben ist, hat `(0,1,0)` und verliert jede einzelne
Variable dagegen. Das Symptom war eine Hintergrundnaht genau eine
Viewport-Höhe weiter unten, und gefunden wurde sie beim Lesen der berechneten
Styles der gebauten Seite, nicht durch Vertrauen in das Stylesheet.

## Was diese Seite nicht tut

Keine Analytics, ich weiß also nicht, wie viele Menschen hier etwas lesen. Das
ist ein bewusster Tausch und kein Tugendanspruch: die Zahlen wären nützlich, und
ich habe entschieden, dass der Third-Party-Request sie nicht wert ist.

Keine Tests. Für eine statische Seite, deren Build an einem kaputten Link, einem
kaputten Anker, einem kaputten Markdown-Link, einem unbekannten Tag und einer
externen Ressource scheitert, ist der Build die Testsuite. Diese Begründung
würde den Kontakt mit einer Anwendung, die Verhalten hat, nicht überleben.

Keine Response-Header. GitHub Pages kann sie nicht setzen, also brauchen HSTS,
eine echte CSP und `frame-ancestors` einen Proxy davor. Bis der steht, ist die
oben beschriebene CSP ein `<meta http-equiv>`, und das ist schwächer: es kann
`frame-ancestors` nicht ausdrücken und kommt erst nach den ersten Bytes des
Dokuments an.

## Ressourcen

- Live: [pascal-nehlsen.de](https://pascal-nehlsen.de)
- Repository: [github.com/PascalNehlsen/devsecops-blog](https://github.com/PascalNehlsen/devsecops-blog)
- Feeds: `/de/blog/rss.xml`, `/de/blog/atom.xml`, und die englischen unter
  `/blog/`
- Security-Kontakt: [`/.well-known/security.txt`](pathname:///.well-known/security.txt)
