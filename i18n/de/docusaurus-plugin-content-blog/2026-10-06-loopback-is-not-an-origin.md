---
title: "An 127.0.0.1 gebunden und trotzdem aus jedem Browser-Tab erreichbar"
slug: loopback-is-not-an-origin
date: "2026-10-06"
authors: [pascal]
description: "Bevor ich meinen Electron-Screenrecorder veröffentlicht habe, habe ich ihn gehärtet: Berechtigungen nach Ursprung, keine file:-Links an xdg-open, der lokale Server an Loopback gebunden. Am nächsten Tag beantwortete der Server trotzdem jede Webseite im Browser. Wie DNS-Rebinding an 127.0.0.1 vorbeikommt, warum eine Origin-Prüfung allein es nicht aufhält, und die sieben Zeilen, die es tun."
keywords: [electron security, dns rebinding, localhost, host header, origin header, mcp, threat modeling, devsecops, supply chain]
tags: [devsecops, agents]
image: /img/og/de/loopback-is-not-an-origin.png
---

# An 127.0.0.1 gebunden und trotzdem aus jedem Browser-Tab erreichbar

Am 5. Oktober habe ich [CaptureDesk](https://github.com/PascalNehlsen/CaptureDesk) veröffentlicht. Eine kleine Electron-App: Loom hat keinen Desktop-Client für Linux, und beim Aufnehmen im Browser gibt es keine Kamerablase, die über anderen Fenstern schwebt, kein Zeichnen auf dem Bildschirm und keine globalen Tastenkürzel. CaptureDesk verpackt Looms Record SDK und ergänzt genau das.

Bevor ich das Repository auf öffentlich gestellt habe, bin ich es auf Sicherheit durchgegangen und habe drei echte Probleme gefunden. Einer der Fixes: Der lokale Server der App lauscht nur noch auf `127.0.0.1` statt auf allen Schnittstellen.

Am nächsten Tag habe ich es noch einmal gelesen. Der Server beantwortete weiterhin jede Webseite, die im Browser des Nutzers offen war. Die Bindung an Loopback hatte diese Tür nicht geschlossen. Sie hatte sie nur schmaler gemacht.

<!-- truncate -->

## Wem ein Recorder eigentlich vertraut

![Das Hauptfenster von CaptureDesk: Monitor, Aufnahmequalität, Kameragröße, Hintergrund verwischen, Desktop-Ton und die Loom-App-ID als Einstellungen, ein großer Aufnahmeknopf und der Status „Ready to record".](/img/blog/capturedesk/main-window.png)

Ein Screenrecorder ist ungefähr der schlechteste Ort, um beim Vertrauen nachlässig zu sein. Er sieht konstruktionsbedingt Bildschirm, Kamera und Mikrofon. Und dieser führt nicht nur meinen Code aus, sondern:

| Code | Woher er kommt | Was er erreicht |
|---|---|---|
| Meine Seiten (Hauptfenster, Kamerablase) | ein lokaler Express-Server auf `localhost` | die Preload-Bridge, Kamera, Mikrofon, Bildschirm |
| Das Loom Record SDK | npm, proprietär, in meine Seite gebündelt | alles, was meine Seite erreicht |
| Looms eigene Frames | `loom.com`, in meine Seite geladen | Kamera, Mikrofon, Bildschirm, Cookies der Loom-Session |
| Pop-ups (Loom-Anmeldung, OAuth-Seiten) | was auch immer `window.open` anfordert | die Cookies der Loom-Session |
| Der lokale Server | `127.0.0.1:8080` | die App-ID, die Seiten |
| Das Betriebssystem | `shell.openExternal`, also `xdg-open` | jeden registrierten URL-Handler |

Den lokalen Server gibt es aus einem langweiligen Grund. Der Hintergrund-Weichzeichner läuft mit MediaPipes WebAssembly-Laufzeit, und `.wasm` von einem `file://`-Ursprung zu laden ist blockiert. `localhost` über HTTP gilt als sicherer Kontext, also funktioniert `getUserMedia` weiter. Der Server liefert die Seiten aus und einen Endpunkt, `/api/loom-token`, der dem Renderer die Loom-App-ID gibt.

## Die Prüfung vor der Veröffentlichung

Drei Funde, jeder ein paar Zeilen Code, jeder etwas, das ein Reviewer in Minuten gefunden hätte.

**Der Bildschirm ging an jedes Pop-up, ohne Nachfrage.** Der Permission-Handler gab Kamera, Mikrofon und Bildschirmaufnahme an jede Anfrage in der Loom-Session. Anmeldeseiten und alles andere, was über `window.open` geöffnet wird, leben in dieser Session. Für die Bildschirmaufnahme erscheint hier keine Auswahl (die App wählt den Monitor selbst), ein Pop-up, das nach dem Bildschirm fragte, bekam ihn also einfach. Jetzt hängt die Entscheidung davon ab, wer fragt:

```js
// Our own pages (served from the local server) and Loom.
function isTrustedMediaOrigin(rawUrl) {
  if (!rawUrl) return false;
  try {
    const { protocol, hostname, port } = new URL(rawUrl);
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return Number(port) === PORT;
    }
    return protocol === "https:" && isLoomUrl(rawUrl);
  } catch {
    return false;
  }
}
```

Sie schützt den Permission-Request-Handler, den Permission-Check-Handler und den Display-Media-Handler. Drei Einstiegspunkte, eine Regel, damit sie nicht auseinanderlaufen können.

**`window.open` gab jedes Schema an den Desktop weiter.** Nicht-Web-URLs gingen direkt an `shell.openExternal`, unter Linux also an `xdg-open`. Eine Seite in der Loom-Session konnte `file:`, `smb:` oder jedes eigene Schema anfordern, das eine lokale Anwendung registriert hat. Jetzt verlässt nur `mailto:` die App; alles andere wird protokolliert und abgelehnt.

**Der Server lauschte auf allen Schnittstellen.** `app.listen(PORT)` ohne Host bindet an alle, also hätte jeder im selben Café-WLAN die Seiten und die App-ID abrufen können. Der Fix war ein Argument: `"127.0.0.1"`.

Ich habe das mit der Nachricht „harden the app and the pipeline before going public" committet, und daher kam meine Zuversicht. Ausgerechnet der dritte Fix war unvollständig.

## Was schon stimmte, geprüft statt angenommen

Jedes Fenster läuft mit `contextIsolation: true`, `nodeIntegration: false` und `sandbox: true`. Das Preload-Skript gibt meinen eigenen Seiten eine schmale `electronAPI`: Fenstersteuerung, Aufnahmeablauf, Zeichenwerkzeuge, eine Handvoll Einstellungen. Kein Dateisystem, keine Shell, kein beliebiger IPC-Kanal. Das Setup-Fenster ist eine lokale Datei mit `default-src 'none'`.

Eine Frage, die ein Reviewer stellen würde: Pop-ups werden mit meinen Basis-Einstellungen und ohne Preload-Skript erzeugt, aber erben sie das Preload des Hauptfensters trotzdem? Wenn ja, bekäme jede Seite, die Loom öffnet, `window.electronAPI`. Das wollte ich nicht aus der Dokumentation beantworten, also habe ich genau dieses Muster in einer minimalen Electron-44-App nachgebaut: Hauptfenster mit Preload, `setWindowOpenHandler` mit `overrideBrowserWindowOptions` nur mit den Basis-Einstellungen, dann `window.open` aus der Seite.

```
main window:  typeof window.electronAPI === "object"
popup:        typeof window.electronAPI === "undefined"
```

Pop-ups erben es nicht. Diese Aussage ist jetzt ein Testergebnis, keine Annahme.

## Die eine Regel, die ich absichtlich aufweiche

Das Loom SDK rendert seine Oberfläche, indem es `loom.com` in meine Seite einbettet. Looms Antworten tragen `X-Frame-Options` und eine `frame-ancestors`-Direktive, die vernünftigerweise `http://localhost:8080` nicht enthalten. Also schreibt die App diese Header um:

```js
// Only relax embed headers for Loom-owned pages that the SDK needs to load.
browserSession.webRequest.onHeadersReceived((details, callback) => {
  if (!isLoomUrl(details.url)) {
    callback({ responseHeaders: details.responseHeaders });
    return;
  }
  const headers = { ...details.responseHeaders };
  delete headers["x-frame-options"];
  delete headers["X-Frame-Options"];
  // ...and frame-ancestors becomes "*" in any Content-Security-Policy
  callback({ responseHeaders: headers });
});
```

Nach diesem Teil der Codebasis würde ich gefragt werden, also hier die Begründung. Clickjacking-Schutz soll verhindern, dass eine feindliche Seite Loom in einem Browser einbettet, dem der Nutzer vertraut. In dieser App ist die einzige Seite, die überhaupt etwas einbettet, meine eigene, und das Umschreiben passiert in einer Electron-Session, die kein normaler Browser teilt. Es ist per Hostname auf Loom begrenzt, berührt keine andere Antwort und lockert nichts anderes in der CSP. Der Preis ist real, aber begrenzt: Gelänge eine feindliche Seite je auf die oberste Ebene dieser Session, ließe sich Loom darin einbetten. Das ist dieselbe Session, in der die Berechtigungsprüfung jetzt alles ablehnt, was nicht meine Seite oder Loom ist.

Eine Schutzmaßnahme abzuschwächen gehört manchmal zur Arbeit. Es still, global oder ohne Angabe des Preises zu tun, nicht.

## Der Fund, den ich übersehen hatte

Die Bindung an `127.0.0.1` entscheidet, welche Maschine sich verbinden kann. Sie sagt nichts darüber, welche Webseite die Anfrage gestellt hat. Jede Seite im Browser des Nutzers läuft auf der Maschine des Nutzers.

Normalerweise rettet einen die Same-Origin-Policy des Browsers: Eine Seite auf `attacker.example` darf Anfragen an `http://127.0.0.1:8080` schicken, aber die Antwort nicht lesen. DNS-Rebinding hebelt diesen Schutz aus, indem der eigene Hostname des Angreifers auf deine Loopback-Adresse zeigt:

![Eine Sequenz zwischen vier Beteiligten. Der Browser löst rebind.attacker.example zum Server des Angreifers auf und lädt eine Seite mit einem Skript. Die DNS-Antwort hat eine TTL von einer Sekunde; bei der nächsten Abfrage lautet sie 127.0.0.1. Der fetch des Skripts auf /api/loom-token ist jetzt same-origin zur Seite und erreicht den CaptureDesk-Server, mit Host: rebind.attacker.example:8080. Vor dem Fix antwortet der Server mit 200 und der App-ID, danach mit 421.](/img/blog/capturedesk/dns-rebinding.svg)

Nach dem Wechsel teilen Seite und Server aus Sicht des Browsers einen Ursprung: gleiches Schema, gleicher Hostname, gleicher Port. Das Skript liest die Antwort wie jede andere.

Auch das wollte ich nicht aus dem Gedächtnis beschreiben. Chromium lässt sich mit `--host-resolver-rules` anweisen, einen Namen auf eine Adresse aufzulösen. Das ergibt genau den Zustand nach dem Rebinding, ohne einen bösartigen DNS-Server zu betreiben. In Electron 44 eine Seite, die „der Angreifer" als `rebind.test:18081` ausliefert, dann `fetch("/api/loom-token")` über das Netz an den echten CaptureDesk-Server auf `127.0.0.1:18081`:

```
before the fix   200 {"appId":"00000000-0000-0000-0000-000000000000","environment":"production"}
after the fix    421
```

Die App-ID in diesem Test ist ein Platzhalter. Im echten Einsatz ist es die ID der Loom-Developer-App des Nutzers.

### Wie schlimm war es

In diesem Fall nicht sehr, und das gehört klar gesagt, statt es aufzubauschen. Der Endpunkt liefert eine Loom-App-ID, und eine App-ID ist öffentlich: Der Einrichtungsdialog sagt Nutzern, die öffentliche ID zu kopieren und ausdrücklich nicht den Private Key, nach dem CaptureDesk nie fragt.

![Das Einrichtungsfenster von CaptureDesk: drei Schritte, um eine Loom-Developer-App anzulegen, ihre öffentliche App-ID (nicht den Private Key) zu kopieren und einzufügen, ein leeres Eingabefeld und der Pfad der Konfigurationsdatei, in die sie gespeichert wird.](/img/blog/capturedesk/setup-window.png)

Warum es trotzdem wichtig war: Der Server ist die eine Komponente, die jede Webseite erreichen kann, und der nächste Endpunkt, den jemand ergänzt, wird nicht harmlos sein. „Das ist zufällig öffentlich" ist eine Eigenschaft der heutigen Antwort, nicht des Servers.

### Der Fix

Die Anfrage trägt den Hostnamen des Angreifers weiterhin im `Host`-Header. Das ist der eine Header, den eine Rebinding-Seite nicht ändern kann: Browser setzen ihn aus der URL, und Skripte dürfen es nicht.

```js
// Binding to 127.0.0.1 keeps the LAN out, but not a web page in the user's
// browser: DNS rebinding points an attacker's hostname at 127.0.0.1, and the
// browser then treats this server as same-origin with that page. The request
// still carries the attacker's hostname in Host, so only our own names pass.
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
app.use((req, res, next) => {
  if (!ALLOWED_HOSTS.has(req.headers.host)) {
    return res.status(421).end();
  }
  return next();
});
```

Das läuft vor jeder Route, statische Dateien eingeschlossen. `421 Misdirected Request` ist der Status für „dieser Server ist nicht der, den dieser Name meint", und genau das ist die Lage. Jedes Fenster der App lädt `http://localhost:${PORT}`, Legitimes ist also nicht betroffen:

| `Host` | Ergebnis |
|---|---|
| `localhost:18080` | 200 |
| `127.0.0.1:18080` | 200 |
| `attacker.example:18080` | 421 |
| `localhost` (ohne Port) | 421 |
| `localhost.attacker.example:18080` | 421 |

Die letzte Zeile ist der Grund für den exakten Abgleich gegen eine Menge statt eines `startsWith("localhost")`.

### Warum nicht CORS, CSP oder eine Origin-Prüfung

**CORS** greift nicht. Nach dem Rebinding ist die Anfrage same-origin; es gibt keinen Cross-Origin-Lesezugriff, den man verweigern könnte.

**CSP** auf meinen Seiten regelt, was meine Seiten laden dürfen. Sie hat nichts dazu zu sagen, wer meinen Server aufruft.

**Eine Origin-Prüfung** empfehlen die meisten Anleitungen, und sie ist die tückische. Im selben Testaufbau hat der Browser Folgendes geschickt:

```
same-origin GET    Origin: (none)
same-origin POST   Origin: http://rebind.test:18090
```

Browser lassen `Origin` bei same-origin-`GET`-Anfragen weg. Ein Server, der fremde Ursprünge ablehnt, Anfragen ohne `Origin` aber durchlässt (weil curl und CLI-Clients keinen schicken), lässt ein umgeleitetes `GET` direkt durch. `Origin` prüfen, wenn er da ist: unbedingt. `Host` prüfen: immer.

## Dieselbe Lücke in jedem lokalen KI-Werkzeug

Das ist keine Electron-Kuriosität. Es ist die Standardform von viel lokalem Tooling: Dev-Server, Debug-Endpunkte und zunehmend MCP-Server, mit denen ein Coding-Agent über HTTP spricht. Der Streamable-HTTP-Transport der MCP-Spezifikation stellt es an die erste Stelle seiner Sicherheitswarnung:

> Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks

gefolgt von der Bindung an localhost und der Authentifizierung von Verbindungen. Alle drei Punkte sind richtig. Der Testaufbau oben zeigt, warum der erste eine Einschränkung braucht: Dieser Transport nutzt auch `GET`, um seinen Stream vom Server zum Client zu öffnen, und ein same-origin-`GET` kommt ohne `Origin` an, den man prüfen könnte. Ein lokaler MCP-Server, der zusätzlich zu `Origin` auch `Host` prüft, hängt nicht davon ab, welche Methode der Angreifer wählt.

Wenn du irgendetwas auf `localhost` betreibst, das dein Browser erreichen könnte, lautet die Frage nicht „ist es an Loopback gebunden?", sondern „was tut es mit einer Anfrage, deren `Host` es nicht kennt?"

## Die Pipeline drumherum

Dieselbe Prüfung hat vier kleinere Dinge gefunden, alle in CI statt in der App:

- **Secret-Scanning lief mit `--only-verified`.** Damit fällt jeder Fund weg, den TruffleHog nicht live bestätigen kann: ein widerrufener Schlüssel, ein Schlüssel für einen Dienst ohne Verifier, eine Prüfung, während der Anbieter nicht erreichbar war. Ein widerrufener Schlüssel in einer öffentlichen Historie verrät einem Angreifer trotzdem, wie hier Schlüssel committet werden. Jetzt werden alle Ergebnistypen gemeldet; ein Scan der ganzen Historie mit allen findet nichts, die strengere Einstellung ist also grün gestartet.
- **Das Dependency-Audit schlug nur bei critical fehl.** Die Pipeline dieser Seite blockiert ab high. CaptureDesk jetzt auch, und ein kritisches Advisory für `proxy-addr`, das in der Nacht zuvor veröffentlicht worden war, stand schon im Lockfile. Express hatte es mitgebracht.
- **Der wöchentliche Scan konnte nie fehlschlagen.** Er endete mit `npm audit || true`. Ein Advisory, das zwischen zwei Commits erscheint, wäre bis zum nächsten Push grün geblieben, und in einem so ruhigen Repository können das Wochen sein. Beim Zeitplan blockiert er jetzt ab high. Genau diese Lektion hatte ich am selben Morgen schon in der Pipeline dieser Seite gelernt, wo ein Dependabot-Pull-Request auf einem Check gemergt wurde, der einen Tag alt war ([der Fix](https://github.com/PascalNehlsen/devsecops-blog/pull/66)).
- **Dependabot war seit mindestens 23. September jede Woche fehlgeschlagen**, und niemand hat hingeschaut. Ab 4.12 verlangt das Loom SDK einen Versionsbereich eines Atlassian-Icon-Pakets als Peer, und dazu ein zweites Atlassian-Paket, dessen aktuelle Versionen einen neueren Bereich desselben Icon-Pakets brauchen. npm kann nicht beides erfüllen. Minor- und Patch-Updates des SDK sind jetzt ausgeschlossen, mit dieser Begründung direkt an der Regel, und der Alert für `uuid` 3.4.0 im SDK ist als „verwundbarer Code nicht genutzt" geschlossen: Der einzige Aufrufer nutzt `v4()`, das Advisory betrifft `v3`, `v5` und `v6` mit einem vom Aufrufer übergebenen Puffer, und einen Fix im erlaubten Bereich gibt es nicht.

## Bekannte Lücken

- **Es gibt keinen automatisierten Test für die Host-Prüfung.** Ich habe sie von Hand und im Browser-Testaufbau verifiziert; CI prüft nur die Syntax. Das ist das Nächste, was sich ändert, denn eine Schutzmaßnahme ohne Test ist ein Kommentar.
- **Die IPC-Handler prüfen nicht, welcher Frame eine Nachricht geschickt hat.** Nur meine eigenen Fenster haben das Preload, was der Pop-up-Test bestätigt, also kann heute nichts anderes sie aufrufen. Eine Absenderprüfung würde aus dieser Folge eine Regel machen.
- **Pop-ups teilen die Loom-Session**, einschließlich ihrer Cookies. Das braucht die Anmeldung. Kamera, Mikrofon oder Bildschirm bekommen sie nicht mehr.
- **Reine `http://`-Pop-ups sind erlaubt**, nicht nur `https://`. Sie bekommen nichts zusätzlich, aber es gibt keinen Grund, sie zuzulassen.
- **Das Loom SDK ist proprietärer Code in meinem Renderer.** Alles oben begrenzt, was es erreichen kann. Es macht es nicht zu meinem Code.

## Rahmen

CaptureDesk ist ein persönliches Werkzeug, jetzt öffentlich, genutzt von mir. Es steht in keiner Verbindung zu Loom oder Atlassian. Es gibt keine fertigen Pakete, weil die Beta-Vereinbarung des SDK die Weitergabe nicht erlaubt; man baut es selbst. Die beschriebenen Änderungen stehen in [Pull-Request #19](https://github.com/PascalNehlsen/CaptureDesk/pull/19) (die Prüfung vor der Veröffentlichung) und [Pull-Request #20](https://github.com/PascalNehlsen/CaptureDesk/pull/20) (alles, was am Tag danach gefunden wurde).
