---
id: intro
title: "Projekte"
sidebar_label: "Projekte"
sidebar_position: 1
description: "Alles, was ich gebaut und dokumentiert habe: Platform-Arbeit bei der Developer Akademie, eigene Produkte, und die Security-Übungen hinter den Aufschrieben."
keywords: [platform engineering, devsecops, terraform, gcp, aws, portfolio]
---

# Projekte

Alles hier ist dokumentiert, nicht nur aufgelistet. Wo es einen Aufschrieb
gibt, verlinkt die letzte Spalte darauf; wo der Code öffentlich ist, auch das
Repo. Arbeit für Arbeitgeber und Kunden hat keinen Repo-Link, dort ist der
Aufschrieb das Artefakt.

Für die Drei-Minuten-Fassung stehen die Highlights auf der [Startseite](/).

## Platform- und DevSecOps-Arbeit

Aus meiner Rolle bei der Developer Akademie GmbH. Die Repositories sind
privat, die Aufschriebe und die Zahlen nicht.

| Projekt | Ergebnis | Stack | Aufschrieb |
| --- | --- | --- | --- |
| Terraform Golden Paths auf GCP | Bereitstellung 4 h → 45 min | Terraform, Cloud Run, Cloud SQL, IAM | [Blog](/blog/terraform-golden-paths-gcp) |
| Agentische Runbooks mit Freigabe-Gate | Reaktionszeit −60 % bei bekannten Fehlern | Go, MCP, GCP, Terraform-State | [Blog](/blog/agentic-runbooks-mcp-human-approval) |
| Ephemere AWS-Sandboxes pro Person | 80+ Umgebungen, Compute-Kosten −50 % | AWS EC2 (t3/t4g), Terraform, n8n | [Blog](/blog/ephemeral-aws-sandboxes-cost) |
| SLO-abgesicherte Deploys mit automatischem Rollback | Deploy-Fehlerrate unter 2 % | Prometheus, Grafana, GitHub Actions | [Blog](/blog/slo-driven-automated-rollback) |
| Security-Scanning im Delivery-Pfad | SAST und DAST blockierend, nicht beratend | Bandit, Semgrep, OWASP ZAP, Trivy | keiner |

## Produkte

Dinge, die ich selbst baue und betreibe.

| Projekt | Was es ist | Stack | Links |
| --- | --- | --- | --- |
| **Agent Delivery Pipeline** | Abgesicherte Auslieferung von Agent-generierten n8n-Workflows: Builder- und Reviewer-Agents, deren Rechte per Hook erzwungen werden, ein erzwungener Fehler vor dem echten Lauf und ein Abnahmeprotokoll, das tatsächlich ausgewertet wird. | Claude-Code-Agents, n8n, Python, Docker | [Docs](/docs/projects/agent-delivery-pipeline) · [Blog](/blog/agent-gate-it-cannot-open) |
| **Runnz** | Multi-Tenant-SaaS für die Planung im Messebau. Wiederverwendbare Workflow-Blöcke leiten jede Frist aus dem Aufbautermin ab; Secret-Scanning und Dependency-Audit blockieren im Pre-commit und in CI. | NestJS, PostgreSQL, React, Docker | [Docs](/docs/projects/runnz) · [Live](https://runnz.de) |
| **Emavi** (früher HepaAssist) | Barrierefreie Multi-Tenant-PWA für Einrichtungen des betreuten Wohnens: Bewohnerinnen und Bewohner erfassen täglich ihre Stimmung, das Personal sieht Verläufe und erzeugt Berichte. | Next.js, FastAPI, PostgreSQL, Docker, Web Push | [Docs](/docs/projects/hepa-assist) |
| **KI-Chatbot-Plattform** | Multi-Tenant-Chatbot mit Terminbuchung, als Widget einbettbar, mit Shadow-DOM-Isolation und CORS-Prüfung pro Tenant. | Next.js, Prisma, OpenAI, Shadow DOM | [Docs](/docs/projects/chatbot) |
| **CaptureDesk** | Linux-zuerst gedachter Electron-Screenrecorder auf dem Loom Record SDK, mit Zeichen-Overlay und lokalem Express-Backend. | Electron, Node.js, Express | keine |
| **Diese Seite** | Docusaurus auf GitHub Pages hinter eigener Domain. Keine Third-Party-Requests, selbst gehostete Schriften, Suche ohne Server. | Docusaurus 3, GitHub Actions | [Docs](/docs/projects/devsecops-blog) |

## Kleinere Projekte

Container- und Deployment-Arbeit. Älter und kleiner, trotzdem dokumentiert.

| Projekt | Worum es geht | Links |
| --- | --- | --- |
| Conduit-Pipeline | GitHub Actions: klonen → Image bauen → über SSH mit Compose ausrollen | [Docs](/docs/projects/recent/conduit-pipeline) · [Repo](https://github.com/PascalNehlsen/conduit) |
| Conduit-Container | Compose-Stack für ein Angular-Frontend und ein Django-Backend | [Docs](/docs/projects/recent/conduit) · [Repo](https://github.com/PascalNehlsen/conduit) |
| Truck Signs API | Shop mit Django und DRF, Stripe, containerisiert | [Docs](/docs/projects/recent/truck-signs-api) · [Repo](https://github.com/PascalNehlsen/truck_signs_api) |
| VM-Setup und Härtung | nginx, SSH-Keys, Passwort-Auth abschalten, mehrere Identitäten verwalten | [Docs](/docs/projects/recent/vm-setup) · [Repo](https://github.com/PascalNehlsen/v-server-setup) |

## Security-Übungen

Bewusstes Üben an absichtlich verwundbaren Zielen, dokumentiert, während ich
sie durchgearbeitet habe. Das sind Übungen, keine Kundenaufträge. Sie anders zu
benennen wäre unehrlich, und so sind sie nützlicher: der Wert liegt in der
Begründung, nicht in der Trophäe.

| Set | Worum es geht | Links |
| --- | --- | --- |
| OWASP Juice Shop | Vier Challenges von Anfang bis Ende (API-only XSS, CAPTCHA-Bypass, Admin-Registrierung, Deluxe-Betrug) samt Request-Spuren | [Docs](/docs/projects/recent/juice-shop/intro) · [Repo](https://github.com/PascalNehlsen/juice-shop-challenges) |
| Python-Security-Tooling | Skriptgestütztes Scannen, Cracken und Auslesen von Metadaten (nmap, hydra, hashcat, Metadaten wie mit exiftool), eine Seite pro Werkzeug | [Docs](/docs/projects/recent/python-tools/intro) · [Repo](https://github.com/PascalNehlsen/dso-python-tasks) |

:::warning[Nur autorisiertes Testen]
Alles in diesem Abschnitt lief gegen Ziele, die mir gehören oder die genau dazu
existieren, angegriffen zu werden. Diese Techniken gegen Systeme einzusetzen,
für die du keine schriftliche Testerlaubnis hast, ist strafbar.
:::
