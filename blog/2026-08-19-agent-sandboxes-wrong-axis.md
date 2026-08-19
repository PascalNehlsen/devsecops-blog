---
title: "Everyone's comparing agent sandboxes on the wrong axis"
slug: agent-sandboxes-wrong-axis
date: "2026-08-19"
authors: [pascal]
description: "The Firecracker-vs-gVisor debate is about the isolation boundary — a wall that's largely solved. The security question that matters starts after the boundary holds. A new lab series on the security of autonomous AI agents once isolation is a given."
keywords: [agent security, ai agents, microvm sandbox, firecracker, gvisor, prompt injection, data exfiltration, egress]
tags: [agents, devsecops, containers]
image: /img/og/default.png
---
# Everyone's comparing agent sandboxes on the wrong axis

If you've looked into running AI agents safely, you've seen the comparison: Firecracker vs gVisor vs plain containers vs full VMs. microVMs boot in milliseconds, containers share the host kernel, gVisor sits in between; Firecracker powers a lot of it, and several products build sandboxes on top. The whole debate is about the isolation boundary — how hard is the wall between the agent and your host?

Here's what I keep running into: that wall is largely solved, and it's not where agents actually get dangerous.

<!-- truncate -->

A microVM boundary is genuinely strong. A compromised agent can't escape to the host or reach other sandboxes. Firecracker, Cloud Hypervisor and the products built on them do this well. If your fear is "the agent breaks out of the box," modern isolation has you covered — and Firecracker vs gVisor vs a microVM product is mostly a performance-and-compatibility decision, not a security one.

The security question that actually matters starts *after* the boundary holds. Because the agent isn't trying to break the wall — it's doing exactly what you asked, inside the box, with the network access, credentials and files you handed it. That's where it gets interesting:

- The agent can only reach hosts on your allow-list — but any allowed host is a potential exfiltration channel.
- The agent reads data — a README, a web page, an issue — and that data can carry instructions (indirect prompt injection).
- The safe-wrappers and egress rules you configured have gaps you can't see from the config alone.

None of these is fixed by choosing a "better" sandbox. They live inside the intact boundary.

So over the next few months I'm publishing a series from my own lab on exactly this: the security of autonomous AI agents once isolation is a given. Real experiments, honest results — including the ones that surprised me — on my own hardware and infrastructure, with coordinated disclosure for anything product-specific.

The first piece lands this week, and it's a good one: I tried to make an agent leak data out of a sandbox whose VM boundary never broke — and found that the thing standing between a poisoned file and your data leaving isn't the sandbox at all.

If you build with agents, follow along. The wall is not the weak point.
