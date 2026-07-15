---
title: "Ephemeral AWS Sandboxes: 80+ Isolated Environments at Half the Cost"
date: "2026-04-28"
authors: pascal
description: "Provisioning per-user, production-like n8n sandboxes on AWS burstable EC2 with automated lifecycle management — isolated environments for 80+ trainees while keeping compute costs 50% below fixed-size instances."
tags: ["AWS", "EC2", "Cost Optimization", "Automation", "Terraform"]
---

# Ephemeral AWS Sandboxes: 80+ Isolated Environments at Half the Cost

Giving every learner a shared environment is cheap and miserable — one person breaks it and
everyone is blocked. Giving everyone a fixed, always-on instance is clean and expensive. This
post is about a third option: per-user, production-like sandboxes on AWS that spin up on demand,
clean themselves up, and cost about half what fixed-size instances would.

<!-- truncate -->

## Why isolation matters more than it looks

For hands-on automation work (in this case, n8n sandboxes for trainees), shared state is
poison. A misconfigured workflow, a runaway loop, a deleted credential — in a shared box, that's
everyone's problem. Isolation means one person's mistake is a learning moment, not an outage for
the cohort.

The requirement, then: **80+ independent, production-like environments**, each disposable.

## Burstable instances fit the usage shape

The usage pattern is bursty: intense activity during a session, near-idle the rest of the time.
That's exactly what AWS burstable instances (`t3` / `t4g`) are built for — you pay for a baseline
and accrue CPU credits while idle, spending them during bursts.

Two choices did most of the cost work:

- **`t4g` (Graviton/ARM)** where the workload is architecture-agnostic — better price/performance.
- **Right-sizing to the burst**, not the peak-of-peaks, because credits absorb short spikes.

Against fixed-size, always-on instances sized for peak, this kept compute costs roughly **50%
lower**.

## Lifecycle automation is the whole game

Ephemeral only saves money if the environments actually go away. The lifecycle is automated
end-to-end:

1. **Provision** on demand from a Terraform-defined template — instance, security group,
   bootstrapped n8n, tagged with `owner` and `expires-at`.
2. **Run** for the session; isolated networking per sandbox.
3. **Reap** automatically — a scheduled job terminates instances past their `expires-at`, so a
   forgotten sandbox can't quietly bill for a week.

```hcl
tags = {
  owner       = var.trainee_id
  purpose     = "n8n-sandbox"
  expires-at  = var.session_end   # consumed by the reaper
}
```

The `expires-at` tag is the linchpin: it turns "please remember to shut it down" into a
guaranteed, automated teardown.

## Guardrails so a sandbox stays a sandbox

Isolation and cost control need the same enforcement discipline as any other environment:

- **Scoped IAM** per sandbox — no shared, over-privileged role.
- **Egress limits** so a sandbox can't become a crypto-mining surprise.
- **Hard expiry** so cost is bounded by design, not by vigilance.

## The result

The outcome was **80+ trainees, each with an isolated, production-like environment**, provisioned
on demand and reaped automatically — at roughly **half the compute cost** of fixed-size
instances. Isolation stopped being a luxury and became the cheap default.

## Takeaways

- Match instance type to the **usage shape**; bursty work loves burstable instances.
- Consider **Graviton (`t4g`)** for architecture-agnostic workloads.
- Make teardown **automated and tag-driven** — ephemeral that never expires is just expensive.
- Bound cost **by design** (hard expiry) instead of relying on people to remember.
