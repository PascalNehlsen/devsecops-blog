---
title: "SLO-gesteuertes automatisches Rollback: die Metrik zieht die Reißleine"
slug: slo-driven-automated-rollback
date: "2026-03-24"
authors: [pascal]
description: "Prometheus, Grafana und strukturiertes Logging so in eine Deployment-Pipeline verdrahten, dass eine SLO-Verletzung das Rollback automatisch auslöst, und warum ein Rollback ohne SLO dahinter ein Knopf ist, dem niemand traut."
keywords: [slo, automated rollback, prometheus, grafana, deployment safety]
tags: [observability, cicd, devsecops]
image: /img/og/de/slo-driven-automated-rollback.png
---
# SLO-gesteuertes automatisches Rollback: die Metrik zieht die Reißleine

Ein Deploy, der um 02:00 die Produktion zerlegt, sollte nicht darauf warten, dass ein Mensch
aufwacht, ein Dashboard liest und sich für ein Rollback entscheidet. Wenn du *definieren*
kannst, was "kaputt" in Größen heißt, die dein Monitoring messen kann, dann kann die Pipeline
die Reißleine selbst ziehen. Dieser Beitrag geht durch, wie Observability so in das Deployment
verdrahtet wird, dass eine SLO-Verletzung ein automatisches Rollback auslöst.

<!-- truncate -->

## Fang mit einem SLO an, das du wirklich messen kannst

Ein automatisches Rollback ist nur so vertrauenswürdig wie das Signal, das es auslöst. Vage
Ziele ("die App soll schnell sein") funktionieren nicht. Konkrete, messbare SLOs schon:

- **Verfügbarkeit**: `>= 99,9 %` der Anfragen liefern kein 5xx, über ein 5-Minuten-Fenster.
- **Latenz**: `p95 < 300 ms` über ein 5-Minuten-Fenster.
- **Error Budget**: ein Burn-Rate-Schwellwert, der einen Ausschlag von einer Regression unterscheidet.

Daraus werden PromQL-Ausdrücke, keine Foliensätze:

```promql
# 5xx rate over the last 5 minutes, per service
sum(rate(http_requests_total{status=~"5..", service="appointments-api"}[5m]))
/
sum(rate(http_requests_total{service="appointments-api"}[5m]))
```

## Das Observability-Rückgrat

Drei Signale füttern die Entscheidung:

- **Prometheus** scrapt Request-Rate, Fehlerrate und Latenz-Histogramme.
- **Grafana** stellt sie dar und beherbergt die Alerting-Regeln, über die Menschen nachdenken.
- **Strukturiertes Logging** (JSON, mit `trace_id`) macht das *Warum* grabbar, sobald das *Was* feuert.

Die entscheidende Disziplin: dieselbe Query, die die Linie im Dashboard zeichnet, ist die, die
den Deploy absichert. Keine separate, wegdriftende "Rollback-Logik".

## Das Rollback-Gate

Nachdem ein Deploy eine neue Revision promoted hat, betritt die Pipeline ein **Bake-Fenster**,
sagen wir fünf Minuten, in dem sie die SLO-Queries beobachtet:

1. Neue Revision promoten, Traffic umlegen.
2. Die SLO-Ausdrücke über das Bake-Fenster hinweg pollen.
3. Verletzt ein SLO seinen Schwellwert (mit Burn-Rate-Schutz gegen Flattern), **Rollback
   auslösen** auf die letzte gute Revision.
4. Ein strukturiertes Event schreiben: Revision, verletztes SLO, beobachteter Wert, Zeitstempel.

Weil ein Rollback nichts anderes ist als "Traffic zurück auf die letzte als gut bekannte
Revision leiten", ist es schnell und langweilig, und genau das willst du um 02:00.

## Gegen Fehlalarme absichern

Automatisierung, die auf Rauschen zurückrollt, ist schlimmer als keine Automatisierung. Sie
zerstört Vertrauen. Zwei Absicherungen:

- **Burn-Rate statt Momentanwert**: ein einzelner Ausschlag soll nicht auslösen, anhaltender Verbrauch schon.
- **Mindest-Traffic-Schwelle**: rechne keine Fehler*rate* auf drei Anfragen.

## Das Ergebnis

Mit SLOs als messbare Queries und einem Rollback-Gate im Bake-Fenster blieb die
Deployment-Fehlerrate **unter 2 %**, und die mittlere Zeit bis zur Erkennung kritischer Fehler
fiel auf **unter fünf Minuten**, weil Erkennung und Behebung derselbe automatisierte Schritt
waren.

## Mitnehmen

- Definiere SLOs als **Queries, die dein Monitoring schon auswertet**, nicht als Prosa.
- Nutze **denselben Ausdruck** für das Dashboard und für das Rollback-Gate.
- Bau ein **Bake-Fenster** und **Burn-Rate-Schutz** ein, damit du auf Regressionen zurückrollst und nicht auf Rauschen.
- Ein gutes Rollback ist **schnell und langweilig**: Traffic auf die letzte gute Revision leiten.
