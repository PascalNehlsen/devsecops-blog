---
id: docker-compose
title: Docker Compose
sidebar_label: Docker Compose Grundlagen
sidebar_position: 3
---

# Anwendungen mit mehreren Containern per Docker Compose vereinfachen

Je komplexer eine Anwendung wird, desto häufiger braucht man mehrere Dienste in getrennten Containern, etwa Datenbank, Backend und Frontend. Diese Dienste von Hand mit `docker run` zu verwalten wird schnell unübersichtlich. Genau dafür gibt es Docker Compose.

## Was ist Docker Compose?

Mit Docker Compose beschreibst und verwaltest du Anwendungen aus mehreren Containern über eine einzige YAML-Datei. Damit kannst du:

- alle Dienste, Netzwerke und Volumes in einer Datei definieren (`docker-compose.yml`),
- alle Container mit einem Befehl starten,
- Dienste ohne Aufwand hoch- und runterskalieren.

## Ein einfaches Beispiel: Web-App mit Datenbank

Wir setzen eine Python-Webanwendung mit PostgreSQL-Datenbank per Docker Compose auf.

1. Projektstruktur

```bash
my-docker-compose-app/
├── app/
│   ├── app.py
│   ├── requirements.txt
├── docker-compose.yml
```

`app.py`

```bash
from flask import Flask
import psycopg2

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello from Flask with PostgreSQL!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
```

`requirements.txt`

```bash
flask
psycopg2
```

2. Die `docker-compose.yml` schreiben

```bash
services:
  web:
    build:
      context: ./app
    ports:
      - "5000:5000"
    volumes:
      - ./app:/app
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydatabase
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

3. Anwendung bauen und starten

Führe im Projektverzeichnis aus:

    1. Anwendung bauen und starten:

    ```bash
    docker-compose up --build
    ```

    2. Web-App aufrufen:

    Öffne `http://localhost:5000` im Browser.

4. Wichtige Befehle

- Dienste starten: docker-compose up
- Dienste stoppen: docker-compose down
- Logs ansehen: docker-compose logs
- Dienste skalieren: docker-compose up --scale web=3

## Bewährte Sicherheitspraxis für Docker Compose

**Secrets-Verwaltung**: Schreibe sensible Werte niemals fest in `docker-compose.yml`. Nutze Umgebungsvariablen, `.env`-Dateien (nicht in die Versionskontrolle) oder für Produktion Docker Secrets:

```yaml
services:
  web:
    environment:
      - DATABASE_PASSWORD=${DB_PASSWORD}

  db:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

**Netzwerkisolation**: Lege eigene Netzwerke an, um Dienste zu trennen. Frontend-Dienste brauchen keinen direkten Zugriff auf Datenbanken:

```yaml
services:
  frontend:
    networks:
      - frontend-net

  backend:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:
    internal: true
```

**Ressourcengrenzen**: Setze Speicher- und CPU-Grenzen, damit nichts die Ressourcen erschöpft und die Verteilung fair bleibt:

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

**Health Checks**: Definiere Health Checks, damit fehlgeschlagene Container automatisch neu starten und kein Traffic auf ungesunde Dienste geleitet wird:

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Nur lesbare Dateisysteme**: Mounte Container-Dateisysteme wenn möglich schreibgeschützt und nutze tmpfs für Verzeichnisse, die Schreibzugriff brauchen:

```yaml
services:
  web:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**Non-Root-Nutzer**: Lass Container als Non-Root laufen, um den Schaden aus einem kompromittierten Container zu begrenzen:

```yaml
services:
  web:
    user: "1000:1000"
```

**Volume-Rechte**: Setze passende Rechte auf gemountete Volumes. Mounte keine sensiblen Host-Verzeichnisse:

```yaml
services:
  web:
    volumes:
      - ./app:/app:ro  # Read-only mount
```

**Startreihenfolge**: Kombiniere `depends_on` mit Health Checks, damit Dienste in der richtigen Reihenfolge starten und bereit sind, bevor abhängige Dienste hochkommen:

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

## Was in Produktion dazukommt

**Image-Versionierung**: Nenne immer exakte Image-Versionen statt `latest`:

```yaml
services:
  db:
    image: postgres:15.3-alpine
```

**Logging konfigurieren**: Stelle Log-Treiber so ein, dass die Platte nicht volläuft:

```yaml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Security-Scanning**: Scanne die in `docker-compose.yml` benannten Images vor dem Ausrollen:

```bash
docker-compose config | grep image: | awk '{print $2}' | xargs -I {} trivy image {}
```

**Umgebungen trennen**: Nutze pro Umgebung eigene Compose-Dateien:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

**Secrets in Produktion**: Setze für Produktionsbetrieb Docker-Swarm-Secrets ein oder wechsle zu Kubernetes, das Secrets besser verwaltet:

```yaml
services:
  web:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```
