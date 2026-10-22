---
id: nblm-clone
title: "nblm-clone"
sidebar_label: "nblm-clone"
sidebar_position: 1.4
description: "A NotebookLM clone whose answers cite the exact passage, checked on the server. The app is the demo; the point is the platform around it: OpenTofu, a release that rolls back by itself, data isolation proven with real tokens, a live eval as a release gate, and AI agents that cannot open the gates."
keywords: [rag, citations, llm security, llm evaluation, aws bedrock, opentofu, row level security, release engineering, automatic rollback, ai platform engineering]
---

# nblm-clone

**A NotebookLM clone: upload sources, ask questions, get answers that cite the
exact passage.** The app is the demo. The point is the platform around it.

:::info[Status · live, public repository]
[app.sec-nblm.dev](https://app.sec-nblm.dev), with "Demo starten" on the login
page: an anonymous account with a copy of a demo notebook, no sign-up, deleted
after 24 hours. Code, 26 decision records, runbooks and a postmortem at
[github.com/PascalNehlsen/nblm-clone](https://github.com/PascalNehlsen/nblm-clone).
The article
[My server checks every citation. The model broke the check three times.](/blog/the-check-the-model-broke)
covers what the real model did to the citation check.
:::

<!-- SCREENSHOT: notebook with an answer and an opened citation -->

## Architecture

```
Browser ──HTTPS, CSP──▶ Next.js on Vercel (fra1) ──user JWT, RLS──▶ Supabase Frankfurt
                              │                                    Postgres + pgvector, Auth, Storage
                              ├──OIDC role──▶ AWS Bedrock EU (Nova 2 Lite, Titan V2)
                              └──errors, no user text──▶ Sentry EU
GitHub Actions ──OIDC──▶ AWS org (OpenTofu state, budget) · deploy and migrate ──▶ Vercel, Supabase · DNS ──▶ Cloudflare
```

Everything that holds data or calls a model runs in the EU. The chat model id
must start with `eu.`, and the IAM policy allows only the EU inference profile.

## What is built

- **Answers that cite:** retrieval per notebook with pgvector. The model writes
  `[n: "quote"]`; the server accepts a marker only if block `n` was retrieved
  for this question and the quote is in it. Every stored quote is the verbatim
  span from the source. No valid citation, no answer: a fixed sentence replaces
  it, and the UI says why.
- **Sources as data:** each retrieved passage sits in a block whose tag carries
  a fresh nonce per request, so a source cannot close its block or forge a new
  one. The model gets no tools and no history.
- **Sharing:** notebooks with owner, editor and viewer roles. PDFs checked by
  magic bytes, pasted text, and URL import behind an SSRF guard that resolves
  and checks every redirect hop.
- **Cost:** a budget check before every model call (per user, tighter for
  demo users, and global), a kill switch, a monthly AWS budget alarm.
- **Operations:** an operator-only ops page with cost per day, p95 latency,
  ingestion errors and the latest eval score. Sentry in the EU with technical
  data only, never user text. Users delete their own account, including
  embeddings and files.

## Where each decision is enforced

| Decision | Enforced by |
|---|---|
| Who can read a notebook | Row level security on every table; 494 RLS tests sign in as owner, editor, viewer, stranger and anonymous with real JWTs, never the service role; pgTAP catalog checks block bypasses |
| What an answer may claim | The citation check on the server, before anything is stored |
| What reaches production | A signed tag, a required human reviewer, then migrations, a staged deploy, smoke test and canary question, promote, live smoke, and an automatic rollback |
| What the infrastructure is | OpenTofu: plan in the PR, apply only in CI after approval, a plan guard against destroys, a nightly drift check |
| What the AI agents can do | A sandbox without cloud credentials, branch rulesets, the production environment; the agents' own role limits are hooks, and the table "Where the hard limits are" in `AGENTS.md` says which limits are only instructions |

## Release and rollback

```
PR (required checks) ─▶ main ─▶ develop: migrate, deploy, smoke, live eval
                                   │
signed tag v* ─▶ approval ─▶ migrations, staged deploy, smoke, canary ─▶ promote ─▶ live smoke
                                                                                    ├─ pass ─▶ released
                                                                                    └─ fail ─▶ automatic rollback
```

The rollback path had never run for real, so on 20 October 2026 I broke a
release on purpose. A game day switch made the new deployment answer `/login`
with 500, but only on the production domain: the staged smoke test and the
canary ran against the deployment URL and passed, as they would for a real
domain-only fault. After promote, the live smoke failed five times with
backoff, and the workflow put the previous deployment back. Nobody touched
anything.

| | |
|---|---|
| Outage, first 500 to restored | 43 seconds |
| Of that, the smoke test's retry backoff | 38 seconds |
| Rollback itself | 4 seconds |
| Human steps | none (the run stays red) |

Most of the outage is the retry window, which exists because right after
promote the domain can still serve the old deployment. Fewer retries would cut
the outage and cause more false rollbacks; the
[postmortem](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/postmortems/2026-10-20-game-day.md)
records the trade-off and the number.

## Measured

| | |
|---|---|
| RLS tests with real JWTs | 494 |
| pgTAP catalog checks | 951 |
| Unit tests | 2,749 |
| End-to-end tests (Playwright, production build) | 142 |
| Live eval on develop, latest run | security 9 of 9, quality 6 of 6 |
| Live eval cost | about 3 cents per run |
| Game day rollback | 43 s outage, no human step |

Counts from the latest CI run on `main`, 22 October 2026.

## How AI agents were used

Claude Code wrote most of the code in roles: a planner that only reads, a
test-author that writes tests and runs nothing, a builder, a read-only
reviewer. Tests come first for every high-risk change, a required check
classifies every PR by the paths it touches, and every PR body has a gate log
of what review or CI caught. Apply, deploy and migrations run only in CI; no
agent can merge, tag or approve production.

The repository says where that stops. The host session that approves plans
and pushes runs with my credentials, and only instructions bind it. The
independent Codex review is run by hand until its CI job exists. And some PRs
were built in the host session after the sandbox crashed out of memory; those
PRs say so.

## Built on

Next.js (App Router, TypeScript strict) on Vercel, Supabase (Postgres with
pgvector, Auth with GitHub OAuth and an anonymous demo behind Turnstile,
private Storage, pg_cron), AWS Bedrock in the EU (Amazon Nova 2 Lite, Titan
Text Embeddings V2), OpenTofu stacks for bootstrap, AWS and Cloudflare, GitHub
Actions with every action pinned to a SHA, a secret scan, zizmor, dependency
review, CodeQL and a trivy IaC scan.

## Known gaps

- The citation check runs after the stream: the user can see text for a
  moment before it is replaced. Plain-text rendering and the CSP limit what
  that text can do. The [article](/blog/the-check-the-model-broke) has the
  trade-off.
- The live eval has 15 cases, one sample each, and does not evaluate
  retrieval.
- The live smoke checks `/login` only; a fault in an API route would pass it.
- GitHub rulesets and environments are set by hand and documented, not yet
  code. A database restore drill has not been run.
