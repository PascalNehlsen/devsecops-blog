---
title: "An agent that writes production code needs a gate it cannot open"
slug: agent-gate-it-cannot-open
date: "2026-10-04"
authors: [pascal]
description: "I let Claude build and deploy n8n workflows against real calendars and mailboxes. The gates that keep that safe are a machine-checkable contract, a reviewer that cannot write, a forced failure before the real run, and a final node that proves the side effect. Then I counted my own acceptance log for the first time, and it found two holes in the gates."
keywords: [ai agents, agentic development, coding agents, guardrails, code review, least privilege, n8n, workflow automation, evaluation, platform engineering]
tags: [agents, devsecops, platform]
image: /img/og/agent-gate-it-cannot-open.png
---

# An agent that writes production code needs a gate it cannot open

I let Claude write workflows and deploy them to my n8n instance. Not suggestions I paste in by hand. Actual `workflow.json`, uploaded through a pipeline, running against real calendars, real mailboxes, real spreadsheets.

The thing I was afraid of was never bad code. Bad code fails loudly, usually on the first run, and you fix it.

<!-- truncate -->

What I was afraid of is **plausible** code. A workflow that looks right, reads right, passes a glance, and then quietly sends the same email twice. Or writes a row and reports success without ever checking that the row exists. Or treats an unexpected API response as "nothing to do" and goes green every single morning while doing nothing at all.

And here is the part nobody puts in the architecture diagram: after the fifth generated workflow, you stop reading carefully. The failure mode is not in the model. It is in the human who is supposed to catch the model, and who is bored.

So I stopped relying on myself as the gate.

## A contract, not a prompt

A prompt is advice. The agent may follow it, mostly does, and you find out when it did not by reading every line.

A contract is the set of rules something else can check. Mine is short:

- Code nodes throw only five error codes: `INVALID_INPUT`, `INVALID_AI_RESPONSE`, `TIMEOUT`, `UPSTREAM_UNAVAILABLE`, `CONFIG_ERROR`. Never a raw error string, never anything derived from the data that caused it.
- Every successful path ends in a `Verify Outcome` node that proves the side effect happened.
- Nodes that write (mail, sheets, CRM, any POST, PUT or DELETE) never get `retryOnFail`. Reads may.
- Every HTTP node has an explicit timeout.
- Secrets exist only as credential references. The workflow file holds an ID and a name, never a token.

A linter checks the checkable half before anything is uploaded: the retry and timeout rules, eight secret patterns, the execution settings (successful runs are not stored, failed ones are kept for diagnosis), and that every Verify node exists and can be forced to fail. That matters, but it is the floor, not the gate. A linter tells you the shape is legal. It cannot tell you the workflow calls someone twice.

## Separate by capability, not by instruction

"You must not deploy" in a system prompt is a wish.

The setup has two Claude skills that orchestrate (delivery and client onboarding) and three subagents with narrow jobs: a builder, a reviewer and an ops analyst. The builder writes `workflow.json`, a README and an `ops.json` into one folder and stops. The reviewer reads and runs the linter.

When I wrote the first draft of this post, the next sentence said the reviewer was read-only "because of its tool list, not because I asked nicely". Before publishing, I checked. Both agents had `Bash` in their tool list. A shell can write any file and call any CLI, including the one that deploys. The separation I was describing as structural lived entirely in the prompt, which is exactly the thing this section argues against.

The tool list cannot fix that on its own, because it only knows whole tools: `Bash` means every command, `Write` means every file. So the boundary moved into a hook that runs before every tool call of those two agents and fails closed:

```yaml
# .claude/agents/workflow-reviewer.md
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit, NotebookEdit
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: python3 "$CLAUDE_PROJECT_DIR/operations/tooling/agent_guard.py" reviewer
```

The reviewer may run exactly one command, the linter with `--no-write`, against a workflow folder. No chaining, no pipes, no substitution, no `..`. The builder has no shell at all, and may write only `workflow.json`, `README.md` and `ops.json` inside a workflow folder, after resolving symlinks. Anything the guard cannot parse is blocked. The guard has its own tests, mostly made of attempts to get around it.

The ops analyst and the onboarding skill still work on instructions alone. They were not first because they do not sit on the path to production; they are next.

And then the rule the whole thing rests on:

> The reviewer never reviews a workflow it built itself in the same session.

