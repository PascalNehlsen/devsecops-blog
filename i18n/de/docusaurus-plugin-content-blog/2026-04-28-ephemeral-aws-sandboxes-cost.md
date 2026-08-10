---
title: "Ephemere AWS-Sandboxes: 80+ isolierte Umgebungen zum halben Preis"
slug: ephemeral-aws-sandboxes-cost
date: "2026-04-28"
authors: [pascal]
description: "n8n-Sandboxes pro Person auf burstable EC2, dimensioniert nach dem Median statt nach der Spitze, mit Lifecycle-Automatisierung, die untätige Instanzen einsammelt: 80+ echte Umgebungen zur Hälfte der Compute-Kosten."
keywords: [aws, ec2 burstable, cost optimization, ephemeral environments, terraform]
tags: [aws, cost, terraform, platform]
image: /img/og/de/ephemeral-aws-sandboxes-cost.png
---
# Ephemere AWS-Sandboxes: 80+ isolierte Umgebungen zum halben Preis

Allen Lernenden eine gemeinsame Umgebung zu geben ist billig und elend. Eine Person zerlegt sie,
und alle stehen. Allen eine feste, immer laufende Instanz zu geben ist sauber und teuer. Dieser
Beitrag handelt von einer dritten Möglichkeit: produktionsnahen Sandboxes pro Person auf AWS, die
auf Abruf hochkommen, sich selbst aufräumen und etwa die Hälfte dessen kosten, was fest
dimensionierte Instanzen kosten würden.

<!-- truncate -->

## Warum Isolation mehr zählt, als sie aussieht

Bei praktischer Automatisierungsarbeit, hier n8n-Sandboxes für Trainees, ist gemeinsamer State
Gift. Ein falsch konfigurierter Workflow, eine Endlosschleife, ein gelöschtes Credential: in
einer gemeinsamen Kiste ist das das Problem aller. Isolation bedeutet, dass der Fehler einer
Person ein Lernmoment ist und kein Ausfall für die ganze Kohorte.

Die Anforderung also: **80+ unabhängige, produktionsnahe Umgebungen**, jede wegwerfbar.

## Burstable Instanzen passen zur Nutzungsform

Das Nutzungsmuster ist stoßweise: intensive Aktivität während einer Session, den Rest der Zeit
fast Leerlauf. Genau dafür sind burstable Instanzen von AWS (`t3` / `t4g`) gebaut. Du zahlst
einen Grundwert und sammelst im Leerlauf CPU-Credits, die du in den Spitzen ausgibst.

Zwei Entscheidungen haben den Großteil der Kostenarbeit gemacht:

- **`t4g` (Graviton/ARM)** dort, wo die Workload architekturunabhängig ist, für das bessere Preis-Leistungs-Verhältnis.
- **Dimensionieren auf den Burst**, nicht auf die Spitze der Spitzen, weil Credits kurze Ausschläge auffangen.

Gegenüber fest dimensionierten, dauerhaft laufenden Instanzen auf Spitzenniveau lagen die
Compute-Kosten damit rund **50 % niedriger**.

## Lifecycle-Automatisierung ist das ganze Spiel

Ephemer spart nur Geld, wenn die Umgebungen tatsächlich verschwinden. Der Lebenszyklus ist
durchgehend automatisiert:

1. **Bereitstellen** auf Abruf aus einem Terraform-definierten Template: Instanz, Security Group,
   vorbereitetes n8n, getaggt mit `owner` und `expires-at`.
2. **Laufen** für die Session; isoliertes Netzwerk pro Sandbox.
3. **Einsammeln** automatisch: ein geplanter Job terminiert Instanzen nach ihrem `expires-at`,
   damit eine vergessene Sandbox nicht still eine Woche lang abrechnet.

```hcl
tags = {
  owner       = var.trainee_id
  purpose     = "n8n-sandbox"
  expires-at  = var.session_end   # consumed by the reaper
}
```

Das `expires-at`-Tag ist das Scharnier: es macht aus "bitte daran denken, sie abzuschalten"
einen garantierten, automatischen Abbau.

## Guardrails, damit eine Sandbox eine Sandbox bleibt

Isolation und Kostenkontrolle brauchen dieselbe Durchsetzungsdisziplin wie jede andere Umgebung:

- **Eng geschnittenes IAM** pro Sandbox, keine gemeinsame, überprivilegierte Rolle.
- **Egress-Grenzen**, damit aus einer Sandbox keine Krypto-Mining-Überraschung wird.
- **Hartes Ablaufdatum**, damit Kosten durch Konstruktion begrenzt sind und nicht durch Wachsamkeit.

## Das Ergebnis

Am Ende standen **80+ Trainees, jede und jeder mit einer isolierten, produktionsnahen
Umgebung**, auf Abruf bereitgestellt und automatisch eingesammelt, bei etwa **der Hälfte der
Compute-Kosten** fest dimensionierter Instanzen. Isolation war kein Luxus mehr, sondern der
billige Standard.

## Mitnehmen

- Passe den Instanztyp an die **Nutzungsform** an; stoßweise Arbeit liebt burstable Instanzen.
- Zieh **Graviton (`t4g`)** für architekturunabhängige Workloads in Betracht.
- Mach den Abbau **automatisch und tag-getrieben**. Ephemer, das nie abläuft, ist einfach teuer.
- Begrenze Kosten **durch Konstruktion** (hartes Ablaufdatum), nicht dadurch, dass Menschen daran denken.
