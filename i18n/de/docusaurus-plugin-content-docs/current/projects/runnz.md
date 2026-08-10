---
id: runnz
title: "Runnz"
sidebar_label: "Runnz"
sidebar_position: 4
description: "Multi-tenant SaaS for trade-fair construction scheduling: reusable workflow blocks, deadlines derived from the build date, and a security pipeline that blocks rather than warns."
keywords: [multi-tenant saas, nestjs, typeorm, detect-secrets, pre-commit, ci security]
---

# Runnz

:::info[Live · login required]
[runnz.de](https://runnz.de). The repository is private; this write-up is the
artifact.
:::

## The problem

Trade-fair construction runs backwards from a date that cannot move. The hall
opens on a Tuesday, so the stand has to be built by Monday, which means the
freight leaves Thursday, which means the print files are locked the Friday
before, which means the customer approval has to land two weeks earlier. Miss
one link and the whole chain slips onto a fair that will not wait.

Most of the companies doing this plan it in a spreadsheet per project, and
rebuild the same chain of dependencies every time. The chain is nearly
identical between projects. What differs is the build date.

## The model

Two ideas carry the product.

**Workflow blocks.** A reusable unit of work carrying an offset relative to
the event rather than an absolute date, plus its own status chain. Technical
registration is 56 days before the event and moves through
`prüfen → anmelden → freigegeben → erledigt`. Booking the freight is 21 days
and runs `offen → angefragt → bestätigt → abgeschlossen`. The offset encodes
the scheduling rule and the chain encodes what "done" means for that
particular kind of work, which is not the same for a floor order as it is
for a power connection.

![Six reusable workflow blocks, each with its lead time in days before the event and its own status chain.](../assets/images/runnz/02-workflow-blocks.png)

Blocks apply to a project, and the concrete deadlines fall out of the event
date automatically. Move the date and the whole chain moves with it.

![Project edit view showing the automatically derived deadlines, with a note that they can still be adjusted by hand.](../assets/images/runnz/04-derived-deadlines.png)

Derived, not locked. The note under the computed dates says they can be
overridden later, which matters: the model is a default that is right most of
the time, not a constraint that fights the planner when a hall changes its
access times.

![Project overview: brief, progress, and the deadline list for a single trade fair.](../assets/images/runnz/03-project-detail.png)

**A year at a glance.** Exhibition companies run many projects with
overlapping crews and overlapping halls, so the calendar is the primary
interface, not a list. Each project renders as its run time plus separate
bars for setup and teardown, and the official windows the organiser dictates
are drawn apart from the ones the company plans itself. A planner sees in one
row where two fairs want the same crew in the same week.

![Year calendar for 2026: run time, official setup, setup and teardown drawn as separate bars per project across the whole year.](../assets/images/runnz/01-year-calendar.png)

Fourteen backend modules cover the surrounding domain: customers, employees
and their vacations, subcontractors, suppliers, file attachments, and the
task instances themselves. Thirty-two migrations, so the schema has been
through real change rather than being generated once.

Screenshots are from the staging environment with test data.

## Stack

| Layer | Choice |
| --- | --- |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Auth | JWT, bcrypt, role-based access control |
| Frontend | React 18, Vite, TypeScript, Tailwind, Zustand |
| Calendar / boards | FullCalendar, Hello Pangea DnD |
| Delivery | Docker, GHCR, nginx, staging and production pipelines |

## Security in the delivery path

This is the part worth reading, because it is the part most side projects
skip.

**Before the commit exists.** pre-commit runs `detect-secrets` against a
committed baseline, `detect-private-key`, a large-file guard, and
`no-commit-to-branch`. A credential has to get past a hook that runs on the
developer's machine before it can reach a remote.

**On every push.** A dedicated `security.yml` workflow runs three jobs:
`npm audit` on both workspaces with dev dependencies excluded, a
`detect-secrets` scan diffed against the baseline so only *new* findings
fail, and GitHub's dependency review on pull requests into `main`.

**On the way out.** Images build to GHCR and deploy over SSH. Staging and
production are separate pipelines, so the staging path is a real rehearsal
rather than a flag.

The `.env` file is not in the repository, which sounds like a low bar until
you check how many multi-tenant side projects clear it.

## What I would change

Two things, named because a project page that only lists strengths is an
advertisement.

**Tenant isolation is enforced in application code.** Every service method
takes a `tenantId` and every query filters on it. It works, and it is
readable, but the guarantee is only as strong as the discipline: one query
written without the filter is a cross-tenant read, and nothing structural
stops it. The stronger form is PostgreSQL row-level security, where the
database refuses the query rather than trusting the service to have asked
correctly. That is the migration I would do next, and it is the honest answer
when someone asks how isolation is enforced.

**The dependency audit is looser than its label.** The workflow step is named
"HIGH+" but runs `npm audit --audit-level=critical`, so high-severity
findings pass silently. A check whose name and behaviour disagree is worse
than no check, because it buys confidence it has not earned. It is a
one-word fix, and it is the kind of thing that only turns up when you read
your own pipeline as if someone else wrote it.
