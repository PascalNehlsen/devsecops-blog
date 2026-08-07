---
title: "SLO-Driven Automated Rollback: Let the Metrics Pull the Cord"
slug: slo-driven-automated-rollback
date: "2026-03-24"
authors: [pascal]
description: "Wiring Prometheus, Grafana and structured logging into a deployment pipeline so an SLO breach triggers rollback automatically — and why a rollback without an SLO behind it is a button nobody trusts."
keywords: [slo, automated rollback, prometheus, grafana, deployment safety]
tags: [observability, cicd, devsecops]
image: /img/og/slo-driven-automated-rollback.png
---
# SLO-Driven Automated Rollback: Let the Metrics Pull the Cord

A deploy that breaks production at 02:00 shouldn't wait for a human to wake up, read a dashboard,
and decide to roll back. If you can *define* what "broken" means in terms your monitoring can
measure, you can let the pipeline pull the cord itself. This post walks through wiring
observability into deployment so that an SLO breach triggers an automatic rollback.

<!-- truncate -->

## Start with an SLO you can actually measure

An automated rollback is only as trustworthy as the signal that fires it. Vague goals ("the app
should be fast") don't work. Concrete, measurable SLOs do:

- **Availability**: `>= 99.9%` of requests return non-5xx over a 5-minute window.
- **Latency**: `p95 < 300ms` over a 5-minute window.
- **Error budget**: a burn-rate threshold that distinguishes a blip from a regression.

These become PromQL expressions, not slideware:

```promql
# 5xx rate over the last 5 minutes, per service
sum(rate(http_requests_total{status=~"5..", service="appointments-api"}[5m]))
/
sum(rate(http_requests_total{service="appointments-api"}[5m]))
```

## The observability spine

Three signals feed the decision:

- **Prometheus** scrapes request rate, error rate, and latency histograms.
- **Grafana** visualises them and hosts the alerting rules humans reason about.
- **Structured logging** (JSON, with a `trace_id`) makes the *why* diggable once the *what* fires.

The key discipline: the same query that draws the dashboard line is the one that gates the deploy.
No separate, drifting "rollback logic".

## The rollback gate

After a deploy promotes a new revision, the pipeline enters a **bake window** — say five minutes
— during which it watches the SLO queries:

1. Promote new revision, shift traffic.
2. Poll the SLO expressions across the bake window.
3. If any SLO breaches its threshold (with a burn-rate guard to avoid flapping), **trigger
   rollback** to the last-good revision.
4. Emit a structured event: revision, breached SLO, observed value, timestamp.

Because rollback is just "route traffic back to the previous known-good revision", it's fast and
boring — exactly what you want at 02:00.

## Guard against false alarms

Automation that rolls back on noise is worse than no automation — it erodes trust. Two guards:

- **Burn-rate, not instantaneous value**: a single spike shouldn't trigger; sustained burn should.
- **Minimum traffic threshold**: don't compute an error *rate* on three requests.

## The result

With SLOs defined as measurable queries and a bake-window rollback gate, the deployment error
rate stayed **under 2%** — and the mean time to detect critical failures dropped to **under five
minutes**, because detection and remediation were the same automated step.

## Takeaways

- Define SLOs as **queries your monitoring already evaluates**, not prose.
- Reuse the **same expression** for the dashboard and the rollback gate.
- Add a **bake window** and **burn-rate guards** so you roll back on regressions, not noise.
- A good rollback is **fast and boring**: route traffic to the last-good revision.
