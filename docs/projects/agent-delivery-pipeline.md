---
id: agent-delivery-pipeline
title: "Agent Delivery Pipeline"
sidebar_label: "Agent Delivery Pipeline"
sidebar_position: 1.5
description: "Gated delivery for agent-generated n8n workflows: a machine-checkable contract, builder and reviewer agents whose rights are enforced by hooks, a forced failure before the real run, and an acceptance log that is actually counted."
keywords: [ai agents, agentic development, guardrails, least privilege, code review, n8n, workflow automation, evaluation, platform engineering]
---

# Agent Delivery Pipeline

**Gated delivery for agent-generated n8n workflows.** An AI agent writes the
workflow; the pipeline decides whether it is ever allowed to run.

:::info[Status · private repository]
Running on my own self-hosted n8n instance. Multi-tenant by design, currently
exercised with my own workflows and demo tenants only. The repository is private
because it holds customer scaffolding; the article
[An agent that writes production code needs a gate it cannot open](/blog/agent-gate-it-cannot-open)
walks through the design and the first measurement.
:::

## What it is

A delivery pipeline for workflows written by an AI agent. The agent produces an
n8n `workflow.json`. Before that file can touch a real calendar, mailbox or
spreadsheet, it has to pass a contract, an independent review, a forced failure
and a real success run, and every one of those decisions lands in an acceptance
log next to the workflow.

Two Claude skills orchestrate, three subagents do narrow jobs. The column that
matters is the last one: where the boundary is actually enforced.

| Role | Kind | May | May not | Enforced by |
|---|---|---|---|---|
| `workflow-delivery` | skill | run the twelve-step flow and the deploy tool | skip a step, change a verdict | the deploy tool's preconditions |
| `client-onboarding` | skill | create tenant isolation, error handler, ingest token | touch business workflows | instructions only |
| `workflow-builder` | agent | write `workflow.json`, `README.md`, `ops.json` in one workflow folder | run any shell command, deploy, write anywhere else | tool list without `Bash` + `PreToolUse` hook on every write |
| `workflow-reviewer` | agent | read, grep, run the linter with `--no-write` | write anything, run any other command | `Write`/`Edit` disallowed + `PreToolUse` hook on every shell call |
| `ops-analyst` | agent | read the dashboard, categorise incidents, draft the monthly assessment | change anything | instructions only: it still has a shell |

Until this month the builder and reviewer rows said "instructions only" too:
both agents had a shell, and the limits lived in the prompt. They were first
because they sit on the path to production. The two rows that still say it are
the next ones to move. The hook that replaced
them fails closed and is tested mostly with attempts to get around it: chaining,
pipes, command substitution, `..`, symlinks out of the repository, malformed
input.

## The gates

```
build → plan → commit → CI → apply (inactive) → independent review
      → test run, expect error → test run, expect success → activate
```

- **Plan** instruments the workflow, lints it and prints a diff with every value
  replaced by a digest, so the diff can never leak what it is diffing.
- **Commit and CI.** Pre-commit runs gitleaks, the linter and the tests; CI
  repeats them and scans the full history.
- **Apply** refuses an uncommitted folder or red CI, backs up the live
  definition, then uploads **inactive**: the artifact exists in the target system
  before it can act.
- **Review** by the reviewer agent, which never reviews a workflow it built in the
  same session. Its output is a fixed shape: verdict, findings by severity, the
  assumptions only a real run can prove, one summary line for the log. A
  `BLOCKER` or `MAJOR` finding sends the workflow back to the build step and
  requires a fresh review.
- **Test run, expect error** sets a flag that makes the Verify node throw. The
  run passes only if the dashboard receives the expected catalog code on the
  expected node. Until this month it accepted any error event; counting the log
  showed why that was not good enough.
- **Test run, expect success** produces real side effects, announced beforehand,
  and is checked against the reviewer's list of unproven assumptions.
- **Activate** refuses unless the review and both test runs were logged after the
  last apply.

The escape hatches (`--allow-dirty`, `--skip-ci-check`, `--force`) exist and are
written into the acceptance log when used. In the logs so far, they never were.

## The contract

Enforced partly by the linter, partly by the reviewer:

- five error codes only, never raw messages, never data in a message
- every successful path ends in a `Verify Outcome` node asserting the real side
  effect (IDs returned, rows written, counts), relying only on fields the node is
  guaranteed to return
- the "nothing to do" path has its own Verify node returning zero, so a silent
  fallthrough cannot pass as success
