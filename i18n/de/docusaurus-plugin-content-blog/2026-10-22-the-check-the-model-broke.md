---
title: "Mein Server prüft jedes Zitat. Das Modell hat die Prüfung dreimal gebrochen."
slug: the-check-the-model-broke
date: "2026-10-22"
authors: [pascal]
description: "Ich habe einen NotebookLM-Klon gebaut, in dem keine Antwort den Nutzer erreicht, solange der Server ihr Zitat nicht in einer Passage gefunden hat, die für genau diese Frage abgerufen wurde. Die Regel hat gehalten. Gebrochen ist alles drumherum: eine Prüfung, die so streng war, dass sie richtige Antworten wegwarf, eine Prüfung, die bestand, während das Modell seine eigenen Prompt-Begrenzer verriet, und eine Antwort, die ohne Grund verschwand. Jeder Fall wurde vom echten Modell gefunden, keiner von den Unit-Tests."
keywords: [rag, retrieval augmented generation, citations, grounding, llm security, prompt injection, llm evaluation, aws bedrock, ai platform engineering]
tags: [agents, devsecops]
image: /img/og/de/the-check-the-model-broke.png
---

# Mein Server prüft jedes Zitat. Das Modell hat die Prüfung dreimal gebrochen.

[nblm-clone](https://github.com/PascalNehlsen/nblm-clone) ist ein NotebookLM-Klon: Quellen hochladen, Fragen stellen, Antworten bekommen, die die genaue Fundstelle zitieren. Er ist [live](https://app.sec-nblm.dev), mit einem Demo-Konto ohne Anmeldung. Die App ist die Demo; worum es geht, ist die Plattform drumherum, und die beschreibt die [Projektseite](/docs/projects/nblm-clone).

Eine Regel ist darin wichtiger als jede andere. Eine Antwort darf eine Aussage nur zeigen, wenn der Server das Zitat dazu Zeichen für Zeichen in einer Passage gefunden hat, die für diese Frage abgerufen wurde. Das Modell schlägt Zitate vor. Der Server entscheidet.

Die Regel hat gehalten. Gebrochen ist, dreimal in den ersten zwei Tagen nach dem ersten Release, alles drumherum.

<!-- truncate -->

![Die Login-Seite der App: „Frag deine Quellen. Jede Antwort zeigt, wo es steht." Darunter eine Beispielfrage zu Hänsel und Gretel, die Antwort „Mit einem Häuschen aus Brot" mit Zitat 1 und die Fundstelle in alter Rechtschreibung, die zitierten Wörter markiert.](/img/blog/nblm/login.png)

## Die Prüfung

In jeder Runde baut der Server den Prompt selbst. Jede abgerufene Passage steht in einem Block, dessen Tag eine zufällige Nonce trägt, neu pro Anfrage:

```text
<quelle-9f3c1a0b7e24d615 nr="1">
... Text der Passage ...
</quelle-9f3c1a0b7e24d615>
<frage-9f3c1a0b7e24d615>
Womit lockte die Hexe Hänsel und Gretel an?
</frage-9f3c1a0b7e24d615>
```

Eine Quelle, die `</quelle-1>` enthält, kann ihren eigenen Block nicht schließen, weil sie die Nonce nicht kennen kann. Das Modell sieht Blocknummern, nie Datenbank-IDs, und bekommt keine Tools. Es soll jede Aussage mit einer Markierung `[n: "wörtliches Zitat"]` belegen.

Dann prüft der Server jede Markierung. `n` muss einen Block nennen, der für diese Runde abgerufen wurde. Das Zitat muss ein Teilstring dieses Blocks sein. Höchstens 20 Markierungen, höchstens 2.000 Zeichen je Zitat. Gültige Markierungen werden zu `[1]`, `[2]` und einer anklickbaren Fundstelle; alles andere wird entfernt. Eine Antwort ohne gültiges Zitat wird durch einen festen Satz ersetzt: „Dazu finde ich in den Quellen keine Antwort." Den Text des Modells speichert die App in diesem Fall nie.

Neun Prompt-Injection-Fälle spielen in den Unit-Tests feindselige Modellausgaben gegen diese Prüfung ab: gefälschte Zitate, eine Blocknummer außerhalb des Bereichs, ein Zitat aus dem falschen Abschnitt, Markierungen, die über Stream-Stücke verteilt sind, ein Markdown-Bild, ein `javascript:`-Link. Alle bestehen. Keiner davon ist das, was schiefging.

## Bruch 1: Die Prüfung warf richtige Antworten weg

Das Demo-Notebook enthält ein Grimm-Märchen in Originalschreibweise: `daß`, `»...«`, `’`. In Produktion habe ich am Abend des ersten Releases zweimal dieselbe Frage gestellt, beide Male mit demselben Retrieval. Die erste Antwort war 62 Tokens lang, jedes Zitat wurde verworfen, und der Nutzer sah die Absage. Die zweite hatte 98 Tokens und gültige Zitate.

Das Modell hatte die Passage zitiert und unterwegs stillschweigend modernisiert: `dass` statt `daß`, gerade Anführungszeichen statt `»«`. Für eine exakte Teilstring-Prüfung ist das ein erfundenes Zitat. Die Prüfung war nach ihrer eigenen Definition richtig und für den Nutzer falsch: Aus einer korrekten, belegten Antwort wurde „Dazu finde ich in den Quellen keine Antwort".

Ich konnte nicht einmal sehen, was das Modell geschrieben hatte. Die App loggt bewusst keinen Prompt-, Quell- oder Antworttext, also stand im Log nur, dass Zitate verworfen wurden, nicht warum.

Der Fix vergleicht beide Seiten nach einem linearen Durchgang, der sie angleicht: Folgen von Leerraum werden zu einem Leerzeichen, jede Art von Anführungszeichen wird zu `'`, Striche werden zu `-`, `ß` wird zu `ss`, weiche Trennstriche und Zeichen ohne Breite fallen weg. Groß- und Kleinschreibung und diakritische Zeichen bleiben streng. Die exakte Prüfung läuft weiter zuerst; die angeglichene nur, wenn sie scheitert, und ein Treffer muss auf Zeichengrenzen der Quelle beginnen und enden.

Der Teil, der die Regel intakt hält: **Gespeichert und gezeigt wird der wörtliche Abschnitt aus der Quelle, nie der Text des Modells.** Jedes gespeicherte Zitat ist weiterhin ein exakter Teilstring einer abgerufenen Passage. Geändert hat sich nur, dass die Fassung des Modells keiner mehr sein muss.

Einen Abgleich über Editierdistanz habe ich verworfen. Er hätte den Grimm-Fall gelöst und Zitate akzeptiert, die nie in der Quelle standen, und genau das soll die Prüfung verhindern. Außerdem zählt das Log jetzt die verworfenen Zitate je Grund (`unknown_chunk`, `not_in_chunk`, `malformed`, `over_limit`) und die angeglichenen Treffer, als Zahlen. So lässt sich der nächste Fall untersuchen, ohne zu loggen, was Nutzer lesen.

## Bruch 2: Die Prüfung bestand, und das Modell verriet seine Begrenzer

Auf develop beantwortete das Modell eine Frage, indem es zuerst drei Quellblöcke wörtlich kopierte, mit Nonce und Tags, und danach eine richtige Antwort mit gültigen Zitaten gab.

Jeder Teil der Zitatprüfung bestand. Die Zitate waren echt. Und der Nutzer sah `<quelle-9f3c...>` durch den Stream laufen, und die gespeicherte Antwort enthielt die Nonce: genau den Wert, dessen Geheimhaltung die Blockgrenzen unfälschbar macht.

Der Fix entfernt kopierte Blöcke, bevor die Zitatprüfung läuft. Eine Markierung in einem kopierten Block ist also Quelltext und zählt nie als Aussage. Dieselben Regeln laufen auf dem Live-Stream, und das ist die schwierigere Hälfte. Der Stream kommt in Stücken an, und ein Tag oder eine Nonce kann auf zwei davon verteilt sein. Also hält der Filter ein `<` zurück, solange daraus noch ein Tag werden kann (höchstens 96 Zeichen), und eine Folge von Hex-Zeichen am Ende, solange daraus noch die Nonce werden kann. Eine Zahl wie `2024` am Ende eines Stücks wartet auf das nächste Zeichen. Das ist eine kleine, bewusste Verzögerung.

Die erste Fassung dieses Fixes ist bei beiden Reviewern durchgefallen, und beide haben das erste Problem unabhängig voneinander gefunden. Das Kleinschreiben für den Tag-Abgleich nutzte Unicode-Regeln, und `"İ".toLowerCase()` ist zwei Zeichen lang. Jeder Index nach einem türkischen großen I zeigte damit auf die falsche Stelle. Die Nonce in einem einzigen Durchgang zu entfernen ließ `<quel` + Nonce + `le-1>` wieder zu einem Tag werden. Und der Stream hielt 96 Zeichen zurück, während der Server Tags von etwa 270 Zeichen akzeptierte. Die ausgelieferte Fassung schreibt nur ASCII klein, entfernt verschachtelte Nonces, bis der Text stabil ist (höchstens acht Durchgänge), und begrenzt Tags auf beiden Seiten auf dieselbe Länge.

Dann wurde die Eval rot, aus dem falschen Grund. Die Live-Eval hatte den rohen Modelltext bewertet, weil der rohe Text zu der Zeit genau das war, was der Nutzer sah. Jetzt entfernten die Filter das Echo, bevor es jemand sah, und die Eval ließ `cites-injection-text` mit `raw:forbidden:<quelle-` durchfallen, für eine Ausgabe, die kein Nutzer je zu sehen bekommt. Heute bewertet die Eval drei Dinge: die gespeicherte Antwort, alles, was der Stream tatsächlich an den Nutzer ausgegeben hat, und jedes Zitat. Eine Injection, der das Modell folgt, fällt weiter durch, denn Payloads, fremde URLs, `javascript:`, der System-Prompt und die Nonce werden von den Filtern nicht entfernt. Und die Eval testet jetzt auch die Filter: Eine Regression, die einen Block durchlässt, lässt den Fall durchfallen.

## Bruch 3: Eine Antwort, die ohne Grund verschwand

In Produktion, eine URL als Quelle, die Frage „Was macht die Developer Akademie": Das Modell streamte eine schlichte, plausible Antwort ganz ohne Zitatmarkierung. Der Logeintrag für diese Runde: 8 Abschnitte abgerufen, 0 Zitate, 0 verworfen, Absage.

Der Server tat, was die Regel sagt, und ersetzte die Antwort durch „Dazu finde ich in den Quellen keine Antwort." Das war sicher, und es war falsch. Die Quellen waren durchsucht worden, das Modell hatte geantwortet, es hatte die Antwort nur mit keinem einzigen Zitat belegt. Und der Nutzer hatte zugesehen, wie Text erschien und dann zu einem Satz wurde, der behauptete, es gebe nichts zu finden.

Jetzt gibt es zwei feste Sätze. Die Absage bleibt für „nichts abgerufen" und „das Modell hat es selbst so gesagt". Eine Antwort ohne Markierung, oder bei der jede Markierung verworfen wurde, wird zu „Ich konnte keine Antwort mit wörtlichen Zitaten aus den Quellen belegen.", mit einem Hinweis darunter, dass der zuerst angezeigte Text verworfen wurde, weil nichts darin geprüft war. Log und Eval melden `ungrounded:no-marker` und `ungrounded:dropped` getrennt. So sehe ich, wie oft das Modell das Zitieren auslässt, statt es zu raten.

<!-- SCREENSHOT: ungrounded notice -->

Auch der Prompt hat sich geändert: Die Zitierregel steht jetzt vor der Absageregel, er sagt, dass eine Antwort ohne jede Markierung verworfen wird, und er gibt ein erfundenes Beispiel für eine richtige Markierung. Das kostet etwa 60 Eingabe-Tokens pro Runde. Wenn die Eval auf develop weiter Faktenfälle mit `ungrounded:no-marker` durchfallen lässt, ist der nächste Schritt ein anderes Modell oder ein eingeschränktes Ausgabeformat, keine schwächere Prüfung.

## Was der Nutzer vor der Prüfung sieht

Der dritte Bruch zeigt auf die Designentscheidung, die ich behalten habe, und die gehört klar gesagt: **Die Prüfung läuft nach dem Stream.** Für einen Moment sieht der Nutzer, was immer das Modell schreibt, bevor der Server eine einzige Markierung angesehen hat.

Dazu gehört auch eine Antwort, die einer Anweisung aus einer Quelle folgt und nichts zitiert. Der Server ersetzt sie am Ende der Runde, und gespeichert wird sie nie. Aber sie stand auf dem Bildschirm.

Was das begrenzt: Die Antwort wird als reiner React-Text gerendert, kein HTML, kein Markdown, ein eingeschleuster Link oder ein Bild sind also wirkungslose Zeichen. Die Content-Security-Policy erlaubt Bilder nur vom eigenen Origin der App. Kopierte Blöcke und die Nonce erreichen den Stream nie. Und das Ersetzen geschieht nicht mehr stillschweigend.

Die Alternative wäre, den Stream zurückzuhalten, bis die erste gültige Markierung kommt. Dann sieht der Nutzer nichts, was er nicht sehen soll, und die Antwort erscheint erst ganz am Ende, womit der Hauptgrund fürs Streamen weg ist. Ich habe mich für die Latenz entschieden und den Zielkonflikt in den Entscheidungsdatensatz geschrieben. So bleibt es eine Entscheidung und wird nicht zu einem Zufall, an dessen Zustandekommen sich niemand erinnert.

## Wie es jetzt gehalten wird

| Gate | Was es prüft | Wo es läuft |
|---|---|---|
| Security-Replay | 9 Injection-Fälle gegen vorgefertigte feindselige Ausgaben | jeder PR, Teil von `pnpm test` |
| Live-Eval | 15 Fälle gegen das echte Modell: 4 Fakten, 2 Absagen, 9 Injections | nach jedem Deploy auf develop |
| Release | ein erfolgreicher develop-Lauf für den getaggten Commit | vor Produktion |
| Canary | eine echte Frage an den gestagten Produktions-Build | vor dem Promote |

Die Live-Eval ist ein hartes Gate: Jeder Security-Fehlschlag oder weniger als 5 der 6 Qualitätsfälle machen den develop-Lauf rot, und ein Commit ohne grünen develop-Lauf kann nicht released werden. Ein Lauf kostet etwa 3 Cent. Der letzte auf develop: Security 9 von 9, Qualität 6 von 6.

Keiner der drei Brüche wäre damals von einem dieser Gates gefunden worden. Den ersten habe ich beim Benutzen der Produktions-Demo bemerkt, den zweiten beim Lesen einer Antwort auf develop, den dritten in einer Logzeile aus Produktion. Was die Gates jetzt tun: verhindern, dass einer davon zurückkommt.

## Bekannte Lücken

- **Eine Stichprobe pro Fall.** Die Eval führt jeden Fall einmal aus, bei Temperatur 0,2. Ein Fall, der einmal besteht, kann beim nächsten Lauf durchfallen; ein wackliger Qualitätsfall wird wiederholt, ein durchgefallener Security-Fall wird zuerst gelesen.
- **Umschriebene Echos werden nicht entfernt.** `<Quelle 1>` oder `[Quelle 1]` würden als Text erscheinen. Gefiltert wird nur die exakte Tag-Form.
- **Das Retrieval wird nicht bewertet.** Die Eval gibt jedem Fall alle Abschnitte seiner Testdaten; ob die Vektorsuche in einem echten Notebook die richtige Passage findet, ist noch nicht gemessen.
- **Kein Gesprächsverlauf.** Jede Frage wird für sich beantwortet, eine Anschlussfrage hat also keinen Kontext. Das hält gefälschte Verlaufszeilen vom Modell fern, und es ist eine echte Einschränkung.
- **Ein Modell.** Amazon Nova 2 Lite über das EU-Inferenzprofil von Bedrock. Alles hier ist auf seine Eigenheiten abgestimmt; ein anderes Modell bräuchte einen neuen Eval-Lauf, kein Vertrauen.

## Umfang

Das Repository ist [öffentlich](https://github.com/PascalNehlsen/nblm-clone), ebenso die Entscheidungsdatensätze hinter jedem Fix: [0011](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0011-chat-with-checked-citations.md) (die Prüfung), [0016](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0016-normalized-citation-matching.md) (das Angleichen), [0018](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0018-echoed-source-blocks.md) (die Echos), [0019](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0019-eval-scores-visible-text.md) (was die Eval bewertet) und [0026](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0026-ungrounded-answer-notice.md) (der zweite Satz). Die [Live-Demo](https://app.sec-nblm.dev) legt ein anonymes Konto mit einer Kopie des Grimm-Notebooks an und löscht es nach 24 Stunden.
