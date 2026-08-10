---
id: docker-in-devops
title: Docker in DevOps
sidebar_label: Docker in DevOps
sidebar_position: 3
---

# Die Rolle von Docker in DevOps

## Einführung

[Docker](../Container/intro.md) hat verändert, wie Anwendungen gebaut, ausgeliefert und betrieben werden. Im DevOps-Umfeld ist es ein zentraler Hebel für Automatisierung, Gleichförmigkeit und Skalierbarkeit. Mit leichtgewichtigen, portablen Containern glättet Docker die Zusammenarbeit zwischen Entwicklung und Betrieb und nimmt Reibung aus dem Auslieferungszyklus.

Dieses Dokument geht durch, wo Docker in DevOps-Workflows sitzt, und nennt bewährte Praxis für den wirksamen Einsatz.

---

## Warum Docker in DevOps zählt

### Die Vorteile:

1. **Gleiches Verhalten über Umgebungen hinweg**:

   - Container sorgen dafür, dass Anwendungen in Entwicklung, Staging und Produktion gleich laufen.
   - "Auf meiner Maschine läuft es" wird zur Vergangenheit.

2. **Portabilität**:

   - Container laufen auf jeder Plattform, die Docker unterstützt (Linux, Windows, macOS).
   - Vereinfacht hybride und Multi-Cloud-Deployments.

3. **Ressourceneffizienz**:

   - Container teilen den Kernel des Hosts und sind damit leichter als virtuelle Maschinen.
   - Schnellere Startzeiten, weniger Overhead.

4. **Isolation**:

   - Jeder Container läuft in seiner eigenen isolierten Umgebung, was Sicherheit und Stabilität erhöht.

5. **Automatisierung und Skalierung**:
   - Docker fügt sich glatt in CI/CD-Pipelines und Orchestrierer wie Kubernetes ein.

---

## Docker im DevOps-Workflow

### 1. Entwicklung

- **Containerisierte Entwicklungsumgebungen**:

  - Mit Docker Compose lassen sich gleiche Umgebungen erzeugen.
  - Onboarding wird einfacher, weil eine vorbereitete `docker-compose.yml` geteilt wird.

- **Lokales Testen**:
  - Integrationstests laufen lokal in isolierten Containern.
  - Werkzeuge wie Testcontainers erlauben containerbasierte Integrationstests.

### 2. Continuous Integration (CI)

- Baue und teste Anwendungen in Containern, damit die Bedingungen gleich bleiben.
- Beispiel für einen CI-Ablauf:

  1. Code aus der Versionskontrolle holen.
  2. Image über ein `Dockerfile` bauen.
  3. Automatisierte Tests im Container ausführen.

- Werkzeuge:
  - Jenkins, GitHub Actions, GitLab CI/CD

### 3. Continuous Delivery (CD)

- Nutze Images als unveränderliche Artefakte für das Ausrollen.
- Rolle Container nach Staging und Produktion aus.

- Beispielwerkzeuge:
  - Kubernetes, Docker Swarm, Amazon ECS

### 4. Monitoring und Logging

- Sammle Container-Metriken mit Prometheus oder Grafana.
- Zentralisiere Container-Logs mit Fluentd oder dem ELK-Stack (Elasticsearch, Logstash, Kibana).

---

## Bewährte Praxis für Docker in DevOps

### 1. Effiziente Dockerfiles schreiben

- Nutze minimale Base-Images (etwa `alpine`).
- Nimm keine unnötigen Abhängigkeiten mit.
- Beispiel:
  ```Dockerfile
  FROM node:alpine
  WORKDIR /app
  COPY package.json .
  RUN npm install
  COPY . .
  CMD ["node", "app.js"]
  ```

### 2. Multi-Stage-Builds einsetzen

- Halte das Image klein, indem du Build- und Laufzeitstufe trennst.
- Beispiel:

  ```Dockerfile
  # Build stage
  FROM golang:alpine AS builder
  WORKDIR /app
  COPY . .
  RUN go build -o main .

  # Runtime stage
  FROM alpine
  WORKDIR /app
  COPY --from=builder /app/main .
  CMD ["./main"]
  ```

### 3. Docker Compose für mehrere Container nutzen

- Definiere Dienste, Netzwerke und Volumes in `docker-compose.yml`.
- Beispiel:
  ```yaml
  version: '3.8'
  services:
    app:
      build: .
      ports:
        - '3000:3000'
    db:
      image: postgres
      environment:
        POSTGRES_USER: user
        POSTGRES_PASSWORD: password
  ```

### 4. Docker-Setup absichern

- Halte Docker und Base-Images aktuell.
- Prüfe Container-Sicherheit mit Werkzeugen wie Docker Bench for Security.
- Beschränke Rechte im Container über `USER` im Dockerfile.

### 5. Orchestrierung nutzen

- Verwalte Container-Cluster mit Kubernetes, Docker Swarm oder Vergleichbarem.
- Automatisiere Skalierung, Lastverteilung und Fehlertoleranz.

---

## Docker-Werkzeuge in DevOps

| **Kategorie**    | **Beispielwerkzeuge**            |
| ---------------- | -------------------------------- |
| Images bauen     | Docker CLI, BuildKit             |
| Orchestrierung   | Kubernetes, Docker Swarm         |
| Monitoring       | Prometheus, Grafana              |
| Logging          | Fluentd, ELK Stack               |
| Security         | Trivy, Docker Bench for Security |

---

## Fazit

Docker spielt im DevOps-Umfeld eine tragende Rolle, weil es Gleichförmigkeit, Portabilität und Skalierbarkeit ermöglicht. Wer Docker in jede Phase des Workflows einbindet, glättet die Entwicklung, macht das Ausrollen effizienter und die Verlässlichkeit besser. Mit bewährter Praxis und den richtigen Werkzeugen wird es zu einem Werkzeug, auf das man in moderner Softwareentwicklung nur schwer verzichtet.

---

## Weiterlesen

- [Docker-Dokumentation](https://docs.docker.com/)
- [Kubernetes-Dokumentation](https://kubernetes.io/docs/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [12-Factor App](https://12factor.net/)