- writers never retry; reads may
- every HTTP node has a timeout
- secrets exist only as credential references, never in the workflow file
- duplicate protection: gate checked immediately before the side effect, marker
  set immediately after it
- business filters live in code with an explicit timezone, not in node options
  whose effect is unproven

The last rule came from a trap file both agents read before they start. Every
node option that turned out not to do what it says is in there, with the commit
or execution that proved it.

## First measurement

Four workflows went through the pipeline between 16 and 22 September 2026.
Counted from their acceptance logs:

| | |
|---|---|
| Passed their first review | 0 of 4 |
| Review verdicts logged | 12 (5 pass, 7 fail) |
| Activated | 2 of 4 |
| Held back by a gate | 2 |
| CI runs, 16 to 23 September | 23 of 25 green |
| Escape hatches used | 0 |

Every first-review failure was a real defect of the plausible kind: fetch errors
turning into a silent no-op success, a dedup marker written before the send, a
debounce two triggers could pass at once, a webhook path that never answered.
The count also found two defects in the measurement itself: two reviews that ran
but were never logged, and two "passed" error tests that had accepted the wrong
error. Both are fixed or written down in the article. Four workflows is a
baseline, not a benchmark.

## Operations

![The operations dashboard in demo mode with fictional customers: run counts, success rate, error codes over 24 hours, incident causes over 90 days, and an open incident showing the catalog code, the failing node and a link to the execution in n8n.](/img/blog/agent-delivery/ops-dashboard-demo.png)

Self-hosted n8n on Hetzner. The operations dashboard runs in Docker Compose
behind nginx, in a read-only container without capabilities, bound to localhost.
It receives start, success and failure events per workflow and execution: only
technical IDs, status, timing, node names and catalog codes, never message
content or tokens. Failed runs and missing success reports become incidents.
Closing one requires a cause (credential expired, upstream outage, configuration
error, customer data quality, workflow bug, customer changed the process,
unknown) and a measure. The overview shows 24-hour error codes and the causes of
incidents closed in the last 90 days. A self-test checks the monitoring path
every five minutes.

Tenants are separated by tag, name prefix, their own error handler and their own
ingest token. Onboarding verifies the separation by checking that a wrong token
and another tenant's workflow are both rejected.

## Example workflows

**Voice tool hub (active).** The back channel of a phone assistant. It may call
four tools and no others, and validates every argument before anything is
written. Nothing it creates is final: mail becomes a Gmail draft and never a
send, an invoice becomes a draft row in a sheet shaped like the accounting
system's API, notes become rows, and appointments become calendar entries
marked `[per Telefon]`. Every tool request is answered, including on every
error path. If the assistant sends two tool calls in one message, only the first
is processed, so the assistant's own prompt forbids parallel calls. The post-call debrief branch has no such net, deliberately,
because nobody is waiting on the line by then. The calendar tool has not yet
been exercised in a real run, and the proof for the two sheet tools is weaker
than for mail and calendar, because the sheet node returns no ID to check.

**Morning briefing (held back).** Starts a phone call when I get into the car
and reads out the day's appointments and the most important unread mail. It
sends sender, subject, a 200-character snippet and appointment locations to
the language model and the voice provider, so it is not a metadata-only
workflow, and the README says so. A debounce allows one call per day; a second
check asks the telephony provider's own API immediately before dialling, because
local state is written too late to stop a parallel trigger. A window of one to
three seconds remains, documented as an accepted risk. It passed review after
several rounds of findings, its forced failure arrived correctly, and its success
test did not. It is still inactive, which is the pipeline doing its job. Even a
green run would only prove that the provider accepted the call, not that the
phone rang, and the README says that too.

**CVE digest (active).** A daily mail of new vulnerabilities for the stack I
run, ranked by known exploitation first, then severity and exploit probability.
Its first review found that seen IDs were stored before the mail was sent and
that an upstream outage would have looked like a quiet day.

## Known gaps

- Builder and reviewer are the same model. The separation is context and
  enforced tool rights, not a different system.
- Review logging depends on the orchestrator calling the log command; two
  reviews were run and never logged.
- There is no benchmark of historical briefs to score changes against. The
  failed first reviews are the first entries for one.
- The sheet tools' success proof is "the node did not throw", not a returned ID.

## Scope

Runs on my own instance. Multi-tenant by design, currently exercised with my
own workflows and demo tenants only. No paying customer runs on it, and the
delivery process requires a signed data processing agreement before one can.
