---
id: nblm-clone
title: "nblm-clone"
sidebar_label: "nblm-clone"
sidebar_position: 1.4
description: "Ein NotebookLM-Klon, dessen Antworten die genaue Fundstelle zitieren, geprüft auf dem Server. Die App ist die Demo; worum es geht, ist die Plattform drumherum: OpenTofu, ein Release, das sich selbst zurückrollt, Datentrennung mit echten Tokens bewiesen, eine Live-Eval als Release-Gate und KI-Agenten, die die Gates nicht öffnen können."
keywords: [rag, citations, llm security, llm evaluation, aws bedrock, opentofu, row level security, release engineering, automatic rollback, ai platform engineering]
---

# nblm-clone

**Ein NotebookLM-Klon: Quellen hochladen, Fragen stellen, Antworten bekommen,
die die genaue Fundstelle zitieren.** Die App ist die Demo. Worum es geht, ist
die Plattform drumherum.

:::info[Status · live, öffentliches Repository]
[app.sec-nblm.dev](https://app.sec-nblm.dev), mit „Demo starten" auf der
Login-Seite: ein anonymes Konto mit einer Kopie eines Demo-Notebooks, ohne
Anmeldung, nach 24 Stunden gelöscht. Code, 26 Entscheidungsdatensätze,
Runbooks und ein Postmortem unter
[github.com/PascalNehlsen/nblm-clone](https://github.com/PascalNehlsen/nblm-clone).
Der Artikel
[Mein Server prüft jedes Zitat. Das Modell hat die Prüfung dreimal gebrochen.](/blog/the-check-the-model-broke)
beschreibt, was das echte Modell mit der Zitatprüfung gemacht hat.
:::

![Ein Notebook in der App: links die Quellen, jede in ihrer eigenen Farbe; in der Mitte die Frage „Beschreibe mir kurz worum es im Projekt Falar geht?" und eine Antwort, die mit Zitat 1 endet; rechts die Quelle, an der zitierten Stelle geöffnet und in der Farbe der Quelle markiert.](/img/blog/nblm/notebook.png)

## Architektur

```
Browser ──HTTPS, CSP──▶ Next.js auf Vercel (fra1) ──Nutzer-JWT, RLS──▶ Supabase Frankfurt
                              │                                       Postgres + pgvector, Auth, Storage
                              ├──OIDC-Rolle──▶ AWS Bedrock EU (Nova 2 Lite, Titan V2)
                              └──Fehler, kein Nutzertext──▶ Sentry EU
GitHub Actions ──OIDC──▶ AWS-Organisation (OpenTofu-State, Budget) · Deploy und Migration ──▶ Vercel, Supabase · DNS ──▶ Cloudflare
```

Alles, was Daten hält oder ein Modell aufruft, läuft in der EU. Die ID des
Chat-Modells muss mit `eu.` beginnen, und die IAM-Policy erlaubt nur das
EU-Inferenzprofil.

## Was gebaut ist

- **Antworten, die zitieren:** Retrieval pro Notebook mit pgvector. Das Modell
  schreibt `[n: "Zitat"]`; der Server akzeptiert eine Markierung nur, wenn
  Block `n` für diese Frage abgerufen wurde und das Zitat darin steht. Jedes
  gespeicherte Zitat ist der wörtliche Abschnitt aus der Quelle. Kein gültiges
  Zitat, keine Antwort: Ein fester Satz ersetzt sie, und die Oberfläche sagt,
  warum.
- **Quellen als Daten:** Jede abgerufene Passage steht in einem Block, dessen
  Tag eine neue Nonce pro Anfrage trägt, eine Quelle kann ihren Block also
  weder schließen noch einen neuen fälschen. Das Modell bekommt keine Tools und
  keinen Verlauf.
- **Teilen:** Notebooks mit den Rollen Owner, Editor und Viewer. PDFs per
  Magic Bytes geprüft, eingefügter Text und URL-Import hinter einem SSRF-Guard,
  der jeden Redirect-Schritt auflöst und prüft.
- **Kosten:** eine Budgetprüfung vor jedem Modellaufruf (pro Nutzer, enger für
  Demo-Nutzer, und global), ein Notschalter, ein monatlicher
  AWS-Budget-Alarm.
- **Betrieb:** eine Ops-Seite nur für Betreiber mit Kosten pro Tag,
  p95-Latenz, Ingestion-Fehlern und dem letzten Eval-Ergebnis. Sentry in der
  EU nur mit technischen Daten, nie mit Nutzertext. Nutzer löschen ihr Konto
  selbst, samt Embeddings und Dateien.

## Wo jede Entscheidung erzwungen wird

| Entscheidung | Erzwungen durch |
|---|---|
| Wer ein Notebook lesen darf | Row Level Security auf jeder Tabelle; 494 RLS-Tests melden sich als Owner, Editor, Viewer, Fremder und anonym mit echten JWTs an, nie mit der Service-Rolle; pgTAP-Katalogprüfungen blockieren Umgehungen |
| Was eine Antwort behaupten darf | Die Zitatprüfung auf dem Server, bevor etwas gespeichert wird |
| Was Produktion erreicht | Ein signierter Tag, ein verpflichtender menschlicher Reviewer, dann Migrationen, ein gestagter Deploy, Smoke-Test und Canary-Frage, Promote, Live-Smoke und ein automatischer Rollback |
| Wie die Infrastruktur aussieht | OpenTofu: Plan im PR, Apply nur in CI nach Freigabe, ein Plan-Guard gegen Löschungen, ein nächtlicher Drift-Check |
| Was die KI-Agenten dürfen | Eine Sandbox ohne Cloud-Zugangsdaten, Branch-Rulesets, die Produktionsumgebung; die Rollengrenzen der Agenten sind Hooks, und die Tabelle „Where the hard limits are" in `AGENTS.md` sagt, welche Grenzen nur Anweisungen sind |

## Release und Rollback

```
PR (Pflicht-Checks) ─▶ main ─▶ develop: Migration, Deploy, Smoke, Live-Eval
                                   │
signierter Tag v* ─▶ Freigabe ─▶ Migrationen, gestagter Deploy, Smoke, Canary ─▶ Promote ─▶ Live-Smoke
                                                                                            ├─ ok ─▶ released
                                                                                            └─ Fehler ─▶ automatischer Rollback
```

Der Rollback-Pfad war nie wirklich gelaufen, also habe ich am 20. Oktober 2026
absichtlich ein Release kaputt gemacht. Ein Game-Day-Schalter ließ das neue
Deployment `/login` mit 500 beantworten, aber nur auf der Produktionsdomain:
Smoke-Test und Canary liefen gegen die Deployment-URL und bestanden, wie bei
einem echten Fehler, der nur auf der Domain auftritt. Nach dem Promote schlug
der Live-Smoke fünfmal mit Backoff fehl, und der Workflow stellte das
vorherige Deployment wieder her. Niemand hat eingegriffen.

| | |
|---|---|
| Ausfall, erste 500 bis wiederhergestellt | 43 Sekunden |
| Davon der Retry-Backoff des Smoke-Tests | 38 Sekunden |
| Der Rollback selbst | 4 Sekunden |
| Menschliche Schritte | keine (der Lauf bleibt rot) |

Der größte Teil des Ausfalls ist das Retry-Fenster, und das gibt es, weil die
Domain direkt nach dem Promote noch das alte Deployment ausliefern kann.
Weniger Retries würden den Ausfall verkürzen und mehr falsche Rollbacks
auslösen; das
[Postmortem](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/postmortems/2026-10-20-game-day.md)
hält den Zielkonflikt und die Zahl fest.

## Gemessen

| | |
|---|---|
| RLS-Tests mit echten JWTs | 494 |
| pgTAP-Katalogprüfungen | 951 |
| Unit-Tests | 2.749 |
| End-to-End-Tests (Playwright, Produktions-Build) | 142 |
| Live-Eval auf develop, letzter Lauf | Security 9 von 9, Qualität 6 von 6 |
| Kosten der Live-Eval | etwa 3 Cent pro Lauf |
| Game-Day-Rollback | 43 s Ausfall, kein menschlicher Schritt |

Zahlen aus dem letzten CI-Lauf auf `main`, 22. Oktober 2026.

## Wie KI-Agenten eingesetzt wurden

Claude Code hat den größten Teil des Codes in Rollen geschrieben: ein Planer,
der nur liest, ein Test-Autor, der Tests schreibt und nichts ausführt, ein
Builder, ein Reviewer, der nur liest. Bei jeder Änderung mit hohem Risiko
kommen die Tests zuerst, ein Pflicht-Check stuft jeden PR nach den berührten
Pfaden ein, und jede PR-Beschreibung hat ein Gate-Log mit dem, was Review oder
CI gefunden haben. Apply, Deploy und Migrationen laufen nur in CI; kein Agent
kann mergen, taggen oder Produktion freigeben.

Das Repository sagt, wo das aufhört. Die Host-Session, die Pläne freigibt und
pusht, läuft mit meinen Zugangsdaten, und nur Anweisungen binden sie. Das
unabhängige Codex-Review wird von Hand ausgeführt, bis sein CI-Job existiert.
Und einige PRs entstanden in der Host-Session, nachdem die Sandbox wegen
Speichermangel abgestürzt war; diese PRs sagen das.

## Gebaut mit

Next.js (App Router, TypeScript strict) auf Vercel, Supabase (Postgres mit
pgvector, Auth mit GitHub OAuth und einer anonymen Demo hinter Turnstile,
privater Storage, pg_cron), AWS Bedrock in der EU (Amazon Nova 2 Lite, Titan
Text Embeddings V2), OpenTofu-Stacks für Bootstrap, AWS und Cloudflare, GitHub
Actions mit jeder Action auf einen SHA gepinnt, Secret-Scan, zizmor,
Dependency Review, CodeQL und einem trivy-IaC-Scan.

## Bekannte Lücken

- Die Zitatprüfung läuft nach dem Stream: Der Nutzer kann für einen Moment
  Text sehen, bevor er ersetzt wird. Darstellung als reiner Text und die CSP
  begrenzen, was dieser Text anrichten kann. Der
  [Artikel](/blog/the-check-the-model-broke) beschreibt den Zielkonflikt.
- Die Live-Eval hat 15 Fälle mit je einer Stichprobe und bewertet das
  Retrieval nicht.
- Der Live-Smoke prüft nur `/login`; ein Fehler in einer API-Route käme
  durch.
- GitHub-Rulesets und -Umgebungen sind von Hand gesetzt und dokumentiert,
  noch kein Code. Eine Wiederherstellung der Datenbank wurde noch nicht
  geprobt.
