---
id: first-image
title: Erstes Docker-Image
sidebar_label: Erstes Docker-Image
sidebar_position: 2
---

# Das erste Docker-Image bauen

Das erste Docker-Image zu bauen wirkt am Anfang vielleicht einschüchternd, ist aber eine Grundfähigkeit, wenn man aus containerisierten Umgebungen etwas herausholen will. Diese Anleitung geht die Grundlagen durch, ein Image über ein `Dockerfile` zu erzeugen.

## Voraussetzungen

Bevor du anfängst, stelle sicher, dass Folgendes vorhanden ist:

- Docker: [Docker installieren](https://docs.docker.com/engine/install/), falls es noch nicht auf deinem System liegt.
- Ein grundlegendes Verständnis von Containern und Images ([fang hier an](./intro.md)).

## Schritt für Schritt: das erste Docker-Image

Wir bauen eine einfache Python-Anwendung und containerisieren sie.

1. Projektverzeichnis anlegen

   Lege ein Verzeichnis für die Anwendung an:

   ```bash
   mkdir my-docker-app
   cd my-docker-app
   ```

   Erstelle darin die folgenden Dateien:

   `app.py`

   ```bash
   # A simple Python application
   print("Hello, Docker!")
   ```

   `requirements.txt`

   ```bash
   # No dependencies for this simple example
   ```

2. Dockerfile schreiben

   Ein `Dockerfile` ist eine Textdatei mit den Anweisungen, aus denen ein Image zusammengesetzt wird. Ein einfaches Beispiel:

   `Dockerfile`

   ```bash
   # Use an official Python runtime as the base image
   FROM python:3.9-slim

   # Set the working directory inside the container
   WORKDIR /app

   # Copy the requirements file and install dependencies
   COPY requirements.txt ./
   RUN pip install --no-cache-dir -r requirements.txt

   # Copy the application code into the container
   COPY app.py ./

   # Define the command to run the application
   CMD ["python", "app.py"]
   ```

3. Image bauen

   Führe im Projektverzeichnis aus:

   ```bash
   docker build -t my-docker-app .
   ```

   Was dabei passiert:

   - `-t my-docker-app`: taggt das Image mit dem Namen my-docker-app.
   - `.`: bestimmt das aktuelle Verzeichnis als Build-Kontext.

4. Container starten

   Sobald das Image gebaut ist, erzeugst und startest du einen Container mit:

   ```bash
   docker run my-docker-app
   ```

   Die Ausgabe sollte lauten:

   ```bash
   Hello, Docker!
   ```

5. Image prüfen

   Um deine Images aufzulisten:

   ```bash
   docker images
   ```

   Du siehst dann etwas wie:

   ```bash
   REPOSITORY        TAG       IMAGE ID       CREATED         SIZE
   my-docker-app     latest    abc12345defg   1 minute ago    29MB
   ```

## Sicherheitsverbesserungen für Docker-Images

**Minimale Base-Images verwenden**: Ersetze allgemeine Base-Images durch minimale Varianten, um die Angriffsfläche zu verkleinern:

```Dockerfile
# Instead of python:3.9
FROM python:3.9-slim

# Or even better, use Alpine
FROM python:3.9-alpine

# For production, consider distroless
FROM gcr.io/distroless/python3
```

**Als Non-Root-Nutzer laufen**: Lege einen eigenen Nutzer an und verwende ihn, statt als root zu laufen:

```Dockerfile
FROM python:3.9-slim
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./

# Switch to non-root user
USER appuser

CMD ["python", "app.py"]
```

**Multi-Stage-Builds**: Trenne Build-Abhängigkeiten von der Laufzeit, um das Endimage klein zu halten:

```Dockerfile
# Build stage
FROM python:3.9 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.9-slim
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /root/.local /root/.local
COPY app.py .

ENV PATH=/root/.local/bin:$PATH

CMD ["python", "app.py"]
```

**Auf Schwachstellen scannen**: Bau das Security-Scanning in den Build-Prozess ein:

```bash
# Build image
docker build -t my-docker-app .

# Scan for vulnerabilities
trivy image my-docker-app

# Block deployment if critical vulnerabilities found
trivy image --severity CRITICAL --exit-code 1 my-docker-app
```

**Abhängigkeiten pinnen**: Nenne exakte Versionen in requirements.txt, damit Builds reproduzierbar sind:

```txt
flask==2.3.2
psycopg2==2.9.6
```

**.dockerignore nutzen**: Halte unnötige Dateien aus dem Build-Kontext heraus:

```text
.git
.gitignore
.env
.env.local
*.md
__pycache__
*.pyc
tests/
.vscode/
.idea/
```

**Health Checks ergänzen**: Damit Docker den Zustand des Containers überwachen kann:

```Dockerfile
FROM python:3.9-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')"

CMD ["python", "app.py"]
```

**Sinnvolle Labels setzen**: Metadaten für Nachvollziehbarkeit und Verwaltung:

```Dockerfile
LABEL maintainer="your.email@example.com"
LABEL version="1.0.0"
LABEL description="Python application"
LABEL org.opencontainers.image.source="https://github.com/user/repo"
```

**Layer-Caching ausnutzen**: Ordne Anweisungen von selten zu häufig wechselnd:

```Dockerfile
FROM python:3.9-slim
WORKDIR /app

# These change rarely, cache them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code changes frequently, copy last
COPY . .

CMD ["python", "app.py"]
```

## Zusammenfassung

**Security-Checkliste**:
- Minimale, konkrete Base-Images mit Versions-Tag verwenden
- Container als Non-Root-Nutzer laufen lassen
- Images vor dem Ausrollen auf Schwachstellen scannen
- Nie Secrets in Images legen
- Multi-Stage-Builds nutzen, um die Angriffsfläche zu verkleinern
- Health Checks für Verlässlichkeit einbauen
- Abhängigkeiten aktuell halten und pinnen
- .dockerignore nutzen, um sensible Dateien auszuschließen

**Image-Verwaltung**:
- Images mit semantischen Versionen taggen, nicht nur mit latest
- Images in private Registries mit Zugriffskontrolle pushen
- Signieren und Prüfen von Images aktivieren
- Images regelmäßig neu bauen, damit Sicherheitspatches einfließen
- Unbenutzte Images entfernen, das spart Platz und vermeidet Verwechslungen

**Testen**:
- Images vor Produktion in isolierten Umgebungen testen
- Ergebnisse der Security-Scans prüfen
- Funktion der Health Checks nachweisen
- Ressourcengrenzen und Beschränkungen testen
- Korrekte Nutzerrechte bestätigen
