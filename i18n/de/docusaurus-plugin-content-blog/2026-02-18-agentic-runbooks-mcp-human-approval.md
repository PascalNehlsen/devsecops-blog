---
title: "Agentische DevOps-Runbooks mit menschlicher Freigabe"
slug: agentic-runbooks-mcp-human-approval
date: "2026-02-18"
authors: [pascal]
description: "Ein MCP-Server, der Incident-Kontext zusammenträgt, eine Behebung vorschlägt und dann stehen bleibt. Jede zustandsändernde Aktion braucht eine menschliche Freigabe, wird mit ihrer Begründung protokolliert und ist umkehrbar."
keywords: [mcp, agentic devops, runbook automation, human in the loop, on-call]
tags: [agents, devsecops, platform]
image: /img/og/de/agentic-runbooks-mcp-human-approval.png
---
# Agentische DevOps-Runbooks mit menschlicher Freigabe

"Lass die KI das reparieren" ist ein guter Weg, aus einem kleinen Vorfall einen großen zu
machen. Der *Aufwand* in der Incident-Bearbeitung liegt aber meist nicht in der Behebung. Er
liegt im Zusammentragen: Logs ziehen, Deploy-Historie prüfen, Metriken korrelieren,
rekonstruieren, was sich geändert hat. Dieser Teil lässt sich gefahrlos automatisieren. Dieser
Beitrag beschreibt einen Runbook-Executor, der das Zusammentragen und das *Vorschlagen*
automatisiert und bei allem Destruktiven einen Menschen davorstellt.

<!-- truncate -->

## Das Entwurfsprinzip: vorschlagen, nicht ausführen

Das System teilt jeden Runbook-Schritt in zwei Kategorien:

- **Lesende Aktionen**: Logs holen, Terraform-State lesen, letzte Deployments auflisten,
  Metriken abfragen. Diese laufen automatisch.
- **Schreibende Aktionen**: einen Service neu starten, ein Release zurückrollen, eine Ressource
  skalieren, ein IAM-Binding ändern. Diese werden *vorgeschlagen* und brauchen eine
  ausdrückliche Freigabe, bevor sie ausgeführt werden.

Das LLM lebt in der lesenden Hälfte und an der Grenze zum Vorschlag. Es hält nie die Schlüssel
für einen Schreibvorgang.

## MCP als Integrationsfläche

Der Executor ist ein [MCP](https://modelcontextprotocol.io/)-Server in Go, der dem Agenten
einen kleinen Satz Tools anbietet:

```
get_recent_deployments(service)      # read
get_logs(service, since, severity)   # read
get_terraform_state(module)          # read
propose_rollback(service, revision)  # write → queued for approval
propose_restart(service)             # write → queued for approval
```

Lesende Tools liefern Kontext. Schreibende Tools handeln nicht. Sie stellen einen **Vorschlag**
in die Warteschlange, mit einem für Menschen lesbaren Diff dessen, was passieren *würde*, und
geben eine Ticket-ID zurück. In der Welt ändert sich nichts, bis ein Mensch dieses Ticket
freigibt.

## Jede kritische Aktion ist prüfbar und umkehrbar

Drei Eigenschaften sind bei einer schreibenden Aktion nicht verhandelbar:

1. **Prüfbar**: wer sie vorgeschlagen hat (welches Runbook, welcher Agent-Lauf), wer sie
   freigegeben hat, wann, und mit exakt welchen Parametern. Das wird vor der Ausführung
   dauerhaft protokolliert.
2. **Umkehrbar**: ein Rollback hat eine Vorwärts- und eine Rückwärtsrichtung; der Executor
   speichert genug State, um ihn rückgängig zu machen.
3. **Ausdrücklich freigegeben**: die Freigabe ist eine bewusste Handlung eines namentlich
   bekannten Menschen, kein Default und kein Timeout.

Der Freigabeschritt ist die Stelle, an der Automatisierung und Verantwortung
zusammenkommen. Der Agent kann falsch liegen; das Guardrail geht davon aus, dass er es wird.

## Was das tatsächlich bringt

Bei bekannten Fehlerklassen (ein schlechter Deploy, ein festgefahrener Worker, eine
Config-Regression) kürzt der Executor den langsamen Teil der Reaktion weg. Statt zehn Minuten
Kontextsammeln unter Druck öffnet die Person im Bereitschaftsdienst einen Vorschlag, der die
Logs, das Diff, die vermutete Ursache und eine vorbereitete Behebung schon enthält und auf ein
Ja oder Nein wartet.

In der Praxis hat das die Reaktionszeit bei bekannten Fehlerklassen um rund **60 %** verkürzt,
und zwar nicht, weil etwas schneller handelt als ein Mensch, sondern weil das Zusammentragen
wegfällt, das ein Mensch ohnehin gemacht hätte.

## Mitnehmen

- Automatisiere das **Zusammentragen und den Vorschlag**; setze vor die **Aktion** einen Menschen.
- Modelliere Schreiboperationen als **umkehrbare Vorschläge mit Diff**, nie als Fire-and-Forget-Aufruf.
- Mach **Prüfbarkeit zur Vorbedingung** der Ausführung, nicht zum Nachgedanken.
- Das Ziel ist nicht Autonomie. Es ist eine schnellere, ruhigere menschliche Entscheidung.
