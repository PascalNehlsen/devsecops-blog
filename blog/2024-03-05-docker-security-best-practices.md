---
title: "Docker Security Best Practices - Lessons from Production"
slug: docker-security-best-practices
authors: pascal
tags: [docker, containers, security, devops]
date: "2024-03-05"
---

# Docker Security Best Practices

Containers have revolutionized deployment, but they've also introduced new security challenges. Here's what I learned securing Docker in production.

<!-- truncate -->

## The Wake-Up Call

Last month, a security scan revealed our Docker images had **247 vulnerabilities**. Many were critical. This post covers how we got that number down to **3** (all low-severity).

## 1. Use Minimal Base Images

### Bad: Full OS Image
```dockerfile
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 python3-pip
# Image size: 1.2GB, 100+ vulnerabilities
```

### Good: Minimal Image
```dockerfile
FROM python:3.11-slim-bookworm
# Image size: 180MB, 5-10 vulnerabilities
```

### Better: Distroless
```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM gcr.io/distroless/python3-debian11
COPY --from=builder /root/.local /root/.local
COPY . /app
WORKDIR /app
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
# Image size: 120MB, 0-2 vulnerabilities
```

## 2. Run as Non-Root User

### The Problem
```dockerfile
# Running as root (UID 0) - dangerous!
FROM python:3.11-slim
COPY . /app
CMD ["python", "app.py"]
```

### The Solution
```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set up application directory
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

CMD ["python", "app.py"]
```

## 3. Scan Images in CI/CD

### Using Trivy
```yaml
# .gitlab-ci.yml
container:scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --severity HIGH,CRITICAL --exit-code 1 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: false
```

### Using Snyk
```yaml
container:snyk:
  stage: security
  image: snyk/snyk:docker
  script:
    - snyk auth $SNYK_TOKEN
    - snyk container test $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA --severity-threshold=high
```

## 4. Multi-Stage Builds

Separate build dependencies from runtime:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy only necessary files
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## 5. Secrets Management

### Never Do This
```dockerfile
# NEVER HARDCODE SECRETS!
ENV DATABASE_PASSWORD=supersecret123
ENV API_KEY=sk_live_abc123def456
```

### Use Docker Secrets (Swarm)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .

# Read secrets from files mounted by Docker
CMD python -c "import os; \
    db_pass = open('/run/secrets/db_password').read().strip(); \
    os.environ['DB_PASSWORD'] = db_pass" && python app.py
```

### Use Environment Variables (Kubernetes)
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    - name: DATABASE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

## 6. Limit Container Capabilities

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

## 7. Network Segmentation

```yaml
# docker-compose.yml
version: '3.8'

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access

services:
  web:
    networks:
      - frontend
      - backend

  database:
    networks:
      - backend  # Only accessible from backend network
```

## 8. Resource Limits

Prevent DoS attacks:

```yaml
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    ulimits:
      nofile:
        soft: 1024
        hard: 2048
```

## 9. Automated Vulnerability Scanning

### Daily Scheduled Scans
```yaml
# .gitlab-ci.yml
schedule:scan:
  stage: security
  only:
    - schedules
  script:
    - trivy image --format json --output scan-results.json $CI_REGISTRY_IMAGE:latest
    - python scripts/notify_security_team.py scan-results.json
```

## 10. Image Signing & Verification

### Sign Images with Docker Content Trust
```bash
# Enable Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Push signed image
docker push myregistry.io/myapp:latest

# Verify signature
docker pull myregistry.io/myapp:latest
```

## Security Checklist

- [ ] Use minimal base images (Alpine, Distroless)
- [ ] Run containers as non-root user
- [ ] Scan images in CI/CD pipeline
- [ ] Use multi-stage builds
- [ ] Never hardcode secrets
- [ ] Drop unnecessary capabilities
- [ ] Implement network segmentation
- [ ] Set resource limits
- [ ] Enable automated vulnerability scanning
- [ ] Sign and verify images
- [ ] Keep base images updated
- [ ] Use `.dockerignore` to exclude sensitive files

## Real Impact

**Before optimization:**
- Image size: 1.2GB
- Vulnerabilities: 247 (15 critical)
- Build time: 8 minutes

**After optimization:**
- Image size: 145MB (87% reduction)
- Vulnerabilities: 3 (0 critical)
- Build time: 3 minutes

## Resources

- [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)

---

*Securing your containers? Share your experience on [GitHub](https://github.com/PascalNehlsen)!*
