---
id: conduit-pipeline
title: Conduit-Pipeline mit GitHub Actions
sidebar_label: Conduit-Pipeline
sidebar_position: 1
---


# Conduit-Pipeline mit GitHub Actions

Dieses Repository baut auf [diesem Conduit-Projekt](./conduit.md) auf und ergänzt eine CI/CD-Pipeline.

Die Pipeline in GitHub Actions automatisiert das Klonen des Repositories, das Bauen der Docker-Images und das Ausrollen der Anwendung auf einen entfernten Server per Docker Compose.

## Inhalt

1. [Auslöser](#auslöser)
2. [Überblick](#überblick)
3. [Schritte im Build-Job](#schritte-im-build-job)
4. [Schritte im Deploy-Job](#schritte-im-deploy-job)
5. [Benötigte Secrets](#benötigte-secrets)

## Auslöser

Der Workflow startet unter diesen Bedingungen:

1. `Manuell (workflow_dispatch)`: Der Workflow kann im GitHub-Actions-Dashboard von Hand gestartet werden.

2. `Push auf den main-Branch`: Ein Commit auf main startet den Workflow automatisch.

3. `Workflow-Aufruf`: Der Workflow kann aus anderen Workflows aufgerufen werden und braucht dann bestimmte Secrets:

   - `SSH_PRIVATE_KEY`: der private SSH-Key für den Zugriff auf den entfernten Server.
   - `REMOTE_HOST`: IP-Adresse oder Hostname des entfernten Servers.
   - `REMOTE_USER`: Benutzername auf dem entfernten Server.
   - `TARGET`: Zielverzeichnis auf dem entfernten Server, in das die Dateien geladen werden.

## Überblick

Der Workflow besteht aus zwei Jobs (auf Basis bestehender GitHub Actions):

1. **Build-Job**: baut die Docker-Images für Frontend und Backend und pusht sie in eine Registry, hier die GitHub Container Registry.

2. **Deploy-Job**: rollt die Anwendung auf den entfernten Server aus. Die nötigen Artefakte (`.env`, `docker-compose.yaml`) werden übertragen, und die Anwendung wird dort per Docker Compose gestartet.

## Schritte im Build-Job:

- Repository klonen mit [actions/checkout](https://github.com/actions/checkout/tree/v4/), um den aktuellen Code zu holen
- Docker Buildx einrichten mit [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action/tree/v3.8.0/) für erweiterte Build-Funktionen
- An GHCR anmelden mit [docker/login-action](https://github.com/docker/login-action/tree/v3.3.0/)
- Metadaten ziehen mit [docker/metadata-action](https://github.com/docker/metadata-action/tree/v5.6.1/)
- Die `.env` aus der `example.env` des Repositories erzeugen
- Frontend- und Backend-Image bauen und pushen mit [docker/build-push-action](https://github.com/docker/build-push-action/tree/v6.12.0/)
- Deployment-Artefakte hochladen mit [actions/download-artifact](https://github.com/actions/upload-artifact/tree/v4.6.0/) (`.env` und `docker-compose.yaml`)

## Schritte im Deploy-Job:

- Repository klonen mit [actions/checkout](https://github.com/actions/checkout/tree/v4/), um den aktuellen Code zu holen
- Deployment-Artefakte herunterladen mit [actions/download-artifact](https://github.com/actions/download-artifact/tree/v4.1.8/)
- Dateien per SCP übertragen mit [appleboy/scp-action](https://github.com/appleboy/scp-action/tree/v0.1.7/), um `.env` und `docker-compose.yaml` auf den Server zu kopieren
- Ausrollen per SSH mit [appleboy/ssh-action](https://github.com/appleboy/ssh-action/tree/v1.2.0/):
  - alte Container stoppen: `docker compose down --remove-orphans`
  - unbenutzte Ressourcen aufräumen: `docker system prune -af`
  - Container starten: `docker compose up -d`

## Benötigte Secrets:

- `SSH_PRIVATE_KEY`: privater SSH-Key für die Anmeldung am entfernten Server.
- `REMOTE_HOST`: IP-Adresse oder Domain des entfernten Servers.
- `REMOTE_USER`: Benutzername für den Zugriff auf den Server.
- `TARGET`: Zielverzeichnis auf dem Server, in das ausgerollt wird.
- `GHCR_PAT`: ein GitHub Personal Access Token für die Anmeldung an der GitHub Container Registry.

---

**Repository:** [https://github.com/PascalNehlsen/conduit](https://github.com/PascalNehlsen/conduit)
