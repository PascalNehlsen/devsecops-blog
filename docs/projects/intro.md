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
| **nblm-clone** | NotebookLM clone, live with a no-sign-up demo. The server accepts a citation only if its quote is in a passage retrieved for that question; a live eval gates every release, and a release broken on purpose rolled itself back in 43 seconds. | Next.js, Supabase, AWS Bedrock, OpenTofu, GitHub Actions | [Docs](/docs/projects/nblm-clone) · [Blog](/blog/the-check-the-model-broke) · [Live](https://app.sec-nblm.dev) · [Repo](https://github.com/PascalNehlsen/nblm-clone) |
| **Agent Delivery Pipeline** | Gated delivery for agent-generated n8n workflows: builder and reviewer agents whose rights are enforced by hooks, a forced failure before the real run, and an acceptance log that is actually counted. | Claude Code agents, n8n, Python, Docker | [Docs](/docs/projects/agent-delivery-pipeline) · [Blog](/blog/agent-gate-it-cannot-open) |
| **Falar** | Speaking tutor for European Portuguese on OpenAI's Realtime API, in internal test on Google Play. The phone talks to the model directly; the backend owns the session, guards every call over a sideband connection and measures minutes by its own clock. | Expo, Django, OpenAI Realtime, GCP OAuth, Docker | [Docs](/docs/projects/falar) · [Blog](/blog/guard-the-call-you-never-hear) |
| **Shift-Left Guard** | Claude Code mod that blocks insecure workflows, Dockerfiles, Terraform and agent configs before they are written and refuses Claude's commits while a flagged file is still flagged. Measured against its own README. | Claude Code mod API, TypeScript | [Docs](/docs/projects/shift-left-guard) · [Blog](/blog/noticing-is-not-a-control) · [Repo](https://github.com/PascalNehlsen/shift-left-guard) |
| **Runnz** | Multi-tenant SaaS for trade-fair construction scheduling. Reusable workflow blocks derive every deadline from the build date; secret scanning and dependency audit block in pre-commit and CI. | NestJS, PostgreSQL, React, Docker | [Docs](/docs/projects/runnz) · [Live](https://runnz.de) |
| **Emavi** (formerly HepaAssist) | Barrier-free multi-tenant PWA for assisted-living facilities: residents log daily mood, staff see trends and generate reports. | Next.js, FastAPI, PostgreSQL, Docker, Web Push | [Docs](/docs/projects/hepa-assist) |
| **AI Chatbot Platform** | Multi-tenant chatbot with appointment booking, embeddable as a widget with Shadow DOM isolation and per-tenant CORS validation. | Next.js, Prisma, OpenAI, Shadow DOM | [Docs](/docs/projects/chatbot) |
| **CaptureDesk** | Loom recorder for Linux on the Loom Record SDK. Runs third-party code next to the screen and camera, so permissions are decided by origin and the local server rejects foreign `Host` headers against DNS rebinding. | Electron, Node.js, Express | [Docs](/docs/projects/capturedesk) · [Blog](/blog/loopback-is-not-an-origin) · [Repo](https://github.com/PascalNehlsen/CaptureDesk) |
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
