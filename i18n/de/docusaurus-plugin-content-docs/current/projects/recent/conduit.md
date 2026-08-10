---
id: conduit
title: Conduit ausrollen mit Docker Compose
sidebar_label: Conduit ausrollen
sidebar_position: 2
---


# Conduit ausrollen mit Docker Compose

## Inhalt

1. [Beschreibung](#beschreibung)
2. [Schnellstart](#schnellstart)
3. [Benutzung](#benutzung)
   - [Konfiguration](#konfiguration)

## Beschreibung

Dieses Repository baut mit Docker Compose eine Umgebung aus mehreren Containern auf, in der Conduit-Frontend und Conduit-Backend zusammen laufen.
Das Conduit-Frontend ist geforkt von <br /> [Developer-Akademie-GmbH/conduit-frontend](https://github.com/Developer-Akademie-GmbH/conduit-frontend), <br /> das Conduit-Backend von <br /> [https://github.com/Developer-Akademie-GmbH/conduit-backend](https://github.com/Developer-Akademie-GmbH/conduit-backend), beide als Submodule eingebunden.

Frontend und Backend sind containerisiert, und Docker Compose orchestriert ihren Betrieb, damit sie reibungslos zusammenarbeiten. Das ergibt eine gleichförmige, skalierbare Entwicklungsumgebung und macht es einfach, beide Anwendungen parallel zu betreiben.

## Schnellstart

### Voraussetzungen

Diese Werkzeuge müssen installiert sein:

- [Docker](https://www.docker.com/products/docker-desktop)

  - Docker Compose war in Docker 20.10 und später enthalten, ist es inzwischen aber nicht mehr standardmäßig. Bei aktuellen Docker-Versionen musst du Docker Compose als Plugin von Hand installieren. Die offizielle Anleitung beschreibt die Schritte.

- Für den Schnellstart des **Frontends** siehe die [README des Conduit-Frontends](https://github.com/Developer-Akademie-GmbH/conduit-frontend/blob/master/README.md)
- Für den Schnellstart des **Backends** siehe die [README des Conduit-Backends](https://github.com/Developer-Akademie-GmbH/conduit-backend/blob/master/README.md)

1. Repository klonen:

   ```bash
   git clone https://github.com/PascalNehlsen/conduit.git
   cd conduit
   ```

2. `example.env` nach `.env` kopieren:

   ```bash
   cp example.env .env
   ```

3. Submodule initialisieren

   ```bash
   git submodule update --init --recursive
   ```

4. Anwendung mit Docker Compose bauen und starten:

   ```bash
   docker-compose up --build -d
   ```

5. Anwendung aufrufen:

- Das **Frontend** sollte im Browser unter `http://localhost:8282` erreichbar sein.
- Das **Backend** sollte im Browser unter `http://localhost:8000/admin` erreichbar sein.

5. Zum Stoppen:
   ```bash
   docker-compose down
   ```

## Benutzung

Sobald die Anwendung läuft, kannst du über das **Backend** unter `http://localhost:8000` mit der Conduit-API arbeiten. Das **Frontend** spricht die API an, um Daten zu holen und anzuzeigen.

### Konfiguration

Für das Django-Projekt sind einige Umgebungsvariablen zu setzen. Hier die nötigen Werte für deine `example.env`:

| Variable                    | Beschreibung                                                                                 | Standardwert           |
| --------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| `DJANGO_SUPERUSER_USERNAME` | Benutzername des Django-Admin-Superusers.                                                    | admin                  |
| `DJANGO_SUPERUSER_EMAIL`    | E-Mail-Adresse des Django-Admin-Superusers.                                                  | admin@example.com      |
| `DJANGO_SUPERUSER_PASSWORD` | Passwort des Django-Admin-Superusers.                                                        | adminpassword          |
| `SECRET_KEY`                | Zentraler Sicherheitsschlüssel, den Django für kryptografisches Signieren nutzt.              | example.env#SECRET_KEY |
| `DEBUG`                     | Für die lokale Entwicklung auf True, um Debugging zu aktivieren.                              | False                  |
| `ALLOWED_HOSTS`             | Kommaseparierte Liste erlaubter Hostnamen oder IP-Adressen, die die Django-Seite bedienen darf. | 127.0.0.1, localhost   |
| `CORS_ALLOWED_ORIGINS`      | Liste erlaubter Origins für Cross-Origin-Anfragen.                                            | http://localhost:8282  |

---

**Repository:** [https://github.com/PascalNehlsen/conduit](https://github.com/PascalNehlsen/conduit)