An agent reviewing its own output is a spellchecker, not a reviewer. It already believes the thing. It will find typos and miss the duplicate side effect, because the reasoning that produced the duplicate is still sitting in its context looking like good reasoning.

The reviewer gets the folder, the customer context, the trap list, and no memory of having written any of it. It returns a fixed shape, which doubles as the evidence a human reads before anything is activated:

```
VERDICT: PASS | FAIL
FINDINGS:
- <BLOCKER|MAJOR|MINOR> <node or file>: <finding>
UNPROVEN: <assumptions only a real test run can settle>
SUMMARY: <one line for the acceptance log>
```

`BLOCKER` is a privacy leak, a duplicate or wrong side effect, a secret in the file, or a workflow that will not activate. `MAJOR` is a wrong business result in a realistic case, a missing error response, or a Verify node that proves nothing. Either one fails the build, and the fix goes back through a fresh review. The verdict is logged as it came back, whether I like it or not.

## The order of the gates

1. **Plan.** Instrument, lint, print a diff with the values stripped out. Structure only, so a diff can never leak what it is diffing.
2. **Commit and CI.** Pre-commit runs gitleaks, the linter and the tests. CI runs them again, plus gitleaks over the full history. Green or stop.
3. **Apply.** The workflow is uploaded **inactive**, and the previous definition is backed up first. This is the draft pull request of the setup: the artifact exists in the target system and cannot do anything yet.
4. **Review.** The independent agent, as above.
5. **Test run, expecting failure.** A flag forces the Verify node to throw. The error must arrive on the dashboard with the expected code, on the expected node, linked to the execution.
6. **Test run, expecting success.** Real side effects happen. A real mail draft, a real row. I say beforehand what will be produced.
7. **Activate.** Refused unless the review and both test runs were logged after the last apply.

Step 5 before step 6 is deliberate, and it is the step most pipelines skip. The error path is the one nobody exercises. If your failure handling is broken, the default way to discover that is during an incident, when the thing that was supposed to tell you is the thing that is broken. Forcing a failure on purpose, while nothing is wrong, is cheap.

There are escape hatches, and pretending otherwise would be the same mistake as the tool list: `apply` accepts `--allow-dirty` and `--skip-ci-check`, `activate` accepts `--force`. Each one is written into the acceptance log next to the step it skipped. So far none has been used.

![The operations dashboard in demo mode with fictional customers. The second incident reads: last completed run failed, login rejected, node "Create Gmail draft", API error, HTTP 401, with a link that opens the execution in n8n.](/img/blog/agent-delivery/ops-dashboard-demo.png)

*The operations dashboard in demo mode, with fictional customers. It is German because the people it is built for are. What matters is the shape of the second incident: catalog code, node, cause, and a link to the execution. The forced failure in step 5 has to produce exactly that.*

## "No error" is not a result

The most common way automation lies to you: the run completed, no exception was thrown, the dashboard is green, and nothing happened.

So every successful path ends in a node whose only job is to assert the business outcome. Not "there was no error field". The actual thing: an ID came back, a row was written, the count matches.

The detail that makes this real is knowing what each node is **guaranteed** to return. Gmail and Calendar hand back a genuine ID, so demanding one is fair. The Google Sheets append node in the version I use mostly returns the mapped input rather than the API response, so asserting on an ID there would be a lie dressed as a check. The Verify node records which field served as evidence. In the voice assistant's real test run, that field came back empty, so today the Sheets path is proven by the node not throwing on an API error, and nothing more. It is on the open list, not in the success column.

The "nothing to do" path gets its own Verify node that returns zero. That sounds like bureaucracy and is not. "Nothing to do" is exactly where silent failures hide: an unknown response shape becomes an empty list, an empty list becomes "no work today", and "no work today" is indistinguishable from success for as long as you care to look away. So an unknown shape throws. Being wrong is recoverable. Being quietly wrong is not.

## Turning review friction into test design

Two things feed back into the system instead of into my memory.

The first is a file of traps found the hard way. Every time a node option turns out not to do what it says, it goes in there, and both agents read it before they start. The clearest case: a date window set through the Calendar node's own time options, which the node silently ignored. A test run of the morning briefing read 35 events from Monday to Friday while the workflow, and everyone reading it, assumed it was looking at today. The rule that came out of it is now part of the contract: business filters live in code with an explicit timezone, never in a node option whose effect is unproven.

