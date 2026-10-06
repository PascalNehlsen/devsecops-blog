---
id: capturedesk
title: "CaptureDesk"
sidebar_label: "CaptureDesk"
sidebar_position: 1.7
description: "Ein Electron-Recorder für Linux auf dem Loom Record SDK: Kamerablase, Zeichen-Overlay, globale Tastenkürzel. Gehärtet rund um das, was er von außen lädt: Berechtigungen nach Ursprung, keine Nicht-Web-Links an den Desktop, ein lokaler Server, der fremde Host-Header ablehnt."
keywords: [electron security, dns rebinding, localhost, screen recording, linux, loom sdk, threat modeling, devsecops]
---

# CaptureDesk

**Ein Loom-Recorder für Linux.** Loom hat keine Desktop-App für Linux, und
beim Aufnehmen im Browser gibt es keine Kamerablase über anderen Fenstern,
kein Zeichnen auf dem Bildschirm und keine globalen Tastenkürzel. CaptureDesk
verpackt das Loom Record SDK in eine Electron-App, die genau das ergänzt. Die
Videos landen wie gewohnt bei Loom.

:::info[Status · öffentliches Repository, private Nutzung]
[github.com/PascalNehlsen/CaptureDesk](https://github.com/PascalNehlsen/CaptureDesk),
MIT für meinen Code. Keine Verbindung zu Loom oder Atlassian. Keine fertigen
Pakete: Die Beta-Vereinbarung des SDK erlaubt keine Weitergabe, also wird aus
dem Quellcode gebaut. Der Artikel
[An 127.0.0.1 gebunden und trotzdem aus jedem Browser-Tab erreichbar](/blog/loopback-is-not-an-origin)
beschreibt die Sicherheitsprüfung im Detail.
:::

![Das Hauptfenster von CaptureDesk: Monitor, Aufnahmequalität, Kameragröße, Hintergrund verwischen, Desktop-Ton und die Loom-App-ID als Einstellungen, ein großer Aufnahmeknopf und der Status „Ready to record".](/img/blog/capturedesk/main-window.png)

## Was es tut

- Bildschirmaufnahme über das Loom SDK, hochgeladen ins Loom-Konto des Nutzers
- Eine Kamerablase über allen Fenstern: ziehen, per Scrollen skalieren,
  Hintergrund-Weichzeichner lokal mit MediaPipe berechnet
- Ein Zeichen-Overlay (Stift, Textmarker, Pfeil, Rechteck, Radierer, Rückgängig)
- Schwebende Steuerung mit Timer und Pause, während das Hauptfenster aus dem
  Video bleibt
- Globale Tastenkürzel für Stopp, Pause und Zeichnen; Platzierung auf
  mehreren Monitoren
- `.deb`- und AppImage-Builds, X11 und Wayland (über XWayland, weil natives
  Wayland einer App nicht erlaubt, ihre eigenen Fenster zu positionieren)

## Wem es vertraut, und wie weit

Ein Screenrecorder sieht konstruktionsbedingt Bildschirm, Kamera und Mikrofon,
und dieser führt Code aus, den er nicht selbst geschrieben hat. Die letzte
Spalte zeigt, wo jede Grenze durchgesetzt wird.

| Code | Ursprung | Darf erreichen | Durchgesetzt durch |
|---|---|---|---|
| Meine Seiten | lokaler Server, `http://localhost:PORT` | eine schmale Preload-Bridge, Kamera, Mikrofon, Bildschirm | `contextIsolation`, `sandbox`, kein `nodeIntegration`; Ursprungsprüfung bei jeder Medienberechtigung |
| Loom Record SDK | npm, proprietär, in meine Seite gebündelt | was meine Seite erreicht | nichts über die Seite hinaus: Das ist das Vertrauen, das ich Loom gebe |
| Loom-Frames | `https://*.loom.com` | Kamera, Mikrofon, Bildschirm | Ursprungsprüfung; Einbettungs-Header nur für Loom-Hostnamen gelockert |
| Pop-ups | was auch immer `window.open` anfordert | die Cookies der Loom-Session | kein Preload (verifiziert), keine Medienberechtigungen, Nicht-Web-Schemata außer `mailto:` abgelehnt |
| Lokaler Server | `127.0.0.1:PORT` | Seiten und die öffentliche App-ID | Loopback-Bindung und eine exakte `Host`-Allowlist (sonst `421`) |

## Sicherheitsprüfung

Zwei Durchgänge, einen Tag auseinander.

**Vor der Veröffentlichung** ([#19](https://github.com/PascalNehlsen/CaptureDesk/pull/19)):

- Kamera, Mikrofon und Bildschirmaufnahme gingen an jede Seite in der
  Loom-Session, auch an Pop-ups, und die Bildschirmaufnahme ohne Nachfrage;
  jetzt nur noch an meine Seiten und Loom, über eine gemeinsame Prüfung
- `window.open` gab `file:`, `smb:` und eigene Schemata an `xdg-open` weiter;
  jetzt verlässt nur `mailto:` die App
- der lokale Server lauschte auf allen Schnittstellen; jetzt auf `127.0.0.1`
- Actions auf Commit-SHAs gepinnt, `permissions: contents: read`, `lodash`
  per Override über zwei High-Advisories gehoben, `nodemon` durch
  `node --watch` ersetzt

**Am Tag danach** ([#20](https://github.com/PascalNehlsen/CaptureDesk/pull/20)):

- die Loopback-Bindung hielt DNS-Rebinding nicht auf: Jede Seite im Browser
  des Nutzers konnte `/api/loom-token` lesen. In Chromium (Electron 44) vor
  und nach dem Fix reproduziert: `200` mit der App-ID, danach `421`
- das Dependency-Audit blockiert ab high statt critical, auch im
  wöchentlichen Lauf, der vorher mit `|| true` endete und nie fehlschlagen
  konnte
- Secret-Scanning meldet auch unverifizierte Funde
- Dependabots npm-Läufe waren wöchentlich an einem nicht auflösbaren
  Peer-Baum im Loom SDK gescheitert; dieses Update ist ausgeschlossen, mit
  der Begründung direkt an der Regel

![Das Einrichtungsfenster: drei Schritte, um eine Loom-Developer-App anzulegen, ihre öffentliche App-ID (nicht den Private Key) zu kopieren und einzufügen.](/img/blog/capturedesk/setup-window.png)

Die App fragt nur nach der **öffentlichen** App-ID einer Loom-Developer-App,
nie nach dem Private Key. Deshalb war der Rebinding-Fund hier von geringer
Tragweite, und deshalb war er trotzdem den Fix wert: Der Server ist die eine
Komponente, die jeder Browser-Tab erreichen kann.

## Der bewusste Kompromiss

Das SDK bettet `loom.com` in eine `localhost`-Seite ein, was Looms
`X-Frame-Options` und `frame-ancestors` verbieten. CaptureDesk entfernt diese
Header nur für Loom-Hostnamen und nur in seiner eigenen Electron-Session. Sonst
wird nichts an Looms CSP verändert, und kein normaler Browser teilt diese
Session.

## Pipeline

- CI: Syntaxprüfung für die JavaScript-, Shell- und Python-Teile,
  `npm audit --audit-level=high`
- Security-Workflow bei Push, Pull-Request und wöchentlich: TruffleHog über die
  ganze Historie (alle Ergebnistypen), blockierendes Audit im Zeitplan, volle
  Advisory-Liste zur Information
- Dependabot wöchentlich für npm und GitHub Actions, Actions per SHA gepinnt

## Bekannte Lücken

- Noch kein automatisierter Test für die `Host`-Prüfung oder die
  Berechtigungsregeln; CI prüft nur die Syntax.
- Die IPC-Handler prüfen den sendenden Frame nicht. Heute haben nur meine
  eigenen Fenster das Preload, das ist also eine Folge, keine Regel.
- Pop-ups teilen die Cookies der Loom-Session, was die Anmeldung braucht.
- Reine `http://`-Pop-ups sind noch erlaubt.
- Das Loom SDK ist Closed Source in meinem Renderer. Die Maßnahmen oben
  begrenzen, was es erreichen kann; prüfbar machen sie es nicht.
