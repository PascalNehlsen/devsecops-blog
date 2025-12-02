---
id: docker-compose
title: Docker Compose
sidebar_label: Docker Compose Basics
sidebar_position: 3
---

# Simplifying Multi-Container Applications with Docker Compose

As applications grow more complex, you often need multiple services running in separate containers—such as a database, backend, and frontend. Managing these services manually with `docker` run can quickly become overwhelming. Enter Docker Compose, a tool designed to simplify the management of multi-container Docker applications.

## What is Docker Compose?

Docker Compose allows you to define and manage multi-container applications using a single YAML file. With Compose, you can:

- Define all your services, networks, and volumes in a single file (`docker-compose.yml`).
- Start all containers with a single command.
- Easily scale services up or down.

## A Simple Example: Web App with Database

Let’s set up a Python web application with a PostgreSQL database using Docker Compose.

1. Project Structure

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

2. Writing the `docker-compose.yml`

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

3. Build and Run the Application

Run the following commands in the project directory:

    1. Build and start the application:

    ```bash
    docker-compose up --build
    ```

    2. Access the web app:

    Open `http://localhost:5000` in your browser.

4. Key Commands

- Start services: docker-compose up
- Stop services: docker-compose down
- View logs: docker-compose logs
- Scale services: docker-compose up --scale web=3

## Docker Compose Security Best Practices

**Secrets Management**: Never hardcode sensitive values in docker-compose.yml files. Use environment variables, .env files (not committed to version control), or Docker secrets for production:

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

**Network Isolation**: Create custom networks to isolate services. Frontend services should not have direct access to databases:

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

**Resource Limits**: Set memory and CPU limits to prevent resource exhaustion and ensure fair allocation:

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

**Health Checks**: Define health checks to enable automatic restart of failed containers and prevent routing to unhealthy services:

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

**Read-Only Filesystems**: Mount container filesystems as read-only when possible, using tmpfs for directories requiring write access:

```yaml
services:
  web:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**Non-Root Users**: Run containers as non-root users to limit potential damage from compromised containers:

```yaml
services:
  web:
    user: "1000:1000"
```

**Volume Permissions**: Set appropriate permissions on mounted volumes. Avoid mounting sensitive host directories:

```yaml
services:
  web:
    volumes:
      - ./app:/app:ro  # Read-only mount
```

**Dependency Ordering**: Use depends_on with health checks to ensure services start in correct order and are ready before dependent services start:

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

## Production Considerations

**Image Versioning**: Always specify exact image versions rather than using latest tags:

```yaml
services:
  db:
    image: postgres:15.3-alpine
```

**Logging Configuration**: Configure log drivers to prevent disk space exhaustion:

```yaml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Security Scanning**: Scan images defined in docker-compose.yml before deployment:

```bash
docker-compose config | grep image: | awk '{print $2}' | xargs -I {} trivy image {}
```

**Environment Separation**: Use different compose files for different environments:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

**Secrets in Production**: For production deployments, use Docker Swarm secrets or migrate to Kubernetes for better secret management:

```yaml
services:
  web:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```
