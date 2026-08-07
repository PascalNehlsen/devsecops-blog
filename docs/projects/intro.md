---
id: intro
title: "Projects"
sidebar_label: "Projects"
sidebar_position: 1
description: "Everything I've built and documented: platform work at Developer Akademie, my own products, and the security exercises behind the write-ups."
keywords: [platform engineering, devsecops, terraform, gcp, aws, portfolio]
---

# Projects

Everything here is documented, not just listed. Where a project has a
write-up, the last column links to it; where the code is public, so does the
repo. Private employer and client work has no repo link; the write-up is the
artifact.

For the three-minute version, the [homepage](/) has the highlights.

## Platform & DevSecOps work

From my role at Developer Akademie GmbH. The repositories are private; the
write-ups and the numbers are not.

| Project | Outcome | Stack | Write-up |
| --- | --- | --- | --- |
| Terraform golden paths on GCP | Provisioning 4 h → 45 min | Terraform, Cloud Run, Cloud SQL, IAM | [Blog](/blog/terraform-golden-paths-gcp) |
| Agentic runbooks with an approval gate | Response time −60% on known failures | Go, MCP, GCP, Terraform state | [Blog](/blog/agentic-runbooks-mcp-human-approval) |
| Ephemeral per-user AWS sandboxes | 80+ envs, compute spend −50% | AWS EC2 (t3/t4g), Terraform, n8n | [Blog](/blog/ephemeral-aws-sandboxes-cost) |
| SLO-gated deploys with automatic rollback | Deploy error rate under 2% | Prometheus, Grafana, GitHub Actions | [Blog](/blog/slo-driven-automated-rollback) |
| Security scanning in the delivery path | SAST and DAST blocking, not advisory | Bandit, Semgrep, OWASP ZAP, Trivy | none |

## Products

Things I build and run myself.

| Project | What it is | Stack | Links |
| --- | --- | --- | --- |
| **Emavi** (formerly HepaAssist) | Barrier-free multi-tenant PWA for assisted-living facilities: residents log daily mood, staff see trends and generate reports. | Next.js, FastAPI, PostgreSQL, Docker, Web Push | [Docs](/docs/projects/hepa-assist) |
| **AI Chatbot Platform** | Multi-tenant chatbot with appointment booking, embeddable as a widget with Shadow DOM isolation and per-tenant CORS validation. | Next.js, Prisma, OpenAI, Shadow DOM | [Docs](/docs/projects/chatbot) |
| **Standly** | AI trade-fair-stand designer: prompt or RFQ in, buildable and quotable 3D booth out. Parametric catalog core, RFQ → BOM → quote. In development. | TypeScript monorepo, 3D, diffusion renders | none |
| **CaptureDesk** | Linux-first Electron screen recorder on the Loom Record SDK, with a drawing overlay and a local Express backend. | Electron, Node.js, Express | none |
| **n8n Workflow Workspace** | Versioned workspace for personal and per-client n8n automations. Strict client separation by tag and name prefix; secrets never in git. | n8n | none |
| **This site** | Docusaurus on GitHub Pages behind a custom domain. Zero third-party requests, self-hosted fonts, offline search. | Docusaurus 3, GitHub Actions | [Docs](/docs/projects/devsecops-blog) |

## Smaller projects

Containers and deployment work. Older and smaller, still documented.

| Project | What it covers | Links |
| --- | --- | --- |
| Conduit pipeline | GitHub Actions: clone → build image → deploy over SSH with Compose | [Docs](/docs/projects/recent/conduit-pipeline) · [Repo](https://github.com/PascalNehlsen/conduit) |
| Conduit container | Compose stack for an Angular frontend and a Django backend | [Docs](/docs/projects/recent/conduit) · [Repo](https://github.com/PascalNehlsen/conduit) |
| Truck Signs API | Django + DRF store with Stripe, containerised | [Docs](/docs/projects/recent/truck-signs-api) · [Repo](https://github.com/PascalNehlsen/truck_signs_api) |
| VM setup & hardening | nginx, SSH keys, disabling password auth, managing multiple identities | [Docs](/docs/projects/recent/vm-setup) · [Repo](https://github.com/PascalNehlsen/v-server-setup) |

## Security exercises

Deliberate practice against intentionally vulnerable targets, documented as I
worked through them. These are exercises, not client engagements. Labelling
them as anything else would be dishonest, and they are more useful this way:
the value is in the reasoning, not the trophy.

| Set | What it covers | Links |
| --- | --- | --- |
| OWASP Juice Shop | Four challenges end to end (API-only XSS, CAPTCHA bypass, admin registration, deluxe fraud) with the request traces | [Docs](/docs/projects/recent/juice-shop/intro) · [Repo](https://github.com/PascalNehlsen/juice-shop-challenges) |
| Python security tooling | Scripted scanning, cracking and metadata extraction (nmap, hydra, hashcat, exiftool-style metadata handling), one page per tool | [Docs](/docs/projects/recent/python-tools/intro) · [Repo](https://github.com/PascalNehlsen/dso-python-tasks) |

:::warning[Authorised testing only]
Everything in that section was run against targets I own or that exist to be
attacked. Running these techniques against systems you have no written
permission to test is illegal.
:::
