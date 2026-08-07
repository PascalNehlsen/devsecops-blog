---
id: intro
title: Knowledge Base
sidebar_label: Knowledge Base
sidebar_position: 1
description: Teaching notes on containers, DevOps practice, Git and environment handling, written for the engineers I mentor and kept public because they are useful to more than them.
keywords: [docker, docker compose, devops, 12-factor, environment variables, teaching notes]
---

# Knowledge Base

These are teaching notes. I mentor engineers at Developer Akademie, and a page
lands here when I have had to explain something for the third time, or when I
want to point at one canonical answer instead of retyping it in a code review.

That makes the coverage uneven on purpose. Docker gets several pages because I
use it daily and because most of the Dockerfiles I review have the same three
problems. There is nothing at all on Kubernetes, because I don't run it.

If you want the applied version, with real numbers and real postmortems, that is in
the [blog](/blog) and the [project write-ups](/docs/projects/intro). This
section is the reference layer underneath.

## What's here

### [Containers](/docs/knowledge-base/Container/intro)

Concepts, building your first image, and Compose. The one I'd point a
colleague at is [**First Docker
Image**](/docs/knowledge-base/Container/first-image). It goes past
`FROM python:3.9` into non-root users, multi-stage builds, minimal base
images and where Trivy fits in the pipeline. Most Dockerfiles I review pick
up at least three findings from that page.

### [DevOps](/docs/knowledge-base/DevOps/intro)

Practice-level notes: [where Docker actually sits in a delivery
workflow](/docs/knowledge-base/DevOps/docker-in-devops), and [implementing
DevOps against the 12-Factor
principles](/docs/knowledge-base/DevOps/implementing-devops). The 12-Factor
page is the one I keep returning to: most "we need DevOps" conversations
turn out to be a config-in-the-code problem wearing a costume.

### [Git](/docs/knowledge-base/git/intro)

Branching and workflow. Deliberately short: Git basics are the
best-documented topic on the internet and I have nothing to add to them. The
security side (signed commits, scanning before the commit lands, what to do
when a key *is* pushed) is in [Git
Security](/blog/git-security-practices), which goes considerably deeper.

### [Environment variables](/docs/knowledge-base/env-vars/)

How to load them, and more importantly what not to put in them. Pairs with
[Secrets Management](/blog/secrets-management-done-right), which is the longer
argument for why `.env` files are a local-development convenience and not a
secrets strategy.

## Where I stand

A few positions that run through all of this, so you know what you are
reading:

- **A security check that only warns is not a check.** If a Semgrep finding
  can't block a merge, it will be ignored by the third sprint. Pick fewer
  rules and make them blocking.
- **Golden paths beat guardrail documents.** Nobody reads the wiki page about
  IAM. They do use the module that gets IAM right by default.
- **If you can't measure the rollback, you don't have one.** An automated
  rollback with no SLO behind it is a button nobody trusts enough to press.
- **Agents propose, humans approve.** I'll let a model read every log in the
  estate. It doesn't get to run `terraform apply`.

## What's missing

Honest gaps, so you don't go looking: Kubernetes, service meshes, and
anything about scale beyond a few dozen services. I work on platforms in the
tens-of-services range. I would rather have nothing here than have you find
out the hard way that a page was written from someone else's blog post
instead of from production.

import DocCardList from '@theme/DocCardList';

<DocCardList/>
