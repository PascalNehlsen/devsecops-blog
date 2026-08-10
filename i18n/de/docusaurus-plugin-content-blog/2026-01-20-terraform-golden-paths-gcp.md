---
title: "Golden Paths auf GCP: 80 % weniger Provisioning-Zeit mit Terraform"
slug: terraform-golden-paths-gcp
date: "2026-01-20"
authors: [pascal]
description: "Wie das Modularisieren einer Google-Cloud-Umgebung entlang der Absicht der Teams statt entlang des Ressourcenkatalogs aus vier Stunden Handarbeit einen Self-Service-Pfad unter 45 Minuten gemacht hat."
keywords: [terraform, gcp, golden paths, platform engineering, cloud run, iam]
tags: [terraform, gcp, platform, cicd]
image: /img/og/de/terraform-golden-paths-gcp.png
---
# Golden Paths auf GCP: 80 % weniger Provisioning-Zeit mit Terraform

Am schnellsten bremst man ein Team aus, indem man es auf Infrastruktur warten lässt. Wenn jeder
neue Service vier Stunden Handarbeit in der GCP-Konsole bedeutet, sammeln Engineers ihre
Anfragen, wechseln währenddessen den Kontext und bauen still und leise Sonderfälle. Dieser
Beitrag handelt davon, dieses Ritual durch einen Golden Path zu ersetzen: einen geebneten,
meinungsstarken Weg, der eine produktionsnahe Umgebung in unter 45 Minuten bereitstellt, im
Self-Service.

<!-- truncate -->

## Was an "klick es einfach in der Konsole" nicht funktioniert

Manuelles Provisioning scheitert auf drei vorhersehbare Arten:

- **Es ist langsam.** Vier Stunden pro Umgebung, davon das meiste Warten und Klicken.
- **Es driftet.** Keine zwei Umgebungen werden identisch, und damit bedeutet "läuft in Staging" nichts mehr.
- **Es ist undurchsichtig.** Kein Review, keine Historie, keine Antwort auf "wer hat dieses IAM-Binding geändert und warum".

Infrastructure as Code behebt alle drei auf einmal, aber nur, wenn die Module so geschnitten
sind, dass die korrekte Verwendung der Weg des geringsten Widerstands ist.

## Modularisieren entlang der Absicht, nicht entlang der Ressourcen

Der Fehler, den ich am häufigsten sehe, ist ein Terraform-Layout, das die GCP-API abbildet: ein
Modul pro Ressourcentyp. Das ist auf das Platform-Team optimiert und bestraft alle anderen.

Modularisiere stattdessen danach, was Teams tatsächlich anfragen:

```hcl
module "service" {
  source  = "./modules/cloud-run-service"
  name    = "appointments-api"
  team    = "scheduling"
  image   = var.image
  # sensible, secure defaults baked in:
  # - private IP Cloud SQL connection
  # - least-privilege service account
  # - structured logging + trace export
}
```

Ein einziger `module "service"`-Block richtet Cloud Run ein, verdrahtet einen
Service-Account mit minimalen Rechten, verbindet Cloud SQL über eine private IP und exportiert
Logs und Traces. Der Aufrufer beschreibt *Absicht*, einen Service für ein Team, nicht dreißig
einzelne Ressourcen.

## Guardrails gehören ins Modul

Ein Golden Path ist nur dann golden, wenn die sichere Wahl die Standardwahl ist:

- **IAM**: Module erzeugen eng geschnittene Service Accounts; niemand editiert Bindings auf Projektebene von Hand.
- **Netzwerk**: private IP als Standard, öffentlicher Egress nur auf ausdrücklichen Wunsch und mit Review.
- **Labels**: `team`, `cost-center` und `environment` sind Pflichtvariablen. Kein Label, kein Plan.

Weil das im Code erzwungen wird, ist eine Fehlkonfiguration ein fehlgeschlagenes
`terraform plan` und kein Produktionsvorfall, der drei Wochen später auffällt.

## Ausrollen über GitOps

Die Module sind nur die halbe Geschichte, das Ausrollen ist die andere. Jede Änderung läuft
durch einen Pull Request:

1. `terraform plan` läuft in CI und hängt das Diff an den PR.
2. Ein Reviewer genehmigt den *Plan*, nicht eine vage Beschreibung davon.
3. Der Merge nach `main` löst `terraform apply` über GitHub Actions aus (oder Argo CD für die
   Kubernetes-artigen Teile).

Der Audit-Trail ist die Git-Historie. "Wer hat das geändert und warum" beantwortet
`git blame`.

## Das Ergebnis

Die Umgebung in Module entlang der Absicht mit Guardrails und GitOps-Auslieferung zu
konsolidieren hat das Provisioning von **rund 4 Stunden Handarbeit auf unter 45 Minuten**
gebracht, vollautomatisch: 80 % weniger. Genauso wichtig: die Support-Tickets für
Infrastruktur sind deutlich zurückgegangen, weil die häufigen Anfragen Self-Service wurden.

## Mitnehmen

- Schneide Module entlang der **Absicht der Teams**, nicht entlang des Ressourcenkatalogs des Cloud-Anbieters.
- Leg die Security-Defaults **ins** Modul, damit der sichere Pfad der einfache ist.
- Liefere über **Pull Requests** aus, damit der Plan geprüft wird und die Historie das Audit-Log ist.
- Miss das, worauf es ankommt: **Zeit bis zur Umgebung**, nicht Zeilen HCL.
