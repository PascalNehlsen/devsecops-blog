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

**Workflow blocks.** A reusable unit of work with an offset relative to the
build date rather than an absolute date. "Lock print files, minus 21 days."
Blocks compose into a template, a template is applied to a project, and the
concrete task dates fall out of the build date automatically. Move the build
date and every derived deadline moves with it.

**A year at a glance.** Exhibition companies run many projects with
overlapping crews and overlapping halls, so the calendar is the primary
interface, not a list. Setup and teardown windows are grouped so a planner
can see where two projects want the same people in the same week.

Fourteen backend modules cover the surrounding domain: customers, employees
and their vacations, subcontractors, suppliers, file attachments, and the
task instances themselves. Thirty-two migrations, so the schema has been
through real change rather than being generated once.

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
