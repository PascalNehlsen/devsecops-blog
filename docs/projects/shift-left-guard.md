---
id: shift-left-guard
title: "Shift-Left Guard"
sidebar_label: "Shift-Left Guard"
sidebar_position: 1.8
description: "A Claude Code mod that blocks insecure workflows, Dockerfiles, Terraform, Kubernetes, Compose files and agent configs before Claude writes them, keeps flagged shell writes out of Claude's commits, and puts destructive cloud commands to a human. Measured, not assumed."
keywords: [claude code, ai coding agents, guardrails, github actions, script injection, mcp, agent configuration, devsecops, shift left, evaluation]
---

# Shift-Left Guard

**Deterministic guardrails for Claude Code.** Claude writes the code; the guard
decides whether an insecure version of it ever reaches the disk or a commit.

:::info[Status · public repository, MIT]
[github.com/PascalNehlsen/shift-left-guard](https://github.com/PascalNehlsen/shift-left-guard),
installed with `/plugin install shift-left-guard --marketplace PascalNehlsen/shift-left-guard`.
Runs locally inside Claude Code: no network, no model calls, no API key. The
article [Claude noticed the injection every time. It still landed.](/blog/noticing-is-not-a-control)
covers how I measured it and the three holes the measurement found.
:::

![The band above the Claude Code prompt after a fix: "Shift-Left Guard: Claude fixed GHA003 in .github/workflows/greet.yml", with the removed line in red and the three added lines in green.](/img/blog/shift-left-guard/band-diff.png)

## What it does

- **Blocks before the write.** Every `Write` and `Edit` is computed as the file
  will look afterwards and scanned; findings at or above `high` refuse the call,
  and Claude reads each finding with a concrete fix. Only what the change
  introduces counts, so old issues never block.
- **Enforces after shell writes.** Files written by `cp`, `sed -i` or heredocs
  are scanned right after the command. Claude cannot `git commit`, `git push`
  or `gh pr create` while one of them still has its findings, and a command
  that writes and commits at once is sent back to be split.
- **Guards the agent's own configuration.** Wildcard shell permissions and
  `bypassPermissions`, unpinned `npx`/`uvx` MCP servers, tokens in `.mcp.json`,
  invisible characters and injected instructions in `CLAUDE.md`, hooks that
  pipe a download into a shell.
- **Puts destructive cloud commands to a human.** `terraform destroy`,
  `gcloud … delete`, `kubectl delete ns` and the like open a dialog with the
  project, namespace or bucket they hit and what undoing them takes, in every
  permission mode.
- **Same rules outside Claude.** A pre-commit hook, a dependency-free CLI for
  CI with SARIF output, `/guard audit` with a score, and team rules in
  `.guard.json`.

![A Claude Code transcript row: "Update(.github/workflows/greet.yml)", directly under it "🛡 fixed GHA003", then the diff with one removed and three added lines.](/img/blog/shift-left-guard/row-mark.png)

## Where each decision is enforced

| Who writes | How | When it is checked | Enforced by |
|---|---|---|---|
| Claude | `Write` / `Edit` | before the file changes | `tool.call` hook refuses the call |
| Claude | Bash (`cp`, `sed -i`, scripts) | right after the command | `tool.check` refuses Claude's commit and push while the file is still flagged |
| Claude | destructive cloud command | before it runs | the guard's own dialog; `deny` mode refuses outright |
| You | your editor | at `git commit` | pre-commit hook |
| Anyone | CI | on push or pull request | `guard-scan.mjs`, SARIF into code scanning |

## Rules

42 rules across GitHub Actions, Dockerfiles, Terraform (GCP, AWS, Azure),
Kubernetes and Helm values, Docker Compose, `package.json`, agent
configuration and secrets in any file, including Trojan Source characters
and `.env` files git does not ignore. Every rule has a fix text Claude can act
on and a "why" with its CWE for a learning mode. The full list is in the
[repository](https://github.com/PascalNehlsen/shift-left-guard/blob/main/docs/rules.md).

## Measured

| | Runs | Vulnerable result |
|---|---|---|
| Opus 5.5 copies the template, no guard | 10 | 2 on disk (noticed in 10) |
| Haiku 5.5 copies and commits, no guard | 5 | 5 committed |
| Haiku 5.5 copies and commits, with the guard | 5 | 0 committed |
| Scan of one file | | 0.1 to 1.3 ms |
| Changed-file check after a shell command, 30,000-file repository | | about 0.5 s, skipped for read-only commands |

False positives were tuned on nine open-source repositories. The
[evaluation page](https://github.com/PascalNehlsen/shift-left-guard/blob/main/docs/evaluation.md)
has every row, what the runs do not show, and the script to rerun them.

![Cloud guard dialog in Claude Code: "gcloud delete against PRODUCTION", the full command, "project: acme-prod", an undo hint, and Cancel preselected above Run it.](/img/blog/shift-left-guard/cloud-dialog.png)

## Built on

Claude Code's mod API: `tool.call` and `tool.check` hooks, a band above the
prompt, a findings pane and a rewritten transcript row, all in one
TypeScript module. 75 tests run against the engine's test kit on every pull
request, for terminal and desktop surfaces; CI also rebuilds the scanner
bundle, scans the repository with its own rules and runs zizmor on the
workflows.

## Known gaps

- Line-based rules, not parsers. Tuned for low noise, so some variants will
  not match.
- A file written by a shell command can stay on disk with its findings; the
  guard keeps it out of Claude's commits but does not repair it.
- A script that writes and commits internally is one program to the guard.
  The pre-commit hook covers that commit if it is installed.
- The evaluation is one task with five to ten runs per row.
