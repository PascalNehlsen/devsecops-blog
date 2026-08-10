---
id: intro
title: Einführung
sidebar_label: Einführung
sidebar_position: 1
---

# Einführung in DevOps

DevOps ist eine grundlegende Verschiebung darin, wie Software entwickelt, ausgerollt und betrieben wird. Indem es die klassischen Mauern zwischen Entwicklung und Betrieb abbaut, ermöglicht es kürzere Auslieferungszyklen, höhere Verlässlichkeit und bessere Zusammenarbeit.

## Kernprinzipien

**Continuous Integration und Continuous Delivery (CI/CD)**: Automatisiere das Zusammenführen von Codeänderungen, das Ausführen von Tests und das Ausrollen in Produktion. CI/CD-Pipelines senken manuelle Fehler, verkürzen Feedback-Schleifen und erlauben schnelle Iteration.

**Infrastructure as Code (IaC)**: Beschreibe und verwalte Infrastruktur über versionierten Code statt über Handarbeit. Werkzeuge wie Terraform, Ansible und CloudFormation machen Infrastruktur reproduzierbar und Disaster Recovery einfacher.

**Monitoring und Observability**: Baue Monitoring, Logging und Tracing so aus, dass Systemverhalten in Produktion verständlich wird. Prometheus, Grafana, der ELK-Stack und Jaeger geben Einblick in Performance, Ressourcennutzung und Fehlerzustände.

**Microservices-Architektur**: Zerlege monolithische Anwendungen in kleinere, unabhängig ausrollbare Dienste. Damit können Teams autonom arbeiten, Komponenten einzeln skalieren und je Dienst unterschiedliche Technologien verwenden.

## DevOps und Security zusammenbringen

Modernes DevOps muss Security von Anfang an mitdenken. Klassische Ansätze, die auf manuelle Reviews und Tests nach dem Ausrollen setzen, erzeugen Engstellen und erhöhen das Risiko. DevSecOps löst das so:

**Security in die Pipeline einbetten**: Automatische Security-Scans laufen bei jedem Build und finden Schwachstellen, bevor sie in Produktion landen. Dazu gehören statische Codeanalyse, Dependency-Scanning, Container-Image-Scanning und dynamische Anwendungstests.

**Unveränderliche Infrastruktur**: Rolle Infrastruktur als unveränderliche Artefakte aus, statt laufende Systeme zu verändern. Bei Aktualisierungen ersetzt du ganze Instanzen statt vor Ort zu patchen. Das reduziert Konfigurationsdrift und verbessert die Sicherheitslage.

**Zero-Trust-Architektur**: Nimm innerhalb des Netzwerkperimeters kein implizites Vertrauen an. Prüfe jede Anfrage, verschlüssele jede Verbindung und setze an jeder Servicegrenze starke Authentifizierung und Autorisierung.

**Shift Left beim Testen**: Zieh Testaktivitäten früher in den Entwicklungszyklus. Security-, Performance- und Integrationstests gehören in die Entwicklung und nicht in eine eigene Testphase am Ende.

## Die Werkzeugkette

**Versionskontrolle**: Git bietet verteilte Versionskontrolle für Quellcode, Konfiguration und Dokumentation. Branching-Strategien wie GitFlow oder trunk-based Development erlauben paralleles Arbeiten und kontrollierte Releases.

**Build-Automatisierung**: Jenkins, GitLab CI, GitHub Actions und CircleCI automatisieren Kompilieren, Testen und Erzeugen von Artefakten. Build-Pipelines sorgen für gleiche, wiederholbare Builds über alle Umgebungen.

**Artefaktverwaltung**: Lege Build-Artefakte versioniert in Repositories wie Nexus, Artifactory oder cloud-eigenen Diensten ab. So lässt sich jedes Deployment reproduzieren und bei Bedarf zurückrollen.

**Konfigurationsverwaltung**: Ansible, Puppet und Chef automatisieren Systemkonfiguration und erzwingen den gewünschten Zustand. Das senkt Handfehler und hält Umgebungen gleich.

**Container-Orchestrierung**: Kubernetes ist zum De-facto-Standard geworden und verwaltet Ausrollen, Skalieren und Betrieb containerisierter Anwendungen über Cluster hinweg.

**Observability-Stack**: Kombiniere Metriken (Prometheus), Logs (ELK/Loki) und Traces (Jaeger/Tempo), um verteilte Systeme wirklich einsehen zu können. Damit werden Fehlersuche und Kapazitätsplanung schnell.

## Kultur und Praxis

**Schuldfreie Postmortems**: Nach einem Vorfall geht es darum, das Systemversagen zu verstehen, nicht Schuld zu verteilen. Halte fest, was passiert ist, warum, und wie eine Wiederholung verhindert wird.

**Ständiges Lernen**: Plane Zeit für Experimente, neue Werkzeuge und Prozessverbesserung ein. DevOps verlangt fortlaufende Anpassung an sich ändernde Technik und Praxis.

**Zusammenarbeit und Kommunikation**: Reiß die Silos zwischen Teams ab. Entwicklerinnen und Entwickler sollten Betriebsfragen verstehen, und der Betrieb sollte Anwendungsarchitektur und fachliche Anforderungen kennen.

**Alles messen**: Definiere Kennzahlen (KPIs) und Service Level Objectives (SLOs), um Verlässlichkeit, Performance und fachliche Wirkung zu messen. Übliche Metriken sind Deployment-Frequenz, Vorlaufzeit für Änderungen, mittlere Wiederherstellungszeit (MTTR) und Fehlerrate von Änderungen.

import DocCardList from '@theme/DocCardList';

<DocCardList/>
