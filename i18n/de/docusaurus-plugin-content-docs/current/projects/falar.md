---
id: falar
title: "Falar"
sidebar_label: "Falar"
sidebar_position: 1.6
description: "Ein Sprechtrainer für europäisches Portugiesisch auf OpenAIs Realtime API. Das Handy spricht direkt mit dem Modell; das Backend bestimmt die Session, beobachtet jeden Anruf über eine Sideband-Verbindung, misst die Minuten mit seiner eigenen Uhr und legt im Zweifel auf."
keywords: [voice ai, realtime api, ai platform engineering, llm security, cost control, react native, expo, django, gcp oauth]
---

# Falar

**Ein Sprechtrainer für europäisches Portugiesisch.** Du sprichst mit Ana, einer
Lehrerin aus Lissabon. Sie antwortet laut, korrigiert dich und baut die nächste
Lektion um die Fehler herum, die du immer wieder machst. Ein Kurs von A0 bis B2
als Reise durch Portugal, Rollenspiele aus dem Alltag und verteilte
Wiederholung deiner eigenen Fehler.

:::info[Status · interner Test bei Google Play, privates Repository]
Seit dem 1. Oktober 2026 im internen Test bei Google Play; bisher zwei Tester,
als Nächstes kommt der geschlossene Test mit externen Testern, danach die
Bezahlung. Das Repository ist privat. Der Artikel
[Mein Server bezahlt einen KI-Sprachanruf, den er nie hört](/blog/guard-the-call-you-never-hear)
beschreibt das Sicherheitsdesign.
:::

![Drei Bildschirme der App: die Lissabon-Karte mit der nächsten Lektion, eine laufende Lektion mit Ana und den Zielsätzen und das Profil mit den verbleibenden Probeminuten.](/img/blog/falar/screens.png)

## Architektur

```
Phone (Expo)  ──SDP offer──▶  Django backend  ──API key, session config──▶  OpenAI Realtime
     ▲                              │  ▲                                          │
     │                              │  └──────── sideband WebSocket (guard) ──────┤
     └───────────── audio + data channel, direct (WebRTC) ────────────────────────┘
Phone  ──exchange text──▶  backend  ──▶  text model (strict JSON)  ──▶  mistakes, vocabulary
```

Sprache zu Sprache, direkt zwischen Handy und Modell: etwa eine Sekunde pro
Gesprächszug, und der einzige Aufbau, in dem das Modell die Aussprache des
Lernenden hört statt einer Mitschrift davon. Das Backend sieht das Audio nie
und bezahlt alles davon.

## Vertrauensgrenzen

| Komponente | Darf | Durchgesetzt durch |
|---|---|---|
| App | ein App-Token, ihr eigenes Mikrofon | nichts, was sie schickt, wird geglaubt: Konfiguration, Dauer und Prompt kommen alle vom Server |
| Anruf-Broker | Anrufe mit dem API-Schlüssel anlegen | Budgetprüfung vor jedem Anruf; ein Anruf pro Nutzer (Zeilensperre, der alte Anruf wird aufgelegt) |
| Wächter | jeden Anruf beenden | Sideband-Verbindung pro Anruf: legt auf bei Session-Änderungen, von der App geschriebenen Nachrichten, mit fremden Einstellungen bestellten Antworten, beim Zeitlimit und wenn das Sideband selbst ausfällt |
| Budget | festlegen, was ein Anruf kostet | die Uhr des Servers (`started_at`, `call_ended_at`); verwaiste Anrufe bei der maximalen Länge gedeckelt |
| Auswertungsmodell | Fehler und Wörter vorschlagen | striktes JSON-Schema, unbekannte IDs ignoriert, `store=False`, HMAC-`safety_identifier`; gespeichert werden nur herausgezogene Einträge, nie der Wortwechsel |
| Google-Anmeldung (GCP) | ein Konto verknüpfen | ID-Token geprüft auf Signatur, Ablauf, Audience (Web-Client-ID) und Issuer; E-Mail nur, wenn verifiziert |

## Was gebaut ist

- **Kurs:** Lektionen pro Station auf einer Karte (Wortschatz, Grammatik,
  Aussprache, Hörverstehen, Diskussion, Abschlusstests), Rollenspiele, ein
  freies Gespräch, vier Lehrpersonen mit eigener Stimme und eigenem Charakter
- **Gedächtnis:** Jede Korrektur wird eine Wiederholungskarte; Ana baut fällige
  Karten in spätere Lektionen ein, fünf richtige Verwendungen in getrennten
  Sitzungen gelten als gelernt
- **Konten:** anonymes Gerätekonto mit Probeminuten beim ersten Start,
  Google-Anmeldung, um den Fortschritt zu behalten, Kontolöschung in der App
- **Limits:** Minuten pro Anruf, Tag und Monat, ein gemeinsamer Tagestopf für
  alle Probekonten, gedrosselte Kontoanlage, ein Ausgabenlimit im OpenAI-Projekt
- **Kosten:** gemessen etwa 9,5 Cent pro Gesprächsminute, gesenkt von etwa 14
  (Anas frühere Antworten als Text statt Audio im Verlauf, kürzere Antworten,
  eine Token-Grenze pro Antwort als Notbremse)

<img src="/img/blog/falar/tutors.png" alt={`Die vier Lehrpersonen zur Auswahl: Ana, João, Dona Graça und Sr. Manuel, jeweils mit Alter, Charakter und eigener Stimme.`} className="phone-shot" width="720" height="1473" loading="lazy" />

## Auslieferung

- Backend: Django, PostgreSQL, Docker Compose auf einem Hetzner-Server hinter
  nginx mit HSTS, der Admin hinter einem zweiten Passwort und mit eigener
  Drossel; mehrstufiges Image mit numerischem Nutzer ohne Root-Rechte;
  tägliches Datenbank-Backup
- CI bei jedem Pull-Request; Deploy nach grüner CI auf dem Hauptzweig, mit
  einem SSH-Schlüssel, den ein Forced Command auf ein Skript beschränkt, und
  einem Nur-Lese-Deploy-Key auf dem Server
- App: Expo mit EAS, Over-the-Air-Updates nach dem Merge, Store-Releases per Tag
- 122 Backend-Tests, darunter der Wächter gegen ein nachgebautes Sideband
- Dependabot-Regeln passend zum SDK-Zyklus von Expo

## Bekannte Lücken

- Eine schmale Klasse von Client-Anfragen sieht vom Sideband aus genau wie ein
  legitimer Gesprächszug aus. Zeitlimit, serverseitiges Budget und
  Ausgabenlimit begrenzen sie; geschlossen ist sie noch nicht.
- Wächter sind Threads in den Web-Workern. Ein Aufräumen beim Start und ein
  Aufräum-Container legen Anrufe auf, deren Wächter gestorben ist; ein eigener
  Prozess wäre sauberer, bevor viele Anrufe gleichzeitig laufen.
- Die Zahlen stammen aus einer Woche Entwicklung und internem Test.
- Die App zeigt nichts an, wenn Google eine Anmeldung ablehnt; behoben im
  nächsten Update.