The second is the reviewer's `UNPROVEN` list: the assumptions no amount of reading can settle, only a real run can. That list is carried into the success test and checked against the actual execution. Right day, right items, expected fields, or back to the build step. Technically green is not enough.

## What the log says, the first time I counted

Every gate writes a row into an acceptance log per workflow. I had collected those rows for weeks and never added them up. For this post I did, for the four workflows that went through the pipeline between 16 and 22 September.

| | |
|---|---|
| Workflows that passed their **first** review | 0 of 4 |
| Review verdicts logged | 12 (5 pass, 7 fail) |
| Workflows activated | 2 of 4 |
| Held back by a gate | 2 (one review fail, one failed success test) |
| CI runs on the repo, 16 to 23 September | 23 of 25 green |
| Escape hatches used | 0 |

The first row is the interesting one. Every first review failed, and not on style. The findings were exactly the plausible-code class from the top of this post: fetch errors that turned into a silent "nothing to do" success, a deduplication marker written before the mail was actually sent, a debounce that two triggers in the same window could both pass, which in that workflow meant two real phone calls, and a webhook path that never answered the caller waiting on the line.

The morning briefing is the one I would have shipped on gut feeling. It got through review after its findings were fixed, its forced failure arrived correctly, and then the success test saw no success event within the window. It is still inactive. That is the pipeline working, and I find it more convincing than any of the green rows.

Counting also found two problems in the measuring itself.

**Two reviews are missing.** Two workflows reach a review the log calls the "4th pass" with only two entries before it. The review ran; nobody logged it. Logging is a command the orchestrator has to remember to call, which means the rework rate I just reported is a lower bound.

**Two green error tests proved nothing.** The voice assistant's forced-failure test passed three times. Twice the event that satisfied it carried `UPSTREAM_UNAVAILABLE`, not the `INVALID_INPUT` the forced failure throws. The test runner waited for *an* error event and accepted the first one. A failure test that passes on any failure does not test the error path; it tests that something went wrong. It now asserts the code and the node, defaulting to `INVALID_INPUT` on a Verify node, overridable per workflow where the error is reported further down the path. Two of the seven green error tests in the log would fail today.

I would not have found either by reading the code. Both were visible within minutes of putting the rows next to each other.

## What I have still not measured

This is the honest part, and it is the part I would want to read if someone else wrote this.

**These are numbers, not a benchmark.** Four workflows, one week, one operator. They describe what happened, and they found two defects. They cannot tell me whether a change to the contract or the builder's instructions made things better.

**My reviewer is not truly independent.** Builder and reviewer are the same model. What differs is context and, now actually enforced, tool rights. That is real separation, and the table shows it catches real things. But I do not know the reviewer's true positive rate. The forced-failure test proves the workflow's error path. It proves nothing about whether the reviewer would have caught a defect I did not plant.

**The missing piece is a benchmark from real history.** A fixed set of past briefs with known-good outcomes, including the ones that failed first review, so a change can be scored instead of argued about. The interesting failures are rare and contextual, so ten synthetic briefs would measure the easy half and tell me a comfortable lie about the hard half. The seven failed verdicts above are the first real entries for that set. Their findings already say what a good review should catch.

What I have is a set of gates that make the system safe without proving how good it is. I think that is the right order: an unmeasured safe system is survivable, and a measured unsafe one is not. But the first count already paid for itself twice, and that is a strong argument for doing it continuously rather than for a blog post.

## The shape, without the n8n part

Swap workflows for pull requests, Terraform plans or database migrations and the pattern holds:

- a contract the agent must satisfy, written so a machine can check most of it
- a reviewer that is structurally incapable of being the builder, enforced where the tool call happens and not in the prompt
- an inactive landing zone, so the artifact exists before it can act
- a forced failure before the real run, asserting the specific failure, because the error path is the one nobody tests
- a final step that proves the side effect, instead of noting the absence of an error
- a log of every gate decision, and someone who actually counts it

None of that makes the agent better. It makes the agent's mistakes cheap and visible, which is a different goal and, for anything touching production, the more useful one.

The full setup, including what the example workflows do and where they fall short, is written up as a [project](/docs/projects/agent-delivery-pipeline).

---

*Scope, so nothing here reads bigger than it is: this runs on my own self-hosted n8n instance on Hetzner, with an operations dashboard I built for it running in Docker Compose behind nginx. The pipeline is multi-tenant by design and is currently exercised with my own workflows and demo tenants only.*
