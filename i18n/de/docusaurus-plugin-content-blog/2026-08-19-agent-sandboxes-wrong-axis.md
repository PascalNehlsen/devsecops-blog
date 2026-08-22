---
title: "Alle vergleichen Agent-Sandboxes auf der falschen Achse"
slug: agent-sandboxes-wrong-axis
date: "2026-08-19"
authors: [pascal]
description: "Die Firecracker-vs-gVisor-Debatte dreht sich um die Isolationsgrenze, eine Wand, die weitgehend gelöst ist. Die Sicherheitsfrage, die zählt, beginnt erst danach. Eine neue Lab-Serie über die Sicherheit autonomer KI-Agenten, wenn die Isolation vorausgesetzt ist."
keywords: [agent security, ai agents, microvm sandbox, firecracker, gvisor, prompt injection, data exfiltration, egress]
tags: [agents, devsecops, containers]
image: /img/og/de/agent-sandboxes-wrong-axis.png
---
# Alle vergleichen Agent-Sandboxes auf der falschen Achse

Wenn du dich damit beschäftigt hast, KI-Agenten sicher zu betreiben, kennst du den Vergleich: Firecracker vs. gVisor vs. normale Container vs. volle VMs. microVMs booten in Millisekunden, Container teilen sich den Host-Kernel, gVisor liegt dazwischen; Firecracker treibt vieles an, und mehrere Produkte bauen ihre Sandboxes darauf. Die ganze Debatte dreht sich um die Isolationsgrenze: wie hart ist die Wand zwischen Agent und Host?

Was mir dabei immer wieder auffällt: Diese Wand ist weitgehend gelöst, und sie ist nicht der Ort, an dem Agenten tatsächlich gefährlich werden.

<!-- truncate -->

Eine microVM-Grenze ist wirklich stark. Ein kompromittierter Agent kommt nicht zum Host und nicht zu anderen Sandboxes. Firecracker, Cloud Hypervisor und die darauf gebauten Produkte können das gut. Wenn deine Sorge „der Agent bricht aus der Box aus" ist, hat dich moderne Isolation abgedeckt, und Firecracker vs. gVisor vs. microVM-Produkt ist meist eine Performance- und Kompatibilitätsentscheidung, keine Sicherheitsfrage.

Die Sicherheitsfrage, die wirklich zählt, beginnt *nachdem* die Grenze hält. Denn der Agent versucht gar nicht, die Wand zu brechen; er tut genau das, was du verlangt hast, innerhalb der Box, mit dem Netzzugang, den Credentials und den Dateien, die du ihm gegeben hast. Und da wird es interessant:

- Der Agent erreicht nur Hosts auf deiner Allow-List, aber jeder erlaubte Host ist ein potenzieller Exfiltrationskanal.
- Der Agent liest Daten (eine README, eine Webseite, ein Issue), und diese Daten können Anweisungen tragen (Indirect Prompt Injection).
- Die Safe-Wrapper und Egress-Regeln, die du konfiguriert hast, haben Lücken, die man der Config allein nicht ansieht.

Nichts davon löst man, indem man eine „bessere" Sandbox wählt. Es lebt innerhalb der intakten Grenze.

Deshalb veröffentliche ich über die nächsten Monate eine Serie aus meinem eigenen Lab zu genau dem: der Sicherheit autonomer KI-Agenten, wenn die Isolation vorausgesetzt ist. Echte Experimente, ehrliche Ergebnisse (auch die, die mich überrascht haben), auf eigener Hardware und Infrastruktur, mit coordinated disclosure für alles Produktspezifische.

Das erste Stück kommt diese Woche, und es hat es in sich: Ich habe versucht, einen Agenten dazu zu bringen, Daten aus einer Sandbox zu leaken, deren VM-Grenze nie gebrochen ist, und herausgefunden, dass das, was zwischen einer vergifteten Datei und deinen abfließenden Daten steht, gar nicht die Sandbox ist.

Wenn du mit Agenten baust, bleib dran. Die Wand ist nicht der Schwachpunkt.
