---
title: "Golden Paths on GCP: Cutting Provisioning Time by 80% with Terraform"
slug: terraform-golden-paths-gcp
date: "2026-01-20"
authors: [pascal]
description: "How modularising a Google Cloud environment around team intent rather than the resource catalogue turned a four-hour manual setup into a sub-45-minute self-service path."
keywords: [terraform, gcp, golden paths, platform engineering, cloud run, iam]
tags: [terraform, gcp, platform, cicd]
image: /img/og/terraform-golden-paths-gcp.png
---
# Golden Paths on GCP: Cutting Provisioning Time by 80% with Terraform

The fastest way to slow a team down is to make them wait on infrastructure. When every new
service means a four-hour manual walk through the GCP console, engineers batch their requests,
context-switch while they wait, and quietly build snowflakes. This post is about replacing that
ritual with a golden path — a paved, opinionated route that provisions a production-like
environment in under 45 minutes, self-service.

<!-- truncate -->

## The problem with "just click it in the console"

Manual provisioning fails in three predictable ways:

- **It's slow.** Four hours per environment, most of it waiting and clicking.
- **It drifts.** No two environments end up identical, so "works in staging" stops meaning anything.
- **It's opaque.** There's no review, no history, no way to answer "who changed this IAM binding and why".

Infrastructure as Code fixes all three at once — but only if the modules are shaped so that
using them correctly is the path of least resistance.

## Modularise around intent, not resources

The mistake I see most often is a Terraform layout that mirrors the GCP API: one module per
resource type. That optimises for the platform team and punishes everyone else.

Instead, modularise around what teams actually ask for:

```hcl
module "service" {
  source  = "./modules/cloud-run-service"
  name    = "appointments-api"
  team    = "scheduling"
  image   = var.image
  # sensible, secure defaults baked in:
  # - private IP Cloud SQL connection
  # - least-privilege service account
  # - structured logging + trace export
}
```

A single `module "service"` block stands up Cloud Run, wires a least-privilege service account,
connects Cloud SQL over a private IP, and exports logs and traces. The consumer specifies
*intent* — a service for a team — not thirty individual resources.

## Guardrails belong in the module

A golden path is only golden if the safe choice is the default choice:

- **IAM**: modules mint scoped service accounts; nobody hand-edits project-level bindings.
- **Networking**: private IP by default, public egress opt-in and reviewed.
- **Tagging/labels**: `team`, `cost-center`, and `environment` are required variables — no label, no plan.

Because these are enforced in code, a misconfiguration is a failed `terraform plan`, not a
production incident discovered three weeks later.

## Delivery via GitOps

The modules are only half the story; delivery is the other half. Every change flows through a
pull request:

1. `terraform plan` runs in CI and posts the diff on the PR.
2. A reviewer approves the *plan*, not a vague description of it.
3. Merge to `main` triggers `terraform apply` through GitHub Actions (or Argo CD for the
   Kubernetes-shaped pieces).

The audit trail is the git history. "Who changed this and why" is answered by `git blame`.

## The result

Consolidating the environment into intent-shaped modules with guardrails and GitOps delivery
took provisioning from **~4 hours of manual work to under 45 minutes**, fully automated — an
80% reduction. Just as importantly, infrastructure support tickets dropped sharply, because the
common requests became self-service.

## Takeaways

- Shape modules around **team intent**, not the cloud provider's resource catalogue.
- Bake security defaults **into** the module so the safe path is the easy path.
- Deliver through **pull requests** so the plan is reviewed and the history is the audit log.
- Measure the thing that matters: **time-to-environment**, not lines of HCL.
