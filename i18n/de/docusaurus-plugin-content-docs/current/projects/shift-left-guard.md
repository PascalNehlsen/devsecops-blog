---
id: shift-left-guard
title: "Shift-Left Guard"
sidebar_label: "Shift-Left Guard"
sidebar_position: 1.8
description: "Ein Mod für Claude Code, der unsichere Workflows, Dockerfiles, Terraform, Kubernetes, Compose-Dateien und Agenten-Konfigurationen blockiert, bevor Claude sie schreibt, markierte Schreibvorgänge aus der Shell aus Claudes Commits heraushält und destruktive Cloud-Befehle einem Menschen vorlegt. Gemessen, nicht angenommen."
keywords: [claude code, ai coding agents, guardrails, github actions, script injection, mcp, agent configuration, devsecops, shift left, evaluation]
---

# Shift-Left Guard

**Deterministische Leitplanken für Claude Code.** Claude schreibt den Code; der
Guard entscheidet, ob eine unsichere Fassung davon je die Platte oder einen
Commit erreicht.

:::info[Status · öffentliches Repository, MIT]
[github.com/PascalNehlsen/shift-left-guard](https://github.com/PascalNehlsen/shift-left-guard),
installiert mit `/plugin install shift-left-guard --marketplace PascalNehlsen/shift-left-guard`.
Läuft lokal in Claude Code: kein Netzwerk, keine Modellaufrufe, kein
API-Schlüssel. Der Artikel
[Claude hat die Injection jedes Mal bemerkt. Sie ist trotzdem gelandet.](/blog/noticing-is-not-a-control)
beschreibt, wie ich ihn gemessen habe, und die drei Lücken, die die Messung
gefunden hat.
:::

![Das Band über dem Prompt von Claude Code nach einem Fix: „Shift-Left Guard: Claude fixed GHA003 in .github/workflows/greet.yml", die entfernte Zeile rot, die drei neuen Zeilen grün.](/img/blog/shift-left-guard/band-diff.png)

## Was er tut

- **Blockiert vor dem Schreiben.** Jedes `Write` und `Edit` wird so berechnet,
  wie die Datei danach aussieht, und gescannt; Funde ab `high` lehnen den
  Aufruf ab, und Claude liest jeden Fund mit einem konkreten Fix. Es zählt nur,
  was die Änderung einführt, alte Probleme blockieren also nie.
- **Setzt nach Shell-Schreibvorgängen durch.** Dateien, die `cp`, `sed -i` oder
  Heredocs schreiben, werden direkt nach dem Befehl gescannt. Claude kann kein
  `git commit`, `git push` oder `gh pr create` ausführen, solange eine davon
  ihre Funde noch hat, und ein Befehl, der schreibt und committet, wird zum
  Aufteilen zurückgeschickt.
- **Schützt die Konfiguration des Agenten selbst.** Wildcard-Shell-Rechte und
  `bypassPermissions`, ungepinnte `npx`/`uvx`-MCP-Server, Tokens in
  `.mcp.json`, unsichtbare Zeichen und eingeschleuste Anweisungen in
  `CLAUDE.md`, Hooks, die einen Download in eine Shell leiten.
- **Legt destruktive Cloud-Befehle einem Menschen vor.** `terraform destroy`,
  `gcloud … delete`, `kubectl delete ns` und ähnliche öffnen einen Dialog mit
  dem Projekt, Namespace oder Bucket, den sie treffen, und was ein
  Rückgängigmachen kostet, in jedem Berechtigungsmodus.
- **Dieselben Regeln außerhalb von Claude.** Ein Pre-commit-Hook, ein CLI ohne
  Abhängigkeiten für die CI mit SARIF-Ausgabe, `/guard audit` mit Score und
  Team-Regeln in `.guard.json`.

![Eine Zeile im Transkript von Claude Code: „Update(.github/workflows/greet.yml)", direkt darunter „🛡 fixed GHA003", dann der Diff mit einer entfernten und drei neuen Zeilen.](/img/blog/shift-left-guard/row-mark.png)

## Wo jede Entscheidung durchgesetzt wird

| Wer schreibt | Wie | Wann geprüft wird | Durchgesetzt von |
|---|---|---|---|
| Claude | `Write` / `Edit` | bevor sich die Datei ändert | `tool.call`-Hook lehnt den Aufruf ab |
| Claude | Bash (`cp`, `sed -i`, Skripte) | direkt nach dem Befehl | `tool.check` lehnt Claudes Commit und Push ab, solange die Datei markiert ist |
| Claude | destruktiver Cloud-Befehl | bevor er läuft | der eigene Dialog des Guards; Modus `deny` lehnt sofort ab |
| Du | dein Editor | bei `git commit` | Pre-commit-Hook |
| Alle | CI | bei Push oder Pull Request | `guard-scan.mjs`, SARIF ins Code Scanning |

## Regeln

42 Regeln für GitHub Actions, Dockerfiles, Terraform (GCP, AWS, Azure),
Kubernetes und Helm-Values, Docker Compose, `package.json`,
Agenten-Konfiguration und Secrets in jeder Datei, darunter Trojan-Source-Zeichen
und `.env`-Dateien, die Git nicht ignoriert. Jede Regel hat einen Fix-Text, nach
dem Claude handeln kann, und ein „Warum" mit CWE für einen Lernmodus. Die
vollständige Liste steht im
[Repository](https://github.com/PascalNehlsen/shift-left-guard/blob/main/docs/rules.md).

## Gemessen

| | Läufe | Verwundbares Ergebnis |
|---|---|---|
| Opus 5.5 kopiert die Vorlage, ohne Guard | 10 | 2 auf der Platte (in 10 bemerkt) |
| Haiku 5.5 kopiert und committet, ohne Guard | 5 | 5 committet |
| Haiku 5.5 kopiert und committet, mit Guard | 5 | 0 committet |
| Scan einer Datei | | 0,1 bis 1,3 ms |
| Prüfung geänderter Dateien nach einem Shell-Befehl, Repository mit 30.000 Dateien | | etwa 0,5 s, übersprungen bei rein lesenden Befehlen |

Fehlalarme wurden an neun Open-Source-Repositories abgestimmt. Die
[Evaluationsseite](https://github.com/PascalNehlsen/shift-left-guard/blob/main/docs/evaluation.md)
enthält jede Zeile, was die Läufe nicht zeigen, und das Skript, um sie zu
wiederholen.

![Cloud-Guard-Dialog in Claude Code: „gcloud delete against PRODUCTION", der vollständige Befehl, „project: acme-prod", ein Hinweis zum Rückgängigmachen und Cancel vorausgewählt über Run it.](/img/blog/shift-left-guard/cloud-dialog.png)

## Gebaut auf

Der Mod-API von Claude Code: `tool.call`- und `tool.check`-Hooks, ein Band über
dem Prompt, ein Fund-Panel und eine umgezeichnete Transkript-Zeile, alles in
einem TypeScript-Modul. 75 Tests laufen bei jedem Pull Request gegen das
Test-Kit der Engine, für Terminal und Desktop; die CI baut außerdem das
Scanner-Bundle neu, scannt das Repository mit den eigenen Regeln und prüft die
Workflows mit zizmor.

## Bekannte Lücken

- Zeilenbasierte Regeln, keine Parser. Auf wenig Rauschen abgestimmt, also
  werden manche Varianten nicht erkannt.
- Eine Datei, die ein Shell-Befehl geschrieben hat, kann mit ihren Funden auf
  der Platte bleiben; der Guard hält sie aus Claudes Commits heraus, repariert
  sie aber nicht.
- Ein Skript, das intern schreibt und committet, ist für den Guard ein einziges
  Programm. Der Pre-commit-Hook deckt diesen Commit ab, wenn er installiert ist.
- Die Evaluation ist eine Aufgabe mit fünf bis zehn Läufen pro Zeile.
