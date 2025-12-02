---
id: first-image
title: First Docker Image
sidebar_label: First Docker Image
sidebar_position: 2
---

# How to Create Your First Docker Image

Building your first Docker image might seem intimidating at first, but it’s an essential skill for leveraging the full potential of containerized environments. This guide will walk you through the basics of creating a Docker image using a `Dockerfile`.

## Prerequisites

Before you start, make sure you have the following installed:

- Docker: [Install Docker](https://docs.docker.com/engine/install/) if it’s not already on your system.
- A basic understanding of containers and images ([this post will help you](./container.md)).

## Step-by-Step: Creating Your First Docker Image

Create a simple Python application and containerize it.

1. Set Up Your Project Directory

   Create a project directory for your application:

   ```bash
   mkdir my-docker-app
   cd my-docker-app
   ```

   Inside this directory, create the following files:

   `app.py`

   ```bash
   # A simple Python application
   print("Hello, Docker!")
   ```

   `requirements.txt`

   ```bash
   # No dependencies for this simple example
   ```

2. Create a Dockerfile

   A `Dockerfile` is a text document that contains the instructions to assemble a Docker image. Here's a basic example:

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

3. Build the Docker Image

   Run the following command in your project directory to build the image:

   ```bash
   docker build -t my-docker-app .
   ```

   Here’s what happens:

   - `-t my-docker-app`: Tags the image with the name my-docker-app.
   - `.`: Specifies the current directory as the build context.

4. Run the Docker Container

   Once the image is built, you can create and start a container using the following command:

   ```bash
   docker run my-docker-app
   ```

   You should see the output:

   ```bash
   Hello, Docker!
   ```

5. Verify Your Image

   To list your Docker images, use:

   ```bash
   docker images
   ```

   You'll see something like:

   ```bash
   REPOSITORY        TAG       IMAGE ID       CREATED         SIZE
   my-docker-app     latest    abc12345defg   1 minute ago    29MB
   ```

## Security Enhancements for Docker Images

**Use Minimal Base Images**: Replace general-purpose base images with minimal alternatives to reduce attack surface:

```Dockerfile
# Instead of python:3.9
FROM python:3.9-slim

# Or even better, use Alpine
FROM python:3.9-alpine

# For production, consider distroless
FROM gcr.io/distroless/python3
```

**Run as Non-Root User**: Create and use a dedicated user instead of running as root:

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

**Multi-Stage Builds**: Separate build dependencies from runtime to minimize final image size:

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

**Scan for Vulnerabilities**: Integrate security scanning into your build process:

```bash
# Build image
docker build -t my-docker-app .

# Scan for vulnerabilities
trivy image my-docker-app

# Block deployment if critical vulnerabilities found
trivy image --severity CRITICAL --exit-code 1 my-docker-app
```

**Pin Dependency Versions**: Specify exact versions in requirements.txt to ensure reproducible builds:

```txt
flask==2.3.2
psycopg2==2.9.6
```

**Use .dockerignore**: Exclude unnecessary files from the build context:

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

**Add Health Checks**: Enable Docker to monitor container health:

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

**Set Proper Labels**: Add metadata for tracking and management:

```Dockerfile
LABEL maintainer="your.email@example.com"
LABEL version="1.0.0"
LABEL description="Python application"
LABEL org.opencontainers.image.source="https://github.com/user/repo"
```

**Optimize Layer Caching**: Order instructions from least to most frequently changing:

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

## Best Practices Summary

**Security Checklist**:
- Use minimal, specific base images with version tags
- Run containers as non-root users
- Scan images for vulnerabilities before deployment
- Never include secrets in images
- Use multi-stage builds to minimize attack surface
- Implement health checks for reliability
- Keep dependencies updated and pinned
- Use .dockerignore to exclude sensitive files

**Image Management**:
- Tag images with semantic versions, not just latest
- Push images to private registries with access controls
- Enable image signing and verification
- Regularly rebuild images to incorporate security patches
- Remove unused images to save space and reduce confusion

**Testing**:
- Test images in isolated environments before production
- Verify security scan results
- Validate health check functionality
- Test resource limits and constraints
- Confirm proper user permissions
