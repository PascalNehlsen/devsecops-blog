---
title: "Agentic DevOps Runbooks with a Human-Approval Layer"
date: "2026-02-18"
authors: pascal
description: "Building an MCP-based runbook executor where an LLM gathers context and proposes remediation, but every critical action is auditable, reversible, and requires explicit human approval."
tags: ["Agentic", "MCP", "Automation", "Go", "DevSecOps"]
---

# Agentic DevOps Runbooks with a Human-Approval Layer

"Let the AI fix it" is a great way to turn a small incident into a large one. But most of the
*toil* in incident response isn't the fix — it's the gathering: pulling logs, checking
deploy history, correlating metrics, reconstructing what changed. That part is safe to automate.
This post describes a runbook executor that automates the gathering and the *proposing*, while
keeping a human firmly in front of anything destructive.

<!-- truncate -->

## The design principle: propose, don't perform

The system splits every runbook step into two categories:

- **Read actions** — fetch logs, read Terraform state, list recent deployments, query metrics.
  These run automatically.
- **Write actions** — restart a service, roll back a release, scale a resource, change an IAM
  binding. These are *proposed* and require explicit approval before they execute.

The LLM lives in the read half and at the proposal boundary. It never holds the keys to a write.

## MCP as the integration surface

The executor is an [MCP](https://modelcontextprotocol.io/) server, written in Go, exposing a
small set of tools to the agent:

```
get_recent_deployments(service)      # read
get_logs(service, since, severity)   # read
get_terraform_state(module)          # read
propose_rollback(service, revision)  # write → queued for approval
propose_restart(service)             # write → queued for approval
```

Read tools return context. Write tools don't act — they enqueue a **proposal** with a
human-readable diff of what *would* happen, and return a ticket ID. Nothing changes in the world
until a human approves that ticket.

## Every critical action is auditable and reversible

Three properties are non-negotiable for a write action:

1. **Auditable** — who proposed it (which runbook, which agent run), who approved it, when, and
   the exact parameters. This is written to a durable log before execution.
2. **Reversible** — a rollback has a forward and a backward direction; the executor records
   enough state to undo it.
3. **Explicitly approved** — approval is a deliberate action by a named human, not a default or
   a timeout.

The approval step is where automation and accountability meet. The agent can be wrong; the
guardrail assumes it will be.

## What it actually buys you

For known failure classes — a bad deploy, a wedged worker, a config regression — the executor
collapses the slow part of the response. Instead of ten minutes of context-gathering under
pressure, the on-call engineer opens a proposal that already contains the logs, the diff, the
suspected cause, and a pre-filled remediation waiting for a yes/no.

In practice this cut response time for known failure classes by around **60%** — not by acting
faster than a human, but by removing the gathering a human would have done anyway.

## Takeaways

- Automate the **gathering and the proposal**; gate the **action** behind a human.
- Model write operations as **reversible proposals with a diff**, never fire-and-forget calls.
- Make **auditability a precondition** of execution, not an afterthought.
- The goal isn't autonomy — it's a faster, calmer human decision.
