---
id: intro
title: Wissensbasis
sidebar_label: Wissensbasis
sidebar_position: 1
description: Lehrnotizen zu Containern, DevOps-Praxis, Git und dem Umgang mit Umgebungsvariablen, geschrieben für die Engineers, die ich mentore, und öffentlich, weil sie mehr als denen nützen.
keywords: [docker, docker compose, devops, 12-factor, environment variables, teaching notes]
---

# Wissensbasis

Das sind Lehrnotizen. Ich mentore Engineers an der Developer Akademie, und eine
Seite landet hier, wenn ich etwas zum dritten Mal erklären musste oder wenn ich
auf eine kanonische Antwort zeigen will, statt sie im Code-Review noch einmal
zu tippen.

Damit ist die Abdeckung absichtlich ungleich. Docker bekommt mehrere Seiten,
weil ich es täglich benutze und weil die meisten Dockerfiles, die ich reviewe,
dieselben drei Probleme haben.

Wenn du die angewandte Version willst, mit echten Zahlen und echten
Postmortems, dann steht die im [Blog](/blog) und in den
[Projekt-Aufschrieben](/docs/projects/intro). Dieser Bereich ist die
Referenzschicht darunter.

## Was hier steht

### [Container](/docs/knowledge-base/Container/intro)

Konzepte, das erste Image bauen, und Compose. Die Seite, auf die ich eine
Kollegin oder einen Kollegen zeigen würde, ist [**Erstes
Docker-Image**](/docs/knowledge-base/Container/first-image). Sie geht über
`FROM python:3.9` hinaus, hin zu Non-Root-Nutzern, Multi-Stage-Builds,
minimalen Base-Images und der Frage, wo Trivy in die Pipeline gehört. Die
meisten Dockerfiles, die ich reviewe, sammeln von dieser Seite mindestens drei
Findings ein.

### [DevOps](/docs/knowledge-base/DevOps/intro)

Notizen auf Praxisebene: [wo Docker in einem Delivery-Workflow tatsächlich
sitzt](/docs/knowledge-base/DevOps/docker-in-devops), und [DevOps gegen die
12-Factor-Prinzipien
umsetzen](/docs/knowledge-base/DevOps/implementing-devops). Die
12-Factor-Seite ist die, zu der ich immer wieder zurückkehre: die meisten
"wir brauchen DevOps"-Gespräche entpuppen sich als Config-im-Code-Problem im
Kostüm.

### [Git](/docs/knowledge-base/git/intro)

Branching und Workflow. Absichtlich kurz: Git-Grundlagen sind das
bestdokumentierte Thema des Internets, und ich habe dazu nichts hinzuzufügen.
Die Security-Seite (signierte Commits, Scannen bevor der Commit landet, was zu
tun ist, wenn ein Key *doch* gepusht wurde) steht in
[Git-Security](/blog/git-security-practices) und geht deutlich tiefer.

### [Umgebungsvariablen](/docs/knowledge-base/env-vars/)

Wie man sie lädt, und wichtiger, was man nicht in sie hineinschreibt. Die
längere Begründung, warum `.env`-Dateien eine Bequemlichkeit für die lokale
Entwicklung sind und keine Secrets-Strategie, ist noch nicht geschrieben; sie
gehört zu einem Projekt, das noch läuft.

## Wo ich stehe

Ein paar Positionen, die sich durch alles hier ziehen, damit du weißt, was du
liest:

- **Eine Security-Prüfung, die nur warnt, ist keine Prüfung.** Wenn ein
  Semgrep-Finding keinen Merge blockieren kann, wird es ab dem dritten Sprint
  ignoriert. Nimm weniger Regeln und lass sie blockieren.
- **Golden Paths schlagen Guardrail-Dokumente.** Niemand liest die Wiki-Seite
  über IAM. Das Modul, das IAM standardmäßig richtig macht, benutzen sie schon.
- **Wenn du das Rollback nicht messen kannst, hast du keins.** Ein
  automatisches Rollback ohne SLO dahinter ist ein Knopf, dem niemand genug
  traut, um ihn zu drücken.
- **Agents schlagen vor, Menschen geben frei.** Ich lasse ein Modell jedes Log
  in der Landschaft lesen. `terraform apply` darf es nicht ausführen.

## Was fehlt

Ehrliche Lücken, damit du nicht danach suchst: Kubernetes, Service Meshes und
alles zu Skalierung jenseits einiger Dutzend Services. Ich arbeite an
Plattformen im Bereich von zehn bis wenigen Dutzend Services. Mir ist lieber,
hier steht nichts, als dass du auf die harte Weise herausfindest, dass eine
Seite aus dem Blogpost eines anderen geschrieben wurde statt aus Produktion.

import DocCardList from '@theme/DocCardList';

<DocCardList/>
