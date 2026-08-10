---
id: implementing-devops
title: DevOps umsetzen
sidebar_label: DevOps umsetzen
sidebar_position: 2
---

# DevOps mit DevSecOps umsetzen (angelehnt an die 12-Factor-App-Prinzipien)

## Einführung

DevOps hat die Softwareentwicklung verändert, indem es die Silos zwischen Entwicklung und Betrieb aufgebrochen hat. DevSecOps führt das weiter und verankert Security über den gesamten Entwicklungszyklus (SDLC). Angelehnt an die Methodik der "12-Factor App" lassen sich DevSecOps-Praktiken an Prinzipien ausrichten, die Skalierbarkeit, Wartbarkeit und Sicherheit tragen.

Dieses Dokument beschreibt bewährte Praxis, Werkzeuge und Schritte, um DevOps mit Blick auf DevSecOps aus der Sicht von Entwicklerinnen und Entwicklern umzusetzen.

---

## Kernbegriffe

### Was ist DevSecOps?

DevSecOps bindet Security in DevOps-Abläufe ein und macht sie zur gemeinsamen Verantwortung aller Teams. Der Schwerpunkt liegt auf Automatisierung, Zusammenarbeit und vorausschauender Sicherheitsarbeit.

### Warum DevSecOps?

- **Risiken früher entschärfen**: Schwachstellen werden früher im SDLC behandelt.
- **Schnellere Auslieferung**: Automatisierte Prüfungen senken den Handaufwand.
- **Nachweisbare Compliance**: Regulatorische Anforderungen werden leichter einzuhalten.

### Die Brücke zu 12-Factor

Die 12-Factor-App-Methodik gibt Leitlinien für moderne, skalierbare Anwendungen. Jeder Faktor kann DevSecOps-Praxis prägen:

1. **Codebase**: Eine Codebasis unter Versionskontrolle halten.
2. **Dependencies**: Abhängigkeiten ausdrücklich deklarieren, damit Builds gleich bleiben.
3. **Config**: Konfiguration in der Umgebung ablegen, nicht im Code festschreiben.
4. **Backing Services**: Dienste wie Datenbanken als angehängte Ressourcen behandeln.
5. **Build, Release, Run**: Build- und Deploy-Stufen trennen.
6. **Processes**: Anwendungen als zustandslose Prozesse ausführen.
7. **Port Binding**: Dienste über Ports anbieten.
8. **Concurrency**: Über zusätzliche Prozesse skalieren.
9. **Disposability**: Schnell starten und sauber herunterfahren.
10. **Dev/Prod Parity**: Entwicklung, Staging und Produktion so ähnlich wie möglich halten.
11. **Logs**: Logs als Event-Streams behandeln.
12. **Admin Processes**: Administrative Aufgaben als einmalige Prozesse ausführen.

---

## Schritte zur Umsetzung von DevSecOps

### 1. Eine Security-First-Kultur aufbauen

- Bring dem Entwicklungsteam sicheres Programmieren bei.
- Zieh Sicherheitsfragen in die täglichen Standups und in Code-Reviews.

### 2. Sicherheitsprüfungen automatisieren

- **Abhängigkeiten**: Prüfe anfällige Bibliotheken mit Snyk oder OWASP Dependency-Check.
- **Statische Analyse**: Lass SAST-Werkzeuge wie SonarQube in der CI-Pipeline laufen.
- **Container-Scanning**: Prüfe Images mit Trivy auf Schwachstellen.

### 3. Nach links verschieben

- Nutze IDE-Plugins, die Sicherheitsprobleme direkt anmerken (etwa ESLint mit Security-Regeln).
- Ergänze Pre-commit-Hooks, die Sicherheitsvorgaben prüfen.

### 4. Continuous Integration und Continuous Delivery (CI/CD)

- Bau Sicherheitsprüfungen direkt in die CI-Pipeline ein:
  - SAST: Codeprobleme finden.
  - DAST: laufende Anwendungen auf Schwachstellen testen.
- Rolle in unveränderliche Umgebungen aus, damit die Bedingungen gleich bleiben.

### 5. Monitoring und Incident Response

- Bau Echtzeit-Monitoring mit Prometheus oder Grafana auf.
- Lass Anomalien automatisch alarmieren, etwa über Splunk.
- Übe die Incident-Response-Abläufe regelmäßig.

---

## Empfohlene Werkzeuge

| **Kategorie**        | **Beispielwerkzeuge**              |
| -------------------- | ---------------------------------- |
| SAST                 | SonarQube, Checkmarx               |
| DAST                 | OWASP ZAP, Burp Suite              |
| Dependency-Scanning  | Snyk, Dependabot                   |
| Container-Sicherheit | Aqua, Anchore, Trivy               |
| CI/CD-Einbindung     | Jenkins, GitHub Actions, GitLab CI |
| Monitoring           | Datadog, Splunk, Prometheus        |

---

## Bewährte Praxis

### 1. Zusammenarbeit fördern

- Arbeite im Pairing an Sicherheitsproblemen, während sie auftreten.
- Nutze gemeinsame Dashboards (etwa Grafana), um Security-Metriken zu verfolgen.

### 2. Infrastruktur absichern

- Nutze IaC-Werkzeuge mit eingebauten Sicherheitsprüfungen:
  - Terraform: Sentinel für Policy-Durchsetzung aktivieren.
  - Ansible: Konfigurationen mit InSpec prüfen.
- Härte CI/CD-Pipelines, indem du Zugriffe einschränkst und Secrets verwaltest.

### 3. Compliance as Code

- Setze Open Policy Agent (OPA) für automatische Compliance-Prüfungen ein.
- Baue wiederverwendbare Compliance-Vorlagen, um Pipelines zu prüfen.

### 4. Messen und verbessern

- Definiere handlungsleitende Kennzahlen wie:
  - mittlere Zeit bis zur Erkennung (MTTD),
  - mittlere Zeit bis zur Behebung (MTTR).
- Halte nach jedem Sprint eine Security-Retrospektive.

---

## Fallbeispiel: DevSecOps in der Praxis

**Firma X** hat Produktivität und Sicherheit verbessert, indem sie:

- Pre-commit-Hooks eingebaut hat, die Probleme vor dem Push finden,
- alle Docker-Images in der CI/CD-Pipeline mit Trivy scannt,
- Infrastruktur-Audits mit InSpec und Terraform automatisiert hat.

---

## Fazit

Wenn DevSecOps-Praxis an der 12-Factor-App-Methodik ausgerichtet wird, entstehen sichere, skalierbare und wartbare Anwendungen. Schon kleine, konkrete Schritte wie automatisierte Dependency-Scans und das Vorziehen von Sicherheitsprüfungen bringen deutliche Verbesserungen. Iteriere weiter, um auf neue Anforderungen und Technik zu reagieren.

---

## Weiterlesen

- [The Twelve-Factor App](https://12factor.net/)
- [OWASP DevSecOps Guide](https://owasp.org/www-project-devsecops-guideline/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [DevOps Handbook](https://itrevolution.com/book/devops-handbook/)

---
